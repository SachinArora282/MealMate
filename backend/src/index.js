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

// ─── Env diagnostic endpoint ───────────────────────────────────────────────────
app.get('/api/env-check', (req, res) => {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL?.slice(0, 30) + '...',
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
  });
});

// ─── One-Time Production Setup (run once to create tables + seed) ─────────────
app.post('/api/setup', async (req, res) => {
  const secret = req.headers['x-setup-secret'];
  const validSecret = process.env.SETUP_SECRET || 'mealmate_setup_2024';
  if (!secret || secret !== validSecret) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const log = [];
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');
  const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

  try {
    // Step 1: Try db push via inline DATABASE_URL in shell
    log.push('Step 1: Creating tables (db push)...');
    try {
      const { execSync } = require('child_process');
      const dbUrl = process.env.DATABASE_URL || '';
      // Embed DATABASE_URL directly in the shell command (Linux syntax)
      execSync(`DATABASE_URL="${dbUrl}" npx prisma db push --accept-data-loss`, {
        shell: '/bin/sh', stdio: 'pipe', cwd: process.cwd()
      });
      log.push('✅ Tables created via db push');
    } catch (e) {
      log.push('⚠️ db push warning (tables may already exist): ' + e.message.slice(0, 100));
    }

    // Step 2: Seed directly using PrismaClient (no subprocess — uses process.env.DATABASE_URL)
    log.push('Step 2: Seeding users...');
    const adminPass = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({ where: { email: 'admin@mealmate.com' }, update: {}, create: { name: 'MealMate Admin', email: 'admin@mealmate.com', password: adminPass, role: 'ADMIN' } });
    const ownerPass = await bcrypt.hash('owner123', 10);
    const owner = await prisma.user.upsert({ where: { email: 'owner@mealmate.com' }, update: {}, create: { name: 'Restaurant Owner', email: 'owner@mealmate.com', password: ownerPass, role: 'OWNER' } });
    const userPass = await bcrypt.hash('user123', 10);
    await prisma.user.upsert({ where: { email: 'demo@mealmate.com' }, update: {}, create: { name: 'Demo User', email: 'demo@mealmate.com', password: userPass, role: 'USER' } });
    log.push('✅ 3 users created');

    log.push('Step 3: Seeding restaurants...');
    const restaurants = [
      { id: 'ram-ashraya', name: 'Ram Ashraya', cuisine: ['South Indian', 'Breakfast'], address: 'Matunga West, Mumbai 400016', city: 'Mumbai', latitude: 19.0269, longitude: 72.8497, avgPrice: 80, rating: 4.8, verified: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800', ownerId: owner.id },
      { id: 'cafe-madras', name: 'Cafe Madras', cuisine: ['South Indian', 'Breakfast'], address: '38A Cadell Road, Matunga West, Mumbai', city: 'Mumbai', latitude: 19.0265, longitude: 72.8489, avgPrice: 90, rating: 4.7, verified: true, imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800', ownerId: owner.id },
      { id: 'ashok-vada-pav', name: 'Ashok Vada Pav', cuisine: ['Street Food', 'Vada Pav'], address: 'Dadar West, Mumbai 400028', city: 'Mumbai', latitude: 19.0178, longitude: 72.8478, avgPrice: 30, rating: 4.7, verified: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', ownerId: owner.id },
      { id: 'swati-snacks', name: 'Swati Snacks', cuisine: ['Gujarati', 'Snacks'], address: 'Tardeo Road, Mumbai 400007', city: 'Mumbai', latitude: 18.9726, longitude: 72.8102, avgPrice: 150, rating: 4.6, verified: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', ownerId: owner.id },
      { id: 'guru-kripa-sion', name: 'Guru Kripa', cuisine: ['North Indian', 'Chole Bhature'], address: 'Sion West, Mumbai 400022', city: 'Mumbai', latitude: 19.0436, longitude: 72.8618, avgPrice: 80, rating: 4.5, verified: true, imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', ownerId: owner.id },
      { id: 'britannia-co', name: 'Britannia & Co', cuisine: ['Parsi', 'Heritage'], address: 'Ballard Estate, Mumbai 400038', city: 'Mumbai', latitude: 18.9447, longitude: 72.8394, avgPrice: 450, rating: 4.5, verified: true, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', ownerId: owner.id },
      { id: 'sardar-refreshments', name: 'Sardar Refreshments', cuisine: ['Street Food', 'Pav Bhaji'], address: 'Tardeo, Mumbai 400034', city: 'Mumbai', latitude: 18.9750, longitude: 72.8083, avgPrice: 90, rating: 4.6, verified: true, imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', ownerId: owner.id },
      { id: 'kyani-co', name: 'Kyani & Co', cuisine: ['Irani', 'Bun Maska'], address: 'Marine Lines, Mumbai 400002', city: 'Mumbai', latitude: 18.9544, longitude: 72.8206, avgPrice: 120, rating: 4.4, verified: true, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', ownerId: owner.id },
      { id: 'shree-thaker', name: 'Shree Thaker Bhojanalay', cuisine: ['Gujarati', 'Thali'], address: 'Kalbadevi, Mumbai 400002', city: 'Mumbai', latitude: 18.9522, longitude: 72.8295, avgPrice: 400, rating: 4.7, verified: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', ownerId: owner.id },
      { id: 'hotel-chaitanya', name: 'Hotel Chaitanya', cuisine: ['Maharashtrian', 'Thali'], address: 'Dadar East, Mumbai 400014', city: 'Mumbai', latitude: 19.0210, longitude: 72.8555, avgPrice: 180, rating: 4.4, verified: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', ownerId: owner.id },
    ];
    for (const r of restaurants) {
      await prisma.restaurant.upsert({ where: { id: r.id }, update: {}, create: r });
    }
    log.push(`✅ ${restaurants.length} restaurants seeded`);

    log.push('Step 4: Seeding dishes...');
    await prisma.dish.deleteMany({});
    const dishes = [
      { restaurantId: 'ram-ashraya', name: 'Masala Dosa', price: 80, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.9, popularityScore: 99, tags: ['South Indian','Breakfast','Classic'], imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800' },
      { restaurantId: 'ram-ashraya', name: 'Filter Coffee', price: 40, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.9, popularityScore: 98, tags: ['Filter Coffee','Beverage'], imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800' },
      { restaurantId: 'ram-ashraya', name: 'Medu Vada', price: 50, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.7, popularityScore: 90, tags: ['South Indian','Fried'], imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800' },
      { restaurantId: 'cafe-madras', name: 'Mysore Masala Dosa', price: 90, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.8, popularityScore: 96, tags: ['South Indian','Spicy'], imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800' },
      { restaurantId: 'cafe-madras', name: 'Idli Sambar', price: 60, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.7, popularityScore: 88, tags: ['South Indian','Steamed'], imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800' },
      { restaurantId: 'ashok-vada-pav', name: 'Vada Pav', price: 20, dietType: 'VEG', mealType: 'SNACKS', rating: 4.8, popularityScore: 99, tags: ['Street Food','Mumbai','Budget','Classic'], imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },
      { restaurantId: 'ashok-vada-pav', name: 'Samosa', price: 15, dietType: 'VEG', mealType: 'SNACKS', rating: 4.5, popularityScore: 82, tags: ['Street Food','Budget'], imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800' },
      { restaurantId: 'swati-snacks', name: 'Dhokla', price: 70, dietType: 'VEG', mealType: 'SNACKS', rating: 4.8, popularityScore: 97, tags: ['Gujarati','Steamed','Healthy'], imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },
      { restaurantId: 'swati-snacks', name: 'Dahi Batata Puri', price: 100, dietType: 'VEG', mealType: 'SNACKS', rating: 4.7, popularityScore: 88, tags: ['Gujarati','Chaat'], imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },
      { restaurantId: 'guru-kripa-sion', name: 'Chole Bhature', price: 90, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.6, popularityScore: 92, tags: ['North Indian','Classic'], imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800' },
      { restaurantId: 'sardar-refreshments', name: 'Pav Bhaji', price: 90, dietType: 'VEG', mealType: 'SNACKS', rating: 4.7, popularityScore: 95, tags: ['Street Food','Mumbai','Butter'], imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800' },
      { restaurantId: 'britannia-co', name: 'Berry Pulao', price: 480, dietType: 'NON_VEG', mealType: 'LUNCH', rating: 4.8, popularityScore: 94, tags: ['Parsi','Heritage','Iconic'], imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800' },
      { restaurantId: 'kyani-co', name: 'Bun Maska', price: 40, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.6, popularityScore: 86, tags: ['Irani','Heritage'], imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800' },
      { restaurantId: 'shree-thaker', name: 'Gujarati Thali', price: 400, dietType: 'VEG', mealType: 'LUNCH', rating: 4.7, popularityScore: 91, tags: ['Gujarati','Thali','Unlimited'], imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800' },
      { restaurantId: 'hotel-chaitanya', name: 'Maharashtrian Thali', price: 180, dietType: 'VEG', mealType: 'LUNCH', rating: 4.5, popularityScore: 83, tags: ['Maharashtrian','Traditional'], imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800' },
    ];
    for (const d of dishes) {
      await prisma.dish.create({ data: d });
    }
    log.push(`✅ ${dishes.length} dishes seeded`);

    res.json({ success: true, log });
  } catch (err) {
    log.push('❌ Error: ' + err.message);
    res.status(500).json({ success: false, log, error: err.message });
  } finally {
    await prisma.$disconnect();
  }
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
