import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DonationCategory, PaymentMethod } from '../../types';
import { Coins } from 'lucide-react';

interface NewDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDonationModal: React.FC<NewDonationModalProps> = ({ isOpen, onClose }) => {
  const { addDonation, members } = useApp();

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState<DonationCategory>('Diezmo');
  const [metodo, setMetodo] = useState<PaymentMethod>('Bancolombia');
  const [referencia, setReferencia] = useState('');
  const [comprobanteUrl, setComprobanteUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto.replace(/\D/g, ''));
    if (!nombre.trim() || isNaN(montoNum) || montoNum <= 0) return;

    addDonation({
      nombre: nombre.trim(),
      monto: montoNum,
      fecha: new Date().toISOString(),
      categoria,
      metodo,
      referencia: referencia.trim(),
      comprobanteUrl:
        comprobanteUrl.trim() ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    });

    onClose();
    setNombre('');
    setMonto('');
    setReferencia('');
    setComprobanteUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Registrar Ofrenda o Diezmo</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Cargar desde CRM */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Seleccionar Miembro (Opcional):</label>
            <select
              onChange={(e) => {
                const found = members.find((m) => m.id === e.target.value);
                if (found) setNombre(found.nombre);
              }}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="">-- O escribir nombre abajo --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Donante: *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Familia Silva Ospina o Anónimo"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Monto en Pesos (COP): *</label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 350000"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-emerald-800 font-bold focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoría:</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as DonationCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Diezmo">Diezmo</option>
                <option value="Ofrenda dominical">Ofrenda dominical</option>
                <option value="Pro-Templo">Pro-Templo</option>
                <option value="Misiones">Misiones</option>
                <option value="Acción Social">Acción Social</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Método:</label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value as PaymentMethod)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Bancolombia">Bancolombia</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Datafono">Datafono</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Referencia Bancaria:</label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="TRX-10293847"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">URL Comprobante (Supabase Storage):</label>
            <input
              type="text"
              value={comprobanteUrl}
              onChange={(e) => setComprobanteUrl(e.target.value)}
              placeholder="https://... o dejar vacío para muestra"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              Guardar en Libro Contable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
