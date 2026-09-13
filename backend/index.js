import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure Supabase (if provided)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) return allowed.test(origin);
        return allowed === origin;
      });
      if (isAllowed) return callback(null, true);
      return callback(null, true); // Permissive CORS for smooth deployment
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// Health Check Endpoint (Render monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FinSight Backend Service',
    timestamp: new Date().toISOString(),
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    supabaseConfigured: Boolean(supabase),
  });
});

// API Welcome Route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to FinSight Analytics API' });
});

// Cloudinary Receipt Upload Route
app.post('/api/upload/receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt file provided' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        error: 'Cloudinary environment variables are missing on the backend.',
      });
    }

    // Convert file buffer to base64 Data URI for Cloudinary upload
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'finsight/receipts',
      resource_type: 'auto',
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error('Error uploading receipt to Cloudinary:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload receipt' });
  }
});

// Cloudinary Avatar / Profile Image Upload Route
app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No avatar file provided' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        error: 'Cloudinary environment variables are missing on the backend.',
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'finsight/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading avatar to Cloudinary:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload avatar' });
  }
});

// Financial Analytics Summary API Endpoint
app.get('/api/analytics/summary', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({
        message: 'Supabase client not connected. Returning default analytics metrics.',
        data: {
          totalIncome: 12500.0,
          totalExpenses: 4230.5,
          savingsRate: 66.15,
          topCategory: 'Housing',
        },
      });
    }

    const { data: transactions, error } = await supabase.from('transactions').select('*');

    if (error) {
      throw error;
    }

    const totalIncome = (transactions || [])
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpenses = (transactions || [])
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(2) : 0;

    return res.json({
      data: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Number(savingsRate),
        transactionCount: transactions?.length || 0,
      },
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FinSight Backend Server listening on port ${PORT}`);
});
