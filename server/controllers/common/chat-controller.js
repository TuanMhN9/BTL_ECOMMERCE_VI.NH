const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../../models/Product");
const Promotion = require("../../models/Promotion");
const {
  enrichProductsWithAutomaticPromotions,
} = require("../../helpers/promotionCalculator");

const PRODUCT_SELECT =
  "title image images category brand price salePrice totalStock sizes colors isSaleItem variants description";

const SYSTEM_PROMPT = `Bạn là nhân viên tư vấn thời trang cao cấp của Saint Laurent.
Nhiệm vụ: hỗ trợ khách hàng tìm sản phẩm, tư vấn phối đồ, trả lời câu hỏi về tồn kho và sản phẩm đang sale.

Quy tắc:
- Trả lời bằng tiếng Việt, lịch sự, ngắn gọn (tối đa 3-4 câu trừ khi cần liệt kê sản phẩm).
- CHỈ dùng thông tin trong "Tổng quan cửa hàng" và "Danh sách sản phẩm tham khảo" bên dưới. Không bịa sản phẩm.
- Khi khách hỏi sale/giảm giá: giới thiệu sản phẩm có giá sale hoặc isSaleItem từ dữ liệu.
- Khi khách hỏi tồn kho/còn hàng: trả lời theo totalStock và biến thể size/màu nếu có.
- Khi giới thiệu sản phẩm, luôn kèm tên, giá gốc, giá sale (nếu có), % giảm (nếu có), tình trạng tồn kho, size/màu còn hàng.
- Định dạng giá theo USD (ví dụ: $120).
- Nếu không có sản phẩm phù hợp trong dữ liệu, nói rõ và gợi ý danh mục khác hoặc từ khóa tìm kiếm.
- Chỉ trả lời trong phạm vi cửa hàng thời trang, từ chối lịch sự các câu hỏi ngoài lề.
- Không sử dụng markdown phức tạp, chỉ dùng text thuần và xuống dòng.
- Khi gợi ý sản phẩm, giới thiệu ngắn gọn trong text; thẻ sản phẩm (ảnh + link) sẽ hiển thị riêng bên dưới câu trả lời.`;

const CATEGORY_ALIASES = {
  women: ["nữ", "women", "woman", "váy", "đầm", "áo nữ"],
  men: ["nam", "men", "man", "áo nam"],
  footwear: ["giày", "dép", "sandal", "boot", "sneaker", "footwear", "giày dép"],
  accessories: ["phụ kiện", "accessories", "kính", "mắt kính"],
  jewelry: ["trang sức", "jewelry", "vòng", "nhẫn", "dây chuyền", "bông tai"],
  handbag: ["túi", "handbag", "bag", "ví", "clutch"],
};

function detectIntents(message) {
  const text = message.toLowerCase();
  return {
    sale:
      /sale|giảm giá|giam gia|khuyến mãi|khuyen mai|flash|discount|promo|ưu đãi|uu dai|giá rẻ|gia re|on sale|đang giảm|dang giam/.test(
        text
      ),
    stock:
      /tồn kho|ton kho|còn hàng|con hang|hết hàng|het hang|in stock|stock|sẵn hàng|san hang|tồn|ton|available|còn bao nhiêu|con bao nhieu/.test(
        text
      ),
    catalog:
      /có gì|co gi|còn gì|con gi|bán gì|ban gi|mặt hàng|mat hang|sản phẩm nào|san pham nao|danh mục|danh muc|catalog|hàng gì|hang gi|shop có|shop co|store có|store co/.test(
        text
      ),
    recommend:
      /gợi ý|goi y|đề xuất|de xuat|tư vấn|tu van|phối đồ|phoi do|nên mua|nen mua|mua gì|mua gi|chọn giúp|chon giup|recommend|suggest|phù hợp|phu hop|tìm giúp|tim giup|tìm cho|tim cho|show me|looking for|help me find|muốn mua|muon mua/.test(
        text
      ),
  };
}

function shouldAttachProductCards(message, intents, products, category, keywords) {
  if (!products.length) return false;

  return (
    intents.recommend ||
    intents.sale ||
    intents.stock ||
    intents.catalog ||
    Boolean(category) ||
    keywords.length > 0
  );
}

function getProductImage(product) {
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    return typeof first === "string" ? first : first?.url || first?.imageUrl || "";
  }
  return "";
}

