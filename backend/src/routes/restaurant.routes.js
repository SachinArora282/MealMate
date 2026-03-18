const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurantById, createRestaurant, updateRestaurant, getRestaurantDishes } = require('../controllers/restaurant.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/dishes', getRestaurantDishes);
router.post('/', authenticate, createRestaurant);
router.patch('/:id', authenticate, updateRestaurant);


module.exports = router;
