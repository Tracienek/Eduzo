require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
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

app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/user", userRoutes);
app.use("/v1/api/classes", classRoutes);
app.use("/v1/api/students", studentRoutes);
app.use("/v1/api/search", searchRoutes);

module.exports = app;
