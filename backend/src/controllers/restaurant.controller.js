const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/restaurants
const getRestaurants = async (req, res) => {
  try {
    const { cuisine, verified, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (verified !== undefined) where.verified = verified === 'true';
    if (cuisine) {
      // SQLite: cuisine stored as JSON string, use contains
      where.cuisine = { contains: cuisine };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          dishes: { take: 3, orderBy: { popularityScore: 'desc' } },
          _count: { select: { dishes: true, reviews: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { rating: 'desc' },
      }),
      prisma.restaurant.count({ where }),
    ]);

    res.json({
      restaurants,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

// GET /api/restaurants/:id
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      include: {
        dishes: { orderBy: { popularityScore: 'desc' } },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { dishes: true, reviews: true } },
      },
    });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
};

// POST /api/restaurants
const createRestaurant = async (req, res) => {
  try {
    const { name, cuisine, address, latitude, longitude, avgPrice, description, phone, website } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    // SQLite stores arrays as JSON strings
    const cuisineArr = Array.isArray(cuisine) ? cuisine : (cuisine ? [cuisine] : []);
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        cuisine: JSON.stringify(cuisineArr),
        address,
        city: req.body.city || 'Mumbai',
        latitude: parseFloat(latitude) || 19.0760,
        longitude: parseFloat(longitude) || 72.8777,
        avgPrice: parseFloat(avgPrice) || 0,
        description,
        phone,
        website,
        ownerId: req.userId,
        verified: false,
      },
    });

    res.status(201).json({ restaurant, message: 'Restaurant created successfully. Pending admin approval.' });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
};

// PATCH /api/restaurants/:id
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    if (restaurant.ownerId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
};

// GET /api/restaurants/:id/dishes
const getRestaurantDishes = async (req, res) => {
  try {
    const dishes = await prisma.dish.findMany({
      where: { restaurantId: req.params.id },
      orderBy: { popularityScore: 'desc' },
    });
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
};

module.exports = { getRestaurants, getRestaurantById, createRestaurant, updateRestaurant, getRestaurantDishes };
