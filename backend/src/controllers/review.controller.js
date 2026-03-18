const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;
    if (!restaurantId || !rating) return res.status(400).json({ error: 'Restaurant ID and rating required' });

    const review = await prisma.review.create({
      data: { userId: req.userId, restaurantId, rating: parseFloat(rating), comment },
      include: { user: { select: { name: true, avatar: true } } },
    });

    // Update restaurant average rating
    const avg = await prisma.review.aggregate({ where: { restaurantId }, _avg: { rating: true } });
    await prisma.restaurant.update({ where: { id: restaurantId }, data: { rating: avg._avg.rating || 0 } });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// GET /api/reviews/:restaurantId
const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { restaurantId: req.params.restaurantId },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = { createReview, getReviews };
