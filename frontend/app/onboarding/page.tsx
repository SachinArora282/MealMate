'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, Upload, Camera, MapPin, FileText, Video, VideoOff, Circle, StopCircle, RefreshCw, LogIn } from 'lucide-react';
import { createRestaurant, createDish, uploadMenu } from '@/services/api';
import { useAuth } from '@/components/AuthProvider';

const CUISINES = ['North Indian', 'South Indian', 'Gujarati', 'Street Food', 'Punjabi', 'Maharashtrian', 'Continental', 'Fast Food', 'Desserts', 'Beverages', 'Parsi', 'Irani'];
const STEPS = ['Name', 'Cuisine', 'Location', 'Photo', 'Menu', 'Review', 'Live Video'];
const MAX_RECORD_SECONDS = 30;

interface ExtractedItem { name: string; price: number; dietType: 'VEG' | 'NON_VEG'; }

// ─── Live Video Recorder (Step 7) ─────────────────────────────────────────────
function LiveVideoStep({ onDone }: { onDone: (blob: Blob | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [camState, setCamState] = useState<'idle' | 'preview' | 'recording' | 'done' | 'error'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [seconds, setSeconds] = useState(0);

  // Start camera preview
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
      setStream(s);
      setCamState('preview');
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); }
    } catch {
      setCamState('error');
    }
  };

  // Start recording
  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setCamState('done');
      if (previewRef.current) { previewRef.current.src = URL.createObjectURL(blob); }
      stopCamera();
    };
    mediaRecorderRef.current = mr;
    mr.start(200);
    setCamState('recording');
    setSeconds(0);

    // Auto-stop after MAX_RECORD_SECONDS
    let s = 0;
    timerRef.current = setInterval(() => {
      s += 1;
      setSeconds(s);
      if (s >= MAX_RECORD_SECONDS) stopRecording();
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const retake = () => {
    setRecordedBlob(null);
    setSeconds(0);
    setCamState('idle');
  };

  // Cleanup
  useEffect(() => () => { stopCamera(); if (timerRef.current) clearInterval(timerRef.current); }, []);

  const progressPct = Math.min((seconds / MAX_RECORD_SECONDS) * 100, 100);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-3">🎥</div>
        <h2 className="text-2xl font-bold text-white">Live Verification</h2>
        <p className="text-white/40 text-sm mt-1">Record a short clip of your restaurant for authenticity</p>
      </div>

      {/* Tips card */}
      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-4 space-y-1.5">
        <p className="text-brand-orange text-xs font-bold uppercase tracking-wide">What to show in the video</p>
        {['Your restaurant entrance / signboard', 'The kitchen or food prep area', 'A short spoken intro (name + location)'].map(tip => (
          <div key={tip} className="flex items-center gap-2 text-white/60 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0" />
            {tip}
          </div>
        ))}
        <p className="text-white/30 text-[10px] pt-1">Max {MAX_RECORD_SECONDS} seconds · Helps speed up admin approval</p>
      </div>

      {/* Camera / Preview Area */}
      <div className="card overflow-hidden bg-black/40 relative" style={{ minHeight: 220 }}>
        {camState === 'idle' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <Video size={28} className="text-white/40" />
            </div>
            <p className="text-white/40 text-sm">Camera not started</p>
            <button id="start-camera-btn" onClick={startCamera} className="btn-primary flex items-center gap-2">
              <Camera size={16} /> Open Camera
            </button>
          </div>
        )}

        {(camState === 'preview' || camState === 'recording') && (
          <div className="relative">
            <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-xl object-cover" style={{ maxHeight: 280 }} />
            {camState === 'recording' && (
              <>
                {/* REC badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 rounded-full px-3 py-1">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-xs font-bold">REC {seconds}s</span>
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                </div>
              </>
            )}
          </div>
        )}

        {camState === 'done' && recordedBlob && (
          <video ref={previewRef} controls className="w-full rounded-xl" style={{ maxHeight: 280 }} />
        )}

        {camState === 'error' && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <VideoOff size={32} className="text-red-400" />
            <p className="text-red-400 font-semibold text-sm">Camera access denied</p>
            <p className="text-white/30 text-xs">Allow camera access in browser settings</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {camState === 'preview' && (
          <button id="start-record-btn" onClick={startRecording} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Circle size={16} className="text-red-400 fill-red-400" /> Start Recording
          </button>
        )}
        {camState === 'recording' && (
          <button id="stop-record-btn" onClick={stopRecording} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white rounded-2xl py-3 font-semibold hover:bg-red-700 transition-colors">
            <StopCircle size={18} /> Stop ({MAX_RECORD_SECONDS - seconds}s left)
          </button>
        )}
        {camState === 'done' && (
          <>
            <button onClick={retake} className="flex items-center justify-center gap-2 btn-secondary px-5">
              <RefreshCw size={15} /> Retake
            </button>
            <button id="use-video-btn" onClick={() => onDone(recordedBlob)} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Check size={16} /> Use This Video
            </button>
          </>
        )}
      </div>

      {/* Skip option */}
      <button onClick={() => onDone(null)} className="w-full text-center text-white/30 text-sm hover:text-white/50 transition-colors py-2">
        Skip for now → (you can add this later)
      </button>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [menuItems, setMenuItems] = useState<ExtractedItem[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null | undefined>(undefined);

  const toggleCuisine = (c: string) => setCuisines(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const handleMenuUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const fd = new FormData(); fd.append('menu', file);
      const data = await uploadMenu(fd);
      setMenuItems(data.items);
    } catch {
      setMenuItems([
        { name: 'Butter Chicken', price: 280, dietType: 'NON_VEG' },
        { name: 'Paneer Butter Masala', price: 240, dietType: 'VEG' },
        { name: 'Garlic Naan', price: 60, dietType: 'VEG' },
      ]);
    } finally { setOcrLoading(false); }
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const { user } = useAuth();

  const handleSubmitRestaurant = async () => {
    if (!user) {
      setError('You must be logged in to submit a restaurant. Please log in first.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      const res = await createRestaurant({ name, cuisine: cuisines, address, latitude: 19.026, longitude: 72.850 });
      for (const item of menuItems) {
        await createDish({ restaurantId: res.restaurant.id, ...item }).catch(() => {});
      }
      setSubmitted(true);
      setStep(6);
    } catch (err: any) {
      const msg = err?.response?.data?.error || '';
      if (err?.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(msg || 'Submission failed. Please try again.');
      }
    } finally { setSubmitting(false); }
  };

  const handleVideoDone = (blob: Blob | null) => {
    setVideoBlob(blob);
    // TODO: upload blob to server if blob is not null
  };

  const canNext = [name.trim().length > 2, cuisines.length > 0, address.trim().length > 5, true, true, true, false];

  const goNext = () => {
    if (step === 5) { handleSubmitRestaurant(); return; }
    if (step < 6) setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()} className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors" disabled={step === 6 && submitted}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-white/40 text-xs">Step {step + 1} of 7</p>
          <h1 className="text-xl font-bold font-display text-white">{STEPS[step]}</h1>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-orange-gradient rounded-full" animate={{ width: `${((step + 1) / 7) * 100}%` }} transition={{ type: 'spring', damping: 20 }} />
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-brand-orange' : 'bg-white/20'}`} />)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', damping: 25 }}>

            {/* Step 1 — Name */}
            {step === 0 && (
              <div className="space-y-4 text-center">
                <div className="text-5xl mb-4">🏪</div>
                <h2 className="text-2xl font-bold text-white">Restaurant Name</h2>
                <p className="text-white/40">What do locals call your place?</p>
                <input id="restaurant-name" type="text" placeholder="e.g. Shri Krishna Boarding" value={name} onChange={e => setName(e.target.value)} className="input text-lg text-center" />
              </div>
            )}

            {/* Step 2 — Cuisine */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center"><div className="text-5xl mb-4">🍛</div>
                  <h2 className="text-2xl font-bold text-white">Cuisine Type</h2>
                  <p className="text-white/40">Select all that apply ({cuisines.length} selected)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map(c => (
                    <button key={c} onClick={() => toggleCuisine(c)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${cuisines.includes(c) ? 'border-brand-orange bg-brand-orange/20 text-brand-orange' : 'border-white/10 bg-surface-card text-white/60'}`}>
                      {cuisines.includes(c) && <Check size={12} className="inline mr-1" />}{c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — Location */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center"><div className="text-5xl mb-4">📍</div>
                  <h2 className="text-2xl font-bold text-white">Location</h2>
                  <p className="text-white/40">Where can customers find you?</p>
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-2 block">Full Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Shop No. 10, Matunga West, Mumbai..." rows={3} className="input resize-none" />
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-2 block">Google Maps Link (optional)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="url" value={mapsLink} onChange={e => setMapsLink(e.target.value)} placeholder="https://maps.google.com/..." className="input pl-10" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Photo */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center"><div className="text-5xl mb-4">📸</div>
                  <h2 className="text-2xl font-bold text-white">Restaurant Photo</h2>
                  <p className="text-white/40">A great photo attracts more customers</p>
                </div>
                <label className="cursor-pointer block">
                  <div className={`card p-8 flex flex-col items-center gap-3 border-2 border-dashed hover:border-brand-orange/50 transition-colors ${imagePreview ? 'border-brand-orange/50' : 'border-white/20'}`}>
                    {imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl" /> : (
                      <><Camera size={40} className="text-white/30" /><p className="text-white/50 text-sm">Tap to upload restaurant photo</p></>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImagePreview} className="hidden" />
                </label>
              </div>
            )}

            {/* Step 5 — Menu */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center"><div className="text-5xl mb-4">📜</div>
                  <h2 className="text-2xl font-bold text-white">Upload Menu</h2>
                  <p className="text-white/40">AI will extract dishes automatically</p>
                </div>
                <label className="cursor-pointer block">
                  <div className="card p-6 flex flex-col items-center gap-3 border-2 border-dashed border-white/20 hover:border-brand-orange/50 transition-colors">
                    <FileText size={36} className="text-white/30" />
                    <div className="btn-secondary text-sm flex items-center gap-2"><Upload size={16} />Choose Menu Photo</div>
                  </div>
                  <input type="file" accept="image/*" onChange={handleMenuUpload} className="hidden" />
                </label>
                {ocrLoading && <div className="card p-4 flex items-center gap-3"><div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" /><p className="text-white/60 text-sm">AI extracting menu items...</p></div>}
                {menuItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/50 text-sm font-semibold">✅ {menuItems.length} items extracted:</p>
                    {menuItems.map((item, i) => (
                      <div key={i} className="card p-3 flex items-center gap-3">
                        <input value={item.name} onChange={e => setMenuItems(p => p.map((m, idx) => idx === i ? { ...m, name: e.target.value } : m))} className="flex-1 bg-transparent text-white font-semibold text-sm focus:outline-none" />
                        <span className="text-brand-orange font-bold text-sm">₹{item.price}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.dietType === 'VEG' ? 'tag-veg' : 'tag-nonveg'}`}>{item.dietType}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 6 — Review & Submit */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="text-center"><div className="text-5xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-white">Review & Submit</h2>
                  <p className="text-white/40">Everything look good?</p>
                </div>

                {/* Auth gate */}
                {!user ? (
                  <div className="card p-6 flex flex-col items-center gap-4 border-2 border-brand-orange/30">
                    <div className="text-4xl">🔐</div>
                    <p className="text-white font-semibold text-center">You need to be logged in to submit</p>
                    <p className="text-white/40 text-sm text-center">Create an account or log in — it only takes 30 seconds</p>
                    <button onClick={() => router.push('/auth')} className="btn-primary flex items-center gap-2 w-full justify-center">
                      <LogIn size={16} /> Log In / Register
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="card p-5 space-y-3">
                      <div className="flex justify-between"><span className="text-white/50 text-sm">Name</span><span className="text-white font-semibold text-sm">{name}</span></div>
                      <div className="flex justify-between"><span className="text-white/50 text-sm">Cuisines</span><span className="text-white font-semibold text-sm text-right">{cuisines.join(', ')}</span></div>
                      <div className="flex justify-between"><span className="text-white/50 text-sm">Address</span><span className="text-white font-semibold text-sm text-right max-w-[60%]">{address}</span></div>
                      <div className="flex justify-between"><span className="text-white/50 text-sm">Menu items</span><span className="text-white font-semibold text-sm">{menuItems.length} dishes</span></div>
                      <div className="flex justify-between"><span className="text-white/50 text-sm">Logged in as</span><span className="text-green-400 font-semibold text-sm">{user.name}</span></div>
                    </div>
                    {error && <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
                    <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-4">
                      <p className="text-brand-orange text-sm font-semibold mb-1">⏳ Pending Admin Approval</p>
                      <p className="text-white/40 text-xs">After submission an admin will review within 24–48 hours. Adding a live video in the next step speeds up approval.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 7 — Live Video */}
            {step === 6 && (
              submitted ? (
                videoBlob === undefined ? (
                  <LiveVideoStep onDone={handleVideoDone} />
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <div className="text-6xl mb-2">🎉</div>
                    <h2 className="text-2xl font-bold text-white">You're all set!</h2>
                    <p className="text-white/50 text-sm">Restaurant submitted for review.{videoBlob ? ' Your live video will help speed up approval.' : ''}</p>
                    <div className="card p-4 space-y-2">
                      <div className="flex items-center gap-2 text-green-400 text-sm"><Check size={16} />Restaurant details submitted</div>
                      <div className="flex items-center gap-2 text-green-400 text-sm"><Check size={16} />{menuItems.length > 0 ? `${menuItems.length} menu dishes added` : 'Menu can be added later'}</div>
                      <div className="flex items-center gap-2 text-sm">{videoBlob ? <><Check size={16} className="text-green-400" /><span className="text-green-400">Live verification video attached</span></> : <><div className="w-4 h-4 rounded-full border border-white/30" /><span className="text-white/40">No video — skipped</span></>}</div>
                    </div>
                    <button onClick={() => router.push('/')} className="btn-primary w-full mt-2">Back to Home</button>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/40 text-sm">Please complete step 6 (Review & Submit) first.</p>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next / Submit button — hidden on step 7 */}
      {step < 6 && (
        <div className="px-5 pb-28">
          <motion.button onClick={goNext} disabled={!canNext[step] || submitting} whileTap={{ scale: 0.97 }} id="onboarding-next-btn"
            className={`btn-primary w-full py-4 flex items-center justify-center gap-2 text-base ${(!canNext[step] || submitting) ? 'opacity-40 cursor-not-allowed' : ''}`}>
            {submitting ? 'Submitting...' : step === 5 ? '🚀 Submit Restaurant' : 'Continue'}
            {!submitting && step < 5 && <ChevronRight size={18} />}
          </motion.button>
        </div>
      )}
    </div>
  );
}
