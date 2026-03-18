const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const dishRoutes = require('./routes/dish.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');
const savedRoutes = require('./routes/saved.routes');

const { sqliteArrayParser } = require('./middlewares/sqliteArrays');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Parse SQLite JSON string arrays back to real arrays in all responses
app.use(sqliteArrayParser);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);


// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/saved', savedRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MealMate API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Stats endpoint for homepage ───────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const [totalRestaurants, totalDishes, totalUsers] = await Promise.all([
      prisma.restaurant.count({ where: { verified: true } }),
      prisma.dish.count(),
      prisma.user.count({ where: { role: 'USER' } }),
    ]);
    const avgPriceResult = await prisma.dish.aggregate({ _avg: { price: true } });
    res.json({
      totalRestaurants,
      totalDishes,
      totalUsers,
      avgPrice: Math.round(avgPriceResult._avg.price || 0),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  } finally {
    await prisma.$disconnect();
  }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 MealMate API running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`);

  // On production, auto-run migrations on startup
  if (process.env.NODE_ENV === 'production') {
    try {
      const { execSync } = require('child_process');
      console.log('🗄️  Running DB migrations...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('✅ DB ready');
    } catch (e) {
      console.error('⚠️  DB migration warning:', e.message);
    }
  }
});

module.exports = app;
