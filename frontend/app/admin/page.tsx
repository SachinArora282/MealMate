'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Utensils, Store, TrendingUp, Check, X, ChevronLeft } from 'lucide-react';
import { getAdminStats, approveRestaurant, rejectRestaurant } from '@/services/api';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    try {
      const d = await getAdminStats();
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    load();
  }, [user]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveRestaurant(id);
      load();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + '-reject');
    try {
      await rejectRestaurant(id, 'Does not meet platform standards');
      load();
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <p className="text-white font-bold text-xl mb-4">Admin access required</p>
        <Link href="/auth" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <p className="text-white font-bold text-xl mb-2">Access Denied</p>
        <p className="text-white/40 text-sm mb-4">Admin privileges required</p>
        <button onClick={() => router.back()} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-xl glass flex items-center justify-center"><ChevronLeft size={18} /></button>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2"><ShieldCheck size={22} className="text-green-400" />Admin Dashboard</h1>
        </div>
        <p className="text-white/40 text-sm">Manage MealMate platform</p>
      </div>

      {loading ? (
        <div className="px-5 space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="card h-24 animate-pulse bg-white/5" />)}
        </div>
      ) : data ? (
        <div className="px-5 pb-28 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Restaurants', value: data.stats.totalRestaurants, icon: Store, color: 'text-brand-orange', bg: 'bg-brand-orange/20' },
              { label: 'Verified', value: data.stats.verifiedRestaurants, icon: Check, color: 'text-green-400', bg: 'bg-green-500/20' },
              { label: 'Pending Approval', value: data.stats.pendingRestaurants, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
              { label: 'Total Dishes', value: data.stats.totalDishes, icon: Utensils, color: 'text-brand-blue', bg: 'bg-blue-500/20' },
              { label: 'Active Users', value: data.stats.totalUsers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20' },
              { label: 'Reviews', value: data.stats.totalReviews, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Top Dishes */}
          {data.topDishes?.length > 0 && (
            <div>
              <h2 className="section-title mb-3">🔥 Top Dishes</h2>
              <div className="space-y-2">
                {data.topDishes.map((dish: any, i: number) => (
                  <div key={dish.id} className="card p-3 flex items-center gap-3">
                    <span className={`text-lg font-bold w-8 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/40'}`}>#{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{dish.name}</p>
                      <p className="text-white/40 text-xs">{dish.restaurant?.name}</p>
                    </div>
                    <span className="text-brand-orange font-bold text-sm">₹{dish.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          <div>
            <h2 className="section-title mb-3">⏳ Pending Approvals ({data.pendingApprovals?.length || 0})</h2>
            {data.pendingApprovals?.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-white/50 text-sm">All caught up! No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.pendingApprovals?.map((restaurant: any) => (
                  <div key={restaurant.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white">{restaurant.name}</p>
                        <p className="text-white/40 text-xs">{restaurant.address}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {restaurant.cuisine?.slice(0, 3).map((c: string) => (
                            <span key={c} className="tag-orange text-[10px]">{c}</span>
                          ))}
                        </div>
                        {restaurant.owner && (
                          <p className="text-white/30 text-xs mt-1">Owner: {restaurant.owner.name} ({restaurant.owner.email})</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        id={`approve-${restaurant.id}`}
                        onClick={() => handleApprove(restaurant.id)}
                        disabled={actionLoading === restaurant.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl py-2.5 text-sm font-semibold hover:bg-green-500/30 transition-all disabled:opacity-40"
                      >
                        {actionLoading === restaurant.id ? '...' : <><Check size={16} />Approve</>}
                      </button>
                      <button
                        id={`reject-${restaurant.id}`}
                        onClick={() => handleReject(restaurant.id)}
                        disabled={actionLoading === restaurant.id + '-reject'}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-2.5 text-sm font-semibold hover:bg-red-500/30 transition-all disabled:opacity-40"
                      >
                        {actionLoading === restaurant.id + '-reject' ? '...' : <><X size={16} />Reject</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center px-5">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-white font-bold mb-2">Could not load admin data</p>
          <p className="text-white/40 text-sm">Make sure the backend server is running</p>
          <button onClick={load} className="btn-primary mt-4">Retry</button>
        </div>
      )}
    </div>
  );
}
