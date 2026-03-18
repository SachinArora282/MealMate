const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDishes = async (req, res) => {
  try {
    const { search, dietType, mealType, minPrice, maxPrice, restaurantId, page = 1, limit = 20, sort = 'popularity', sortBy } = req.query;
    const effectiveSort = sortBy || sort;

    const where = {};
    if (dietType && dietType !== 'BOTH') where.dietType = dietType;
    if (mealType) where.mealType = mealType;
    if (restaurantId) where.restaurantId = restaurantId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
        // Search through the joined restaurant's address for neighbourhood filtering
        { restaurant: { address: { contains: search, mode: 'insensitive' } } },
        { restaurant: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy = effectiveSort === 'price' ? { price: 'asc' } : effectiveSort === 'rating' ? { rating: 'desc' } : { popularityScore: 'desc' };

    const [dishes, total] = await Promise.all([
      prisma.dish.findMany({
        where,
        include: {
          restaurant: {
            select: {
              id: true, name: true, address: true, city: true,
              latitude: true, longitude: true, verified: true,
              imageUrl: true, openingHours: true, priceRange: true,
            },
          },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy,
      }),
      prisma.dish.count({ where }),
    ]);

    res.json({ dishes, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
};


// GET /api/dishes/trending
const getTrendingDishes = async (req, res) => {
  try {
    const dishes = await prisma.dish.findMany({
      where: { isAvailable: true },
      include: {
        restaurant: { select: { id: true, name: true, address: true, verified: true } },
      },
      orderBy: { popularityScore: 'desc' },
      take: 10,
    });
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending dishes' });
  }
};

// GET /api/dishes/:id
const getDishById = async (req, res) => {
  try {
    const dish = await prisma.dish.findUnique({
      where: { id: req.params.id },
      include: {
        restaurant: {
          select: { id: true, name: true, address: true, latitude: true, longitude: true, phone: true, imageUrl: true },
        },
      },
    });
    if (!dish) return res.status(404).json({ error: 'Dish not found' });
    res.json(dish);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dish' });
  }
};

// POST /api/dishes
const createDish = async (req, res) => {
  try {
    const { restaurantId, name, price, dietType, description, tags, mealType, imageUrl } = req.body;
    if (!restaurantId || !name || !price) {
      return res.status(400).json({ error: 'Restaurant ID, name, and price are required' });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    if (restaurant.ownerId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const dish = await prisma.dish.create({
      data: {
        restaurantId,
        name,
        price: parseFloat(price),
        dietType: dietType || 'VEG',
        description,
        tags: tags || [],
        mealType: mealType || 'LUNCH',
        imageUrl,
      },
    });
    res.status(201).json(dish);
  } catch (error) {
    console.error('Create dish error:', error);
    res.status(500).json({ error: 'Failed to create dish' });
  }
};

// PUT /api/dishes/:id
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

module.exports = { getDishes, getTrendingDishes, getDishById, createDish, updateDish };
