const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractMenu, uploadRestaurantImage, uploadVerificationVideo } = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.test(ext));
  },
});

// Serve uploaded files
router.use('/files', express.static(uploadsDir));

router.post('/menu', upload.single('menu'), extractMenu);
router.post('/restaurant-image', authenticate, upload.single('image'), uploadRestaurantImage);
router.post('/verification-video', authenticate, upload.single('video'), uploadVerificationVideo);

module.exports = router;
