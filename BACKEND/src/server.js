const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");

// Load .env (explicit path in case you move files later)
dotenv.config(); // keep as-is since you're running from BACKEND

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/posts/:postId/comments", require("./routes/commentRoutes"));

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

const start = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ Missing MONGO_URI (or MONGODB_URI) in BACKEND/.env");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || "secureblog",
    });
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`✅ SecureBlog API running on :${port}`));
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
};

start();
