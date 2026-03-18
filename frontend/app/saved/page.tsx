'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bookmark, ChevronRight } from 'lucide-react';
import { DishCard } from '@/components/DishCard';
import { getSavedDishes, type Dish } from '@/services/api';
import { useAuth } from '@/components/AuthProvider';

export default function SavedPage() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getSavedDishes().then(setDishes).catch(() => setDishes([])).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in to view saved dishes</h2>
        <p className="text-white/40 text-sm mb-6">Save your favourite dishes and come back anytime</p>
        <Link href="/auth" className="btn-primary flex items-center gap-2">Sign In <ChevronRight size={16} /></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <Bookmark size={24} className="text-brand-orange" /> Saved Dishes
        </h1>
        <p className="text-white/40 text-sm mt-1">Your collection of favourites</p>
      </div>

      <div className="px-5 pb-28">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="card overflow-hidden animate-pulse h-64 bg-white/5" />
            ))}
          </div>
        ) : dishes.length > 0 ? (
          <div className="space-y-4">
            {dishes.map((dish, i) => (
              <motion.div key={dish.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <DishCard dish={dish} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">💔</div>
            <h3 className="text-xl font-bold text-white mb-2">No saved dishes yet</h3>
            <p className="text-white/40 text-sm">Tap the ❤️ on any dish to save it here</p>
            <Link href="/explore" className="btn-primary mt-6">Explore Dishes</Link>
          </div>
        )}
      </div>
    </div>
  );
}
