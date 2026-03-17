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
    } = req.body;

    if (totalStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Total stock cannot be negative",
      });
    }

    console.log(averageReview, "averageReview");

    const newlyCreatedProduct = new Product({
      image: image || (images && images.length > 0 ? images[0] : ""),
      images: Array.isArray(images) ? images : [],
      title,
      description,
      category,
      brand,
      price,
      salePrice: salePrice === "" ? 0 : salePrice,
      totalStock,
      sizes: Array.isArray(sizes) ? sizes : sizes ? sizes.split(",").map(s => s.trim()) : [],
      colors: Array.isArray(colors) ? colors : colors ? colors.split(",").map(c => c.trim()) : [],
      averageReview,
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

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.salePrice =
      salePrice === "" ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.image = image || (images && images.length > 0 ? images[0] : findProduct.image);
    findProduct.images = Array.isArray(images) ? images : findProduct.images || [];
    findProduct.sizes = Array.isArray(sizes) ? sizes : sizes ? sizes.split(",").map(s => s.trim()) : findProduct.sizes || [];
    findProduct.colors = Array.isArray(colors) ? colors : colors ? colors.split(",").map(c => c.trim()) : findProduct.colors || [];
    findProduct.averageReview = averageReview || findProduct.averageReview;

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
