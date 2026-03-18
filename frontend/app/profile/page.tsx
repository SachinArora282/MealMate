'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, Store, LogOut, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-white mb-2">Not signed in</h2>
        <p className="text-white/40 text-sm mb-6">Sign in to manage your profile</p>
        <Link href="/auth" className="btn-primary flex items-center gap-2">Sign In <ChevronRight size={16} /></Link>
      </div>
    );
  }

  const roleConfig = {
    USER: { label: 'Food Explorer', emoji: '🍽️', color: 'text-brand-blue bg-blue-500/20 border-blue-500/30' },
    OWNER: { label: 'Restaurant Owner', emoji: '🏪', color: 'text-brand-amber bg-amber-500/20 border-amber-500/30' },
    ADMIN: { label: 'Administrator', emoji: '🛡️', color: 'text-brand-green bg-green-500/20 border-green-500/30' },
  };

  const role = roleConfig[user.role] || roleConfig.USER;

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold font-display text-white">Profile</h1>
      </div>

      {/* Avatar & Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 mb-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-orange-gradient flex items-center justify-center shadow-orange flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-3xl">{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-white/40 text-sm">{user.email}</p>
            <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${role.color}`}>
              {role.emoji} {role.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Menu items */}
      <div className="px-5 space-y-3">
        {user.role === 'ADMIN' && (
          <Link href="/admin">
            <div className="card p-4 flex items-center gap-3 hover:border-brand-orange/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <ShieldCheck size={20} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Admin Dashboard</p>
                <p className="text-white/40 text-xs">Manage restaurants & analytics</p>
              </div>
              <ChevronRight size={18} className="text-white/30" />
            </div>
          </Link>
        )}

        {(user.role === 'OWNER' || user.role === 'ADMIN') && (
          <Link href="/onboarding">
            <div className="card p-4 flex items-center gap-3 hover:border-brand-orange/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center">
                <Store size={20} className="text-brand-orange" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Add Restaurant</p>
                <p className="text-white/40 text-xs">List your restaurant on MealMate</p>
              </div>
              <ChevronRight size={18} className="text-white/30" />
            </div>
          </Link>
        )}

        <Link href="/saved">
          <div className="card p-4 flex items-center gap-3 hover:border-brand-orange/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <span className="text-lg">❤️</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Saved Dishes</p>
              <p className="text-white/40 text-xs">Your favourite food collection</p>
            </div>
            <ChevronRight size={18} className="text-white/30" />
          </div>
        </Link>

        <div className="card p-4 flex items-center gap-3 opacity-60">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Settings size={20} className="text-white/50" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Settings</p>
            <p className="text-white/40 text-xs">Coming soon</p>
          </div>
        </div>

        <button onClick={handleLogout} id="logout-btn" className="w-full card p-4 flex items-center gap-3 hover:border-red-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <LogOut size={20} className="text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-red-400">Sign Out</p>
          </div>
        </button>
      </div>
    </div>
  );
}
