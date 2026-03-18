const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      sizes,
      colors,
      averageReview,
      variants,
    } = req.body;

    if (totalStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Total stock cannot be negative",
      });
    }

    // Check variants stock
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (variant.stock < 0) {
          return res.status(400).json({
            success: false,
            message: "Variant stock cannot be negative",
          });
        }
      }
    }

    console.log(averageReview, "averageReview");

    // Process sizes and colors
    const processedSizes = Array.isArray(sizes) ? sizes : sizes ? sizes.split(",").map(s => s.trim()) : [];
    const processedColors = Array.isArray(colors) ? colors : colors ? colors.split(",").map(c => c.trim()) : [];

    // Auto-generate variants from sizes and colors if provided
    let generatedVariants = [];
    if (processedSizes.length > 0 && processedColors.length > 0) {
      if (Array.isArray(variants) && variants.length > 0) {
        // Use provided variants if they exist
        generatedVariants = variants;
      } else {
        // Generate default variants
        for (const size of processedSizes) {
          for (const color of processedColors) {
            generatedVariants.push({
              size,
              color,
              stock: 0, // Default stock, can be edited later
              price: price || 0,
              salePrice: salePrice || 0,
            });
          }
        }
      }
    } else {
      // If no sizes/colors or variants provided, use the provided variants
      generatedVariants = Array.isArray(variants) ? variants : [];
    }

    // Calculate totalStock from variants if variants exist
    const calculatedTotalStock = generatedVariants.length > 0 
      ? generatedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : totalStock;

    const newlyCreatedProduct = new Product({
      image: image || (images && images.length > 0 ? images[0] : ""),
      images: Array.isArray(images) ? images : [],
      title,
      description,
      category,
      brand,
      price,
      salePrice: salePrice === "" ? 0 : salePrice,
      totalStock: calculatedTotalStock,
      sizes: processedSizes,
      colors: processedColors,
      averageReview,
      variants: generatedVariants,
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      sizes,
      colors,
      averageReview,
      variants,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    if (totalStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Total stock cannot be negative",
      });
    }

    // Check variants stock
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (variant.stock < 0) {
          return res.status(400).json({
            success: false,
            message: "Variant stock cannot be negative",
          });
        }
      }
    }

    // Process sizes and colors
    const processedSizes = Array.isArray(sizes) ? sizes : sizes ? sizes.split(",").map(s => s.trim()) : findProduct.sizes || [];
    const processedColors = Array.isArray(colors) ? colors : colors ? colors.split(",").map(c => c.trim()) : findProduct.colors || [];

    // Auto-generate variants from sizes and colors if provided and different from existing
    let generatedVariants = Array.isArray(variants) ? variants : findProduct.variants || [];
    if (processedSizes.length > 0 && processedColors.length > 0 && !Array.isArray(variants)) {
      // Check if sizes or colors changed
      const sizesChanged = JSON.stringify(processedSizes.sort()) !== JSON.stringify((findProduct.sizes || []).sort());
      const colorsChanged = JSON.stringify(processedColors.sort()) !== JSON.stringify((findProduct.colors || []).sort());
      
      if (sizesChanged || colorsChanged) {
        // Regenerate variants
        generatedVariants = [];
        for (const size of processedSizes) {
          for (const color of processedColors) {
            // Try to preserve existing stock if variant existed
            const existingVariant = findProduct.variants.find(v => v.size === size && v.color === color);
            generatedVariants.push({
              size,
              color,
              stock: existingVariant ? existingVariant.stock : 0,
              price: price || findProduct.price || 0,
              salePrice: salePrice || findProduct.salePrice || 0,
            });
          }
        }
      }
    }

    // Calculate totalStock from variants if variants exist
    const calculatedTotalStock = generatedVariants.length > 0 
      ? generatedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : totalStock || findProduct.totalStock;

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.salePrice =
      salePrice === "" ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = calculatedTotalStock;
    findProduct.image = image || (images && images.length > 0 ? images[0] : findProduct.image);
    findProduct.images = Array.isArray(images) ? images : findProduct.images || [];
    findProduct.sizes = processedSizes;
    findProduct.colors = processedColors;
    findProduct.averageReview = averageReview || findProduct.averageReview;
    findProduct.variants = generatedVariants;

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
