const express = require("express");
const { getVideoSettings } = require("../../controllers/common/video-controller");

const router = express.Router();

router.get("/get", getVideoSettings);

module.exports = router;
