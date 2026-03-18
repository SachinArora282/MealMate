const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/:restaurantId', getReviews);
router.post('/', authenticate, createReview);

module.exports = router;