function formatRecommendedProductsForClient(products, limit = 6) {
  return products.slice(0, limit).map((product) => ({
    _id: String(product._id),
    title: product.title || "Sản phẩm",
    image: getProductImage(product),
    category: product.category || "",
    price: Number(product.price) || 0,
    salePrice: Number(product.salePrice) || 0,
    isSaleItem: Boolean(product.isSaleItem),
    totalStock: Number(product.totalStock) || 0,
  }));
}

function detectCategory(message) {
  const text = message.toLowerCase();
  for (const [category, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((alias) => text.includes(alias))) {
      return category;
    }
  }
  return "";
}

function extractKeywords(message) {
  const stopWords = new Set([
    "tôi", "tooi", "muốn", "muon", "tìm", "tim", "có", "co", "không", "khong",
    "nào", "nao", "cho", "cái", "cai", "chiếc", "chiec", "đôi", "doi", "bộ",
    "bo", "một", "mot", "của", "cua", "và", "va", "hay", "hoặc", "hoac", "với",
    "voi", "trong", "giá", "gia", "dưới", "duoi", "trên", "tren", "khoảng",
    "khoang", "được", "duoc", "bao", "nhiêu", "nhieu", "the", "a", "an", "is",
    "are", "do", "does", "can", "i", "want", "need", "looking", "for", "any",
    "some", "please", "thanks", "hi", "hello", "xin", "chào", "chao", "ơi",
    "oi", "vậy", "vay", "thế", "the", "này", "nay", "đó", "do", "kia", "rồi",
    "roi", "nhé", "nhe", "nha", "ạ", "a", "shop", "store", "saint", "laurent",
    "sale", "giảm", "giam", "giá", "gia", "hàng", "hang", "sản", "san", "phẩm",
    "pham", "đang", "dang", "tồn", "ton", "kho", "còn", "con", "hết", "het",
    "mặt", "mat", "biết", "biet", "gì", "gi", "nào", "nao", "không", "khong",
  ]);

  return message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));
}

function buildBaseFilter(category = "") {
  const filters = { isActive: true };
  if (category) {
    filters.category = category;
  }
  return filters;
}

async function getActivePromoTargets() {
  const now = new Date();
  const activePromos = await Promotion.find({
    status: "active",
    type: { $in: ["automatic", "flash_sale", "seasonal"] },
    startDate: { $lte: now },
    endDate: { $gte: now },
    $and: [
      {
        $or: [
          { "conditions.minOrderValue": { $lte: 0 } },
          { "conditions.minOrderValue": { $exists: false } },
          { "conditions.minOrderValue": null },
        ],
      },
      {
        $or: [
          { "conditions.minQuantity": { $lte: 0 } },
          { "conditions.minQuantity": { $exists: false } },
          { "conditions.minQuantity": null },
        ],
      },
    ],
  }).lean();

  const promoProductIds = [];
  const promoCategories = [];

  activePromos.forEach((promo) => {
    (promo.conditions?.applicableProducts || []).forEach((id) => {
      promoProductIds.push(id.toString());
    });
    (promo.conditions?.applicableCategories || []).forEach((cat) => {
      if (cat) promoCategories.push(cat.toLowerCase());
    });
  });

  return { promoProductIds, promoCategories, activePromos };
}

async function getCatalogSummary() {
  const [totalActive, inStock, outOfStock, saleTagged, categories, promoInfo] =
    await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, totalStock: { $gt: 0 } }),
      Product.countDocuments({ isActive: true, totalStock: { $lte: 0 } }),
      Product.countDocuments({
        isActive: true,
        $or: [{ salePrice: { $gt: 0 } }, { isSaleItem: true }],
      }),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$category",
            total: { $sum: 1 },
            inStock: {
              $sum: { $cond: [{ $gt: ["$totalStock", 0] }, 1, 0] },
            },
            onSale: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $gt: ["$salePrice", 0] },
                      { $eq: ["$isSaleItem", true] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { total: -1 } },
      ]),
      getActivePromoTargets(),
    ]);

  return {
    totalActive,
    inStock,
    outOfStock,
    saleTagged,
    categories,
    activePromotions: promoInfo.activePromos.length,
  };
}

