const express = require('express');
const router = express.Router();
const { getStats, approveRestaurant, rejectRestaurant, getAllRestaurants, updateDish } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const adminOnly = [authenticate, requireRole(['ADMIN'])];

router.get('/stats', ...adminOnly, getStats);
router.get('/restaurants', ...adminOnly, getAllRestaurants);
router.patch('/restaurants/:id/approve', ...adminOnly, approveRestaurant);
router.patch('/restaurants/:id/reject', ...adminOnly, rejectRestaurant);
router.patch('/dishes/:id', ...adminOnly, updateDish);

module.exports = router;
