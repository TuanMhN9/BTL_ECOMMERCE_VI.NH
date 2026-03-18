const Wishlist = require("../../models/Wishlist");
const Product = require("../../models/Product");

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const newItem = new Wishlist({ userId, productId });
    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error adding to wishlist",
    });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    await Wishlist.findOneAndDelete({ userId, productId });

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error removing from wishlist",
    });
  }
};

// Get wishlist
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const wishlistItems = await Wishlist.find({ userId }).populate("productId");

    res.status(200).json({
      success: true,
      data: wishlistItems,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
    });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};