const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/saved
const getSaved = async (req, res) => {
  try {
    const saved = await prisma.savedDish.findMany({
      where: { userId: req.userId },
      include: {
        dish: {
          include: { restaurant: { select: { name: true, address: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(saved.map(s => s.dish));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved dishes' });
  }
};

// POST /api/saved
const saveDish = async (req, res) => {
  try {
    const { dishId } = req.body;
    if (!dishId) return res.status(400).json({ error: 'Dish ID required' });
    const saved = await prisma.savedDish.create({ data: { userId: req.userId, dishId } });
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Dish already saved' });
    res.status(500).json({ error: 'Failed to save dish' });
  }
};

// DELETE /api/saved/:dishId
const unsaveDish = async (req, res) => {
  try {
    await prisma.savedDish.deleteMany({ where: { userId: req.userId, dishId: req.params.dishId } });
    res.json({ message: 'Dish removed from saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove saved dish' });
  }
};

module.exports = { getSaved, saveDish, unsaveDish };
