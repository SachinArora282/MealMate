# 🍽️ MealMate — Dish-First Food Discovery Platform

MealMate is a full-stack mobile-first food discovery platform that helps users find **dishes** near them — not just restaurants. Search for "Best Dhokla near me" and see all the places serving it, ranked by rating, popularity, and distance.

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- PostgreSQL (running locally on port 5432)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
cp .env.example .env       # Edit DATABASE_URL and JWT_SECRET
npm install
npx prisma db push         # Creates database schema
node prisma/seed.js        # Seeds demo restaurants & dishes
npm run dev                # Starts on http://localhost:4000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install --legacy-peer-deps
npm run dev                # Starts on http://localhost:3000
```

### 3. Demo Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@mealmate.com | admin123 |
| User  | demo@mealmate.com | user123 |
| Owner | owner@mealmate.com | owner123 |

---

## 🐳 Docker Deployment

```bash
# Start everything with Docker
docker-compose up --build

# The app will be available at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# Database: localhost:5432
```

---

## 📁 Project Structure

```
MealMate/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema (User, Restaurant, Dish, Review, Upload)
│   │   └── seed.js             # Seed data (8 restaurants, 15 dishes)
│   ├── src/
│   │   ├── index.js            # Express app entry point
│   │   ├── controllers/        # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── restaurant.controller.js
│   │   │   ├── dish.controller.js
│   │   │   ├── recommendation.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── saved.controller.js
│   │   │   └── upload.controller.js
│   │   ├── routes/             # Express routes
│   │   └── middlewares/        # JWT auth, role guard
│   ├── .env                    # Environment variables
│   └── Dockerfile
│
├── frontend/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx            # Home (greeting, stats, trending)
│   │   ├── wizard/page.tsx     # 3-step recommendation wizard
│   │   ├── results/page.tsx    # Ranked dish results
│   │   ├── explore/page.tsx    # Browse & filter dishes
│   │   ├── dish/[id]/page.tsx  # Dish detail + maps
│   │   ├── onboarding/page.tsx # 7-step restaurant onboarding
│   │   ├── admin/page.tsx      # Admin dashboard
│   │   ├── auth/page.tsx       # Login / Register
│   │   ├── saved/page.tsx      # Saved dishes
│   │   └── profile/page.tsx    # User profile
│   ├── components/
│   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   ├── DishCard.tsx        # Reusable dish card
│   │   └── AuthProvider.tsx    # JWT auth context
│   ├── services/api.ts         # Centralized API layer
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/dishes` | List dishes (filterable) |
| GET | `/api/dishes/trending` | Top trending dishes |
| GET | `/api/dishes/:id` | Dish details |
| GET | `/api/restaurants` | List restaurants |
| GET | `/api/recommendations` | AI-ranked dish recommendations |
| POST | `/api/restaurants` | Add new restaurant (Owner) |
| POST | `/api/uploads/menu` | OCR menu extraction |
| POST | `/api/reviews` | Add review |
| GET | `/api/saved` | Saved dishes (Auth) |
| POST | `/api/saved` | Save a dish (Auth) |
| GET | `/api/admin/stats` | Admin dashboard (Admin) |
| PATCH | `/api/admin/restaurants/:id/approve` | Approve restaurant |
| GET | `/api/stats` | Platform stats |
| GET | `/api/health` | API health check |

---

## 🧠 Recommendation Engine

Dishes are ranked using:

```
score = (rating × 0.4) + (popularity × 0.3) + (distance_score × 0.3)
```

- **Rating**: Normalized from 0–5 scale → 0–1
- **Popularity**: `popularityScore` field (0–100) → normalized
- **Distance**: Haversine formula, max useful distance = 20km

---

## 🍽️ Seed Data

**Restaurants:**
- Swati Snacks (Gujarati) — Mumbai
- Ramashraya (South Indian) — Matunga
- Britannia & Co (Parsi) — Ballard Estate
- Kyani & Co (Irani) — Marine Lines
- Shree Thaker Bhojanalay (Gujarati) — Kalbadevi
- Sardar Refreshments (Street Food) — Tardeo
- New Kulfi Centre (Desserts) — Chowpatty
- Guru Kripa (South Indian) — Sion

**Dishes:** Dhokla, Masala Dosa, Filter Coffee, Berry Pulao, Gujarati Thali, Vada Pav, Chole Bhature, Bun Maska, Pav Bhaji + more

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TailwindCSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + Google OAuth |
| OCR | Tesseract.js (menu extraction) |
| Maps | Google Maps API |
| Deploy | Docker + docker-compose |

---

## 👥 User Roles

- **User** — Browse, search, save dishes, write reviews
- **Owner** — Onboard restaurants, manage menu
- **Admin** — Approve/reject restaurants, view analytics

---

## 🎯 Pilot Target
- 1,000 users
- 500 restaurants  
- 10,000 dishes
