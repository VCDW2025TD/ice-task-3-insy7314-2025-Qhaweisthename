const Post = require("../models/Post");

exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden: role not allowed" });
    next();
  };
};

// Ensure the current user is the author of the post (for editing drafts)
exports.requirePostOwnership = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (String(post.author) !== req.user.id)
      return res.status(403).json({ message: "Forbidden: not your post" });

    req.post = post; // pass forward
    next();
  } catch (e) {
    next(e);
  }
};
