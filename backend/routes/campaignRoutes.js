import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Campaign from '../models/Campaign.js';
import { fileURLToPath } from 'url';
import { authMiddleware } from './authRoutes.js'; // Import auth middleware
import User from '../models/User.js'; // To find institution from logged-in user

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

// CREATE new campaign
router.post('/', authMiddleware, upload.array('pictures', 3), async (req, res) => {
  try {
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
      keyTerms,
      institution: user.institution // link to logged-in user’s institution
    };

    const campaign = new Campaign(campaignData);
    const savedCampaign = await campaign.save();
    res.status(201).json(savedCampaign);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET campaigns filtered by institution
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('institution');
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }
    const institutionId = user.institution._id;

    const { isClosed, search, page = 1, limit = 10 } = req.query;
    const query = { institution: institutionId };

    if (isClosed === 'true') query.isClosed = true;
    else if (isClosed === 'false') query.isClosed = false;

    if (search) query.title = { $regex: search, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10), 50);

    const totalCount = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .sort({ startDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ campaigns, totalCount });
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET single campaign by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }

    const campaign = await Campaign.findOne({ _id: req.params.id, institution: user.institution });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found or not accessible' });

    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH close campaign
router.patch('/:id/close', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }

    const campaign = await Campaign.findOne({ _id: req.params.id, institution: user.institution });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    campaign.isClosed = true;
    await campaign.save();
    res.json({ message: 'Campaign closed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE campaign
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }

    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, institution: user.institution });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    if (campaign.pictures?.length) {
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
router.put('/:id', authMiddleware, upload.array('pictures', 3), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.institution) {
      return res.status(403).json({ message: 'User is not associated with an institution' });
    }

    const updateData = {
      ...req.body,
      keyTerms: req.body.keyTerms ? JSON.parse(req.body.keyTerms) : []
    };

    if (req.files?.length) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.pictures = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
    }

    const updatedCampaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, institution: user.institution },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCampaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(updatedCampaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST donation to a campaign
router.post('/:id/donations', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const { name, email, amount, company, receiveUpdates, timestamp } = req.body;

    const newDonation = {
      name,
      email,
      amount: Number(amount),
      company,
      receiveUpdates,
      donatedAt: timestamp
    };

    campaign.donations.push(newDonation);
    await campaign.save();

    res.status(201).json(campaign);
  } catch (err) {
    console.error('Error saving donation:', err);
    res.status(400).json({ message: err.message });
  }
});

export default router;
