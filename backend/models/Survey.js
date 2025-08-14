import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Options / Choices Schema
const OptionSchema = new Schema({
  text: { type: String, required: true },
  value: { type: Number },
  order: { type: Number },
  // For matrix/grid
  rowText: { type: String },
  colText: { type: String },
});

// Question Schema
const QuestionSchema = new Schema({
  surveyId: { type: Schema.Types.ObjectId, ref: "Survey" }, // removed required
  type: {
    type: String,
    enum: [
      "multiple-choice",
      "yes-no",
      "rating",
      "open-ended",
      "dropdown",
      "checkbox",
      "matrix",
      "ranking",
      "semantic-differential",
      "demographic",
    ],
    required: true,
  },
  text: { type: String, required: true },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  scale: { type: [Number] },
  options: [OptionSchema],
});

// Response Schema
const ResponseSchema = new Schema({
  surveyId: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  submittedAt: { type: Date, default: Date.now },
  answers: [
    {
      questionId: { type: Schema.Types.ObjectId, required: true },
      answer: Schema.Types.Mixed,
    },
  ],
});

// Survey Schema
const SurveySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    targetAudience: { type: String },
    questions: [QuestionSchema],
    responses: [ResponseSchema],
  },
  { timestamps: true }
);

export default model("Survey", SurveySchema);
