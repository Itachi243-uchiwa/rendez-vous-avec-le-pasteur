'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/shared/Header';
import BookingForm from '@/components/booking/BookingForm';
import QueueStatus from '@/components/booking/QueueStatus';
import Card from '@/components/ui/Card';
import type { Appointment } from '@/lib/types';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: '30 ou 60 min',
    desc: 'Choisissez votre durée',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Confidentiel',
    desc: 'Votre nom est protégé',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'File en direct',
    desc: 'Suivez en temps réel',
  },
];

export default function HomePage() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  return (
    <div className="relative min-h-screen flex flex-col z-10">
      {/* ── Header ─────────────────────────────────────────── */}
      <Header />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Fond dégradé navy Bruxelles */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #060D1F 0%, #0D1B3E 40%, #152B5C 70%, #0B2050 100%)'
        }} />

        {/* Blobs animés */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #C9A22740, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #2B4A8C50, transparent 70%)' }}
        />

        {/* Pattern croix */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='27' y='10' width='6' height='40' rx='1' fill='white'/%3E%3Crect x='10' y='24' width='40' height='6' rx='1' fill='white'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />

        <div className="relative px-4 pt-14 pb-28 max-w-xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-7">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Sessions disponibles aujourd&apos;hui
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.15] mb-3">
              Rencontrez{' '}
              <em className="not-italic" style={{
                background: 'linear-gradient(90deg, #FDE68A, #F59E0B, #C9A227)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                le Pasteur
              </em>
            </h1>

            <p className="text-white/65 text-sm leading-relaxed mb-2">
              AMOUR · SAINTETÉ · PUISSANCE · ÉQUILIBRE
            </p>
            <p className="text-white/55 text-sm max-w-xs mx-auto">
              Un moment d&apos;échange après le culte — simple, rapide, sans inscription.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main card ──────────────────────────────────────── */}
      <main className="relative flex-1 max-w-lg mx-auto w-full px-4 -mt-14 pb-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Card
            className="overflow-hidden"
            style={{ boxShadow: '0 12px 50px rgba(13,27,62,0.15)' }}
          >
            <AnimatePresence mode="wait">
              {!appointment ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="p-6 md:p-8"
                >
                  <BookingForm onSuccess={setAppointment} />
                </motion.div>
              ) : (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-8"
                >
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 mb-6 border"
                    style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#15803D' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-semibold text-sm">Réservation confirmée !</span>
                  </motion.div>
                  <QueueStatus appointment={appointment} onReset={() => setAppointment(null)} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Feature badges */}
        <AnimatePresence>
          {!appointment && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-3 gap-3 mt-5"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(13,27,62,0.10)' }}
                  className="bg-white border border-[#B8C8DF] rounded-2xl p-3.5 text-center cursor-default"
                >
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl mb-2 text-[#C9A227]"
                    style={{ background: 'linear-gradient(135deg, #E6EBF5, #D8E3F5)' }}>
                    {f.icon}
                  </div>
                  <p className="text-xs font-semibold text-[#0D1B3E] leading-tight">{f.title}</p>
                  <p className="text-[10px] text-[#475569] mt-0.5 leading-tight">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative text-center py-6 z-10 space-y-1">
        <p className="text-xs text-[#475569]">
          © {new Date().getFullYear()} La Compassion Bruxelles &mdash; Amour · Sainteté · Puissance · Équilibre
        </p>
        <p className="text-[10px] text-[#94A3B8]">
          Powered by Martinez Muzela
        </p>
      </footer>
    </div>
  );
}
