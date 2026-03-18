'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { DishCard } from '@/components/DishCard';
import { getRecommendations, type Dish } from '@/services/api';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  const maxBudget = searchParams.get('maxBudget') || '1000';
  const minBudget = searchParams.get('minBudget') || '0';
  const mealType = searchParams.get('mealType') || '';
  const dietType = searchParams.get('dietType') || '';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getRecommendations({
          maxBudget: parseFloat(maxBudget),
          minBudget: parseFloat(minBudget),
          mealType,
          dietType,
        });
        setDishes(data.recommendations);
      } catch (e) {
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [maxBudget, minBudget, mealType, dietType]);

  const getDietEmoji = (d: string) => d === 'VEG' ? '🌿' : d === 'NON_VEG' ? '🍗' : '🍱';
  const getMealEmoji = (m: string) => ({ BREAKFAST: '🌅', LUNCH: '☀️', DINNER: '🌙', SNACKS: '🍿' }[m] || '🍽️');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 sticky top-0 z-10 glass">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/wizard')} className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-white/40 text-xs">Showing results for</p>
            <h1 className="text-lg font-bold text-white">Best Matches 🎯</h1>
          </div>
          <button className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Active filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {maxBudget && <span className="tag-orange whitespace-nowrap">₹{minBudget}–₹{maxBudget}</span>}
          {mealType && <span className="tag-orange whitespace-nowrap">{getMealEmoji(mealType)} {mealType}</span>}
          {dietType && <span className="tag-orange whitespace-nowrap">{getDietEmoji(dietType)} {dietType === 'NON_VEG' ? 'Non-Veg' : dietType}</span>}
        </div>
      </div>

      <div className="px-5 py-4 pb-28">
        {loading ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-32 bg-white/10 rounded-full animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-48 bg-white/10" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : dishes.length > 0 ? (
          <div>
            <p className="text-white/50 text-sm mb-4">
              🎯 Found <span className="text-white font-semibold">{dishes.length}</span> dishes matching your taste
            </p>
            <div className="space-y-4">
              {dishes.map((dish, i) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.4) }}
                >
                  <DishCard dish={dish} />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No dishes found</h3>
            <p className="text-white/40 text-sm">Try adjusting your budget or meal filters</p>
            <button onClick={() => router.push('/wizard')} className="btn-primary mt-6">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white/40">Loading...</div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
