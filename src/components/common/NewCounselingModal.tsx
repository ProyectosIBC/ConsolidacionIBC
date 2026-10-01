import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CounselingUrgency } from '../../types';
import { HeartHandshake } from 'lucide-react';

interface NewCounselingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCounselingModal: React.FC<NewCounselingModalProps> = ({ isOpen, onClose }) => {
  const { addCounseling, members } = useApp();

  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [tema, setTema] = useState('Matrimonial / Familia');
  const [disponibilidad, setDisponibilidad] = useState<'Mañana' | 'Tarde' | 'Noche'>('Mañana');
  const [detalles, setDetalles] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !contacto.trim()) return;

    addCounseling({
      nombre: nombre.trim(),
      contacto: contacto.trim(),
      tema: tema.trim(),
      urgencia: 'Media',
      disponibilidadHorario: disponibilidad,
      detalles: detalles.trim(),
      estado: 'Pendiente',
      pastorAsignado: 'Pastor Edgar',
    });

    onClose();
    setNombre('');
    setContacto('');
    setDetalles('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900">Registrar Solicitud de Consejería</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Cargar desde Sistema de Consolidación opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Seleccionar Hermano(a) en Consolidación:</label>
            <select
              onChange={(e) => {
                const found = members.find((m) => m.id === e.target.value);
                if (found) {
                  setNombre(found.nombre);
                  setContacto(found.telefono);
                }
              }}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="">-- O escribir manualmente abajo --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.telefono})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Solicitante: *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Rosa Gómez"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp: *</label>
              <input
                type="text"
                required
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="3187654321"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Disponibilidad de Horario:</label>
              <select
                value={disponibilidad}
                onChange={(e) => setDisponibilidad(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              >
                <option value="Mañana">🌅 Mañana (8am - 12pm)</option>
                <option value="Tarde">☀️ Tarde (1pm - 6pm)</option>
                <option value="Noche">🌙 Noche (6pm - 9pm)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tema Principal:</label>
            <input
              type="text"
              required
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ej: Crisis Matrimonial, Duelo, Orientación..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detalles Confidenciales:</label>
            <textarea
              rows={2}
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              placeholder="Información previa para el Pastor Edgar..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
            >
              Guardar Solicitud Pastoral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
