const express = require("express");
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../../controllers/shop/wishlist-controller");

const router = express.Router();

router.post("/add", addToWishlist);
router.delete("/remove", removeFromWishlist);
router.get("/get/:userId", getWishlist);

module.exports = router;