'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { createAppointment, getSlotsByDate } from '@/lib/firestore';
import { getTodayString } from '@/lib/utils';
import type { Appointment, TimeSlot } from '@/lib/types';

interface Props {
  onSuccess: (appointment: Appointment) => void;
}

const STEPS = ['Durée', 'Infos', 'Confirmer'] as const;
type Step = 0 | 1 | 2;

const DURATION_OPTIONS = [
  {
    value: 30 as const,
    label: '30 min',
    sublabel: 'Court',
    desc: 'Une question précise ou un sujet ciblé',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    value: 60 as const,
    label: '1 heure',
    sublabel: 'Approfondi',
    desc: 'Discussion de fond ou accompagnement',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 8 15" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
];

export default function BookingForm({ onSuccess }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [duration, setDuration] = useState<30 | 60 | null>(null);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

  useEffect(() => {
    getSlotsByDate(getTodayString()).then((s) => {
      setSlots(s);
      setSlotsLoaded(true);
    });
  }, []);

  function validateDetails() {
    if (!name.trim() || name.trim().length < 2) {
      setErrors({ name: 'Veuillez entrer votre prénom (min. 2 caractères)' });
      return false;
    }
    setErrors({});
    return true;
  }

  async function handleSubmit() {
    if (!duration || !name.trim()) return;
    setLoading(true);
    try {
      const appointment = await createAppointment({
        name: name.trim(),
        duration,
        reason: reason.trim() || undefined,
        date: getTodayString(),
      });
      toast.success('Votre place est réservée !');
      onSuccess(appointment);
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* ── Stepper ──────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: i === step ? 1.15 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: i < step
                    ? 'linear-gradient(135deg, #7B1FA2, #5E0FAB)'
                    : i === step
                    ? 'linear-gradient(135deg, #C2185B, #7B1FA2)'
                    : '#EDE6FF',
                }}
              >
                {i < step ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="white" strokeWidth={3}>
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${i === step ? 'text-white' : 'text-[#8B7AAF]'}`}>
                    {i + 1}
                  </span>
                )}
              </motion.div>
              <span className={`text-[10px] font-medium ${i === step ? 'text-[#5E0FAB]' : 'text-[#8B7AAF]'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-10 h-px mx-1 mb-4 bg-[#EDE6FF] overflow-hidden">
                <motion.div
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.4 }}
                  className="h-full origin-left"
                  style={{ background: 'linear-gradient(90deg, #7B1FA2, #5E0FAB)' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Step content ─────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Step 0 — Durée */}
        {step === 0 && (
          <motion.div
            key="duration"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="font-display text-2xl font-bold text-center text-[#2D1B5E] mb-1">
              Quelle durée souhaitez-vous ?
            </h2>
            <p className="text-center text-[#8B7AAF] text-sm mb-5">
              Choisissez le temps dont vous avez besoin
            </p>

            {/* Créneau du jour */}
            {slotsLoaded && (
              slots.length > 0 ? (
                <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-5 border"
                  style={{ background: '#F0EAFF', borderColor: '#D8C8FF' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-[#7B1FA2]" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="text-xs text-[#5E0FAB]">
                    <span className="font-semibold">Session aujourd&apos;hui : </span>
                    {slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((s) => `${s.startTime}–${s.endTime}`).join(', ')}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 mb-5 border border-amber-200 bg-amber-50">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" stroke="currentColor" strokeWidth={2}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p className="text-xs text-amber-700">
                    Aucun créneau défini aujourd&apos;hui. Le pasteur doit d&apos;abord configurer les horaires depuis son espace.
                  </p>
                </div>
              )
            )}

            <div className="grid grid-cols-2 gap-3">
              {DURATION_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setDuration(opt.value); setStep(1); }}
                  className="group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer overflow-hidden"
                  style={{
                    borderColor: duration === opt.value ? '#8B31D4' : '#EDE6FF',
                    background: duration === opt.value ? '#F5EEFF' : 'white',
                  }}
                >
                  {/* Accent top bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-200"
                    style={{
                      background: 'linear-gradient(90deg, #C2185B, #7B1FA2)',
                      opacity: duration === opt.value ? 1 : 0,
                    }}
                  />

                  <div className="mb-3 transition-colors text-[#8B31D4] opacity-70 group-hover:opacity-100">
                    {opt.icon}
                  </div>

                  <div className="text-xl font-bold text-[#2D1B5E] leading-tight">{opt.label}</div>
                  <div className="text-xs font-semibold text-[#8B31D4] mt-0.5 mb-1">{opt.sublabel}</div>
                  <div className="text-xs text-[#8B7AAF] leading-snug">{opt.desc}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1 — Infos */}
        {step === 1 && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <BackButton onClick={() => setStep(0)} />

            <h2 className="font-display text-2xl font-bold text-center text-[#2D1B5E] mb-1">
              Vos informations
            </h2>
            <p className="text-center text-[#8B7AAF] text-sm mb-7">
              Ces informations restent confidentielles
            </p>

            <div className="space-y-4">
              <Input
                label="Votre prénom *"
                placeholder="ex : Marie"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({}); }}
                error={errors.name}
                maxLength={50}
                autoFocus
              />
              <div>
                <Textarea
                  label="Motif (optionnel)"
                  placeholder="Sujet que vous souhaitez aborder avec le pasteur…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-right text-[10px] text-[#8B7AAF] mt-1">{reason.length}/200</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl p-3 border"
              style={{ background: '#F7F0FF', borderColor: '#EDE6FF' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 mt-0.5 text-[#8B31D4]" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-xs text-[#8B7AAF]">
                Votre prénom ne sera pas visible par les autres visiteurs. Seul le pasteur y a accès.
              </p>
            </div>

            <Button className="w-full mt-5" size="lg" onClick={() => { if (validateDetails()) setStep(2); }}>
              Continuer
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </motion.div>
        )}

        {/* Step 2 — Confirmation */}
        {step === 2 && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <BackButton onClick={() => setStep(1)} />

            <h2 className="font-display text-2xl font-bold text-center text-[#2D1B5E] mb-1">
              Tout est bon ?
            </h2>
            <p className="text-center text-[#8B7AAF] text-sm mb-7">
              Vérifiez vos informations avant de confirmer
            </p>

            {/* Summary card */}
            <div className="rounded-2xl p-5 text-white mb-5"
              style={{ background: 'linear-gradient(135deg, #3D0870 0%, #7B1FA2 60%, #1565C0 100%)' }}>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/15">
                <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center font-bold text-xl font-display ring-2 ring-white/20">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-white/55 text-xs">Visiteur</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-white/55 text-sm">Durée</span>
                  <span className="font-semibold">{duration === 30 ? '30 minutes' : '1 heure'}</span>
                </div>
                {reason && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-white/55 text-sm shrink-0">Motif</span>
                    <span className="text-sm text-right font-medium text-white/85">{reason}</span>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full" size="lg" loading={loading} onClick={handleSubmit}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Confirmer ma réservation
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-[#8B7AAF] hover:text-[#5E0FAB] mb-5 transition-colors cursor-pointer group"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" stroke="currentColor" strokeWidth={2.5}>
        <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Retour
    </button>
  );
}
