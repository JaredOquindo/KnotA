import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Event from '../models/Event.js';
import { fileURLToPath } from 'url';
import { authMiddleware } from './authRoutes.js'; // Import auth middleware
import User from '../models/User.js'; // Import User model to find institution

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload folder
const uploadFolder = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, GIF images are allowed.'));
  }
});

// CREATE new event
router.post('/', authMiddleware, upload.array('pictures', 3), async (req, res) => {
  try {
    // Get institution from logged-in user through the token
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);

    let keyTerms = [];
    if (req.body.keyTerms) {
      try { keyTerms = JSON.parse(req.body.keyTerms); } catch {}
    }

    const eventData = {
      title: req.body.title,
      location: req.body.location,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      description: req.body.description,
      keyTerms,
      pictures: imageUrls,
      isClosed: req.body.isClosed === 'true' || req.body.isClosed === true || false,
      institution: user.institution // Assign institution from the logged-in user
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET events filtered by institution
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get the logged-in user's institution ID from the token
    const user = await User.findById(req.userId).populate('institution');
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }
    const institutionId = user.institution._id;

    const { isClosed, search, page = 1, limit = 10 } = req.query;

    const query = { institution: institutionId }; // Use the institution ID from the token

    if (isClosed === 'true') query.isClosed = true;
    else if (isClosed === 'false') query.isClosed = false;

    if (search) query.title = { $regex: search, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10), 50);

    const totalCount = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ startDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ events, totalCount });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET single event by ID and institution
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }
    const institutionId = user.institution._id;
    
    const event = await Event.findOne({ _id: req.params.id, institution: institutionId });
    if (!event) return res.status(404).json({ message: 'Event not found or you do not have permission to view it' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH close event (institution check)
router.patch('/:id/close', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }
    const institutionId = user.institution._id;

    const event = await Event.findOne({ _id: req.params.id, institution: institutionId });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.isClosed = true;
    await event.save();
    res.json({ message: 'Event closed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }
    const institutionId = user.institution._id;

    const event = await Event.findOneAndDelete({ _id: req.params.id, institution: institutionId });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.pictures?.length) {
      event.pictures.forEach(url => {
        const filename = url.split('/uploads/')[1];
        if (filename) {
          const filePath = path.join(uploadFolder, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE event
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }
    const institutionId = user.institution._id;

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: req.params.id, institution: institutionId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });

    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;