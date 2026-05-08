'use client';

import { motion } from 'framer-motion';
import { isToday } from '@/lib/utils';
import type { Appointment } from '@/lib/types';

interface Props {
  appointments: Appointment[];
  date: string;
}

export default function StatsBar({ appointments, date }: Props) {
  const total = appointments.length;
  const done = appointments.filter((a) => a.status === 'done').length;
  const waiting = appointments.filter((a) => a.status === 'waiting').length;
  const active = appointments.filter((a) => a.status === 'active').length;
  const doneMinutes = appointments.filter((a) => a.status === 'done').reduce((acc, a) => acc + a.duration, 0);
  const avgDuration = done > 0 ? Math.round(doneMinutes / done) : 0;

  const stats = [
    {
      label: 'Total',
      value: total,
      iconBg: 'from-[#0D1B3E] to-[#1A3068]',
      icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
      valueColor: '#0D1B3E',
    },
    {
      label: 'En attente',
      value: waiting,
      iconBg: 'from-amber-400 to-amber-500',
      icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
      valueColor: '#92400E',
    },
    {
      label: 'En cours',
      value: active,
      iconBg: 'from-emerald-400 to-emerald-500',
      icon: <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
      valueColor: '#065F46',
    },
    {
      label: 'Terminés',
      value: done,
      iconBg: 'from-slate-400 to-slate-500',
      icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth={2.5}><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      valueColor: '#475569',
    },
    {
      label: 'Durée moy.',
      value: avgDuration ? `${avgDuration}m` : '—',
      iconBg: 'from-[#B8860B] to-[#C9A227]',
      icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
      valueColor: '#A07D1A',
    },
  ];

  return (
    <div className="space-y-3">
    {/* Date label */}
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
        {isToday(date) ? 'Aujourd\'hui' : 'Journée sélectionnée'}
      </span>
      <div className="flex-1 h-px bg-[#B8C8DF]" />
      {isToday(date) && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)' }}>
          LIVE
        </span>
      )}
    </div>
    <div className="grid grid-cols-5 gap-2.5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl border border-[#B8C8DF] p-3.5"
        >
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br ${s.iconBg} mb-2.5`}>
            {s.icon}
          </div>
          <p className="text-2xl font-bold leading-none mb-0.5" style={{ color: s.valueColor }}>{s.value}</p>
          <p className="text-[10px] text-[#475569] leading-tight">{s.label}</p>
        </motion.div>
      ))}
    </div>
    </div>
  );
}
