// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import eventRoutes from './routes/eventRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js'; // ← import survey routes

const app = express();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/events', eventRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/surveys', surveyRoutes); // ← register survey routes

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to Database'))
  .catch(err => console.error('❌ Database connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server Started on port ${PORT}`));
