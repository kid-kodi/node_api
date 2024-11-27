const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const ErrorHandler = require("../middleware/ErrorHandler");
//Load public routes
const authRoutes = require("../routes/auth");
const usersRoutes = require("../routes/users");
const chatsRoutes = require("../routes/chats");
const messagesRoutes = require("../routes/messages");
const filesRoutes = require("../routes/files");

//app configuration
dotenv.config();

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

const corsOptions = {
  credentials: true,
  origin: "*",
};
app.use(cors(corsOptions));
app.use("/", express.static(path.join(__dirname, "../uploads")));

//use middleware
app.use(express.json({ limit: "1000mb" }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

// Public api
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/files", filesRoutes);

// Errors handlers
app.use(ErrorHandler);


module.exports = app;