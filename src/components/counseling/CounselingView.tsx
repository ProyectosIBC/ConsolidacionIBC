import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CounselingRequest, CounselingStatus, CounselingUrgency } from '../../types';
import {
  HeartHandshake,
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageCircle,
  Plus,
  Search,
  Filter,
  FileText,
  Send,
  User,
  ShieldAlert,
} from 'lucide-react';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';
import { generarMensajePastoralCounseling } from '../../lib/pastoralCounselingMessages';

interface CounselingViewProps {
  onOpenNewCounselingModal: () => void;
}

export const CounselingView: React.FC<CounselingViewProps> = ({ onOpenNewCounselingModal }) => {
  const { counseling, updateCounselingStatus, addCounselingNote, getTiempoAtencionStatus, config } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterUrgency, setFilterUrgency] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRequestForNotes, setActiveRequestForNotes] = useState<CounselingRequest | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Filtrado
  const filteredRequests = counseling
    .filter((c) => {
      const matchesSearch =
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contacto.includes(searchTerm);

      const matchesStatus = filterStatus === 'todos' || c.estado === filterStatus;
      const matchesUrgency = filterUrgency === 'todos' || c.urgencia === filterUrgency;

      return matchesSearch && matchesStatus && matchesUrgency;
    })
    .sort((a, b) => {
      // Priorizar pendientes no cerradas y urgencia Alta
      if (a.estado === 'Cerrada' && b.estado !== 'Cerrada') return 1;
      if (a.estado !== 'Cerrada' && b.estado === 'Cerrada') return -1;
      const order: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };
      return order[a.urgencia] - order[b.urgencia];
    });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestForNotes || !newNoteText.trim()) return;
    addCounselingNote(activeRequestForNotes.id, newNoteText.trim(), config.pastorNombre);
    setNewNoteText('');
    const updated = counseling.find((c) => c.id === activeRequestForNotes.id);
    if (updated) {
      setActiveRequestForNotes({
        ...updated,
        notas: [
          {
            id: 'temp-' + Date.now(),
            fecha: new Date().toISOString(),
            autor: config.pastorNombre,
            texto: newNoteText.trim(),
          },
          ...updated.notas,
        ],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Explicación de Compromiso y Semáforo Pastoral */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-600" />
            <span>Compromiso de Atención Oportuna en Consejería</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Acompañamiento pastoral dedicado para que ninguna persona que pida ayuda espiritual quede desatendida.
            Tiempos máximos de respuesta estipulados:{' '}
            <b className="text-rose-700">Alta: 6 horas</b>,{' '}
            <b className="text-amber-700">Media: 24 horas</b>,{' '}
            <b className="text-slate-700">Baja: 24 horas</b>.
          </p>
        </div>

        {/* Semáforo Guía */}
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>En tiempo</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Por vencer</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Atención Inmediata</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center flex-1 gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por solicitante, tema o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Estado:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium focus:outline-none"
          >
            <option value="todos">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En acompañamiento">En acompañamiento</option>
            <option value="Cerrada">Cerrada</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium focus:outline-none"
          >
            <option value="todos">Toda Prioridad</option>
            <option value="Alta">Alta (máx. 6 horas)</option>
            <option value="Media">Media (máx. 24 horas)</option>
            <option value="Baja">Baja (máx. 24 horas)</option>
          </select>

          <button
            onClick={onOpenNewCounselingModal}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Grid de Solicitudes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((req) => {
          const atencion = getTiempoAtencionStatus(req);
          const isClosed = req.estado === 'Cerrada';

          let cardBorder = 'border-slate-200';
          let badgeStatus = 'bg-emerald-100 text-emerald-800 border-emerald-200';
          let iconColor = 'text-emerald-500';
          let statusText = `${Math.max(0, Math.round(atencion.remainingHours))}h restantes`;

          if (isClosed) {
            badgeStatus = 'bg-slate-100 text-slate-600 border-slate-200';
            statusText = 'Atendida / Cerrada';
          } else if (atencion.status === 'breached') {
            cardBorder = 'border-rose-400 bg-rose-50/10 ring-1 ring-rose-200';
            badgeStatus = 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse';
            iconColor = 'text-rose-600';
            statusText = `¡RESPUESTA SUPERADA HACE ${Math.round(atencion.elapsedHours - req.tiempoLimiteHoras)}H!`;
          } else if (atencion.status === 'warning') {
            cardBorder = 'border-amber-300 bg-amber-50/10';
            badgeStatus = 'bg-amber-100 text-amber-800 border-amber-200';
            iconColor = 'text-amber-500';
            statusText = `Por vencer (${Math.round(atencion.remainingHours)}h restantes)`;
          }

          return (
            <div
              key={req.id}
              className={`bg-white rounded-2xl border ${cardBorder} shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all`}
            >
              <div>
                {/* Header de la Tarjeta */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        req.urgencia === 'Alta'
                          ? 'bg-rose-600 text-white'
                          : req.urgencia === 'Media'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
                      Prioridad {req.urgencia} (máx. {req.tiempoLimiteHoras}h)
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1.5 leading-snug">
                      {req.nombre}
                    </h4>
                  </div>

                  {/* Estado Badge */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                      req.estado === 'Pendiente'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : req.estado === 'En acompañamiento'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {req.estado}
                  </span>
                </div>

                {/* Tema y Detalles */}
                <div className="space-y-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{req.tema}</p>
                    {req.detalles && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {req.detalles}
                      </p>
                    )}
                  </div>

                  {/* Contacto y Fecha */}
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p>
                      <span className="font-semibold text-slate-700">Contacto:</span> {req.contacto}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Solicitada:</span>{' '}
                      {new Date(req.fechaSolicitud).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso de Tiempo Oportuno */}
                {!isClosed && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className={`w-3.5 h-3.5 ${iconColor}`} />
                        <span>Compromiso {req.tiempoLimiteHoras}h:</span>
                      </span>
                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full border ${badgeStatus}`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          atencion.status === 'breached'
                            ? 'bg-rose-500'
                            : atencion.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, atencion.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                {/* Vista previa del mensaje pastoral personalizado */}
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                  <div className="flex items-center gap-1 font-bold text-slate-700 mb-0.5">
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>Mensaje WhatsApp personalizado:</span>
                  </div>
                  <p className="italic font-serif line-clamp-2">
                    «{generarMensajePastoralCounseling(req.nombre, req.tema, req.detalles, req.disponibilidadHorario)}»
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp */}
                  {req.contacto && (
                    <a
                      href={generarEnlaceWhatsApp(
                        req.contacto,
                        generarMensajePastoralCounseling(req.nombre, req.tema, req.detalles, req.disponibilidadHorario)
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contactar por WhatsApp</span>
                    </a>
                  )}

                  {/* Ver/Agregar Notas */}
                  <button
                    onClick={() => setActiveRequestForNotes(req)}
                    className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                    title="Notas pastorales confidenciales"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Notas ({req.notas?.length || 0})</span>
                  </button>
                </div>

                {/* Cambiar Estado */}
                <div className="flex items-center gap-1.5">
                  {req.estado === 'Pendiente' && (
                    <button
                      onClick={() => updateCounselingStatus(req.id, 'En acompañamiento')}
                      className="flex-1 py-1 text-[11px] font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      Iniciar Acompañamiento
                    </button>
                  )}
                  {req.estado === 'En acompañamiento' && (
                    <button
                      onClick={() => updateCounselingStatus(req.id, 'Cerrada')}
                      className="flex-1 py-1 text-[11px] font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      Marcar como Cerrada
                    </button>
                  )}
                  {req.estado === 'Cerrada' && (
                    <button
                      onClick={() => updateCounselingStatus(req.id, 'En acompañamiento')}
                      className="flex-1 py-1 text-[11px] font-semibold rounded bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      Reabrir Solicitud
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Confidencial de Notas Pastorales */}
      {activeRequestForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Notas de Consejería Pastoral
                </h3>
                <p className="text-xs text-slate-500">
                  Hermano(a): <b>{activeRequestForNotes.nombre}</b> · Tema:{' '}
                  {activeRequestForNotes.tema}
                </p>
              </div>
              <button
                onClick={() => setActiveRequestForNotes(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Historial de Notas */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
              {activeRequestForNotes.notas.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No hay notas registradas para esta consejería todavía. Escribe la primera a continuación.
                </div>
              ) : (
                activeRequestForNotes.notas.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-700">{n.autor}</span>
                      <span>
                        {new Date(n.fecha).toLocaleString('es-CO', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{n.texto}</p>
                  </div>
                ))
              )}
            </div>

            {/* Formulario para Añadir Nota */}
            <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Añadir Nota Confidencial
              </label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={3}
                placeholder="Escribe el resumen del acuerdo pastoral, versículos compartidos o próxima cita..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRequestForNotes(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Guardar Nota</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
