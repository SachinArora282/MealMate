'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, IndianRupee, Sunrise, Sun, Moon, Cookie, Leaf, Drumstick, Check } from 'lucide-react';

const STEPS = ['Budget', 'Meal Type', 'Dietary'];

const BUDGET_PRESETS = [
  { label: 'Budget', range: [50, 150], emoji: '💰' },
  { label: 'Regular', range: [150, 400], emoji: '🍽️' },
  { label: 'Premium', range: [400, 1000], emoji: '👑' },
];

const MEAL_TYPES = [
  { id: 'BREAKFAST', label: 'Breakfast', emoji: '🌅', icon: Sunrise, desc: 'Start your day right' },
  { id: 'LUNCH', label: 'Lunch', emoji: '☀️', icon: Sun, desc: 'Afternoon delight' },
  { id: 'DINNER', label: 'Dinner', emoji: '🌙', icon: Moon, desc: 'Evening feast' },
  { id: 'SNACKS', label: 'Snacks', emoji: '🍿', icon: Cookie, desc: 'Quick bites' },
];

const DIET_TYPES = [
  { id: 'VEG', label: 'Vegetarian', emoji: '🌿', icon: Leaf, color: 'bg-green-500/20 border-green-500/40 text-green-400' },
  { id: 'NON_VEG', label: 'Non-Vegetarian', emoji: '🍗', icon: Drumstick, color: 'bg-red-500/20 border-red-500/40 text-red-400' },
  { id: 'BOTH', label: 'Both', emoji: '🍱', icon: Check, color: 'bg-brand-orange/20 border-brand-orange/40 text-brand-orange' },
];

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState<[number, number]>([50, 500]);
  const [mealType, setMealType] = useState('');
  const [dietType, setDietType] = useState('');

  const canNext = [
    true, // budget always valid
    !!mealType,
    !!dietType,
  ];

  const goNext = () => {
    if (step < 2) { setStep(s => s + 1); return; }
    // Step 3 complete → go to results
    const params = new URLSearchParams({
      maxBudget: String(budget[1]),
      minBudget: String(budget[0]),
      mealType,
      dietType,
    });
    router.push(`/results?${params.toString()}`);
  };

  const goBack = () => {
    if (step > 0) setStep(s => s - 1);
    else router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={goBack} className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors" id="wizard-back-btn">
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-white/40 text-xs font-medium">Step {step + 1} of 3</p>
          <h1 className="text-xl font-bold font-display text-white">{STEPS[step]}</h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-gradient rounded-full"
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 py-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full"
          >
            {/* Step 1: Budget */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">💸</div>
                  <h2 className="text-2xl font-bold text-white">What&apos;s your budget?</h2>
                  <p className="text-white/40 mt-2">Set your price range for the meal</p>
                </div>

                {/* Budget slider visual */}
                <div className="card p-6 text-center">
                  <div className="flex justify-between text-sm text-white/50 mb-2">
                    <span>₹{budget[0]}</span>
                    <span className="gradient-text font-bold text-xl">₹{budget[0]} – ₹{budget[1]}</span>
                    <span>₹{budget[1]}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={50}
                    value={budget[1]}
                    onChange={e => setBudget([budget[0], parseInt(e.target.value)])}
                    className="w-full h-2 accent-brand-orange cursor-pointer"
                    id="budget-slider"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>₹50</span>
                    <span>₹1000+</span>
                  </div>
                </div>

                {/* Preset buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {BUDGET_PRESETS.map(({ label, range, emoji }) => {
                    const isActive = budget[0] === range[0] && budget[1] === range[1];
                    return (
                      <button
                        key={label}
                        id={`budget-preset-${label.toLowerCase()}`}
                        onClick={() => setBudget(range as [number, number])}
                        className={`card p-4 text-center transition-all duration-200 border-2 ${
                          isActive ? 'border-brand-orange bg-brand-orange/10' : 'border-transparent hover:border-brand-orange/30'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{emoji}</span>
                        <p className="font-semibold text-white text-sm">{label}</p>
                        <p className="text-white/40 text-[10px]">₹{range[0]}–₹{range[1]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Meal Type */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl mb-4">🍽️</div>
                  <h2 className="text-2xl font-bold text-white">When are you eating?</h2>
                  <p className="text-white/40 mt-2">Pick one meal type</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {MEAL_TYPES.map(({ id, label, emoji, desc }) => {
                    const isActive = mealType === id;
                    return (
                      <button
                        key={id}
                        id={`meal-${id.toLowerCase()}`}
                        onClick={() => setMealType(id)}
                        className={`card p-5 text-left transition-all duration-200 border-2 ${
                          isActive ? 'border-brand-orange bg-brand-orange/10' : 'border-transparent hover:border-brand-orange/30'
                        }`}
                      >
                        <span className="text-3xl block mb-2">{emoji}</span>
                        <p className="font-bold text-white">{label}</p>
                        <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                        {isActive && <div className="w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center mt-2"><Check size={12} className="text-white" /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Dietary Preference */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl mb-4">🥗</div>
                  <h2 className="text-2xl font-bold text-white">Dietary preference?</h2>
                  <p className="text-white/40 mt-2">We&apos;ll filter dishes for you</p>
                </div>
                <div className="space-y-3">
                  {DIET_TYPES.map(({ id, label, emoji, color }) => {
                    const isActive = dietType === id;
                    return (
                      <button
                        key={id}
                        id={`diet-${id.toLowerCase()}`}
                        onClick={() => setDietType(id)}
                        className={`w-full card p-5 flex items-center gap-4 transition-all duration-200 border-2 text-left ${
                          isActive ? `border-brand-orange ${color.replace('text-', 'bg-').split(' ')[0]}/10` : 'border-transparent hover:border-brand-orange/30'
                        }`}
                      >
                        <span className="text-3xl">{emoji}</span>
                        <div className="flex-1">
                          <p className={`font-bold text-lg ${isActive ? 'text-white' : 'text-white/80'}`}>{label}</p>
                          <p className="text-white/40 text-sm">
                            {id === 'VEG' ? 'Only plant-based dishes' : id === 'NON_VEG' ? 'Meat & non-veg options' : 'Show me everything!'}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next button */}
      <div className="px-5 pb-28">
        <motion.button
          onClick={goNext}
          disabled={!canNext[step]}
          whileTap={{ scale: 0.97 }}
          id="wizard-next-btn"
          className={`btn-primary w-full py-4 flex items-center justify-center gap-2 text-base ${!canNext[step] ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {step === 2 ? '🔍 Find Dishes' : 'Continue'}
          {step < 2 && <ChevronRight size={18} />}
        </motion.button>
      </div>
    </div>
  );
}
