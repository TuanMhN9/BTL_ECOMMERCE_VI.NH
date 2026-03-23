const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { requireAdminRole } = require("../../middlewares/admin-auth");
const {
  getVideoSettingsAdmin,
  updateHomeVideos,
  updateAboutVideo,
} = require("../../controllers/admin/video-controller");

const router = express.Router();

router.use(authMiddleware, requireAdminRole);

router.get("/get", getVideoSettingsAdmin);
router.put("/home", updateHomeVideos);
router.put("/about", updateAboutVideo);

module.exports = router;
