const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = http.request(options, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost', port: 4000, path, method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
    const req = http.request(options, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, body: d }); } });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('=== MealMate Feature Audit ===\n');
  const ts = Date.now();

  // 1. Health
  const health = await get('/api/health');
  console.log('✅ Health:', health.status === 200 ? 'OK' : '❌ FAIL', health.body?.status);

  // 2. Register
  const reg = await post('/api/auth/register', { name: 'Test User', email: `test${ts}@test.com`, password: 'test1234' });
  console.log(reg.status === 201 ? '✅ Register:' : '❌ Register:', reg.status, reg.body?.message || reg.body?.error);
  const token = reg.body?.token;

  // 3. Login with demo
  const login = await post('/api/auth/login', { email: 'demo@mealmate.com', password: 'user123' });
  console.log(login.status === 200 ? '✅ Login:' : '❌ Login:', login.status, login.body?.message || login.body?.error);
  const demoToken = login.body?.token;

  // 4. Admin login
  const adminLogin = await post('/api/auth/login', { email: 'admin@mealmate.com', password: 'admin123' });
  console.log(adminLogin.status === 200 ? '✅ Admin Login:' : '❌ Admin Login:', adminLogin.status, adminLogin.body?.message || adminLogin.body?.error);
  const adminToken = adminLogin.body?.token;

  // 5. Get dishes
  const dishes = await get('/api/dishes?limit=3');
  console.log(dishes.status === 200 ? '✅ Get Dishes:' : '❌ Get Dishes:', dishes.status, `${dishes.body?.dishes?.length ?? 0} dishes returned`);

  // 6. Get restaurants
  const rests = await get('/api/restaurants?limit=3');
  console.log(rests.status === 200 ? '✅ Get Restaurants:' : '❌ Get Restaurants:', rests.status, `${rests.body?.restaurants?.length ?? 0} restaurants returned`);

  // 7. Trending dishes
  const trending = await get('/api/dishes/trending');
  console.log(trending.status === 200 ? '✅ Trending Dishes:' : '❌ Trending Dishes:', trending.status, `${trending.body?.length ?? 0} returned`);

  // 8. Recommendations
  const reco = await get('/api/recommendations?maxBudget=200&dietType=VEG', demoToken);
  console.log(reco.status === 200 ? '✅ Recommendations:' : '❌ Recommendations:', reco.status, reco.body?.total ?? reco.body?.error);

  // 9. Admin stats
  const stats = await get('/api/admin/stats', adminToken);
  console.log(stats.status === 200 ? '✅ Admin Stats:' : '❌ Admin Stats:', stats.status, stats.body?.stats ? JSON.stringify(stats.body.stats) : stats.body?.error);

  // 10. Save dish (needs auth)
  const saved = await get('/api/saved', demoToken);
  console.log(saved.status === 200 ? '✅ Saved Dishes:' : '❌ Saved Dishes:', saved.status, Array.isArray(saved.body) ? `${saved.body.length} saved` : saved.body?.error);

  // 11. Submit restaurant
  const newRest = await post('/api/restaurants', { 
    name: 'Test Dhaba', cuisine: ['North Indian'], address: 'Test Lane, Mumbai', latitude: 19.02, longitude: 72.85 
  });
  console.log(newRest.status === 201 || newRest.status === 200 ? '✅ Create Restaurant:' : '❌ Create Restaurant (no auth):', newRest.status, newRest.body?.error || 'Created');

  console.log('\n=== Audit Complete ===');
}

run().catch(console.error);
