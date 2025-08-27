import mongoose from 'mongoose';

function arrayLimit(val) {
  return val.length <= 3;
}

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, required: true, maxlength: 300 },
  pictures: {
    type: [String], // URLs to images stored on disk
    validate: [arrayLimit, '{PATH} exceeds the limit of 3']
  },
  keyTerms: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  isClosed: { type: Boolean, default: false },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true } // <-- institution
});

export default mongoose.model('Event', eventSchema);
