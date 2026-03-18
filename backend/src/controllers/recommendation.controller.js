const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Recommendation Engine
 * Score formula: score = (rating * 0.4) + (popularity * 0.3) + (distance_score * 0.3)
 */

const calculateDistanceScore = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0.5; // Default middle score
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Convert distance to score: 0km = 1.0, 10km = 0.5, 20km+ = 0.0
  return Math.max(0, 1 - distance / 20);
};

const getRecommendations = async (req, res) => {
  try {
    const {
      budget,
      minBudget = 0,
      maxBudget = 1000,
      mealType,
      dietType,
      lat,
      lng,
      limit = 20,
    } = req.query;

    const where = { isAvailable: true };

    // Budget filter
    const actualMaxBudget = budget ? parseFloat(budget) : parseFloat(maxBudget);
    if (actualMaxBudget > 0) {
      where.price = { lte: actualMaxBudget, gte: parseFloat(minBudget) || 0 };
    }

    // Meal type filter
    if (mealType && mealType !== 'ALL') where.mealType = mealType.toUpperCase();

    // Dietary filter
    if (dietType && dietType !== 'BOTH') where.dietType = dietType.toUpperCase();

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        restaurant: {
          select: { id: true, name: true, address: true, latitude: true, longitude: true, verified: true, imageUrl: true },
        },
      },
      take: 100, // fetch more, then sort in memory
    });

    // Score and sort
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    const scored = dishes.map((dish) => {
      const ratingScore = (dish.rating / 5) * 0.4;
      const popularityScore = (Math.min(dish.popularityScore, 100) / 100) * 0.3;
      const distanceScore = calculateDistanceScore(userLat, userLng, dish.restaurant.latitude, dish.restaurant.longitude) * 0.3;
      const totalScore = ratingScore + popularityScore + distanceScore;
      return { ...dish, _score: totalScore };
    });

    scored.sort((a, b) => b._score - a._score);

    res.json({
      recommendations: scored.slice(0, parseInt(limit)),
      total: scored.length,
      filters: { mealType, dietType, maxBudget: actualMaxBudget, minBudget },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

module.exports = { getRecommendations };
