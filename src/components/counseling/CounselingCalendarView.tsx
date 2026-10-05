import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CounselingRequest, CounselingStatus, CounselingUrgency } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Phone,
  MessageCircle,
  MapPin,
  Video,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  CalendarDays,
  CalendarCheck,
  HeartHandshake,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';
import { formatColombianTime } from '../../lib/dateUtils';

interface CounselingCalendarViewProps {
  onOpenNewCounselingModal?: () => void;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CounselingCalendarView: React.FC<CounselingCalendarViewProps> = ({ onOpenNewCounselingModal }) => {
  const {
    counseling,
    scheduleCounselingAppointment,
    addCounseling,
    config,
    showToast,
    setCurrentView,
  } = useApp();

  const hoy = new Date();
  const [currentYear, setCurrentYear] = useState<number>(hoy.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(hoy.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  );

  // Modal para agendar cita
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCounselingId, setSelectedCounselingId] = useState<string>('');
  const [modalDate, setModalDate] = useState<string>(selectedDateStr);
  const [modalTime, setModalTime] = useState<string>('15:00');
  const [modalModalidad, setModalModalidad] = useState<
    'Presencial (Oficina Pastoral Cra 7 # 31a-78)' | 'Llamada Telefónica' | 'Videollamada'
  >('Presencial (Oficina Pastoral Cra 7 # 31a-78)');
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonContact, setNewPersonContact] = useState('');
  const [newPersonTema, setNewPersonTema] = useState('');

  // Días estipulados de atención pastoral (ej. Martes = 2, Jueves = 4)
  const pastoralDays = config.diasConsejeriaPastoral || [2, 4];

