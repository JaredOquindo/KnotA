import mongoose from 'mongoose';

function arrayLimit(val) {
  return val.length <= 3; // limit to 3 images
}

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 0 }, // target fundraising amount
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, required: true, maxlength: 300 },
  pictures: {
    type: [String], // URLs to images stored on disk
    validate: [arrayLimit, '{PATH} exceeds the limit of 3']
  },
  keyTerms: { type: [String], default: [] },
  contactEmail: { type: String, required: true, trim: true },
  contactPhone: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  isClosed: { type: Boolean, default: false }
});

export default mongoose.model('Campaign', campaignSchema);
