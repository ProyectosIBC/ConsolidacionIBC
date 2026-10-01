import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MemberType } from '../../types';
import { X, UserPlus, UserCheck } from 'lucide-react';

interface NewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMemberModal: React.FC<NewMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember, consolidators } = useApp();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState<MemberType>('Visitante Nuevo');
  const [consolidadorId, setConsolidadorId] = useState('');
  const [ministerioInteres, setMinisterioInteres] = useState('');
  const [deseaBautizarse, setDeseaBautizarse] = useState<'Sí' | 'No' | 'Ya bautizado' | 'Desea información'>('Desea información');
  const [necesitaTransporte, setNecesitaTransporte] = useState(false);
  const [notas, setNotas] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;

    addMember({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      tipo,
      estadoSeguimiento: 'Nuevo',
      proximoContacto: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notas: notas.trim(),
      ministerioInteres: ministerioInteres.trim(),
      necesitaTransporte,
      deseaBautizarse,
      consolidadorId: consolidadorId || undefined,
    });

    onClose();
    setNombre('');
    setTelefono('');
    setEmail('');
    setNotas('');
    setConsolidadorId('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Registrar Nueva Persona</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo: *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Andrés Felipe Silva"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp: *</label>
              <input
                type="text"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="3105551234"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Persona:</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as MemberType)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Visitante Nuevo">Visitante Nuevo</option>
                <option value="Ausente">Ausente</option>
                <option value="Miembro Frecuente">Miembro Frecuente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Integrado">Integrado</option>
              </select>
            </div>
          </div>

          {/* Asignación de Consolidador */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Asignar a Consolidador:</span>
              <span className="text-[10px] text-blue-600 font-normal">Automático por carga si no se elige</span>
            </label>
            <select
              value={consolidadorId}
              onChange={(e) => setConsolidadorId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="">-- Auto-asignar equitativamente (Balanceado) --</option>
              {consolidators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.alias}: {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ministerio de Interés:</label>
              <input
                type="text"
                value={ministerioInteres}
                onChange={(e) => setMinisterioInteres(e.target.value)}
                placeholder="Jóvenes, Matrimonios..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">¿Desea bautizarse?:</label>
            <select
              value={deseaBautizarse}
              onChange={(e) => setDeseaBautizarse(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
            >
              <option value="Sí">🌊 Sí, desea bautizarse</option>
              <option value="Ya bautizado">✝️ Ya está bautizado(a)</option>
              <option value="Desea información">📖 Desea información</option>
              <option value="No">No por ahora</option>
            </select>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="modalTransporte"
              checked={necesitaTransporte}
              onChange={(e) => setNecesitaTransporte(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="modalTransporte" className="text-xs text-slate-700 cursor-pointer">
              ¿Requiere transporte / apoyo para el domingo?
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notas Iniciales:</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Quién le invitó o necesidad identificada..."
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
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Guardar e Iniciar Ruta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
