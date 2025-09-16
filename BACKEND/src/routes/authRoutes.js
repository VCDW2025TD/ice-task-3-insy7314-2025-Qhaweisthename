const router = require("express").Router();
const path = require("path");

// SAFE: build the path without typos/spaces
const auth = require(path.join(__dirname, "..", "controllers", "authController"));
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { ADMIN } = require("../utils/permissions");

// routes
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/admin/create-user", protect, requireRole(ADMIN), auth.adminCreateUser);

module.exports = router;
