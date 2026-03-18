const express = require('express');
const router = express.Router();
const { getDishes, getTrendingDishes, getDishById, createDish, updateDish } = require('../controllers/dish.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', getDishes);
router.get('/trending', getTrendingDishes);
router.get('/:id', getDishById);
router.post('/', authenticate, createDish);
router.put('/:id', authenticate, updateDish);

module.exports = router;
