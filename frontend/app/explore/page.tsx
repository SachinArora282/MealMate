'use client';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Leaf, Drumstick } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DishCard } from '@/components/DishCard';
import { getDishes, type Dish } from '@/services/api';

const CUISINE_FILTERS = ['All', 'South Indian', 'Gujarati', 'Street Food', 'North Indian', 'Parsi', 'Irani', 'Desserts'];
const TABS = ['Top Dishes', 'Hidden Gems', 'Street Food', 'Regional'];

function ExploreContent() {
  const searchParams = useSearchParams();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeTab, setActiveTab] = useState(0);
  const [dietFilter, setDietFilter] = useState('ALL');
  const [activeCuisine, setActiveCuisine] = useState('All');

  const load = async (q = search) => {
    setLoading(true);
    try {
      const tagMap: Record<number, string> = {
        1: 'Hidden Gems',
        2: 'Street Food',
        3: 'Regional',
      };
      const params: Record<string, string> = { limit: '30' };
      if (q) params.search = q;
      if (dietFilter !== 'ALL') params.dietType = dietFilter;

      const data = await getDishes(params);
      let result = data.dishes;

      // Tab filtering (client-side for MVP)
      if (activeTab === 1) result = result.filter(d => d.popularityScore < 80);
      if (activeTab === 2) result = result.filter(d => d.tags?.includes('Street Food'));
      if (activeTab === 3) result = result.filter(d => d.tags?.some(t => ['Gujarati', 'South Indian', 'Parsi', 'Irani', 'Maharashtrian'].includes(t)));

      if (activeCuisine !== 'All') {
        result = result.filter(d => d.tags?.some(t => t.includes(activeCuisine)) || d.restaurant?.name?.includes(activeCuisine));
      }

      setDishes(result);
    } catch {
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab, dietFilter, activeCuisine]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold font-display text-white mb-1">Explore 🗺️</h1>
        <p className="text-white/40 text-sm">Discover dishes across the city</p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              id="explore-search"
              type="text"
              placeholder="Search dishes, restaurants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-11 pr-4 bg-surface-card"
            />
          </div>
        </form>

        {/* Diet filter chips */}
        <div className="flex gap-2 mt-3">
          {[
            { id: 'ALL', label: 'All', emoji: '🍱' },
            { id: 'VEG', label: 'Veg', emoji: '🌿' },
            { id: 'NON_VEG', label: 'Non-Veg', emoji: '🍗' },
          ].map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setDietFilter(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                dietFilter === id ? 'bg-brand-orange text-white shadow-orange' : 'bg-surface-card text-white/60 border border-white/10 hover:border-brand-orange/30'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === i ? 'bg-orange-gradient text-white shadow-orange' : 'bg-surface-card text-white/50 border border-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cuisine chips */}
      <div className="px-5 mt-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CUISINE_FILTERS.map(c => (
            <button
              key={c}
              onClick={() => setActiveCuisine(c)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                activeCuisine === c ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/40' : 'bg-surface-card text-white/40 border border-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-5 py-4 pb-28">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card overflow-hidden animate-pulse h-64 bg-white/5" />
            ))}
          </div>
        ) : dishes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-white/40 text-sm">{dishes.length} dishes found</p>
            {dishes.map((dish, i) => (
              <motion.div key={dish.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
                <DishCard dish={dish} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/50 font-semibold">No dishes found</p>
            <p className="text-white/30 text-sm mt-1">Try a different search or clear filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white/40">Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
