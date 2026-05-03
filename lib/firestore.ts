'use client';

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Appointment, TimeSlot } from './types';
import { generateToken } from './utils';

const APPOINTMENTS_COL = 'appointments';
const SLOTS_COL = 'slots';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "HH:MM" + "YYYY-MM-DD" → local Date */
function parseSlotTime(date: string, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, h, m, 0, 0);
}

/** First slot start time for the day, or 10:00 fallback */
async function getSessionStart(date: string): Promise<Date> {
  const slots = await getSlotsByDate(date);
  if (slots.length > 0) {
    const earliest = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
    return parseSlotTime(date, earliest.startTime);
  }
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, 10, 0, 0, 0);
}

/**
 * Walk through the queue in position order and compute each person's
 * estimated start time correctly:
 *
 *  - cursor starts at session start (from slot)
 *  - for the ACTIVE person: cursor = max(their estimatedStart, now)
 *    so that waiting people never get a time in the past
 *  - for WAITING people: cursor advances normally
 */
function computeTimeline(
  sessionStart: Date,
  queue: Appointment[],  // only waiting + active, sorted by position
): Map<string, { position: number; estimatedStartTime: Date }> {
  const now = new Date();
  let cursor = sessionStart;
  const result = new Map<string, { position: number; estimatedStartTime: Date }>();

  queue.forEach((appt, i) => {
    // If this person is currently active, the real start is at least "now minus elapsed"
    // We can't know exact elapsed, so we use now as the cursor floor so nobody gets a past time
    if (appt.status === 'active') {
      cursor = new Date(Math.max(cursor.getTime(), now.getTime()));
    }

    result.set(appt.id, { position: i + 1, estimatedStartTime: cursor });
    cursor = new Date(cursor.getTime() + appt.duration * 60_000);
  });

  return result;
}

// ─── Appointments ─────────────────────────────────────────────────────────────

/** Single composite index needed: date + position */
async function fetchAppointmentsByDate(date: string): Promise<Appointment[]> {
  const q = query(
    collection(db, APPOINTMENTS_COL),
    where('date', '==', date),
    orderBy('position')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
}

export async function createAppointment(data: {
  name: string;
  duration: 30 | 60;
  reason?: string;
  date: string;
}): Promise<Appointment> {
  const token = generateToken();

  const all = await fetchAppointmentsByDate(data.date);
  const queue = all.filter((a) => a.status === 'waiting' || a.status === 'active');
  const position = queue.length + 1;

  const sessionStart = await getSessionStart(data.date);

  // Compute the cursor after all existing queue members
  const timeline = computeTimeline(sessionStart, queue);
  let cursor = sessionStart;
  if (timeline.size > 0) {
    const last = queue[queue.length - 1];
    const lastEntry = timeline.get(last.id)!;
    cursor = new Date(lastEntry.estimatedStartTime.getTime() + last.duration * 60_000);
  }

  const payload = {
    name: data.name,
    duration: data.duration,
    reason: data.reason ?? '',
    status: 'waiting',
    date: data.date,
    position,
    token,
    estimatedStartTime: cursor.toISOString(),
    createdAt: new Date().toISOString(),
  };

  const ref = await addDoc(collection(db, APPOINTMENTS_COL), payload);
  return { id: ref.id, ...payload } as Appointment;
}

export async function getAppointmentByToken(token: string): Promise<Appointment | null> {
  const q = query(collection(db, APPOINTMENTS_COL), where('token', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Appointment;
}

export function subscribeToDateAppointments(
  date: string,
  callback: (appointments: Appointment[]) => void
): () => void {
  const q = query(
    collection(db, APPOINTMENTS_COL),
    where('date', '==', date),
    orderBy('position')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment)));
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<void> {
  const ref = doc(db, APPOINTMENTS_COL, id);
  await updateDoc(ref, { status });

  // After any terminal state, recompute the remaining queue's times
  if (status === 'done' || status === 'cancelled' || status === 'active') {
    const snap = await getDoc(ref);
    const date = snap.data()?.date as string;
    if (date) await recomputePositions(date);
  }
}

export const cancelAppointment = (id: string) => updateAppointmentStatus(id, 'cancelled');
export const startAppointment  = (id: string) => updateAppointmentStatus(id, 'active');
export const finishAppointment = (id: string) => updateAppointmentStatus(id, 'done');

async function recomputePositions(date: string): Promise<void> {
  const all = await fetchAppointmentsByDate(date);
  const queue = all.filter((a) => a.status === 'waiting' || a.status === 'active');

  const sessionStart = await getSessionStart(date);
  const timeline = computeTimeline(sessionStart, queue);

  if (timeline.size === 0) return;

  const batch = writeBatch(db);
  timeline.forEach(({ position, estimatedStartTime }, id) => {
    batch.update(doc(db, APPOINTMENTS_COL, id), {
      position,
      estimatedStartTime: estimatedStartTime.toISOString(),
    });
  });
  await batch.commit();
}

// ─── Slots ───────────────────────────────────────────────────────────────────

export async function getSlotsByDate(date: string): Promise<TimeSlot[]> {
  const q = query(collection(db, SLOTS_COL), where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TimeSlot));
}

export async function createSlot(slot: Omit<TimeSlot, 'id'>): Promise<TimeSlot> {
  const ref = await addDoc(collection(db, SLOTS_COL), slot);
  return { id: ref.id, ...slot };
}

export async function deleteSlot(id: string): Promise<void> {
  await deleteDoc(doc(db, SLOTS_COL, id));
}
