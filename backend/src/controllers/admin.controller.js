const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalRestaurants, verifiedRestaurants, pendingRestaurants, totalDishes, totalUsers, totalReviews] = await Promise.all([
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { verified: true } }),
      prisma.restaurant.count({ where: { verified: false } }),
      prisma.dish.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.review.count(),
    ]);

    const topDishes = await prisma.dish.findMany({
      orderBy: { popularityScore: 'desc' },
      take: 5,
      include: { restaurant: { select: { name: true } } },
    });

    const pendingApprovals = await prisma.restaurant.findMany({
      where: { verified: false },
      include: {
        uploads: { select: { status: true, restaurantImage: true, menuImage: true, verificationVideo: true } },
        owner: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      stats: { totalRestaurants, verifiedRestaurants, pendingRestaurants, totalDishes, totalUsers, totalReviews },
      topDishes,
      pendingApprovals,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// PATCH /api/admin/restaurants/:id/approve
const approveRestaurant = async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: { verified: true },
    });
    await prisma.upload.updateMany({
      where: { restaurantId: req.params.id },
      data: { status: 'APPROVED' },
    });
    res.json({ restaurant, message: 'Restaurant approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve restaurant' });
  }
};

// PATCH /api/admin/restaurants/:id/reject
const rejectRestaurant = async (req, res) => {
  try {
    const { adminNote } = req.body;
    await prisma.upload.updateMany({
      where: { restaurantId: req.params.id },
      data: { status: 'REJECTED', adminNote },
    });
    res.json({ message: 'Restaurant rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject restaurant' });
  }
};

// GET /api/admin/restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const { verified, page = 1, limit = 20 } = req.query;
    const where = verified !== undefined ? { verified: verified === 'true' } : {};
    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        _count: { select: { dishes: true, reviews: true } },
        owner: { select: { name: true, email: true } },
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

// PATCH /api/admin/dishes/:id
const updateDish = async (req, res) => {
  try {
    const dish = await prisma.dish.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(dish);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dish' });
  }
};

module.exports = { getStats, approveRestaurant, rejectRestaurant, getAllRestaurants, updateDish };