  // Navegación de mes
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );
  };

  // Cálculo de la cuadrícula de días
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonthCells: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    prevMonthCells.push({
      dayNumber: day,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  const currentMonthCells: { dayNumber: number; dateStr: string; isCurrentMonth: boolean; dayOfWeek: number }[] = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();
    currentMonthCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      dayOfWeek,
    });
  }

  const totalCells = prevMonthCells.length + currentMonthCells.length;
  const nextMonthCells: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  const remainingCells = 42 - totalCells; // 6 filas de 7 días
  for (let d = 1; d <= (remainingCells < 7 ? remainingCells : remainingCells - 7); d++) {
    const m = currentMonth === 11 ? 1 : currentMonth + 2;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    nextMonthCells.push({
      dayNumber: d,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  // Mapeo de citas agendadas por fecha (YYYY-MM-DD)
  const scheduledAppointmentsByDate = counseling.reduce((acc, req) => {
    if (req.fechaCitaAgendada && req.estado !== 'Cerrada') {
      const datePart = req.fechaCitaAgendada.split('T')[0];
      if (!acc[datePart]) acc[datePart] = [];
      acc[datePart].push(req);
    }
    return acc;
  }, {} as Record<string, CounselingRequest[]>);

  // Citas agendadas para el día seleccionado
  const appointmentsForSelectedDate = scheduledAppointmentsByDate[selectedDateStr] || [];

  // Solicitudes pendientes listas para agendar
  const pendingRequests = counseling.filter(
    (c) => c.estado !== 'Cerrada' && !c.fechaCitaAgendada
  );

  // Guardar cita agendada
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDate || !modalTime) return;

    const fullDateTime = `${modalDate}T${modalTime}:00`;

    if (selectedCounselingId && selectedCounselingId !== 'nuevo') {
      // Cita para solicitud existente
      scheduleCounselingAppointment(selectedCounselingId, fullDateTime, modalModalidad);
    } else {
      // Crear solicitud nueva y agendarla de inmediato
      if (!newPersonName.trim()) {
        showToast('error', 'Por favor ingresa el nombre de la persona', 'Campo Requerido');
        return;
      }
      addCounseling({
        nombre: newPersonName.trim(),
        contacto: newPersonContact.trim() || '3100000000',
        tema: newPersonTema.trim() || 'Orientación Pastoral General',
        urgencia: 'Media',
        estado: 'En acompañamiento',
        disponibilidadHorario: modalTime < '13:00' ? 'Mañana' : 'Tarde',
        modalidadCita: modalModalidad,
        fechaCitaAgendada: fullDateTime,
      });
      showToast('success', `Cita creada y agendada para ${newPersonName.trim()}`, 'Cita Pastoral');
    }

    setIsScheduleModalOpen(false);
    setSelectedCounselingId('');
    setNewPersonName('');
    setNewPersonContact('');
    setNewPersonTema('');
  };

  // Generador de enlace a Google Calendar
  const getGoogleCalendarUrl = (req: CounselingRequest) => {
    if (!req.fechaCitaAgendada) return '';
    const dateClean = req.fechaCitaAgendada.replace(/[-:]/g, '').split('.')[0];
    const startDate = dateClean;
    const endDate = dateClean; // mismo bloque aprox
    const title = encodeURIComponent(`Consejería Pastoral IBC — ${req.nombre}`);
    const details = encodeURIComponent(
      `Tema: ${req.tema}\nContacto: ${req.contacto}\nModalidad: ${req.modalidadCita || 'Presencial'}\nPastor Edgar Castaño Díaz — Iglesia Bautista Central de Bogotá`
    );
    const location = encodeURIComponent('Carrera 7 # 31a - 78, Bogotá, Colombia');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md text-rose-200 text-xs font-bold border border-rose-400/30">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Agenda Pastoral Oficial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Calendario de Consejería Pastoral
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              Planifica, visualiza y agenda las citas de orientación espiritual del <b>Pastor Edgar Castaño Díaz</b>. Días asignados de atención en sede: <b>Martes y Jueves</b> (2:00 PM a 6:00 PM) en la Carrera 7 # 31a - 78.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setModalDate(selectedDateStr);
                setIsScheduleModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-white text-rose-950 font-black text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Programar Cita</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector de Navegación de Mes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {MESES[currentMonth]} {currentYear}
              </h2>
              <p className="text-xs text-slate-500">
                {Object.keys(scheduledAppointmentsByDate).length} citas programadas en el sistema
              </p>
            </div>
          </div>

          {/* Botones de Navegación */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToday}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cuadrícula del Calendario Mensual */}
        <div className="space-y-2">
          {/* Cabecera Días de la Semana */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DIAS_SEMANA.map((dia, index) => {
              const isPastoralDay = pastoralDays.includes(index);
              return (
                <div
                  key={dia}
                  className={`py-2 text-xs font-bold rounded-lg ${
                    isPastoralDay ? 'text-rose-700 bg-rose-50/50' : 'text-slate-400'
                  }`}
                >
                  {dia} {isPastoralDay && <span className="hidden sm:inline">⭐</span>}
                </div>
              );
            })}
          </div>

          {/* Celdas de Días */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Días del mes anterior */}
            {prevMonthCells.map((cell) => (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className="min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 opacity-40 cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-400">{cell.dayNumber}</span>
              </div>
            ))}

            {/* Días del mes actual */}
            {currentMonthCells.map((cell) => {
              const isPastoralDay = pastoralDays.includes(cell.dayOfWeek);
              const isSelected = selectedDateStr === cell.dateStr;
              const isToday =
                cell.dayNumber === hoy.getDate() &&
                currentMonth === hoy.getMonth() &&
                currentYear === hoy.getFullYear();

              const dayAppointments = scheduledAppointmentsByDate[cell.dateStr] || [];

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[75px] sm:min-h-[105px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/30 ring-2 ring-rose-500/20 shadow-xs'
                      : isPastoralDay
                      ? 'border-rose-100 bg-rose-50/20 hover:border-rose-300'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Número del día y badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-rose-600 text-white'
                          : isSelected
                          ? 'text-rose-950 font-black'
                          : isPastoralDay
                          ? 'text-rose-900 font-extrabold'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {isPastoralDay && (
                      <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Pastoral
                      </span>
                    )}
                  </div>

                  {/* Citas del día */}
                  <div className="space-y-1 mt-1">
                    {dayAppointments.slice(0, 2).map((apt) => {
                      const timeStr = apt.fechaCitaAgendada
                        ? apt.fechaCitaAgendada.split('T')[1]?.substring(0, 5)
                        : '';

                      return (
                        <div
                          key={apt.id}
                          className="px-1.5 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold truncate flex items-center gap-1 shadow-2xs"
                          title={`${timeStr} - ${apt.nombre} (${apt.tema})`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
                          <span className="font-semibold text-rose-100">{timeStr}</span>
                          <span className="truncate">{apt.nombre.split(' ')[0]}</span>
                        </div>
                      );
                    })}

                    {dayAppointments.length > 2 && (
                      <span className="text-[10px] font-extrabold text-rose-700 block text-center">
                        +{dayAppointments.length - 2} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Días del mes siguiente */}
            {nextMonthCells.map((cell) => (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className="min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 opacity-40 cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-400">{cell.dayNumber}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETALLES DEL DÍA SELECCIONADO */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-1">
              <CalendarDays className="w-4 h-4" />
              <span>Día Seleccionado</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight capitalize">
              {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
          </div>

          <button
            onClick={() => {
              setModalDate(selectedDateStr);
              setIsScheduleModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agendar Cita en esta Fecha</span>
          </button>
        </div>

        {/* Lista de citas en este día */}
        {appointmentsForSelectedDate.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">
              No hay citas de consejería agendadas para esta fecha
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Puedes pulsar en «Agendar Cita en esta Fecha» para programar la atención pastoral de un hermano o asignar una solicitud pendiente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointmentsForSelectedDate.map((apt) => {
              const timeStr = apt.fechaCitaAgendada
                ? apt.fechaCitaAgendada.split('T')[1]?.substring(0, 5)
                : '15:00';

              const whatsAppMsg = `«¡Hola ${apt.nombre}! Te saluda el Pastor Edgar Castaño de la Iglesia Bautista Central de Bogotá. Te confirmo que tu cita de consejería pastoral ha quedado programada para el día ${selectedDateStr} a las ${timeStr} en modalidad ${apt.modalidadCita || 'Presencial'}. Estaremos orando por este tiempo. Si requieres reprogramar, por favor avísame. ¡Dios te bendiga!»`;

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex flex-col items-center justify-center font-black border border-rose-200">
                        <span className="text-xs">{timeStr}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {apt.nombre}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          {apt.tema}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        apt.urgencia === 'Alta'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : apt.urgencia === 'Media'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Prioridad {apt.urgencia}
                    </span>
                  </div>

                  {/* Modalidad y Ubicación */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      {apt.modalidadCita?.includes('Presencial') ? (
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{apt.modalidadCita || 'Presencial (Oficina Pastoral Cra 7 # 31a-78)'}</span>
                    </div>
                    {apt.detalles && (
                      <p className="text-[11px] text-slate-600 italic">«{apt.detalles}»</p>
                    )}
                  </div>

                  {/* Acciones para la cita */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {/* Botón WhatsApp de Confirmación */}
                    {apt.contacto && (
                      <a
                        href={generarEnlaceWhatsApp(apt.contacto, whatsAppMsg)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        title="Enviar confirmación y recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Confirmar por WhatsApp</span>
                      </a>
                    )}

                    {/* Botón Google Calendar */}
                    <a
                      href={getGoogleCalendarUrl(apt)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Sincronizar en Google Calendar"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Google Calendar</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL PARA AGENDAR CONSEJERÍA */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-rose-600" />
                <span>Programar Consejería Pastoral</span>
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              {/* Selección: Solicitud pendiente o Nuevo hermano */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Persona a Atender
                </label>
                <select
                  value={selectedCounselingId}
                  onChange={(e) => setSelectedCounselingId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Seleccionar solicitud existente pendiente --</option>
                  {pendingRequests.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.nombre} — {req.tema} (Prioridad {req.urgencia})
                    </option>
                  ))}
                  <option value="nuevo">➕ Escribir otro hermano(a) o caso nuevo</option>
                </select>
              </div>

              {/* Si se elige persona nueva */}
              {selectedCounselingId === 'nuevo' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pedro Camargo"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="310 123 4567"
                        value={newPersonContact}
                        onChange={(e) => setNewPersonContact(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Motivo / Tema
                      </label>
                      <input
                        type="text"
                        placeholder="Crisis, Bautismo, etc."
                        value={newPersonTema}
                        onChange={(e) => setNewPersonTema(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de la Cita
                  </label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hora (Franja Pastoral)
                  </label>
                  <select
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="16:30">04:30 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="17:30">05:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Modalidad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Modalidad de Atención
                </label>
                <select
                  value={modalModalidad}
                  onChange={(e) => setModalModalidad(e.target.value as any)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="Presencial (Oficina Pastoral Cra 7 # 31a-78)">
                    Presencial (Oficina Pastoral Cra 7 # 31a-78)
                  </option>
                  <option value="Llamada Telefónica">Llamada Telefónica</option>
                  <option value="Videollamada">Videollamada (Meet / Zoom)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
                >
                  Confirmar y Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
