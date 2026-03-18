'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { authRegister } from '@/services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await authRegister(name, email, password);
        await login(email, password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 py-12">
      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-orange-gradient flex items-center justify-center mx-auto shadow-orange mb-4">
          <span className="text-4xl">🍽️</span>
        </div>
        <h1 className="text-3xl font-bold font-display gradient-text">MealMate</h1>
        <p className="text-white/40 mt-1 text-sm">Discover your next favourite dish</p>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex mb-6 bg-surface-card rounded-2xl p-1 border border-white/10">
        <button
          onClick={() => setIsLogin(true)}
          id="login-tab"
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${isLogin ? 'bg-orange-gradient text-white shadow-orange' : 'text-white/50'}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsLogin(false)}
          id="register-tab"
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${!isLogin ? 'bg-orange-gradient text-white shadow-orange' : 'text-white/50'}`}
        >
          Register
        </button>
      </motion.div>

      {/* Form */}
      <motion.form
        key={isLogin ? 'login' : 'register'}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input id="auth-name" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required className="input pl-11" />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input id="auth-email" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="input pl-11" />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            id="auth-password"
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="input pl-11 pr-11"
          />
          <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          id="auth-submit"
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          {!loading && <ArrowRight size={18} />}
        </button>

        {/* Demo credentials hint */}
        <div className="bg-surface-card rounded-xl p-4 border border-white/10">
          <p className="text-xs text-white/40 font-semibold mb-2">🧪 Demo credentials</p>
          <p className="text-xs text-white/30">User: <span className="text-white/60">demo@mealmate.com / user123</span></p>
          <p className="text-xs text-white/30">Admin: <span className="text-white/60">admin@mealmate.com / admin123</span></p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-white/40 text-sm hover:text-white/60 transition-colors">
            Continue as guest →
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
