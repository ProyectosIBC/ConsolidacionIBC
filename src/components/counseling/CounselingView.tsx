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
  Calendar,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';
import { generarMensajePastoralCounseling } from '../../lib/pastoralCounselingMessages';
import { formatColombianTime } from '../../lib/dateUtils';
import { CounselingCalendarView } from './CounselingCalendarView';

interface CounselingViewProps {
  onOpenNewCounselingModal: () => void;
  initialTab?: 'lista' | 'calendario' | 'cronograma';
}

const DIAS_NOMBRES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const CounselingView: React.FC<CounselingViewProps> = ({ onOpenNewCounselingModal, initialTab = 'lista' }) => {
  const {
    counseling,
    updateCounselingStatus,
    addCounselingNote,
    scheduleCounselingAppointment,
    getTiempoAtencionStatus,
    config,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lista' | 'calendario' | 'cronograma'>(initialTab);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterUrgency, setFilterUrgency] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRequestForNotes, setActiveRequestForNotes] = useState<CounselingRequest | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Modal para agendar cita pastoral
  const [schedulingReq, setSchedulingReq] = useState<CounselingRequest | null>(null);
  const [schedFecha, setSchedFecha] = useState('');
  const [schedModalidad, setSchedModalidad] = useState<
    'Presencial (Oficina Pastoral Cra 7 # 31a-78)' | 'Llamada Telefónica' | 'Videollamada'
  >('Presencial (Oficina Pastoral Cra 7 # 31a-78)');

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

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingReq || !schedFecha) return;
    scheduleCounselingAppointment(schedulingReq.id, schedFecha, schedModalidad);
    setSchedulingReq(null);
    setSchedFecha('');
  };

  // Citas agendadas para el cronograma
  const scheduledAppointments = counseling.filter((c) => c.fechaCitaAgendada && c.estado !== 'Cerrada');

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md text-rose-200 text-xs font-bold border border-rose-400/30">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Ministerio de Consejería Pastoral</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Acompañamiento & Cronograma Pastoral
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              Atención guiada por el <b>Pastor Edgar Castaño Díaz</b>. Monitorea los compromisos de atención oportuna (6h Alta, 24h Media/Baja) y administra el cronograma semanal de citas pastorales.
            </p>
          </div>

          <button
            onClick={onOpenNewCounselingModal}
            className="px-5 py-3 rounded-2xl bg-white text-rose-950 font-black text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas: Lista de Casos vs Calendario Interactivo vs Agenda */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('lista')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'lista'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Solicitudes & SLA ({filteredRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendario')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calendario'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendario Interactivo Mensual</span>
        </button>

        <button
          onClick={() => setActiveTab('cronograma')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'cronograma'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Agenda & Próximas Citas ({scheduledAppointments.length})</span>
        </button>
      </div>

      {/* PESTAÑA CALENDARIO INTERACTIVO */}
      {activeTab === 'calendario' && (
        <CounselingCalendarView onOpenNewCounselingModal={onOpenNewCounselingModal} />
      )}

      {/* PESTAÑA 1: LISTA DE SOLICITUDES Y SLA */}
      {activeTab === 'lista' && (
        <div className="space-y-6">
          {/* Banner de Compromiso SLA */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Tiempos de Atención Oportuna</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
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
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
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
                <option value="todos">Todas las Urgencias</option>
                <option value="Alta">Urgencia Alta (6h)</option>
                <option value="Media">Urgencia Media (24h)</option>
                <option value="Baja">Urgencia Baja (24h)</option>
              </select>
            </div>
          </div>

          {/* Grid de Tarjetas de Consejería */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRequests.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">No hay solicitudes en esta vista</h4>
                <p className="text-xs text-slate-400">Prueba ajustando los filtros de búsqueda o registra una nueva solicitud.</p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const sla = getTiempoAtencionStatus(req);
                const pastoralMsg = generarMensajePastoralCounseling(
                  req.nombre,
                  req.tema,
                  req.detalles,
                  req.disponibilidadHorario
                );

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-3xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                      sla.status === 'breached' && req.estado !== 'Cerrada'
                        ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/10'
                        : sla.status === 'warning' && req.estado !== 'Cerrada'
                        ? 'border-amber-300 bg-amber-50/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Cabecera Tarjeta */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{req.nombre}</h4>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{req.contacto || 'Sin contacto'}</p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              req.urgencia === 'Alta'
                                ? 'bg-rose-100 text-rose-800'
                                : req.urgencia === 'Media'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            Urgencia {req.urgencia}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              req.estado === 'Pendiente'
                                ? 'bg-amber-100 text-amber-900'
                                : req.estado === 'En acompañamiento'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {req.estado}
                          </span>
                        </div>
                      </div>

                      {/* Asunto y Horario */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 block">
                          Tema: <span className="text-rose-700 font-black">{req.tema}</span>
                        </span>
                        {req.disponibilidadHorario && (
                          <span className="text-[11px] text-slate-500 block">
                            ⏰ Disponibilidad: <b>{req.disponibilidadHorario}</b>
                          </span>
                        )}
                        {req.fechaCitaAgendada && (
                          <span className="text-[11px] font-bold text-emerald-800 block bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            📅 Cita Agendada: {formatColombianTime(req.fechaCitaAgendada)}
                          </span>
                        )}
                      </div>

                      {req.detalles && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed italic line-clamp-3">
                          «{req.detalles}»
                        </p>
                      )}

                      {/* Semáforo SLA de Atención */}
                      {req.estado !== 'Cerrada' && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-600">Compromiso Oportuno ({req.tiempoLimiteHoras}h):</span>
                            <span
                              className={`font-mono ${
                                sla.status === 'breached'
                                  ? 'text-rose-700 animate-pulse'
                                  : sla.status === 'warning'
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {sla.label}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                sla.status === 'breached'
                                  ? 'bg-rose-500'
                                  : sla.status === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, sla.percentage)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Mensaje pastoral preparado */}
                      <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl text-[11px] text-slate-700 leading-relaxed">
                        <div className="flex items-center gap-1 font-bold text-rose-900 mb-0.5">
                          <MessageCircle className="w-3 h-3 text-rose-600" />
                          <span>Mensaje Pastor Edgar (WhatsApp):</span>
                        </div>
                        <p className="italic font-serif line-clamp-2">«{pastoralMsg}»</p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1.5">
                        {/* Botón WhatsApp */}
                        {req.contacto && (
                          <a
                            href={generarEnlaceWhatsApp(req.contacto, pastoralMsg)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {/* Botón Agendar Cita */}
                        <button
                          type="button"
                          onClick={() => {
                            setSchedulingReq(req);
                            setSchedFecha(req.fechaCitaAgendada || '');
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Agendar cita en el cronograma pastoral"
                        >
                          <Calendar className="w-3.5 h-3.5 text-rose-600" />
                          <span>Agendar Cita</span>
                        </button>

                        {/* Botón Notas */}
                        <button
                          type="button"
                          onClick={() => setActiveRequestForNotes(req)}
                          className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>({req.notas?.length || 0})</span>
                        </button>
                      </div>

                      {/* Selector de Estado */}
                      <select
                        value={req.estado}
                        onChange={(e) => updateCounselingStatus(req.id, e.target.value as CounselingStatus)}
                        className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                      >
                        <option value="Pendiente">Estado: Pendiente</option>
                        <option value="En acompañamiento">Estado: En acompañamiento</option>
                        <option value="Cerrada">Estado: Cerrada / Concluida</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CRONOGRAMA & AGENDA SEMANAL DE CONSEJERÍA PASTORAL */}
      {activeTab === 'cronograma' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-rose-600" />
                  <span>Agenda Semanal de Consejería Pastoral</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Días activos configurados:{' '}
                  <strong className="text-slate-800">
                    {config.diasConsejeriaPastoral?.map((d) => DIAS_NOMBRES[d]).join(', ') || 'Martes y Jueves'}
                  </strong>{' '}
                  • Franjas: 2:00 PM a 6:00 PM (Sede Carrera 7 # 31a - 78, Bogotá).
                </p>
              </div>

              <button
                onClick={onOpenNewCounselingModal}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Cita</span>
              </button>
            </div>

            {/* Listado de Citas Agendadas */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Citas Pastorales Programadas Esta Semana:
              </h4>

              {scheduledAppointments.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No hay citas agendadas actualmente en el cronograma</p>
                  <p className="text-[11px] text-slate-400">
                    Haz clic en "Agendar Cita" en cualquiera de las solicitudes pendientes para reservar un espacio con el Pastor Edgar.
                  </p>
                </div>
              ) : (
                scheduledAppointments.map((req) => {
                  const mensajeConfirmacion = `¡Hola, ${req.nombre}! Dios te bendiga. Te saluda el Pastor Edgar Castaño Díaz de la Iglesia Bautista Central de Bogotá. Te confirmo que hemos agendado tu cita de consejería pastoral para el ${formatColombianTime(req.fechaCitaAgendada!)} (${req.modalidadCita || 'Presencial Carrera 7 # 31a - 78'}). ¿Nos confirmas tu asistencia? Quedamos en oración.`;

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">{req.nombre}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {req.tema}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-900">
                            {req.estado}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <span className="font-bold text-emerald-800">
                            📅 {formatColombianTime(req.fechaCitaAgendada!)}
                          </span>
                          <span>📍 {req.modalidadCita || 'Presencial'}</span>
                          <span className="font-mono">{req.contacto}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.contacto && (
                          <a
                            href={generarEnlaceWhatsApp(req.contacto, mensajeConfirmacion)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                            title="Confirmar cita pastoral por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Confirmar Cita</span>
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setSchedulingReq(req);
                            setSchedFecha(req.fechaCitaAgendada || '');
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs"
                        >
                          Reprogramar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA AGENDAR CITA PASTORAL */}
      {schedulingReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Agendar Cita de Consejería Pastoral
                </h3>
              </div>
              <button
                onClick={() => setSchedulingReq(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Solicitante: <strong className="text-slate-900">{schedulingReq.nombre}</strong>
              </p>
              <p>
                Tema: <strong className="text-rose-700">{schedulingReq.tema}</strong>
              </p>
              <p>
                Disponibilidad indicada:{' '}
                <strong className="text-slate-800">{schedulingReq.disponibilidadHorario || 'Cualquier horario'}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha y Hora de la Cita con el Pastor Edgar: *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={schedFecha}
                  onChange={(e) => setSchedFecha(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modalidad de Atención:</label>
                <select
                  value={schedModalidad}
                  onChange={(e) => setSchedModalidad(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="Presencial (Oficina Pastoral Cra 7 # 31a-78)">
                    Presencial (Oficina Pastoral Cra 7 # 31a-78)
                  </option>
                  <option value="Llamada Telefónica">Llamada Telefónica</option>
                  <option value="Videollamada">Videollamada</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingReq(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md"
                >
                  Confirmar en Cronograma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NOTAS CONFIDENCIALES */}
      {activeRequestForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Notas Pastorales Confidenciales
                </h3>
              </div>
              <button
                onClick={() => setActiveRequestForNotes(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500 shrink-0">
              Solicitante: <b className="text-slate-800">{activeRequestForNotes.nombre}</b> • Tema:{' '}
              <b className="text-rose-700">{activeRequestForNotes.tema}</b>
            </div>

            {/* Historial de Notas */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {activeRequestForNotes.notas && activeRequestForNotes.notas.length > 0 ? (
                activeRequestForNotes.notas.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700">{n.autor}</span>
                      <span>{formatColombianTime(n.fecha)}</span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{n.texto}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">Sin notas pastorales previas.</p>
              )}
            </div>

            {/* Agregar Nota */}
            <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Escribe una observación pastoral confidencial..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
