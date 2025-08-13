import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Event from '../models/Event.js';
import { fileURLToPath } from 'url';

const router = express.Router();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload folder path
const uploadFolder = path.join(__dirname, '..', 'uploads');

// Multer storage config: keep extensions & unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + Date.now() + ext;
    cb(null, filename);
  }
});

// Multer upload setup: max 3 images, max 5MB each, only images
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|gif)/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF images are allowed.'));
    }
  }
});

// CREATE new event with image upload
router.post('/', upload.array('pictures', 3), async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);

    let keyTerms = [];
    if (req.body.keyTerms) {
      try {
        keyTerms = JSON.parse(req.body.keyTerms);
      } catch {
        keyTerms = [];
      }
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
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();

    res.status(201).json(savedEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET events with filter, search, pagination
router.get('/', async (req, res) => {
  try {
    const { isClosed, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (isClosed === 'true') query.isClosed = true;
    else if (isClosed === 'false') query.isClosed = false;

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);

    const totalCount = await Event.countDocuments(query);

    const events = await Event.find(query)
      .sort({ startDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .exec();

    res.json({ events, totalCount });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH close event
router.patch('/:id/close', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.isClosed = true;
    await event.save();
    res.json({ message: 'Event closed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.pictures && event.pictures.length > 0) {
      event.pictures.forEach(url => {
        const filename = url.split('/uploads/')[1];
        if (filename) {
          const filePath = path.join(uploadFolder, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE event
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
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
