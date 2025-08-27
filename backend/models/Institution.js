// backend/models/Institution.js
import mongoose from "mongoose";

function arrayLimit(val) {
  return val.length <= 5; // max 5 verification documents
}

const institutionSchema = new mongoose.Schema({
  officialInstitutionName: { type: String, required: true, trim: true },
  institutionType: { type: String, required: true, trim: true },
  accreditationStatus: { type: String, required: true, trim: true },
  contactEmail: { type: String, required: true, trim: true, lowercase: true },
  contactPhone: { type: String, required: true, trim: true },
  institutionWebsite: { type: String, trim: true },
  physicalAddress: { type: String, required: true },
  verificationDocuments: {
    type: [String], // store URLs of uploaded documents
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"]
  },
  institutionLogo: { type: String }, // logo URL
  missionStatement: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false } // admin will approve later
});

export default mongoose.model("Institution", institutionSchema);