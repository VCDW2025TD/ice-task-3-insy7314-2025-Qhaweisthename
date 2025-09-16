const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ROLES } = require("../models/User");

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES_IN || "1h",
  });

exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.create({
      email,
      password,
      role: ROLES.includes(role) ? role : "reader",
    });
    const token = sign(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });
    const token = sign(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
};

// Admin-only: create a user with a specific role
exports.adminCreateUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!ROLES.includes(role)) return res.status(400).json({ message: "Invalid role" });
    const user = await User.create({ email, password, role });
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (e) {
    next(e);
  }
};
