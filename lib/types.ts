export type AppointmentStatus = 'waiting' | 'active' | 'done' | 'cancelled';

export interface Appointment {
  id: string;
  name: string;
  duration: 30 | 60;
  reason?: string;
  status: AppointmentStatus;
  estimatedStartTime: string; // ISO string
  createdAt: string; // ISO string
  date: string; // YYYY-MM-DD
  position: number;
  token: string; // unique visitor token for self-lookup
  phone?: string;
}

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isBlocked: boolean;
  label?: string;
}

export interface DayStats {
  total: number;
  done: number;
  waiting: number;
  active: number;
  avgDuration: number;
}
