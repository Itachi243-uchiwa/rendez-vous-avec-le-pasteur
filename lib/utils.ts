import type { Appointment } from './types';

export function generateToken(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function computePositions(appointments: Appointment[]): Appointment[] {
  const waiting = appointments
    .filter((a) => a.status === 'waiting' || a.status === 'active')
    .sort((a, b) => a.position - b.position);
  return waiting;
}

export function getWaitCountBefore(appointments: Appointment[], token: string): number {
  const sorted = appointments
    .filter((a) => a.status === 'waiting' || a.status === 'active')
    .sort((a, b) => a.position - b.position);
  const idx = sorted.findIndex((a) => a.token === token);
  return idx === -1 ? -1 : idx;
}

export function statusLabel(status: Appointment['status']): string {
  switch (status) {
    case 'waiting': return 'En attente';
    case 'active': return 'En cours';
    case 'done': return 'Terminé';
    case 'cancelled': return 'Annulé';
  }
}

export function statusColor(status: Appointment['status']): string {
  switch (status) {
    case 'waiting': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'active': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'done': return 'text-slate-500 bg-slate-50 border-slate-200';
    case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
  }
}

export function anonymizeName(name: string, position: number): string {
  return `Personne #${position}`;
}
