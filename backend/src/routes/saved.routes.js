const express = require('express');
const router = express.Router();
const { getSaved, saveDish, unsaveDish } = require('../controllers/saved.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, getSaved);
router.post('/', authenticate, saveDish);
router.delete('/:dishId', authenticate, unsaveDish);

module.exports = router;
