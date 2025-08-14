import express from "express";
import Survey from "../models/Survey.js";

const router = express.Router();

// Create a new survey
router.post("/", async (req, res) => {
  try {
    const { title, description, creatorId, targetAudience, questions } = req.body;

    const newSurvey = new Survey({
      title,
      description,
      creatorId,
      targetAudience,
      questions,
      isActive: true,
    });

    await newSurvey.save();
    res.status(201).json(newSurvey);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create survey", error: err.message });
  }
});

// Get all surveys (active or archived)
router.get("/", async (req, res) => {
  try {
    const { isClosed = "false", search = "", page = 1, limit = 10 } = req.query;
    const isActive = isClosed === "true" ? false : true;

    const query = {
      isActive,
      title: { $regex: search, $options: "i" },
    };

    const surveys = await Survey.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Survey.countDocuments(query);

    res.json({ surveys, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch surveys" });
  }
});

// Get single survey (place after /add and /archive)
router.get("/:id", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    res.json(survey);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch survey" });
  }
});

export default router;
