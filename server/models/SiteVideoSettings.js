const mongoose = require("mongoose");

const HomeVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    title: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const AboutVideoSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      enum: ["youtube", "upload"],
      default: "youtube",
    },
    url: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const SiteVideoSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      required: true,
      default: "site-video-settings",
      unique: true,
      index: true,
    },
    homeVideos: {
      type: [HomeVideoSchema],
      default: [],
    },
    aboutVideo: {
      type: AboutVideoSchema,
      default: () => ({ sourceType: "youtube", url: "" }),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteVideoSettings", SiteVideoSettingsSchema);
