const router = require("express").Router();
const posts = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const { requireRole, requirePostOwnership } = require("../middleware/roles");
const { ADMIN, EDITOR, AUTHOR } = require("../utils/permissions");

// Public read of published
router.get("/", posts.list);
router.get("/:postId", posts.getOne);

// Authenticated actions
router.post("/", protect, requireRole(AUTHOR, EDITOR, ADMIN), posts.createDraft);
router.put("/:postId", protect, requireRole(AUTHOR, EDITOR, ADMIN), requirePostOwnership, posts.updateDraft);
router.post("/:postId/publish", protect, requireRole(EDITOR, ADMIN), posts.publish);
router.delete("/:postId", protect, requireRole(ADMIN), posts.remove);

module.exports = router;
