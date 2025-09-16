const router = require("express").Router({ mergeParams: true });
const comments = require("../controllers/commentController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { ADMIN, EDITOR } = require("../utils/permissions");

// add comment (any authenticated user OR even anonymous—choose one)
// If you want anonymous allowed, remove `protect`.
router.post("/", protect, comments.add);

router.get("/", comments.listApproved);
router.post("/:commentId/approve", protect, requireRole(EDITOR, ADMIN), comments.approve);

module.exports = router;
