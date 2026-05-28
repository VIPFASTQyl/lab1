import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

// protect uploads - only authenticated users (admins) should upload
router.use(authMiddleware);

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// POST /api/uploads - single image upload
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }

    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      return res.status(201).json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  });
});

export default router;
