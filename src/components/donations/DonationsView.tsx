import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Donation, DonationCategory, PaymentMethod } from '../../types';
import {
  Coins,
  Search,
  Filter,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Receipt,
  FileCheck,
  ZoomIn,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { formatearMonedaCOP } from '../../lib/whatsappUtils';

interface DonationsViewProps {
  onOpenNewDonationModal: () => void;
}

export const DonationsView: React.FC<DonationsViewProps> = ({ onOpenNewDonationModal }) => {
  const { donations, toggleVerifyDonation } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);

  // Cálculos contables
  const totalMonto = donations.reduce((sum, d) => sum + d.monto, 0);
  const promedioMonto = donations.length > 0 ? totalMonto / donations.length : 0;
  const diezmosMonto = donations
    .filter((d) => d.categoria === 'Diezmo')
    .reduce((sum, d) => sum + d.monto, 0);
  const proTemploMonto = donations
    .filter((d) => d.categoria === 'Pro-Templo')
    .reduce((sum, d) => sum + d.monto, 0);

  // Filtrado
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.referencia && d.referencia.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'todos' || d.categoria === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Tarjetas de Resumen Contable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Reportado
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {formatearMonedaCOP(totalMonto)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{donations.length} reportes registrados</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Diezmos
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600">
              {formatearMonedaCOP(diezmosMonto)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Fidelidad congregacional</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Fondo Pro-Templo
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">
              {formatearMonedaCOP(proTemploMonto)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Mantenimiento y sonido</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Promedio por Donación
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-700">
              {formatearMonedaCOP(promedioMonto)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Aporte promedio</p>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center flex-1 gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por donante o referencia bancaria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Categoría:</span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium focus:outline-none"
          >
            <option value="todos">Todas las Categorías</option>
            <option value="Diezmo">Diezmo</option>
            <option value="Ofrenda dominical">Ofrenda dominical</option>
            <option value="Pro-Templo">Pro-Templo</option>
            <option value="Misiones">Misiones</option>
            <option value="Acción Social">Acción Social</option>
          </select>

          <button
            onClick={onOpenNewDonationModal}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Ofrenda</span>
          </button>
        </div>
      </div>

      {/* Tabla Contable con Comprobantes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Donante / Hermano(a)</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4 text-right">Monto (COP)</th>
                <th className="py-3.5 px-4 text-center">Comprobante</th>
                <th className="py-3.5 px-4 text-center">Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron registros de donaciones con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {new Date(don.fecha).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{don.nombre}</div>
                      {don.referencia && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ref: {don.referencia}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          don.categoria === 'Diezmo'
                            ? 'bg-blue-100 text-blue-800'
                            : don.categoria === 'Pro-Templo'
                            ? 'bg-amber-100 text-amber-800'
                            : don.categoria === 'Misiones'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {don.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {don.metodo}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap text-sm">
                      {formatearMonedaCOP(don.monto)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {don.comprobanteUrl ? (
                        <button
                          onClick={() => setSelectedReceipt(don)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ver Soporte</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">Sin soporte</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleVerifyDonation(don.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          don.verificado
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Clic para cambiar estado de auditoría"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{don.verificado ? 'Verificado' : 'Por verificar'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visor Modal de Comprobantes con Zoom */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Comprobante de Ofrenda / Donación
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedReceipt.nombre} · {formatearMonedaCOP(selectedReceipt.monto)}
                </p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Imagen del Comprobante */}
            <div className="my-4 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-[380px] border border-slate-200">
              <img
                src={selectedReceipt.comprobanteUrl}
                alt="Comprobante de donación"
                className="object-contain max-h-[380px] w-full hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Datos Técnicos */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 mb-4 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Medio:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.metodo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Referencia:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceipt.referencia || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha:</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedReceipt.fecha).toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <a
                href={selectedReceipt.comprobanteUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 hover:bg-slate-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Original</span>
              </a>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
