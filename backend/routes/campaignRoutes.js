// backend/routes/campaignRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Campaign from '../models/Campaign.js';
import { fileURLToPath } from 'url';

const router = express.Router();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload folder path
const uploadFolder = path.join(__dirname, '..', 'uploads');

// Multer storage config
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

// CREATE new campaign with image upload
router.post('/', upload.array('pictures', 3), async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);

    const campaignData = {
      title: req.body.title,
      targetAmount: req.body.targetAmount,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      description: req.body.description,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      pictures: imageUrls,
      isClosed: req.body.isClosed === 'true' || req.body.isClosed === true || false,
      keyTerms: req.body.keyTerms ? JSON.parse(req.body.keyTerms) : [], // ✅ Added
    };

    const campaign = new Campaign(campaignData);
    const savedCampaign = await campaign.save();

    res.status(201).json(savedCampaign);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET campaigns with filter, search, pagination
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

    const totalCount = await Campaign.countDocuments(query);

    const campaigns = await Campaign.find(query)
      .sort({ startDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .exec();

    res.json({ campaigns, totalCount });
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET single campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH close campaign
router.patch('/:id/close', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    campaign.isClosed = true;
    await campaign.save();
    res.json({ message: 'Campaign closed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    if (campaign.pictures && campaign.pictures.length > 0) {
      campaign.pictures.forEach(url => {
        const filename = url.split('/uploads/')[1];
        if (filename) {
          const filePath = path.join(uploadFolder, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE campaign
router.put('/:id', upload.array('pictures', 3), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      keyTerms: req.body.keyTerms ? JSON.parse(req.body.keyTerms) : [],
    };

    // If new images uploaded, replace them
    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.pictures = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCampaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(updatedCampaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
