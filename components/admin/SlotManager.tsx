'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { createSlot, deleteSlot } from '@/lib/firestore';
import { getTodayString } from '@/lib/utils';
import type { TimeSlot } from '@/lib/types';
import { toast } from 'react-hot-toast';

interface Props {
  slots: TimeSlot[];
  date: string;
  onSlotsChange: () => void;
}

export default function SlotManager({ slots, date, onSlotsChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!startTime || !endTime) return;
    setLoading(true);
    try {
      await createSlot({ date, startTime, endTime, isBlocked: false, label });
      toast.success('Créneau ajouté');
      setShowForm(false);
      onSlotsChange();
    } catch {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock(id: string) {
    await deleteSlot(id);
    toast('Créneau supprimé');
    onSlotsChange();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#1B3A6B]">Créneaux du jour</h3>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Annuler' : '+ Ajouter'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4 space-y-3 bg-[#F9F5F0]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1B3A6B] block mb-1">Début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] text-sm outline-none focus:border-[#C9973B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1B3A6B] block mb-1">Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] text-sm outline-none focus:border-[#C9973B]"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Label (ex: Après culte du matin)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] text-sm outline-none focus:border-[#C9973B]"
              />
              <Button size="sm" loading={loading} onClick={handleAdd} className="w-full">
                Ajouter ce créneau
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {slots.length === 0 ? (
        <p className="text-sm text-[#8B9AAF] text-center py-4">
          Aucun créneau défini pour aujourd&apos;hui
        </p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-[#E8DFD0]"
            >
              <div>
                <p className="text-sm font-semibold text-[#1B3A6B]">
                  {slot.startTime} – {slot.endTime}
                </p>
                {slot.label && <p className="text-xs text-[#8B9AAF]">{slot.label}</p>}
              </div>
              <button
                onClick={() => handleBlock(slot.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
