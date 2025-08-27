// Campaign.js
import mongoose from 'mongoose';

function arrayLimit(val) {
  return val.length <= 3;
}

const donationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  company: { type: String },
  receiveUpdates: { type: Boolean, default: false },
  donatedAt: { type: Date, default: Date.now }
});

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, required: true, maxlength: 300 },
  pictures: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 3']
  },
  keyTerms: { type: [String], default: [] },
  contactEmail: { type: String, required: true, trim: true },
  contactPhone: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  isClosed: { type: Boolean, default: false },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  donations: [donationSchema]
});

// ✅ Prevent OverwriteModelError
export default mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
