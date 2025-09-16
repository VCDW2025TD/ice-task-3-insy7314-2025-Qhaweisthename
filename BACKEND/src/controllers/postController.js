const Post = require("../models/Post");
const { ADMIN, EDITOR, AUTHOR } = require("../utils/permissions");

// Authors create draft
exports.createDraft = async (req, res, next) => {
  try {
    if (req.user.role !== AUTHOR && req.user.role !== ADMIN && req.user.role !== EDITOR)
      return res.status(403).json({ message: "Only authors/editors/admins create drafts" });

    const post = await Post.create({
      title: req.body.title,
      body: req.body.body,
      author: req.user.id,
      status: "draft",
    });
    res.status(201).json(post);
  } catch (e) {
    next(e);
  }
};

// Author edits own draft
exports.updateDraft = async (req, res, next) => {
  try {
    const post = req.post; // from requirePostOwnership
    if (post.status !== "draft")
      return res.status(400).json({ message: "Only drafts can be edited by the author" });

    post.title = req.body.title ?? post.title;
    post.body = req.body.body ?? post.body;
    await post.save();
    res.json(post);
  } catch (e) {
    next(e);
  }
};

// Publish (editors/admins)
exports.publish = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (![EDITOR, ADMIN].includes(req.user.role))
      return res.status(403).json({ message: "Only editors/admins can publish" });

    post.status = "published";
    post.publishedAt = new Date();
    await post.save();
    res.json(post);
  } catch (e) {
    next(e);
  }
};

// Hard delete (admins only)
exports.remove = async (req, res, next) => {
  try {
    if (req.user.role !== ADMIN) return res.status(403).json({ message: "Admins only" });
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Deleted", id: post._id });
  } catch (e) {
    next(e);
  }
};

// List published posts (all)
exports.list = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .select("title publishedAt author status");
    res.json(posts);
  } catch (e) {
    next(e);
  }
};

// View single published (all)
exports.getOne = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId, status: "published" });
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (e) {
    next(e);
  }
};
    