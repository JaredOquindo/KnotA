import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Institution from "../models/Institution.js";

const router = express.Router();

// Register an institution admin via institutionId
router.post("/:institutionId", async (req, res) => {
  const { institutionId } = req.params;
  const { fullName, email, password } = req.body;

  // Validate input
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required" });
  }

  try {
    // Check if institution exists
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(400).json({ message: "Invalid institution ID" });
    }

    // Check if admin already exists for this institution
    const existingAdmin = await User.findOne({ institution: institutionId, role: "admin" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin account already exists for this institution" });
    }

    // Create new admin user
    const adminUser = new User({
      fullName,
      email,
      password,
      role: "admin",
      institution: institutionId,
    });

    await adminUser.save();

    res.status(201).json({ message: "Admin account created successfully. You can now login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
