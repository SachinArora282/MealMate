'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Heart, Leaf, Drumstick } from 'lucide-react';
import { useState } from 'react';
import { Dish, saveDish, unsaveDish } from '@/services/api';

interface DishCardProps {
  dish: Dish;
  showDistance?: boolean;
  compact?: boolean;
}

export function DishCard({ dish, compact = false }: DishCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      if (saved) {
        await unsaveDish(dish.id);
        setSaved(false);
      } else {
        await saveDish(dish.id);
        setSaved(true);
      }
    } catch {
      // Silently handle auth errors
    } finally {
      setSaving(false);
    }
  };

  const imageUrl = dish.imageUrl || `https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80`;

  if (compact) {
    return (
      <Link href={`/dish/${dish.id}`}>
        <div className="card p-3 flex gap-3 cursor-pointer group">
          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
            <Image src={imageUrl} alt={dish.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{dish.name}</p>
            <p className="text-xs text-white/50 truncate">{dish.restaurant?.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="rating-badge text-xs"><Star size={10} fill="currentColor" />{dish.rating.toFixed(1)}</span>
              <span className="price-badge text-xs px-2 py-0.5 rounded-full font-semibold">₹{dish.price}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/dish/${dish.id}`}>
      <div className="card overflow-hidden cursor-pointer group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={dish.name}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <Heart
              size={18}
              className={`transition-colors duration-200 ${saved ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </button>

          {/* Diet badge */}
          <div className="absolute top-3 left-3">
            {dish.dietType === 'VEG' ? (
              <span className="flex items-center gap-1 tag-veg"><Leaf size={10} />Veg</span>
            ) : (
              <span className="flex items-center gap-1 tag-nonveg"><Drumstick size={10} />Non-Veg</span>
            )}
          </div>

          {/* Price badge bottom left */}
          <div className="absolute bottom-3 left-3">
            <span className="price-badge px-3 py-1 rounded-full text-sm font-bold">₹{dish.price}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base truncate">{dish.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-white/40 flex-shrink-0" />
                <p className="text-sm text-white/50 truncate">{dish.restaurant?.name}</p>
              </div>
            </div>
            <span className="rating-badge flex-shrink-0">
              <Star size={12} fill="currentColor" />
              {dish.rating.toFixed(1)}
            </span>
          </div>

          {/* Tags */}
          {dish.tags && dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {dish.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag-orange text-[10px]">{tag}</span>
              ))}
            </div>
          )}

          {/* Restaurant location */}
          {dish.restaurant?.address && (
            <p className="text-xs text-white/30 mt-2 truncate">
              📍 {dish.restaurant.address.split(',').slice(0, 2).join(',')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
