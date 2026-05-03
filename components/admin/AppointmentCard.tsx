'use client';

import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import { statusColor, statusLabel, formatTime } from '@/lib/utils';
import { startAppointment, finishAppointment, cancelAppointment } from '@/lib/firestore';
import type { Appointment } from '@/lib/types';
import { toast } from 'react-hot-toast';

interface Props {
  appointment: Appointment;
  index: number;
}

const LEFT_BORDER: Record<Appointment['status'], string> = {
  waiting: '#F59E0B',
  active: '#10B981',
  done: '#CBD5E1',
  cancelled: '#FCA5A5',
};

export default function AppointmentCard({ appointment: appt, index }: Props) {
  async function handleStart() {
    await startAppointment(appt.id);
    toast.success(`${appt.name} — entretien démarré`);
  }
  async function handleFinish() {
    await finishAppointment(appt.id);
    toast.success(`${appt.name} — entretien terminé`);
  }
  async function handleCancel() {
    if (!confirm(`Annuler le rendez-vous de ${appt.name} ?`)) return;
    await cancelAppointment(appt.id);
    toast(`${appt.name} — rendez-vous annulé`);
  }

  const isDone = appt.status === 'done' || appt.status === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      layout
      className={`relative bg-white rounded-2xl border border-[#EDE6FF] border-l-4 overflow-hidden transition-all duration-300
        ${isDone ? 'opacity-50' : 'shadow-sm hover:shadow-md'}`}
      style={{ borderLeftColor: LEFT_BORDER[appt.status] }}
    >
      {/* Barre active pulsante */}
      {appt.status === 'active' && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #C2185B, #7B1FA2)' }}
        />
      )}

      <div className="p-4">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
              style={{
                background: appt.status === 'active'
                  ? 'linear-gradient(135deg, #C2185B, #7B1FA2)'
                  : 'linear-gradient(135deg, #5E0FAB, #8B31D4)',
              }}
            >
              {appt.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[#2D1B5E] truncate">{appt.name}</h3>
              {appt.reason && <p className="text-xs text-[#8B7AAF] truncate mt-0.5">{appt.reason}</p>}
            </div>
          </div>
          <Badge className={`${statusColor(appt.status)} shrink-0`}>
            {statusLabel(appt.status)}
          </Badge>
        </div>

        {/* Méta */}
        <div className="flex items-center gap-3 text-xs text-[#8B7AAF] mb-3">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {appt.duration} min
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatTime(appt.estimatedStartTime)}
          </span>
          <span className="ml-auto font-mono font-semibold" style={{ color: '#8B31D4' }}>#{appt.position}</span>
        </div>

        {/* Actions */}
        {!isDone && (
          <div className="flex gap-2 pt-2 border-t border-[#F0EAFF]">
            {appt.status === 'waiting' && (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-2 rounded-xl transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #5E0FAB, #3D0870)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Démarrer
              </button>
            )}
            {appt.status === 'active' && (
              <button
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={3}>
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Terminer
              </button>
            )}
            <button
              onClick={handleCancel}
              className="px-3 py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
