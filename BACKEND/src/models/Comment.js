const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    authorName: { type: String, required: true, trim: true }, // keep simple
    text: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending", index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);