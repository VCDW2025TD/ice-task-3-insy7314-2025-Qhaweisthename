const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
