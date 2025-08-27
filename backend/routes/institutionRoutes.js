// backend/routes/institutionRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

import Institution from "../models/Institution.js";
import User from "../models/User.js";
import { authMiddleware } from "./authRoutes.js"; // updated import for middleware

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- MULTER SETUP --------------------
const uploadFolder = path.join(__dirname, "..", "uploads", "institutions");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) =>
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // max 10MB

// -------------------- CREATE INSTITUTION --------------------
router.post(
  "/",
  upload.fields([
    { name: "verificationDocuments", maxCount: 5 },
    { name: "institutionLogo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}/uploads/institutions`;
      const verificationDocs = req.files?.verificationDocuments?.map(
        (f) => `${baseUrl}/${f.filename}`
      ) || [];
      const logo = req.files?.institutionLogo?.[0]
        ? `${baseUrl}/${req.files.institutionLogo[0].filename}`
        : null;

      const institution = new Institution({
        officialInstitutionName: req.body.officialInstitutionName,
        institutionType: req.body.institutionType,
        accreditationStatus: req.body.accreditationStatus,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        institutionWebsite: req.body.institutionWebsite,
        physicalAddress: req.body.physicalAddress,
        missionStatement: req.body.missionStatement,
        verificationDocuments: verificationDocs,
        institutionLogo: logo,
        isApproved: false,
      });

      const saved = await institution.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  }
);

// -------------------- GET PENDING INSTITUTIONS --------------------
router.get("/pending", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { isApproved: { $ne: true } };
    if (search) query.officialInstitutionName = { $regex: search, $options: "i" };

    const totalCount = await Institution.countDocuments(query);
    const pendings = await Institution.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ pendings, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// -------------------- GET APPROVED INSTITUTIONS --------------------
router.get("/approved", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { isApproved: true };
    if (search) query.officialInstitutionName = { $regex: search, $options: "i" };

    const totalCount = await Institution.countDocuments(query);
    const institutions = await Institution.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ institutions, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// -------------------- APPROVE INSTITUTION --------------------
router.patch("/:id/approve", async (req, res) => {
  try {
    const inst = await Institution.findById(req.params.id);
    if (!inst) return res.status(404).json({ message: "Institution not found" });

    inst.isApproved = true;
    await inst.save();

    // Send registration link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const registrationLink = `${frontendUrl}/register-admin/${inst._id}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailContent = `
Hello ${inst.officialInstitutionName},

Your institution registration has been approved!

Click the link below to create your admin account:
${registrationLink}

Thank you!
`;

    await transporter.sendMail({
      from: `"Knot Admin" <${process.env.EMAIL_USER}>`,
      to: inst.contactEmail,
      subject: "Institution Approved - Register Your Admin Account",
      text: emailContent,
    });

    res.json({ message: "Institution approved and registration email sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// -------------------- GET LOGGED-IN USER'S INSTITUTION --------------------
router.get("/my-institution", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("institution");
    if (!user || !user.institution)
      return res.status(404).json({ message: "No institution associated with this user" });

    res.json({
      _id: user.institution._id,
      name: user.institution.officialInstitutionName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;