async function getSaleProductsForChat(category = "", limit = 10) {
  const filters = buildBaseFilter(category);
  const { promoProductIds, promoCategories } = await getActivePromoTargets();

  let manualSaleItems = await Product.find({ ...filters, isSaleItem: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select(PRODUCT_SELECT)
    .lean();

  let finalProducts = [...manualSaleItems];

  if (finalProducts.length < limit) {
    const remainingCount = limit - finalProducts.length;
    const manualIds = manualSaleItems.map((p) => p._id);

    const dynamicSaleQuery = {
      ...filters,
      isSaleItem: { $ne: true },
      _id: { $nin: manualIds },
      $or: [
        { salePrice: { $gt: 0 } },
        { _id: { $in: promoProductIds } },
        ...(promoCategories.length
          ? [{ category: { $in: promoCategories } }]
          : []),
      ],
    };

    const computedSales = await Product.find(dynamicSaleQuery)
      .sort({ updatedAt: -1 })
      .limit(remainingCount)
      .select(PRODUCT_SELECT)
      .lean();

    finalProducts = [...finalProducts, ...computedSales];
  }

  return finalProducts;
}

async function getInStockProductsForChat(category = "", limit = 10) {
  return Product.find({
    ...buildBaseFilter(category),
    totalStock: { $gt: 0 },
  })
    .sort({ totalSold: -1, updatedAt: -1 })
    .limit(limit)
    .select(PRODUCT_SELECT)
    .lean();
}

async function findRelevantProducts(message, category = "", limit = 8) {
  const keywords = extractKeywords(message);
  const filters = buildBaseFilter(category);

  if (keywords.length === 0) {
    return [];
  }

  const searchQuery = keywords.join(" ");

  let products = await Product.find(
    { ...filters, $text: { $search: searchQuery } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .select(PRODUCT_SELECT)
    .lean();

  if (products.length === 0) {
    products = await Product.find({
      ...filters,
      $or: keywords.flatMap((keyword) => [
        { title: new RegExp(keyword, "i") },
        { category: new RegExp(keyword, "i") },
        { brand: new RegExp(keyword, "i") },
        { description: new RegExp(keyword, "i") },
      ]),
    })
      .limit(limit)
      .select(PRODUCT_SELECT)
      .lean();
  }

  return products;
}

function mergeProductsById(...lists) {
  const map = new Map();
  for (const list of lists) {
    for (const product of list) {
      if (!product?._id) continue;
      map.set(String(product._id), product);
    }
  }
  return [...map.values()];
}

function formatVariantStock(product) {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const available = product.variants.filter((v) => Number(v.stock) > 0);
    if (available.length === 0) {
      return "Hết hàng (theo size/màu)";
    }
    return available
      .slice(0, 6)
      .map((v) => `${v.size || "Free"}/${v.color || "Default"}: ${v.stock}`)
      .join(", ");
  }

  return Number(product.totalStock) > 0
    ? `Còn ${product.totalStock} sp`
    : "Hết hàng";
}

function formatPriceInfo(product) {
  const basePrice = Number(product.price) || 0;
  const salePrice = Number(product.salePrice) || 0;

  if (salePrice > 0 && salePrice < basePrice) {
    const discount = Math.round((1 - salePrice / basePrice) * 100);
    return `$${salePrice} (gốc $${basePrice}, giảm ${discount}%)`;
  }

  return `$${basePrice}`;
}

function formatProductsForPrompt(products) {
  if (!products.length) {
    return "Không có sản phẩm phù hợp trong dữ liệu tham khảo.";
  }

  return products
    .map((product, index) => {
      const sizes = product.sizes?.length ? product.sizes.join(", ") : "N/A";
      const colors = product.colors?.length ? product.colors.join(", ") : "N/A";
      const saleTag = product.isSaleItem ? " | SALE" : "";
      const stockInfo = formatVariantStock(product);

      return `${index + 1}. ${product.title} | ${product.category} | ${product.brand}${saleTag} | Giá: ${formatPriceInfo(product)} | Size: ${sizes} | Màu: ${colors} | Tồn kho: ${stockInfo}`;
    })
    .join("\n");
}

function formatCatalogSummary(summary) {
  const categoryLines = (summary.categories || [])
    .map(
      (item) =>
        `- ${item._id || "Khác"}: ${item.total} sản phẩm (${item.inStock} còn hàng, ${item.onSale} đang sale)`
    )
    .join("\n");

  return `Tổng sản phẩm đang bán: ${summary.totalActive}
Còn hàng: ${summary.inStock} | Hết hàng: ${summary.outOfStock}
Sản phẩm có giá sale/isSaleItem: ${summary.saleTagged}
Chương trình khuyến mãi tự động đang chạy: ${summary.activePromotions}

Theo danh mục:
${categoryLines || "- Chưa có dữ liệu danh mục"}`;
}

async function buildProductContext(message) {
  const intents = detectIntents(message);
  const category = detectCategory(message);
  const keywords = extractKeywords(message);

  const [summary, keywordProducts, saleProducts, stockProducts] =
    await Promise.all([
      getCatalogSummary(),
      findRelevantProducts(message, category),
      intents.sale || intents.catalog
        ? getSaleProductsForChat(category, 10)
        : Promise.resolve([]),
      intents.stock || intents.catalog || intents.recommend
        ? getInStockProductsForChat(category, 10)
        : Promise.resolve([]),
    ]);

  let products = mergeProductsById(keywordProducts, saleProducts, stockProducts);

  if (products.length === 0) {
    if (intents.sale) {
      products = await getSaleProductsForChat(category, 10);
    } else if (intents.stock || intents.catalog || intents.recommend) {
      products = await getInStockProductsForChat(category, 10);
    } else if (keywords.length === 0) {
      products = await getInStockProductsForChat(category, 8);
    }
  }

  const enrichedProducts = await enrichProductsWithAutomaticPromotions(
    products.slice(0, 12)
  );

  const contextSections = [
    `=== TỔNG QUAN CỬA HÀNG ===\n${formatCatalogSummary(summary)}`,
    `=== DANH SÁCH SẢN PHẨM THAM KHẢO ===\n${formatProductsForPrompt(enrichedProducts)}`,
  ];

  if (intents.sale) {
    contextSections.push(
      "Ghi chú: Khách đang hỏi về sản phẩm SALE. Ưu tiên giới thiệu các mục có giá sale hoặc nhãn SALE."
    );
  }
  if (intents.recommend) {
    contextSections.push(
      "Ghi chú: Khách đang yêu cầu GỢI Ý sản phẩm. Giới thiệu ngắn gọn 2-4 sản phẩm phù hợp nhất từ danh sách; ảnh và link chi tiết sẽ hiển thị tự động bên dưới."
    );
  }
  if (intents.stock) {
    contextSections.push(
      "Ghi chú: Khách đang hỏi về TỒN KHO. Trả lời rõ còn/hết và size/màu còn hàng nếu có."
    );
  }

  const attachProductCards = shouldAttachProductCards(
    message,
    intents,
    enrichedProducts,
    category,
    keywords
  );

  return {
    productContext: contextSections.join("\n\n"),
    productsFound: enrichedProducts.length,
    recommendedProducts: attachProductCards
      ? formatRecommendedProductsForClient(enrichedProducts)
      : [],
  };
}

let genAI = null;

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
].filter(Boolean);

function getGenAI() {
  if (
    !genAI &&
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE"
  ) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

function isRetryableGeminiError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("not found") ||
    message.includes("404")
  );
}

async function generateChatReply({ ai, message, history, productContext }) {
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
      });

      const mapped = history.slice(-10).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));
      const firstUserIdx = mapped.findIndex((m) => m.role === "user");
      const chatHistory =
        firstUserIdx > 0
          ? mapped.slice(firstUserIdx)
          : firstUserIdx === 0
            ? mapped
            : [];

      const chat = model.startChat({ history: chatHistory });

      const userPrompt = `Câu hỏi khách hàng: "${message}"

${productContext}

Hãy trả lời khách hàng dựa trên dữ liệu cửa hàng ở trên. Không được bịa sản phẩm ngoài danh sách.`;

      const result = await chat.sendMessage(userPrompt);
      return {
        reply: result.response.text(),
        model: modelName,
      };
    } catch (error) {
      lastError = error;
      console.warn(`[Chat] Model ${modelName} failed:`, error.message);
      if (!isRetryableGeminiError(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Không thể kết nối tới Gemini API");
}

const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tin nhắn",
      });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        success: false,
        message: "Chatbot chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY.",
      });
    }

    const { productContext, productsFound, recommendedProducts } =
      await buildProductContext(message.trim());

    const { reply, model } = await generateChatReply({
      ai,
      message: message.trim(),
      history,
      productContext,
    });

    return res.status(200).json({
      success: true,
      data: {
        reply,
        productsFound,
        recommendedProducts,
        model,
      },
    });
  } catch (error) {
    console.error("[Chat] Error:", error.message);
    const status = isRetryableGeminiError(error) ? 503 : 500;
    return res.status(status).json({
      success: false,
      message:
        status === 503
          ? "Chatbot đang quá tải. Vui lòng thử lại sau vài giây."
          : "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.",
    });
  }
};

module.exports = { handleChat };
