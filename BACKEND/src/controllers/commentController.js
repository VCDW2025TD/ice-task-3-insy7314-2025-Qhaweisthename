const Comment = require("../models/Comment");
const { ADMIN, EDITOR } = require("../utils/permissions");

// Readers (any role) can submit; defaults to pending
exports.add = async (req, res, next) => {
  try {
    const { authorName, text } = req.body;
    const comment = await Comment.create({
      post: req.params.postId,
      authorName,
      text,
      status: "pending",
    });
    res.status(201).json(comment);
  } catch (e) {
    next(e);
  }
};

// Editors/Admins approve
exports.approve = async (req, res, next) => {
  try {
    if (![EDITOR, ADMIN].includes(req.user.role))
      return res.status(403).json({ message: "Only editors/admins can approve" });

    const comment = await Comment.findOne({ _id: req.params.commentId, post: req.params.postId });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.status = "approved";
    await comment.save();
    res.json(comment);
  } catch (e) {
    next(e);
  }
};

// Everyone sees only approved
exports.listApproved = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, status: "approved" })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (e) {
    next(e);
  }
};
