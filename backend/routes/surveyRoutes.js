import express from "express";
import Survey from "../models/Survey.js";
import { authMiddleware } from './authRoutes.js'; // Assuming you have an auth middleware

const router = express.Router();

/**
 * Create a new survey
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, creatorId, institution, targetAudience, questions } = req.body;

    // Validation for essential fields including 'institution'
    if (!title || !description || !creatorId || !institution) {
      return res.status(400).json({ message: "Title, description, creatorId, and institution are required." });
    }

    const newSurvey = new Survey({
      title,
      description,
      creatorId,
      institution, 
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

//---

/**
 * Get all surveys (active or archived) for a specific institution
 */
router.get("/", async (req, res) => {
  try {
    const { isClosed = "false", search = "", page = 1, limit = 10, institution } = req.query; // Extract 'institution' from query
    const isActive = isClosed === "true" ? false : true;

    // Ensure institution ID is provided to filter results
    if (!institution) {
      return res.status(400).json({ message: "Institution ID is required to fetch surveys." });
    }

    const query = {
      isActive,
      institution: institution, // Filter surveys by the provided institution ID
      title: { $regex: search, $options: "i" },
    };

    const surveys = await Survey.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalCount = await Survey.countDocuments(query);

    res.json({ surveys, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch surveys" });
  }
});

//---

/**
 * Get single survey
 */
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

//---

/**
 * Get all responses for a survey
 */
router.get("/:id/responses", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const responsesWithText = survey.responses.map((resp) => ({
      ...resp.toObject(),
      answers: resp.answers.map((a) => {
        const question = survey.questions.id(a.questionId);
        return {
          question: question ? question.text : "Deleted question",
          answer: a.answer,
        };
      }),
    }));

    res.json(responsesWithText);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch responses" });
  }
});

//---

/**
 * Submit a response for a survey
 */
router.post("/:id/responses", async (req, res) => {
  try {
    const { answers, userId } = req.body;

    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const newResponse = {
      surveyId: req.params.id,
      userId: userId || null,
      submittedAt: new Date(),
      answers: answers.map((a) => ({
        questionId: a.questionId,
        answer: a.answer,
      })),
    };

    survey.responses.push(newResponse);
    await survey.save();

    res.status(201).json({ message: "Response submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit response" });
  }
});

//---

/**
 * Delete a survey
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedSurvey = await Survey.findByIdAndDelete(req.params.id);
    if (!deletedSurvey) return res.status(404).json({ message: "Survey not found" });
    res.json({ message: "Survey deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete survey" });
  }
});

//---

/**
 * Delete a single response from a survey
 */
router.delete("/:surveyId/responses/:responseId", async (req, res) => {
  try {
    const { surveyId, responseId } = req.params;

    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const responseIndex = survey.responses.findIndex(
      (r) => r._id.toString() === responseId
    );
    if (responseIndex === -1)
      return res.status(404).json({ message: "Response not found" });

    survey.responses.splice(responseIndex, 1);
    await survey.save();

    res.json({ message: "Response deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete response" });
  }
});

//---

/**
 * Close a survey
 */
router.patch("/:id/close", async (req, res) => {
  try {
    const updatedSurvey = await Survey.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!updatedSurvey) return res.status(404).json({ message: "Survey not found" });
    res.json({ message: "Survey closed successfully", survey: updatedSurvey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to close survey" });
  }
});

//---

/**
 * Update a survey (Edit questions/options/title/description)
 */
router.patch("/:id", async (req, res) => {
  try {
    const updatedSurvey = await Survey.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedSurvey) return res.status(404).json({ message: "Survey not found" });
    res.json(updatedSurvey);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update survey" });
  }
});

export default router;