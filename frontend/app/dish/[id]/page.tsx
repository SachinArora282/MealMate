'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Star, MapPin, Heart, Leaf, Drumstick, ExternalLink, Phone } from 'lucide-react';
import { getDishById, saveDish, unsaveDish, type Dish } from '@/services/api';

export default function DishDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDishById(id as string).then(setDish).catch(() => setDish(null)).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      if (saved) { await unsaveDish(id as string); setSaved(false); }
      else { await saveDish(id as string); setSaved(true); }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="animate-pulse">
          <div className="h-72 bg-white/10" />
          <div className="px-5 py-6 space-y-3">
            <div className="h-6 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <p className="text-white font-bold text-xl mb-2">Dish not found</p>
        <button onClick={() => router.back()} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const imageUrl = dish.imageUrl || `https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800`;
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(dish.restaurant?.address || dish.restaurant?.name || '')}`;

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-72 overflow-hidden">
        <Image src={imageUrl} alt={dish.name} fill className="object-cover" sizes="480px" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-darker via-surface-darker/20 to-transparent" />

        {/* Back button */}
        <button onClick={() => router.back()} className="absolute top-12 left-4 w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronLeft size={20} />
        </button>

        {/* Save button */}
        <button onClick={handleSave} id="dish-save-btn" className="absolute top-12 right-4 w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/20 transition-colors">
          <Heart size={20} className={saved ? 'fill-red-500 text-red-500' : 'text-white'} />
        </button>

        {/* Price badge */}
        <div className="absolute bottom-4 left-4">
          <span className="price-badge px-4 py-2 rounded-2xl text-2xl font-bold">₹{dish.price}</span>
        </div>
      </div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-4 pb-28 space-y-5">
        {/* Name and rating */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold font-display text-white">{dish.name}</h1>
            <span className="rating-badge flex-shrink-0 px-3 py-1.5">
              <Star size={14} fill="currentColor" />{dish.rating.toFixed(1)}
            </span>
          </div>

          {/* Diet badge */}
          <div className="flex items-center gap-2 mt-2">
            {dish.dietType === 'VEG' ? (
              <span className="flex items-center gap-1 tag-veg text-sm"><Leaf size={12} />Vegetarian</span>
            ) : (
              <span className="flex items-center gap-1 tag-nonveg text-sm"><Drumstick size={12} />Non-Vegetarian</span>
            )}
            <span className="tag-orange text-sm">{dish.mealType}</span>
          </div>

          {/* Tags */}
          {dish.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {dish.tags.map(tag => (
                <span key={tag} className="tag-orange">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {dish.description && (
          <div className="card p-4">
            <p className="text-white/70 text-sm leading-relaxed">{dish.description}</p>
          </div>
        )}

        {/* Restaurant info */}
        {dish.restaurant && (
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-white text-base">📍 Where to find it</h3>
            <div>
              <p className="font-semibold text-white">{dish.restaurant.name}</p>
              <p className="text-white/50 text-sm mt-0.5">{dish.restaurant.address}</p>
            </div>

            {/* Map button */}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" id="open-maps-btn" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-gradient rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              <MapPin size={16} />Open in Google Maps
              <ExternalLink size={14} />
            </a>

            {dish.restaurant.imageUrl && (
              <div className="relative h-32 rounded-xl overflow-hidden">
                <Image src={dish.restaurant.imageUrl} alt={dish.restaurant.name} fill className="object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm drop-shadow">{dish.restaurant.name}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back to explore */}
        <Link href="/explore">
          <button className="btn-secondary w-full py-3 mt-2 text-sm">← Explore More Dishes</button>
        </Link>
      </motion.div>
    </div>
  );
}
