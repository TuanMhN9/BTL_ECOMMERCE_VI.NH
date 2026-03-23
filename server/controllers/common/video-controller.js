const SiteVideoSettings = require("../../models/SiteVideoSettings");

const SINGLETON_KEY = "site-video-settings";

const getVideoSettings = async (_req, res) => {
  try {
    const settings = await SiteVideoSettings.findOne({
      singletonKey: SINGLETON_KEY,
    });

    if (!settings) {
      return res.status(200).json({
        success: true,
        data: {
          homeVideos: [],
          aboutVideo: { sourceType: "youtube", url: "" },
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        homeVideos: Array.isArray(settings.homeVideos) ? settings.homeVideos : [],
        aboutVideo: settings.aboutVideo || { sourceType: "youtube", url: "" },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = {
  getVideoSettings,
};
