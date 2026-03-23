const SiteVideoSettings = require("../../models/SiteVideoSettings");

const SINGLETON_KEY = "site-video-settings";

const getOrCreateSettings = async () => {
  let settings = await SiteVideoSettings.findOne({ singletonKey: SINGLETON_KEY });
  if (!settings) {
    settings = await SiteVideoSettings.create({ singletonKey: SINGLETON_KEY });
  }
  return settings;
};

const normalizeHomeVideos = (videos = []) => {
  if (!Array.isArray(videos)) return [];

  return videos
    .map((item) => {
      if (typeof item === "string") {
        return { url: item.trim(), title: "" };
      }
      return {
        url: String(item?.url || "").trim(),
        title: String(item?.title || "").trim(),
      };
    })
    .filter((item) => item.url);
};

const buildYoutubeEmbedUrl = (videoId) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0&playsinline=1`;

const extractYoutubeVideoId = (rawUrl) => {
  const input = String(rawUrl || "").trim();
  if (!input) return "";

  try {
    const parsed = new URL(input);
    const host = String(parsed.hostname || "").toLowerCase();
    const path = String(parsed.pathname || "");

    if (host === "youtu.be") {
      return path.replace(/^\/+/, "").split("/")[0];
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      if (path.startsWith("/embed/")) return path.split("/embed/")[1]?.split("/")[0];
      if (path.startsWith("/shorts/")) return path.split("/shorts/")[1]?.split("/")[0];
      if (path.startsWith("/live/")) return path.split("/live/")[1]?.split("/")[0];
      const watchId = parsed.searchParams.get("v");
      if (watchId) return watchId;
    }
  } catch (_error) {
    // Fallback to regex parsing below.
  }

  const fallbackMatch = input.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/
  );
  return fallbackMatch?.[1] || "";
};

const normalizeAboutVideoUrl = (sourceType, rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  if (sourceType !== "youtube") return url;

  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return url;
  return buildYoutubeEmbedUrl(videoId);
};

const getVideoSettingsAdmin = async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const updateHomeVideos = async (req, res) => {
  try {
    const { videos = [] } = req.body;
    const normalizedVideos = normalizeHomeVideos(videos);

    const settings = await getOrCreateSettings();
    settings.homeVideos = normalizedVideos;
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Home videos updated successfully",
      data: settings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const updateAboutVideo = async (req, res) => {
  try {
    const { sourceType, url } = req.body;
    const normalizedSourceType =
      sourceType === "upload" ? "upload" : "youtube";
    const normalizedUrl = normalizeAboutVideoUrl(normalizedSourceType, url);

    if (!normalizedUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required",
      });
    }

    const settings = await getOrCreateSettings();
    settings.aboutVideo = {
      sourceType: normalizedSourceType,
      url: normalizedUrl,
    };
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "About video updated successfully",
      data: settings,
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
  getVideoSettingsAdmin,
  updateHomeVideos,
  updateAboutVideo,
};
