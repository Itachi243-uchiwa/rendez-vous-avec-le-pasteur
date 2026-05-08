'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import { subscribeToDateAppointments } from '@/lib/firestore';
import { formatTime, getWaitCountBefore, anonymizeName } from '@/lib/utils';
import type { Appointment } from '@/lib/types';

interface Props {
  appointment: Appointment;
  onReset: () => void;
}

function PositionRing({ position, total }: { position: number; total: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const progress = total > 1 ? (total - position) / (total - 1) : 0;
  const dash = circ * Math.max(0, progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} stroke="#B8C8DF" strokeWidth="8" fill="none" />
        <motion.circle
          cx="60" cy="60" r={r}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          stroke="url(#ring-grad)"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="50%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#1A3068" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] text-[#475569] mb-0.5">Position</span>
        <motion.span
          key={position}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          className="font-display text-3xl font-bold text-[#0D1B3E]"
        >
          #{position}
        </motion.span>
      </div>
    </div>
  );
}

export default function QueueStatus({ appointment, onReset }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [myAppt, setMyAppt] = useState<Appointment>(appointment);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    const unsub = subscribeToDateAppointments(appointment.date, (data) => {
      setAppointments(data);
      const updated = data.find((a) => a.token === appointment.token);
      if (updated) setMyAppt(updated);
    });
    return unsub;
  }, [appointment.date, appointment.token]);

  const waitingBefore = getWaitCountBefore(appointments, appointment.token);
  const queueList = appointments
    .filter((a) => a.status === 'waiting' || a.status === 'active')
    .sort((a, b) => a.position - b.position);
  const isCancelled = myAppt.status === 'cancelled';
  const isDone = myAppt.status === 'done';
  const isActive = myAppt.status === 'active';

  /* ── États terminaux ─────────────────────────────────── */
  if (isCancelled || isDone) {
    const icon = isDone ? '🙏' : '😔';
    const title = isDone ? 'Merci pour votre visite' : 'Rendez-vous annulé';
    const msg = isDone
      ? 'Que Dieu vous bénisse. À bientôt !'
      : 'Votre créneau a été annulé. N\'hésitez pas à réserver à nouveau.';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center py-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="text-6xl mb-4"
        >
          {icon}
        </motion.div>
        <h2 className="font-display text-xl font-bold text-[#0D1B3E] mb-2">{title}</h2>
        <p className="text-[#475569] text-sm mb-7 max-w-xs mx-auto">{msg}</p>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 font-semibold text-sm hover:gap-2.5 transition-all cursor-pointer"
          style={{ color: '#C9A227' }}
        >
          Prendre un nouveau rendez-vous
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </motion.div>
    );
  }

  /* ── C'est votre tour ───────────────────────────────── */
  if (isActive) {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="relative overflow-hidden rounded-2xl p-8 mb-5 text-white"
          style={{ background: 'linear-gradient(135deg, #B8860B, #C9A227)' }}>
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 bg-white/10 rounded-2xl"
          />
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mb-3"
          >
            ✨
          </motion.div>
          <p className="font-display text-2xl font-bold mb-1">C&apos;est votre tour !</p>
          <p className="text-white/75 text-sm">Rendez-vous au bureau du pasteur</p>
        </div>
        <div className="rounded-xl p-3.5 text-left border" style={{ background: '#E6EBF5', borderColor: '#B8C8DF' }}>
          <p className="text-[10px] text-[#475569] uppercase tracking-wide mb-0.5">Votre code</p>
          <p className="font-mono font-bold text-xl tracking-[0.2em]" style={{ color: '#C9A227' }}>
            {appointment.token}
          </p>
        </div>
      </motion.div>
    );
  }

  /* ── En attente ─────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Anneau de position */}
      <div className="text-center py-2">
        <PositionRing position={myAppt.position} total={queueList.length} />
        <p className="text-sm text-[#475569] mt-2">
          {waitingBefore === 0
            ? <span className="font-semibold" style={{ color: '#C9A227' }}>Vous êtes le prochain !</span>
            : <>{waitingBefore} personne{waitingBefore > 1 ? 's' : ''} avant vous</>}
        </p>
      </div>

      {/* Heure + durée */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Heure estimée', value: formatTime(myAppt.estimatedStartTime) },
          { label: 'Durée prévue', value: `${myAppt.duration} min` },
        ].map((item) => (
          <div key={item.label} className="rounded-xl p-3.5 border" style={{ background: '#E6EBF5', borderColor: '#B8C8DF' }}>
            <p className="text-[10px] text-[#475569] uppercase tracking-wide mb-1">{item.label}</p>
            <p className="font-bold text-[#0D1B3E] text-xl">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Token */}
      <div className="rounded-xl p-3.5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0D1B3E, #1A3068)' }}>
        <div>
          <p className="text-[10px] text-white/45 uppercase tracking-wide mb-0.5">Code de suivi</p>
          <p className="font-mono font-bold text-lg tracking-[0.15em]" style={{ color: '#FDE68A' }}>
            {appointment.token}
          </p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white/20" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      {/* File d'attente */}
      {queueList.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-2.5">
            File d&apos;attente
          </p>
          <div className="space-y-1.5">
            {queueList.map((appt, i) => {
              const isMe = appt.token === appointment.token;
              return (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all"
                  style={isMe
                    ? { background: 'linear-gradient(135deg, #0D1B3E, #1A3068)', borderColor: '#1A3068' }
                    : { background: 'white', borderColor: '#B8C8DF' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={isMe
                      ? { background: 'rgba(255,255,255,0.2)', color: '#FDE68A' }
                      : { background: '#D8E3F5', color: '#1A3068' }}>
                    {appt.position}
                  </div>
                  <span className={`text-sm flex-1 font-medium ${isMe ? 'text-white' : 'text-[#0D1B3E]'}`}>
                    {isMe ? 'Vous' : anonymizeName(appt.name, appt.position)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isMe ? 'text-white/55' : 'text-[#475569]'}`}>
                      {appt.duration}m
                    </span>
                    {appt.status === 'active' && (
                      <Badge className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0.5">
                        En cours
                      </Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Annulation */}
      <AnimatePresence>
        {!cancelConfirm ? (
          <motion.button
            key="cancel-btn"
            exit={{ opacity: 0, height: 0 }}
            onClick={() => setCancelConfirm(true)}
            className="w-full text-center text-xs text-[#475569] hover:text-red-500 transition-colors pt-1 cursor-pointer"
          >
            Annuler mon rendez-vous
          </motion.button>
        ) : (
          <motion.div
            key="cancel-confirm"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="border border-red-200 bg-red-50 rounded-xl p-4 text-center"
          >
            <p className="text-sm font-semibold text-red-700 mb-1">Annuler votre rendez-vous ?</p>
            <p className="text-xs text-red-400 mb-4">Cette action ne peut pas être annulée.</p>
            <div className="flex gap-2">
              <button onClick={() => setCancelConfirm(false)}
                className="flex-1 text-sm text-[#475569] hover:text-[#0D1B3E] transition-colors cursor-pointer py-1.5">
                Garder ma place
              </button>
              <button onClick={onReset}
                className="flex-1 bg-red-500 text-white text-sm font-semibold rounded-lg py-1.5 hover:bg-red-600 transition-colors cursor-pointer">
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
