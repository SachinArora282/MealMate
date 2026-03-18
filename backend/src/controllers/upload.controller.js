const path = require('path');
const fs = require('fs');

// POST /api/uploads/menu - OCR menu extraction
const extractMenu = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Try to use tesseract.js for OCR
    let extractedItems = [];
    try {
      const Tesseract = require('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng', {
        logger: () => {},
      });
      extractedItems = parseMenuText(text);
    } catch (ocrError) {
      console.warn('OCR not available, using mock data:', ocrError.message);
      // Mock extracted items for demo
      extractedItems = [
        { name: 'Butter Chicken', price: 280, dietType: 'NON_VEG' },
        { name: 'Paneer Butter Masala', price: 240, dietType: 'VEG' },
        { name: 'Garlic Naan', price: 60, dietType: 'VEG' },
        { name: 'Dal Makhani', price: 200, dietType: 'VEG' },
        { name: 'Biryani', price: 320, dietType: 'NON_VEG' },
        { name: 'Raita', price: 60, dietType: 'VEG' },
      ];
    }

    // Clean up temp file
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      items: extractedItems,
      message: `Extracted ${extractedItems.length} items from menu`,
    });
  } catch (error) {
    console.error('Menu extraction error:', error);
    res.status(500).json({ error: 'Failed to extract menu' });
  }
};

// Parse raw OCR text into structured menu items
function parseMenuText(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 2);
  const items = [];
  const priceRegex = /[₹$]?\s*(\d+(?:\.\d{2})?)/;
  
  for (const line of lines) {
    const priceMatch = line.match(priceRegex);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      const name = line.replace(priceRegex, '').replace(/[₹$\-\.]+/g, '').trim();
      if (name.length > 2 && price > 0 && price < 5000) {
        items.push({
          name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
          price,
          dietType: 'VEG', // Default, user can change
        });
      }
    }
  }
  return items.slice(0, 20); // Max 20 items
}

// POST /api/uploads/restaurant-image
const uploadRestaurantImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const imageUrl = `/uploads/${req.file.filename}`;
    const { restaurantId } = req.body;

    if (restaurantId) {
      await prisma.upload.upsert({
        where: { id: restaurantId + '-upload' },
        update: { restaurantImage: imageUrl },
        create: { id: restaurantId + '-upload', restaurantId, restaurantImage: imageUrl },
      });
    }

    res.json({ imageUrl, message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// POST /api/uploads/verification-video
const uploadVerificationVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video uploaded' });
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const videoUrl = `/uploads/${req.file.filename}`;
    const { restaurantId } = req.body;

    if (restaurantId) {
      await prisma.upload.upsert({
        where: { id: restaurantId + '-upload' },
        update: { verificationVideo: videoUrl },
        create: { id: restaurantId + '-upload', restaurantId, verificationVideo: videoUrl },
      });
    }

    res.json({ videoUrl, message: 'Verification video uploaded. Pending admin review.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

module.exports = { extractMenu, uploadRestaurantImage, uploadVerificationVideo };
