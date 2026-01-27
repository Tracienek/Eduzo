// server/src/app.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("Mongo error:", err.message));

app.get("/", (req, res) => res.send("EDUZO API OK"));

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const classRoutes = require("./routes/class.routes");
const studentRoutes = require("./routes/student.routes");
const searchRoutes = require("./routes/search.routes");
const centerRoutes = require("./routes/center.routes");

app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/user", userRoutes);
app.use("/v1/api/classes", classRoutes);
app.use("/v1/api/students", studentRoutes);
app.use("/v1/api/search", searchRoutes);
app.use("/v1/api/center", centerRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/v1/api/notifications", require("./routes/notification.routes"));

module.exports = app;
