'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { subscribeToDateAppointments, getSlotsByDate } from '@/lib/firestore';
import { getTodayString, formatDate } from '@/lib/utils';
import type { Appointment, TimeSlot } from '@/lib/types';
import AppointmentCard from '@/components/admin/AppointmentCard';
import StatsBar from '@/components/admin/StatsBar';
import SlotManager from '@/components/admin/SlotManager';

type Tab = 'queue' | 'done' | 'slots';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().split('T')[0];
}

function isToday(dateStr: string) {
  return dateStr === getTodayString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'linear-gradient(135deg, #0D1B3E, #1A3068)' }}>
      <div className="relative w-20 h-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white"
        />
        <div className="absolute inset-2.5 rounded-full overflow-hidden bg-white/10">
          <Image src="/NEW logo compassion bruxelles.png" alt="" fill sizes="64px" loading="eager" className="object-contain p-1" />
        </div>
      </div>
      <p className="text-white/60 text-sm">Chargement…</p>
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-[#B8C8DF] py-16 px-6 text-center"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-semibold text-[#0D1B3E] mb-1">{title}</p>
      <p className="text-sm text-[#475569]">{desc}</p>
    </motion.div>
  );
}

/** Date navigation bar */
function DateNav({
  date,
  onPrev,
  onNext,
  onToday,
  onChange,
}: {
  date: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onChange: (d: string) => void;
}) {
  const today = isToday(date);

  return (
    <div className="flex items-center gap-2 bg-white border border-[#B8C8DF] rounded-2xl px-3 py-2 shadow-sm">
      {/* Prev */}
      <button
        onClick={onPrev}
        className="p-1.5 rounded-lg hover:bg-[#D8E3F5] text-[#475569] hover:text-[#1A3068] transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Date input (cliquable) */}
      <div className="flex-1 relative">
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="w-full text-center text-sm font-semibold text-[#0D1B3E] bg-transparent outline-none cursor-pointer
            [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <p className="text-[10px] text-[#475569] text-center capitalize leading-none mt-0.5 pointer-events-none">
          {formatDate(date)}
        </p>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        className="p-1.5 rounded-lg hover:bg-[#D8E3F5] text-[#475569] hover:text-[#1A3068] transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Today pill */}
      {!today && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onToday}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white cursor-pointer shrink-0"
          style={{ background: 'linear-gradient(135deg, #C9A227, #A07D1A)' }}
        >
          Auj.
        </motion.button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [date, setDate] = useState(getTodayString());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('queue');

  // Auth guard
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/admin/login');
      else setAuthLoading(false);
    });
  }, [router]);

  // Real-time appointments — re-subscribe whenever date changes
  useEffect(() => {
    if (authLoading) return;
    setAppointments([]); // clear while loading new date
    return subscribeToDateAppointments(date, setAppointments);
  }, [date, authLoading]);

  // Slots — reload when date changes
  const loadSlots = useCallback(async () => {
    setSlots(await getSlotsByDate(date));
  }, [date]);

  useEffect(() => {
    if (!authLoading) loadSlots();
  }, [authLoading, loadSlots]);

  if (authLoading) return <LoadingScreen />;

  const queueAppointments = appointments
    .filter((a) => a.status === 'waiting' || a.status === 'active')
    .sort((a, b) => a.position - b.position);

  const doneAppointments = appointments
    .filter((a) => a.status === 'done' || a.status === 'cancelled')
    .sort((a, b) => a.position - b.position);

  const activeNow = appointments.find((a) => a.status === 'active');

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'queue', label: 'File d\'attente', count: queueAppointments.length },
    { key: 'done', label: 'Historique', count: doneAppointments.length },
    { key: 'slots', label: 'Créneaux' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#E6EBF5' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #060D1F 0%, #0D1B3E 50%, #152B5C 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="relative h-9 w-36 shrink-0 overflow-hidden">
            <Image
              src="/NEW logo compassion bruxelles.png"
              alt="La Compassion"
              fill
              sizes="144px"
              loading="eager"
              className="object-contain"
            />
          </div>

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Temps réel
          </div>

          {/* Logout */}
          <button
            onClick={async () => { await signOut(auth); router.push('/admin/login'); }}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        {/* Date navigation */}
        <DateNav
          date={date}
          onPrev={() => setDate((d) => shiftDate(d, -1))}
          onNext={() => setDate((d) => shiftDate(d, +1))}
          onToday={() => setDate(getTodayString())}
          onChange={setDate}
        />

        {/* Stats */}
        <StatsBar appointments={appointments} date={date} />

        {/* Session active banner */}
        <AnimatePresence>
          {activeNow && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="text-white rounded-2xl px-5 py-3.5 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #1A3068, #2B4A8C)' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">En cours : </span>
                  <span className="text-sm text-white/80">{activeNow.name} — {activeNow.duration} min</span>
                </div>
                <span className="text-xs text-white/50 font-mono shrink-0">{activeNow.token}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-[#B8C8DF] shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #0D1B3E, #1A3068)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${activeTab === tab.key ? 'text-white' : 'text-[#475569]'}`}>
                {tab.label}
              </span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`relative z-10 text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-[#D8E3F5] text-[#1A3068]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'queue' && (
            <motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {queueAppointments.length === 0
                ? <EmptyState icon="🕊️" title="File vide" desc={isToday(date) ? 'Les réservations apparaîtront ici en temps réel.' : 'Aucun rendez-vous en attente pour cette journée.'} />
                : <div className="space-y-3">{queueAppointments.map((a, i) => <AppointmentCard key={a.id} appointment={a} index={i} />)}</div>}
            </motion.div>
          )}

          {activeTab === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {doneAppointments.length === 0
                ? <EmptyState icon="📋" title="Aucun entretien terminé" desc={`Aucun historique pour le ${formatDate(date)}.`} />
                : <div className="space-y-3">{doneAppointments.map((a, i) => <AppointmentCard key={a.id} appointment={a} index={i} />)}</div>}
            </motion.div>
          )}

          {activeTab === 'slots' && (
            <motion.div key="slots" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div className="bg-white rounded-2xl border border-[#B8C8DF] shadow-sm p-5">
                <SlotManager slots={slots} date={date} onSlotsChange={loadSlots} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
