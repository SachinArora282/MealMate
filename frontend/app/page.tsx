'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Star, MapPin, TrendingUp, Clock } from 'lucide-react';
import { DishCard } from '@/components/DishCard';
import { getTrendingDishes, getDishes, getStats, type Dish, type Stats } from '@/services/api';
import { useRouter } from 'next/navigation';

const AREAS = ['All', 'Matunga', 'Dadar', 'Sion', 'Wadala', 'GTB Nagar'];

const QUICK_SEARCH = ['Masala Dosa', 'Vada Pav', 'Chole Bhature', 'Misal Pav', 'Pav Bhaji', 'Dhokla', 'Filter Coffee', 'Biryani'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
  if (h < 21) return { text: 'Good Evening', emoji: '🌆' };
  return { text: 'Good Night', emoji: '🌙' };
}

export default function HomePage() {
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [trending, setTrending] = useState<Dish[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeArea, setActiveArea] = useState('All');
  const [search, setSearch] = useState('');
  const { text, emoji } = greeting();

  const load = async (area = 'All') => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '10', sortBy: 'rating' };
      if (area !== 'All') params.search = area;
      const [d, t, s] = await Promise.all([
        getDishes(params),
        getTrendingDishes(),
        getStats(),
      ]);
      setDishes(d.dishes);
      setTrending(t);
      setStats(s);
    } catch {
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAreaChange = (area: string) => {
    setActiveArea(area);
    load(area);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/explore?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Hero header */}
      <div className="px-5 pt-12 pb-5">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-white/50 text-sm font-medium">{emoji} {text}</p>
          <h1 className="text-3xl font-bold font-display mt-1">
            <span className="gradient-text">MealMate</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Find the best dishes around Mumbai</p>
        </motion.div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              id="home-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes or restaurants..."
              className="input pl-11 bg-surface-card"
            />
          </div>
        </form>

        {/* Quick search chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_SEARCH.map(q => (
            <button
              key={q}
              onClick={() => router.push(`/explore?search=${encodeURIComponent(q)}`)}
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-surface-card border border-white/10 text-white/50 hover:border-brand-orange/40 hover:text-brand-orange transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="px-5 mb-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Restaurants', value: stats.totalRestaurants, emoji: '🏪' },
              { label: 'Dishes', value: stats.totalDishes, emoji: '🍽️' },
              { label: 'Avg Price', value: `₹${Math.round(stats.avgPrice || 120)}`, emoji: '💰' },
            ].map(({ label, value, emoji }) => (
              <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-3 text-center">
                <p className="text-lg mb-0.5">{emoji}</p>
                <p className="text-white font-bold text-lg leading-tight">{value}</p>
                <p className="text-white/40 text-[10px]">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-5 mb-6">
        <Link href="/wizard">
          <motion.button
            whileTap={{ scale: 0.97 }}
            id="find-meal-btn"
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base shadow-orange"
          >
            🔮 Find My Next Meal
          </motion.button>
        </Link>
      </div>

      {/* Trending Now */}
      {trending.length > 0 && (
        <div className="mb-6">
          <div className="px-5 flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-brand-orange" />
            <h2 className="section-title">Trending Now</h2>
          </div>
          <div className="flex gap-3 px-5 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map(dish => (
              <Link key={dish.id} href={`/dish/${dish.id}`}>
                <div className="flex-shrink-0 flex items-center gap-2 bg-surface-card border border-white/10 rounded-xl px-4 py-2.5 hover:border-brand-orange/40 transition-all">
                  <span className="text-base">{dish.dietType === 'VEG' ? '🟢' : '🔴'}</span>
                  <span className="text-white text-sm font-semibold whitespace-nowrap">{dish.name}</span>
                  <span className="text-brand-orange text-xs font-bold flex items-center gap-0.5"><Star size={11} fill="currentColor"/>{dish.rating.toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Neighbourhood tabs */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-brand-orange" />
          <h2 className="section-title">Browse by Area</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {AREAS.map(area => (
            <button
              key={area}
              onClick={() => handleAreaChange(area)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeArea === area
                  ? 'bg-orange-gradient text-white shadow-orange'
                  : 'bg-surface-card text-white/50 border border-white/10 hover:border-brand-orange/30'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Dish list */}
      <div className="px-5 space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-48 bg-white/10" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : dishes.length > 0 ? (
          <>
            <p className="text-white/40 text-xs">
              {activeArea === 'All' ? 'Showing all areas' : `Showing spots in ${activeArea}`} · {dishes.length} results
            </p>
            {dishes.map((dish, i) => (
              <motion.div key={dish.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
                <DishCard dish={dish} />
              </motion.div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/50 font-semibold">No dishes found</p>
            <p className="text-white/30 text-sm mt-1">
              {activeArea !== 'All' ? `Nothing recorded for ${activeArea} yet` : 'Check that the backend is running'}
            </p>
            <p className="text-white/20 text-xs mt-3">Run: <code className="bg-white/10 px-2 py-0.5 rounded">node prisma/seed.js</code> in /backend</p>
          </div>
        )}
      </div>

      {/* Opening hours reminder */}
      <div className="px-5 mt-6">
        <div className="card p-4 flex items-start gap-3 border border-brand-orange/20">
          <Clock size={18} className="text-brand-orange flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold">Breakfast spots close early!</p>
            <p className="text-white/40 text-xs mt-0.5">Ram Ashraya, Guru Kripa, Ashok Vada Pav — many spots sell out by 10 AM. Plan ahead.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
