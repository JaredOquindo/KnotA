// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import paymayaRoutes from "./routes/paymayaRoutes.js";
import institutionRoutes from "./routes/institutionRoutes.js";
import registerAdminRoutes from "./routes/registerAdminRoutes.js"; // NEW

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);            // /auth/register, /auth/login
app.use("/events", eventRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/surveys", surveyRoutes);
app.use("/paymaya", paymayaRoutes);
app.use("/institutions", institutionRoutes);
app.use("/register-admin", registerAdminRoutes); // NEW

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Knot Backend API is running..." });
});

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to Database"))
.catch(err => console.error("Database connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
