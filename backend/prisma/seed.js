const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// SQLite: arrays stored as JSON strings
const arr = (a) => JSON.stringify(a);

async function main() {
  console.log('🌱 Seeding MealMate — Matunga / Dadar / Sion / Wadala area...\n');

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mealmate.com' }, update: {},
    create: { name: 'MealMate Admin', email: 'admin@mealmate.com', password: adminPass, role: 'ADMIN' },
  });

  const userPass = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@mealmate.com' }, update: {},
    create: { name: 'Demo User', email: 'demo@mealmate.com', password: userPass, role: 'USER' },
  });

  const ownerPass = await bcrypt.hash('owner123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@mealmate.com' }, update: {},
    create: { name: 'Restaurant Owner', email: 'owner@mealmate.com', password: ownerPass, role: 'OWNER' },
  });
  console.log('✅ 3 users created');

  // ── Restaurants ────────────────────────────────────────────────────────────
  const restaurants = [
    // ── MATUNGA ───────────────────────────────────────────────────────────
    { id: 'ram-ashraya', name: 'Ram Ashraya', cuisine: arr(['South Indian', 'Breakfast', 'Filter Coffee']), address: 'Matunga West, Mumbai 400016', city: 'Mumbai', latitude: 19.0269, longitude: 72.8497, avgPrice: 80, rating: 4.8, verified: true, description: 'Legendary 80+ year old Matunga institution. The definitive Masala Dosa and Filter Coffee in Mumbai. No frills, pure gold.', openingHours: '7:30 AM – 1:30 PM, 4:00 PM – 8:30 PM (Closed Mon)', priceRange: '₹40–₹120', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800', ownerId: owner.id },
    { id: 'cafe-madras', name: 'Cafe Madras', cuisine: arr(['South Indian', 'Breakfast', 'Filter Coffee']), address: '38A Cadell Road, Matunga West, Mumbai 400016', city: 'Mumbai', latitude: 19.0265, longitude: 72.8489, avgPrice: 90, rating: 4.7, verified: true, description: 'A Matunga legend since 1940. Famous for Mysore Masala Dosa, Medu Vada, and the best Filter Coffee in the area. Weekend queues are worth every minute.', openingHours: '7:00 AM – 11:00 PM (Closed Tue)', priceRange: '₹50–₹150', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800', ownerId: owner.id },
    { id: 'arya-bhavan', name: 'Arya Bhavan', cuisine: arr(['South Indian', 'Breakfast', 'Udupi']), address: 'Matunga West, Mumbai 400016', city: 'Mumbai', latitude: 19.0271, longitude: 72.8501, avgPrice: 100, rating: 4.6, verified: true, description: 'Authentic Udupi-style South Indian with a loyal local following. Known for fluffy Uttapam, soft Idli, and generous portions since the 1950s.', openingHours: '7:00 AM – 10:30 PM', priceRange: '₹60–₹160', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', ownerId: owner.id },
    { id: 'mani-lunch-home', name: "Mani's Lunch Home", cuisine: arr(['South Indian', 'Seafood', 'Lunch']), address: 'Matunga East, Mumbai 400019', city: 'Mumbai', latitude: 19.0280, longitude: 72.8540, avgPrice: 200, rating: 4.5, verified: true, description: 'Beloved for Chettinad-style lunch thali and fresh seafood curries. A hidden gem near Matunga station that locals fiercely protect.', openingHours: '11:30 AM – 3:30 PM, 7:00 PM – 10:30 PM', priceRange: '₹150–₹350', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', ownerId: owner.id },
    { id: 'shri-krishna-boarding', name: 'Shri Krishna Boarding', cuisine: arr(['South Indian', 'Breakfast']), address: 'Ranade Road, Matunga West, Mumbai 400016', city: 'Mumbai', latitude: 19.0258, longitude: 72.8480, avgPrice: 80, rating: 4.5, verified: true, description: 'Famous for hot Gulab Jamun served alongside South Indian breakfast — a unique Matunga experience that exists nowhere else.', openingHours: '7:00 AM – 1:00 PM, 4:30 PM – 8:30 PM', priceRange: '₹40–₹100', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800', ownerId: owner.id },
    { id: 'idli-house-matunga', name: 'Idli House', cuisine: arr(['South Indian', 'Breakfast', 'Fast Food']), address: 'Telang Road, Matunga West, Mumbai 400016', city: 'Mumbai', latitude: 19.0275, longitude: 72.8492, avgPrice: 60, rating: 4.3, verified: true, description: 'Quick affordable South Indian tiffin. Great for students and office-goers. Idlis are always fresh and soft.', openingHours: '7:00 AM – 12:00 PM, 4:00 PM – 9:00 PM', priceRange: '₹40–₹80', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', ownerId: owner.id },

    // ── DADAR ─────────────────────────────────────────────────────────────
    { id: 'ashok-vada-pav', name: 'Ashok Vada Pav', cuisine: arr(['Street Food', 'Vada Pav', 'Mumbai Snacks']), address: 'Opposite Dadar Station, Dadar West, Mumbai 400028', city: 'Mumbai', latitude: 19.0178, longitude: 72.8478, avgPrice: 30, rating: 4.7, verified: true, description: 'The Vada Pav Mecca of Mumbai. 30+ years, Bollywood celebrities and local workers queue here together. The spicy green chutney is legendary.', openingHours: '8:00 AM – 10:00 PM', priceRange: '₹15–₹40', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', ownerId: owner.id },
    { id: 'shri-krishna-batata-vada', name: 'Shri Krishna Batata Vada', cuisine: arr(['Street Food', 'Vada Pav', 'Heritage']), address: 'Near Chhabildas School, Dadar West, Mumbai 400028', city: 'Mumbai', latitude: 19.0190, longitude: 72.8465, avgPrice: 25, rating: 4.6, verified: true, description: 'A 75+ year institution. Same family, same recipe. The crispy batter and fluffy potato filling haven\'t changed in generations.', openingHours: '8:30 AM – 1:00 PM, 4:00 PM – 8:00 PM', priceRange: '₹12–₹30', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', ownerId: owner.id },
    { id: 'prakash-upahar', name: 'Prakash Upahaar Kendra', cuisine: arr(['South Indian', 'Maharashtrian', 'Breakfast']), address: 'Dadar West, Mumbai 400028', city: 'Mumbai', latitude: 19.0195, longitude: 72.8470, avgPrice: 90, rating: 4.5, verified: true, description: 'A Dadar favourite serving soft fluffy dosas, crispy medu vadas, and authentic Maharashtrian breakfast items.', openingHours: '7:30 AM – 11:00 PM', priceRange: '₹50–₹150', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800', ownerId: owner.id },
    { id: 'gypsy-corner-dadar', name: 'Gypsy Corner', cuisine: arr(['Street Food', 'Sandwiches', 'Fast Food']), address: 'Near Portuguese Church, Dadar West, Mumbai 400028', city: 'Mumbai', latitude: 19.0174, longitude: 72.8455, avgPrice: 80, rating: 4.2, verified: true, description: 'Iconic Dadar joint for Bombay-style sandwiches, bhurji pav, and grilled sandwiches. A late-night go-to for students.', openingHours: '12:00 PM – 1:30 AM', priceRange: '₹50–₹130', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', ownerId: owner.id },
    { id: 'hotel-chaitanya', name: 'Hotel Chaitanya', cuisine: arr(['Maharashtrian', 'Lunch', 'Thali']), address: 'Dr. Ambedkar Marg, Dadar East, Mumbai 400014', city: 'Mumbai', latitude: 19.0210, longitude: 72.8555, avgPrice: 180, rating: 4.4, verified: true, description: 'Pure Maharashtrian food — Ukadiche Modak, Sol Kadhi, Pitla-Bhakri, Varan Bhaat. Excellent value lunch thali.', openingHours: '11:00 AM – 3:30 PM, 7:00 PM – 10:30 PM', priceRange: '₹120–₹280', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', ownerId: owner.id },
    { id: 'swati-snacks', name: 'Swati Snacks', cuisine: arr(['Gujarati', 'Snacks', 'Chaats']), address: 'Opposite Bhatia Hospital, Tardeo Road, Mumbai 400007', city: 'Mumbai', latitude: 18.9726, longitude: 72.8102, avgPrice: 150, rating: 4.6, verified: true, description: 'Landmark Gujarati snack spot. The Dhokla, Panki, and Dahi Batata Puri are legendary. Lunchtime queues snake out the door.', openingHours: '11:30 AM – 10:00 PM (Closed Tue)', priceRange: '₹60–₹250', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', ownerId: owner.id },

    // ── SION ──────────────────────────────────────────────────────────────
    { id: 'guru-kripa-sion', name: 'Guru Kripa', cuisine: arr(['North Indian', 'Chole Bhature', 'Street Food']), address: 'Sion West, Mumbai 400022', city: 'Mumbai', latitude: 19.0436, longitude: 72.8618, avgPrice: 80, rating: 4.5, verified: true, description: 'Sion\'s beloved spot famous for fluffy, puffed Bhature with spicy tangy Chole. Breakfast queues start at 8 AM. Cash only.', openingHours: '8:00 AM – 2:00 PM (Sells out early)', priceRange: '₹60–₹120', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', ownerId: owner.id },
    { id: 'cafe-military-sion', name: 'Cafe Military', cuisine: arr(['Irani', 'Breakfast', 'Bun Maska']), address: 'Sion Circle, Sion West, Mumbai 400022', city: 'Mumbai', latitude: 19.0445, longitude: 72.8625, avgPrice: 70, rating: 4.3, verified: true, description: 'A 90-year-old Irani cafe serving old-school Bun Maska, Keema Pav, and strong Chai. Faded wooden tables, timeless vibes.', openingHours: '7:00 AM – 11:30 PM', priceRange: '₹30–₹150', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', ownerId: owner.id },
    { id: 'sion-fort-misal', name: 'Sion Fort Restaurant', cuisine: arr(['Maharashtrian', 'Breakfast', 'Misal Pav']), address: 'Near Sion Fort, Sion East, Mumbai 400022', city: 'Mumbai', latitude: 19.0420, longitude: 72.8650, avgPrice: 60, rating: 4.2, verified: true, description: 'The best Misal Pav in Sion. Fiery tarri-soaked sprouts with crispy farsan. A Maharashtrian breakfast essential for spice lovers.', openingHours: '7:30 AM – 12:30 PM', priceRange: '₹50–₹90', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', ownerId: owner.id },

    // ── WADALA / GTB ──────────────────────────────────────────────────────
    { id: 'sardar-refreshments', name: 'Sardar Refreshments', cuisine: arr(['Street Food', 'Pav Bhaji', 'Mumbai Snacks']), address: 'Tardeo, Near August Kranti Marg, Mumbai 400034', city: 'Mumbai', latitude: 18.9750, longitude: 72.8083, avgPrice: 90, rating: 4.6, verified: true, description: 'Mumbai\'s Pav Bhaji king since the 1960s. Butter-loaded, tomato-red Bhaji with perfectly toasted Pav. Still draws the longest queues.', openingHours: '11:00 AM – 11:30 PM', priceRange: '₹70–₹130', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', ownerId: owner.id },
    { id: 'gtb-dosa-centre', name: 'GTB Dosa Centre', cuisine: arr(['South Indian', 'Street Food', 'Breakfast']), address: 'GTB Nagar, Wadala East, Mumbai 400037', city: 'Mumbai', latitude: 19.0130, longitude: 72.8680, avgPrice: 70, rating: 4.3, verified: true, description: 'Local favourite near GTB Nagar station. Quick crispy dosas and soft idlis. Popular with workers and commuters.', openingHours: '7:00 AM – 10:00 PM', priceRange: '₹40–₹100', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800', ownerId: owner.id },
    { id: 'wadala-biryani-house', name: 'Wadala Biryani House', cuisine: arr(['Biryani', 'Mughlai', 'North Indian']), address: 'Wadala West, Near Wadala Bus Depot, Mumbai 400031', city: 'Mumbai', latitude: 19.0115, longitude: 72.8625, avgPrice: 220, rating: 4.4, verified: true, description: 'Fragrant dum biryani cooked in-house. The Mutton Biryani is a clear winner — tender meat, perfectly spiced rice.', openingHours: '11:30 AM – 11:00 PM', priceRange: '₹150–₹350', imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800', ownerId: owner.id },

    // ── HERITAGE ──────────────────────────────────────────────────────────
    { id: 'britannia-co', name: 'Britannia & Co', cuisine: arr(['Parsi', 'Heritage', 'Berry Pulao']), address: 'Wakefield House, 11 Sprott Road, Ballard Estate, Mumbai 400038', city: 'Mumbai', latitude: 18.9447, longitude: 72.8394, avgPrice: 450, rating: 4.5, verified: true, description: 'Established 1923. The legendary Parsi cafe famous for its signature Berry Pulao — fragrant rice with dried barberries and slow-cooked mutton.', openingHours: '11:30 AM – 4:00 PM (Mon–Sat)', priceRange: '₹300–₹700', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', ownerId: owner.id },
    { id: 'shree-thaker', name: 'Shree Thaker Bhojanalay', cuisine: arr(['Gujarati', 'Thali', 'Unlimited']), address: '31A Dadiseth Agiary Lane, Kalbadevi, Mumbai 400002', city: 'Mumbai', latitude: 18.9522, longitude: 72.8295, avgPrice: 400, rating: 4.7, verified: true, description: 'Unlimited traditional Gujarati thali since 1945. Dal, sabzi, rotli, rice, papad, and Shrikhand dessert. A true comfort feast.', openingHours: '11:00 AM – 3:30 PM, 7:00 PM – 10:30 PM', priceRange: '₹350–₹450', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', ownerId: owner.id },
    { id: 'kyani-co', name: 'Kyani & Co', cuisine: arr(['Irani', 'Parsi', 'Bun Maska']), address: 'JSS Road & Rope Walk Lane, Marine Lines, Mumbai 400002', city: 'Mumbai', latitude: 18.9544, longitude: 72.8206, avgPrice: 120, rating: 4.4, verified: true, description: '100+ year old Irani cafe — one of Mumbai\'s last. Famous for Bun Maska, Nankhatai biscuits, and Keema Pav. Slow, timeless, irreplaceable.', openingHours: '7:00 AM – 9:00 PM (Closed Sun)', priceRange: '₹40–₹200', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', ownerId: owner.id },
  ];

  for (const r of restaurants) {
    await prisma.restaurant.upsert({ where: { id: r.id }, update: {}, create: r });
  }
  console.log(`✅ ${restaurants.length} restaurants created`);

  // ── Dishes ────────────────────────────────────────────────────────────────
  await prisma.dish.deleteMany({});

  const t = (tags) => JSON.stringify(tags); // serialize tags for SQLite

  const dishes = [
    // Ram Ashraya
    { restaurantId: 'ram-ashraya', name: 'Masala Dosa', price: 80, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.9, popularityScore: 99, tags: t(['South Indian','Breakfast','Classic','Matunga']), description: 'Razor-thin, golden crispy dosa with perfectly spiced potato filling. Arguably the best Masala Dosa in Mumbai. Served with thick sambar and white coconut chutney.', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800' },
    { restaurantId: 'ram-ashraya', name: 'Filter Coffee', price: 40, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.9, popularityScore: 98, tags: t(['Filter Coffee','Beverage','Matunga']), description: 'The most talked-about Filter Coffee in Mumbai. Strong dark decoction with thick milk, served in a traditional brass tumbler-dabarah set.', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800' },
    { restaurantId: 'ram-ashraya', name: 'Medu Vada', price: 50, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.7, popularityScore: 90, tags: t(['South Indian','Breakfast','Fried']), description: 'Crispy on the outside, fluffy inside. Dunked in hot sambar — dangerously addictive.', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800' },
    { restaurantId: 'ram-ashraya', name: 'Idli Sambar', price: 50, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.8, popularityScore: 92, tags: t(['South Indian','Breakfast','Steamed']), description: 'Three perfectly steamed idlis with piping hot sambar and fresh coconut chutney.', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800' },
    { restaurantId: 'ram-ashraya', name: 'Rava Dosa', price: 70, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.6, popularityScore: 85, tags: t(['South Indian','Breakfast','Crispy']), description: 'Lacy crunchy semolina dosa served with coconut chutney. Delicate and incredibly satisfying.', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800' },

    // Cafe Madras
    { restaurantId: 'cafe-madras', name: 'Mysore Masala Dosa', price: 90, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.8, popularityScore: 96, tags: t(['South Indian','Breakfast','Spicy','Classic']), description: 'Smeared with red chutney inside, stuffed with spiced potato masala. The Mysore Dosa at Cafe Madras is in a class of its own.', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800' },
    { restaurantId: 'cafe-madras', name: 'Filter Coffee', price: 35, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.8, popularityScore: 94, tags: t(['Filter Coffee','Beverage','Matunga']), description: 'Perfectly balanced aromatic filter coffee. The froth on top is a work of art.', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800' },
    { restaurantId: 'cafe-madras', name: 'Onion Uttapam', price: 80, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.6, popularityScore: 80, tags: t(['South Indian','Breakfast','Thick Dosa']), description: 'Thick spongy uttapam loaded with caramelised onions. Served with sambar and three chutneys.', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800' },
    { restaurantId: 'cafe-madras', name: 'Pongal', price: 70, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.5, popularityScore: 72, tags: t(['South Indian','Breakfast','Comfort Food']), description: 'Creamy rice-and-lentil porridge seasoned with pepper, cumin, ginger and ghee. The ultimate South Indian breakfast comfort food.', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800' },

    // Arya Bhavan
    { restaurantId: 'arya-bhavan', name: 'Idli Vada Combo', price: 70, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.6, popularityScore: 88, tags: t(['South Indian','Breakfast','Combo']), description: 'Two soft idlis and a crispy vada served with sambar and chutneys. Perfect value for a filling breakfast.', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800' },
    { restaurantId: 'arya-bhavan', name: 'Ghee Roast Dosa', price: 100, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.7, popularityScore: 85, tags: t(['South Indian','Ghee','Indulgent']), description: 'Dosa roasted on a thick layer of ghee until deliciously crispy and golden. Rich and indulgent.', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800' },

    // Mani's Lunch Home
    { restaurantId: 'mani-lunch-home', name: 'Fish Curry Rice', price: 200, dietType: 'NON_VEG', mealType: 'LUNCH', rating: 4.6, popularityScore: 82, tags: t(['Seafood','Coastal','Hidden Gem','Matunga']), description: 'Fresh fish in a tangy coconut-based curry served with steamed rice. Always fresh, deeply flavoured.', imageUrl: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800' },
    { restaurantId: 'mani-lunch-home', name: 'South Indian Thali', price: 180, dietType: 'VEG', mealType: 'LUNCH', rating: 4.4, popularityScore: 74, tags: t(['South Indian','Thali','Lunch','Value']), description: 'Complete South Indian meal — rice, sambar, rasam, two sabzis, papad, and dessert. Incredible value.', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800' },

    // Shri Krishna Boarding
    { restaurantId: 'shri-krishna-boarding', name: 'Gulab Jamun with Dosa', price: 80, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.7, popularityScore: 88, tags: t(['South Indian','Unique','Matunga','Must-Try']), description: 'The iconic Matunga combo — hot syrupy Gulab Jamun alongside crispy South Indian dosa. Sounds odd, tastes divine.', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800' },

    // Ashok Vada Pav
    { restaurantId: 'ashok-vada-pav', name: 'Vada Pav', price: 20, dietType: 'VEG', mealType: 'SNACKS', rating: 4.8, popularityScore: 99, tags: t(['Street Food','Mumbai','Budget','Classic','Dadar']), description: 'The gold standard of Vada Pav. Crispy battered potato vada, soft pav, dry garlic chutney, green chutney, fresh chili. Perfect in every way.', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },
    { restaurantId: 'ashok-vada-pav', name: 'Samosa', price: 15, dietType: 'VEG', mealType: 'SNACKS', rating: 4.5, popularityScore: 82, tags: t(['Street Food','Mumbai','Budget']), description: 'Crispy spiced potato samosa, freshly fried. Served with tamarind and green chutneys.', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800' },

    // Shri Krishna Batata Vada
    { restaurantId: 'shri-krishna-batata-vada', name: 'Batata Vada', price: 15, dietType: 'VEG', mealType: 'SNACKS', rating: 4.7, popularityScore: 92, tags: t(['Street Food','Mumbai','Heritage','Budget']), description: '75 years of perfecting one thing. Thinner batter, more spiced filling. No pav — just the vada with chutneys. Purist\'s choice.', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },

    // Prakash Upahaar
    { restaurantId: 'prakash-upahar', name: 'Misal Pav', price: 80, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.5, popularityScore: 85, tags: t(['Maharashtrian','Breakfast','Spicy','Dadar']), description: 'Fiery sprouted moth bean curry (usal) topped with crunchy farsan, raw onion, and lemon. A Maharashtrian must-try.', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },
    { restaurantId: 'prakash-upahar', name: 'Sabudana Khichdi', price: 70, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.4, popularityScore: 75, tags: t(['Maharashtrian','Breakfast','Light']), description: 'Soft sago pearls cooked with peanuts, green chili and curry leaves. Light and comforting.', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },

    // Gypsy Corner
    { restaurantId: 'gypsy-corner-dadar', name: 'Bombay Masala Toast', price: 70, dietType: 'VEG', mealType: 'SNACKS', rating: 4.4, popularityScore: 80, tags: t(['Street Food','Sandwich','Mumbai','Dadar']), description: 'White bread with green chutney, potato slices, and veg masala, grilled until crispy. Classic Mumbai street sandwich.', imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800' },
    { restaurantId: 'gypsy-corner-dadar', name: 'Egg Bhurji Pav', price: 80, dietType: 'NON_VEG', mealType: 'SNACKS', rating: 4.5, popularityScore: 82, tags: t(['Street Food','Eggs','Mumbai','Late Night']), description: 'Spiced scrambled eggs with onions, tomatoes, and green chillies served with soft pav. The Mumbai street egg experience.', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },

    // Hotel Chaitanya
    { restaurantId: 'hotel-chaitanya', name: 'Maharashtrian Thali', price: 180, dietType: 'VEG', mealType: 'LUNCH', rating: 4.5, popularityScore: 83, tags: t(['Maharashtrian','Thali','Traditional','Dadar']), description: 'Full Maharashtrian thali with Varan, Amti, Bhaji, Koshimbir, Papad, Poli, and dessert.', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800' },
    { restaurantId: 'hotel-chaitanya', name: 'Ukadiche Modak', price: 60, dietType: 'VEG', mealType: 'SNACKS', rating: 4.6, popularityScore: 70, tags: t(['Maharashtrian','Sweet','Traditional']), description: 'Steamed rice-flour dumplings filled with jaggery and fresh coconut. Best eaten with ghee. Ganesh Chaturthi\'s gift to the world.', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800' },

    // Swati Snacks
    { restaurantId: 'swati-snacks', name: 'Dhokla', price: 70, dietType: 'VEG', mealType: 'SNACKS', rating: 4.8, popularityScore: 97, tags: t(['Gujarati','Steamed','Healthy','Classic']), description: 'Soft spongy fermented chickpea dhokla topped with mustard seeds, green chili, and coriander. Best in Mumbai.', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },
    { restaurantId: 'swati-snacks', name: 'Dahi Batata Puri', price: 100, dietType: 'VEG', mealType: 'SNACKS', rating: 4.7, popularityScore: 88, tags: t(['Gujarati','Chaat','Street Food']), description: 'Crispy puris stuffed with potato and sprouts, drenched in yogurt and chutneys, topped with sev. The chaat to end all chaats.', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },
    { restaurantId: 'swati-snacks', name: 'Panki', price: 90, dietType: 'VEG', mealType: 'SNACKS', rating: 4.5, popularityScore: 74, tags: t(['Gujarati','Steamed','Rare']), description: 'Thin rice batter pancakes steamed in fresh banana leaves. A specialty hard to find outside of Gujarat.', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800' },

    // Guru Kripa Sion
    { restaurantId: 'guru-kripa-sion', name: 'Chole Bhature', price: 90, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.6, popularityScore: 92, tags: t(['North Indian','Breakfast','Sion','Street Food']), description: 'Fluffy golden deep-fried bhature paired with fiery tangy chole topped with raw onion and pickle. Queue before 9 AM.', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800' },

    // Cafe Military
    { restaurantId: 'cafe-military-sion', name: 'Bun Maska & Chai', price: 45, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.5, popularityScore: 80, tags: t(['Irani','Breakfast','Heritage','Sion']), description: 'Soft Iranian bun slathered with cold butter, served with strong Irani chai. The timeless Irani cafe breakfast.', imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800' },
    { restaurantId: 'cafe-military-sion', name: 'Keema Pav', price: 130, dietType: 'NON_VEG', mealType: 'LUNCH', rating: 4.4, popularityScore: 75, tags: t(['Irani','Mutton','Heritage','Sion']), description: 'Spiced minced mutton keema slow-cooked with onion and herbs, served with soft pav. An Irani cafe classic.', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },

    // Sion Fort Misal
    { restaurantId: 'sion-fort-misal', name: 'Misal Pav', price: 70, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.4, popularityScore: 82, tags: t(['Maharashtrian','Breakfast','Spicy','Sion']), description: 'Kolhapuri-style fiery misal — sprouted moth beans in a hot tarri topped with farsan. Not for the faint-hearted.', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },

    // Sardar Refreshments
    { restaurantId: 'sardar-refreshments', name: 'Pav Bhaji', price: 90, dietType: 'VEG', mealType: 'SNACKS', rating: 4.7, popularityScore: 95, tags: t(['Street Food','Mumbai','Classic','Butter']), description: 'Thick spiced mashed vegetable curry slathered with butter, served with pav toasted on butter. One of Mumbai\'s great street foods.', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800' },
    { restaurantId: 'sardar-refreshments', name: 'Tawa Pulao', price: 100, dietType: 'VEG', mealType: 'LUNCH', rating: 4.5, popularityScore: 78, tags: t(['Street Food','Mumbai','Rice']), description: 'Rice tossed on a hot tawa with Pav Bhaji masala, vegetables, and butter. A Mumbai street classic.', imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800' },

    // GTB Dosa Centre
    { restaurantId: 'gtb-dosa-centre', name: 'Masala Dosa', price: 65, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.3, popularityScore: 74, tags: t(['South Indian','Breakfast','Budget','GTB Nagar']), description: 'Crispy dosa stuffed with spiced potato masala. Quick service, great value near GTB Nagar.', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800' },

    // Wadala Biryani House
    { restaurantId: 'wadala-biryani-house', name: 'Mutton Biryani', price: 280, dietType: 'NON_VEG', mealType: 'LUNCH', rating: 4.5, popularityScore: 83, tags: t(['Biryani','Mutton','Dum','Wadala']), description: 'Slow-cooked dum biryani with tender mutton in fragrant basmati rice. The meat falls off the bone. Served with raita.', imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800' },
    { restaurantId: 'wadala-biryani-house', name: 'Chicken Biryani', price: 220, dietType: 'NON_VEG', mealType: 'LUNCH', rating: 4.4, popularityScore: 80, tags: t(['Biryani','Chicken','Dum','Wadala']), description: 'Juicy chicken layered with fragrant saffron-tinted basmati rice. Full of aroma and flavour.', imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800' },

    // Britannia & Co
    { restaurantId: 'britannia-co', name: 'Berry Pulao', price: 480, dietType: 'NON_VEG', mealType: 'LUNCH', rating: 4.8, popularityScore: 94, tags: t(['Parsi','Heritage','Iconic','Mumbai']), description: 'Fragrant basmati with dried Iranian barberries, caramelised onions, and melt-in-your-mouth mutton. A Mumbai bucket-list dish.', imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800' },
    { restaurantId: 'britannia-co', name: 'Dhansak', price: 400, dietType: 'NON_VEG', mealType: 'LUNCH', rating: 4.6, popularityScore: 82, tags: t(['Parsi','Heritage','Mutton','Curry']), description: 'Slow-cooked lentils with mutton served with caramelised brown rice and lime. The definitive Parsi Sunday dish.', imageUrl: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800' },

    // Shree Thaker
    { restaurantId: 'shree-thaker', name: 'Gujarati Thali', price: 400, dietType: 'VEG', mealType: 'LUNCH', rating: 4.7, popularityScore: 91, tags: t(['Gujarati','Thali','Unlimited','Heritage']), description: 'Unlimited Gujarati thali since 1945. All sabzis, dal, kadhi, rotli, rice, papad, pickle, and Shrikhand. A monument to Gujarati hospitality.', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800' },

    // Kyani & Co
    { restaurantId: 'kyani-co', name: 'Bun Maska', price: 40, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.6, popularityScore: 86, tags: t(['Irani','Heritage','Breakfast','Mumbai']), description: 'Soft slightly sweet Iranian bun slathered with cold salted butter. Best with Irani chai. A century-old Mumbai staple.', imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800' },
    { restaurantId: 'kyani-co', name: 'Irani Chai', price: 25, dietType: 'VEG', mealType: 'BREAKFAST', rating: 4.5, popularityScore: 84, tags: t(['Irani','Heritage','Beverage','Mumbai']), description: 'Strong milky slightly sweet Irani chai brewed the old-fashioned way. The antidote to flat white culture.', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800' },
  ];

  for (const d of dishes) {
    await prisma.dish.create({ data: d });
  }
  console.log(`✅ ${dishes.length} dishes created`);

  console.log('\n🎉 Database ready!');
  console.log('📍 Areas: Matunga · Dadar · Sion · Wadala · GTB Nagar + Heritage spots');
  console.log('\n🔑 Login: admin@mealmate.com / admin123  |  demo@mealmate.com / user123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
