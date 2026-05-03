'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch {
      toast.error('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Fond dégradé */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #1A0038 0%, #3D0870 40%, #6B0FAB 70%, #1565C0 100%)'
      }} />

      {/* Blobs */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 11, repeat: Infinity }}
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"
        style={{ background: 'radial-gradient(circle, #C2185B, transparent 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 15, repeat: Infinity, delay: 4 }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
        style={{ background: 'radial-gradient(circle, #1565C0, transparent 70%)' }}
      />

      {/* Pattern croix */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='27' y='10' width='6' height='40' rx='1' fill='white'/%3E%3Crect x='10' y='24' width='40' height='6' rx='1' fill='white'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo complet — format paysage respecté */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative h-20 w-full mb-8"
        >
          <Image
            src="/logo.png"
            alt="La Compassion Bruxelles"
            fill
            sizes="384px"
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Glass card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-7 shadow-2xl"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>

          <h1 className="font-display text-xl font-bold text-white text-center mb-1">
            Espace Pasteur
          </h1>
          <p className="text-white/45 text-xs text-center mb-6">Accès sécurisé à l&apos;administration</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/60 block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="pasteur@lacompassion.be"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30
                  focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/60 block mb-1.5">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30
                  focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none text-sm transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-opacity disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(135deg, #C2185B, #7B1FA2)' }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center mt-5 text-white/25 text-xs">
          AMOUR · SAINTETÉ · PUISSANCE · ÉQUILIBRE
        </p>
      </motion.div>
    </div>
  );
}
