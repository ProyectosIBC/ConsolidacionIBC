import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  BellRing,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Activity,
  Send,
  ShieldCheck,
  Sparkles,
  Bot,
  Database,
  MessageCircle,
  Award,
  BookOpen,
  UserCheck,
  HeartHandshake,
  Check,
  Flame,
  Info,
  CalendarCheck,
  ChevronRight,
  ArrowRight,
  Users,
  PhoneCall,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { getNextWeekRange } from '../../lib/dateUtils';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';

const DIAS_SEMANA = [
  { id: 1, label: 'Lunes', corto: 'Lun' },
  { id: 2, label: 'Martes', corto: 'Mar' },
  { id: 3, label: 'Miércoles', corto: 'Mié' },
  { id: 4, label: 'Jueves', corto: 'Jue' },
  { id: 5, label: 'Viernes', corto: 'Vie' },
  { id: 6, label: 'Sábado', corto: 'Sáb' },
  { id: 0, label: 'Domingo', corto: 'Dom' },
];

export const AlertsConfigView: React.FC = () => {
  const {
    config,
    updateConfig,
    triggerTestAlert,
    scheduleAllProcessesForNextWeek,
    supabaseStatus,
    testSupabase,
    sendTelegramAlert,
    showToast,
    members,
    counseling,
    setCurrentView,
  } = useApp();

  const nextWeekRange = getNextWeekRange();
  const [testingType, setTestingType] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [isSchedulingNextWeek, setIsSchedulingNextWeek] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<{
    scheduledCount: number;
    membersCount: number;
    counselingCount: number;
    discipleshipCount: number;
    startDateFormatted: string;
    endDateFormatted: string;
  } | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');

  const activeMembersForFollowUp = members.filter((m) => m.estadoSeguimiento !== 'Integrado');
  const pendingCounselingForSchedule = counseling.filter((c) => c.estado === 'Pendiente' || c.estado === 'En acompañamiento');
  const activeDisciples = members.filter((m) => m.discipulado && m.discipulado.leccionActual <= 13);

  // Form local state
  const [diasEnvio, setDiasEnvio] = useState<number[]>(
    Array.isArray(config.diasEnvioAlertasSemanales) ? config.diasEnvioAlertasSemanales : [1, 4]
  );
  const [horaEnvio, setHoraEnvio] = useState<string>(config.horaEnvioAlertas || '08:00');
  const [diasConsejeria, setDiasConsejeria] = useState<number[]>(
    Array.isArray(config.diasConsejeriaPastoral) ? config.diasConsejeriaPastoral : [2, 4]
  );
  const [alertas, setAlertas] = useState(
    config.alertasActivas || {
      alertasSemanalesConsolidacion: true,
      alertasAusenciasDiscipulado: true,
      recordatoriosProximaClaseDiscipulado: true,
      alertasGraduacionDiscipuladoPastor: true,
      alertasConsejeriaSLA: true,
      alertasNuevasDecisionesSalvacion: true,
    }
  );

  const toggleDiaEnvio = (diaId: number) => {
    setDiasEnvio((prev) =>
      prev.includes(diaId) ? prev.filter((d) => d !== diaId) : [...prev, diaId].sort()
    );
  };

  const toggleDiaConsejeria = (diaId: number) => {
    setDiasConsejeria((prev) =>
      prev.includes(diaId) ? prev.filter((d) => d !== diaId) : [...prev, diaId].sort()
    );
  };

  const toggleAlerta = (key: keyof typeof alertas) => {
    setAlertas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveConfig = () => {
    updateConfig({
      diasEnvioAlertasSemanales: diasEnvio,
      horaEnvioAlertas: horaEnvio,
      diasConsejeriaPastoral: diasConsejeria,
      alertasActivas: alertas,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExecuteScheduleNextWeek = () => {
    setIsSchedulingNextWeek(true);
    updateConfig({
      diasEnvioAlertasSemanales: diasEnvio,
      horaEnvioAlertas: horaEnvio,
      diasConsejeriaPastoral: diasConsejeria,
      alertasActivas: alertas,
    });

    const res = scheduleAllProcessesForNextWeek();
    setScheduleResult(res);
    setIsSchedulingNextWeek(false);
  };

  const runLiveTest = async (
    type: 'semanal' | 'ausencia' | 'proxima_clase' | 'graduacion' | 'consejeria_sla' | 'decision_salvacion'
  ) => {
    setTestingType(type);
    setTestResult(null);
    const result = await triggerTestAlert(type);
    setTestResult(result);
    setTestingType(null);
  };

  // Helper para clasificar elementos agendados por día de la próxima semana
  const getItemsForDay = (dayIndex: number) => {
    const dayMembers = members.filter((m) => {
      if (m.estadoSeguimiento === 'Integrado') return false;
      if (!m.proximoContacto) return false;
      const d = new Date(m.proximoContacto);
      return d.getDay() === dayIndex;
    });

    const dayCounseling = counseling.filter((c) => {
      if (!c.fechaCita) return false;
      const d = new Date(c.fechaCita + 'T12:00:00');
      return d.getDay() === dayIndex;
    });

    const dayDisciples = members.filter((m) => {
      if (!m.discipulado?.proximaClaseFecha) return false;
      const d = new Date(m.discipulado.proximaClaseFecha + 'T12:00:00');
      return d.getDay() === dayIndex;
    });

    return {
      members: dayMembers,
      counseling: dayCounseling,
      disciples: dayDisciples,
      total: dayMembers.length + dayCounseling.length + dayDisciples.length,
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 text-xs font-bold border border-blue-400/30">
            <BellRing className="w-3.5 h-3.5" />
            <span>Centro de Notificaciones & Automatización</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Configuración de Alertas & Diagnóstico en Vivo
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Personaliza los días de disparo de avisos semanales, agenda de consejería, recordatorios de discipulado y verifica el funcionamiento en tiempo real de todos los canales de la iglesia.
          </p>
        </div>
      </div>

      {/* SECCIÓN ESTELAR: PLANIFICADOR & CRONOGRAMA OPERATIVO DE LA PRÓXIMA SEMANA */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Próxima Semana: {nextWeekRange.startFormatted} al {nextWeekRange.endFormatted}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              🗓️ Planificador & Calendario de la Próxima Semana
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Teniendo en cuenta que ya existen personas y procesos creados, este módulo sincroniza y calendariza a todos los miembros en seguimiento en los días configurados (<b>{diasEnvio.map((d) => DIAS_SEMANA.find((s) => s.id === d)?.label).join(' y ') || 'Lunes y Jueves'}</b>), agenda las solicitudes de consejería con el Pastor Edgar (<b>{diasConsejeria.map((d) => DIAS_SEMANA.find((s) => s.id === d)?.label).join(' y ') || 'Martes y Jueves'}</b>) y prepara los recordatorios de clases de discipulado.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleExecuteScheduleNextWeek}
              disabled={isSchedulingNextWeek}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{isSchedulingNextWeek ? 'Calendarizando...' : '🚀 Sincronizar y Programar Alertas de la Próxima Semana'}</span>
            </button>
          </div>
        </div>

        {/* Resumen de Personas y Procesos Detectados en el Sistema */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-black text-blue-950 block">{activeMembersForFollowUp.length}</span>
              <span className="text-[11px] text-blue-700 font-semibold block leading-tight">En Consolidación</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-black text-rose-950 block">{pendingCounselingForSchedule.length}</span>
              <span className="text-[11px] text-rose-700 font-semibold block leading-tight">Consejerías Pendientes</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-black text-purple-950 block">{activeDisciples.length}</span>
              <span className="text-[11px] text-purple-700 font-semibold block leading-tight">Alumnos Discipulado</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-950 block">Hora de Despacho</span>
              <span className="text-[11px] text-emerald-700 font-bold block leading-tight">{horaEnvio} AM (Colombia)</span>
            </div>
          </div>
        </div>

        {/* Banner de Confirmación tras Calendarizar */}
        {scheduleResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 animate-in zoom-in-95">
            <div className="flex items-center gap-2 font-black text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Procesos calendarizados exitosamente para la próxima semana!</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed pl-6">
              Se distribuyeron <b>{scheduleResult.membersCount} hermanos en seguimiento</b> en los días {diasEnvio.map((d) => DIAS_SEMANA.find((s) => s.id === d)?.label).join(' y ')}, se agendaron <b>{scheduleResult.counselingCount} citas de consejería</b> para el Pastor Edgar y se programaron <b>{scheduleResult.discipleshipCount} recordatorios de clases</b>. Las alertas ya están disponibles en la campana de notificaciones de cada consolidador y fueron despachadas a Telegram.
            </p>
          </div>
        )}

        {/* Selector de Días de la Próxima Semana */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Cronograma Día por Día de la Próxima Semana:</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Haz clic en un día para filtrar o ver toda la semana
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedDayFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toda la Semana ({activeMembersForFollowUp.length + pendingCounselingForSchedule.length})
            </button>

            {nextWeekRange.days.map((dia) => {
              const dayItems = getItemsForDay(dia.dayIndex);
              const isSelected = selectedDayFilter === dia.dayIndex;
              const isAlertDay = diasEnvio.includes(dia.dayIndex);
              const isCounselDay = diasConsejeria.includes(dia.dayIndex);

              return (
                <button
                  key={dia.dayIndex}
                  type="button"
                  onClick={() => setSelectedDayFilter(dia.dayIndex)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : isAlertDay || isCounselDay
                      ? 'bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{dia.name} {dia.dateNumber}</span>
                  {dayItems.total > 0 && (
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                        isSelected ? 'bg-white text-indigo-700' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {dayItems.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visualización de las Citas y Personas Programadas para la Próxima Semana */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {nextWeekRange.days
            .filter((dia) => selectedDayFilter === 'all' || selectedDayFilter === dia.dayIndex)
            .map((dia) => {
              const dayItems = getItemsForDay(dia.dayIndex);
              const isAlertDay = diasEnvio.includes(dia.dayIndex);
              const isCounselDay = diasConsejeria.includes(dia.dayIndex);

              return (
                <div
                  key={dia.dayIndex}
                  className={`rounded-2xl border p-4 space-y-3 transition-all ${
                    isAlertDay || isCounselDay
                      ? 'bg-white border-blue-200/90 shadow-2xs ring-1 ring-blue-500/10'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                          isAlertDay
                            ? 'bg-blue-600 text-white'
                            : isCounselDay
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {dia.shortName}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">
                          {dia.name} {dia.formatted}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {isAlertDay && isCounselDay
                            ? '🔔 Día de Contacto & Consejería'
                            : isAlertDay
                            ? '📞 Día de Contacto Consolidación'
                            : isCounselDay
                            ? '🙏 Día de Consejería Pastoral'
                            : '🕊️ Actividad Regular'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {dayItems.total} {dayItems.total === 1 ? 'proceso' : 'procesos'}
                    </span>
                  </div>

                  {dayItems.total === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-slate-100/50 border border-dashed border-slate-200 text-[11px] text-slate-400">
                      Sin actividades calendarizadas para este día
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Lista de Miembros en Consolidación */}
                      {dayItems.members.map((m) => {
                        const mensajeWhatsApp = `Hola ${m.nombre}, te saludamos con mucho cariño de la Iglesia Bautista Central de Bogotá. Esperamos que estés teniendo una bendecida semana. Cuéntanos cómo estás y en qué podemos orar por ti.`;
                        const linkWhatsApp = m.telefono ? generarEnlaceWhatsApp(m.telefono, mensajeWhatsApp) : null;

                        return (
                          <div
                            key={m.id}
                            className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-xs text-blue-950 block">
                                  👤 {m.nombre}
                                </span>
                                <span className="text-[10px] text-blue-700 font-semibold block">
                                  Semana {m.semanaActual || 1} • {m.consolidadorNombre?.split('(')[0] || 'Martha Gómez'}
                                </span>
                              </div>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">
                                {m.estadoSeguimiento}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-blue-100/60">
                              <span>⏰ Hora: {horaEnvio} AM</span>
                              {linkWhatsApp && (
                                <a
                                  href={linkWhatsApp}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Lista de Consejerías Pastorales */}
                      {dayItems.counseling.map((c) => {
                        const mensajeWhatsApp = `Apreciado(a) ${c.nombre}, reciba un saludo fraterno del Pastor Edgar Castaño de la Iglesia Bautista Central. Le confirmamos su cita de consejería pastoral para el ${dia.name} a las ${c.horaCita || '3:00 PM'} en el Templo (Cra 7 # 31a - 78). Dios le bendiga.`;
                        const linkWhatsApp = c.contacto ? generarEnlaceWhatsApp(c.contacto, mensajeWhatsApp) : null;

                        return (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-xs text-rose-950 block">
                                  🙏 Consejería: {c.nombre}
                                </span>
                                <span className="text-[10px] text-rose-700 block">
                                  Tema: {c.tema}
                                </span>
                              </div>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-200 text-rose-800">
                                {c.urgencia}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-rose-100">
                              <span>⏰ Cita: {c.horaCita || '03:00 PM'} (Pastor Edgar)</span>
                              {linkWhatsApp && (
                                <a
                                  href={linkWhatsApp}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>Confirmar</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Lista de Clases de Discipulado */}
                      {dayItems.disciples.map((d) => (
                        <div
                          key={`disc-${d.id}`}
                          className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-purple-950">
                              📖 {d.nombre}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">
                              Lección {d.discipulado?.leccionActual}
                            </span>
                          </div>
                          <p className="text-[10px] text-purple-700">
                            {d.discipulado?.proximaClaseModalidad || 'Presencial Cra 7 # 31a - 78'} • {d.discipulado?.proximaClaseHora || '07:00 PM'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Grid de 2 Columnas: Ajustes de Alertas + Verificador de Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Configuración de Parámetros (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bloque 1: Días de Envío de Alertas Semanales */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    1. Días de Envío de Alertas Semanales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Elige los días en que el sistema despachará las alertas a los consolidadores y discípulos.
                  </p>
                </div>
              </div>
            </div>

            {/* Selector de Días de la Semana */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Días de la semana activos para despacho:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const isSelected = diasEnvio.includes(dia.id);
                  return (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => toggleDiaEnvio(dia.id)}
                      className={`py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider">{dia.corto}</span>
                      <span className="text-xs font-extrabold">{dia.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hora de Disparo Matutino */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Hora de Notificación Automática</h4>
                  <p className="text-[11px] text-slate-500">
                    Momento del día para generar los resúmenes y mensajes pendientes.
                  </p>
                </div>
              </div>
              <input
                type="time"
                value={horaEnvio}
                onChange={(e) => setHoraEnvio(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Bloque 2: Días y Franjas de Consejería Pastoral */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    2. Días y Franjas de Consejería Pastoral (Pastor Edgar)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Días en que el Pastor atiende citas presenciales o llamadas de consejería.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Días habilitados en el cronograma pastoral:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const isSelected = diasConsejeria.includes(dia.id);
                  return (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => toggleDiaConsejeria(dia.id)}
                      className={`py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider">{dia.corto}</span>
                      <span className="text-xs font-extrabold">{dia.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 text-xs text-rose-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <span>📍 Franjas habituales:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-rose-200">
                  {config.franjasHorariasConsejeria?.join(', ') || '2:00 PM a 6:00 PM'}
                </span>
              </p>
              <p className="text-[11px] text-slate-600">
                Sede principal: Carrera 7 # 31a - 78, Bogotá. Las citas se programan en bloques de 45 minutos a 1 hora.
              </p>
            </div>
          </div>

          {/* Bloque 3: Interruptores de Todas las Alertas de la Herramienta */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>3. Interruptores de Notificaciones Activas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Activa o desactiva qué eventos disparan alertas automáticas en Telegram y la app.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'alertasSemanalesConsolidacion' as const,
                  title: '📅 Alertas Semanales de Consolidación',
                  desc: 'Notifica a los consolidadores los días seleccionados con el mensaje correspondiente a la semana de cada hermano.',
                  badge: 'Consolidadores',
                  badgeColor: 'bg-blue-100 text-blue-800',
                },
                {
                  key: 'alertasAusenciasDiscipulado' as const,
                  title: '⚠️ Alertas de Inasistencias en Discipulado',
                  desc: 'Notifica al discipulador y al discípulo cuando se registre una falta a la lección semanal del libro Nuevos Creyentes.',
                  badge: 'Discipuladores & Discípulos',
                  badgeColor: 'bg-amber-100 text-amber-800',
                },
                {
                  key: 'recordatoriosProximaClaseDiscipulado' as const,
                  title: '⏰ Recordatorios de Próxima Clase de Discipulado',
                  desc: 'Prepara el recordatorio con fecha, hora, modalidad y resumen de lección para enviar antes de cada sesión.',
                  badge: 'Discipulado',
                  badgeColor: 'bg-teal-100 text-teal-800',
                },
                {
                  key: 'alertasGraduacionDiscipuladoPastor' as const,
                  title: '🎓 Alerta al Pastor al Culminar Discipulado (Lección 13)',
                  desc: 'Notifica de inmediato al Pastor Edgar Castaño para entrevistar al graduado e identificar asignación ministerial.',
                  badge: 'Liderazgo Pastoral',
                  badgeColor: 'bg-purple-100 text-purple-800',
                },
                {
                  key: 'alertasConsejeriaSLA' as const,
                  title: '🚨 Alertas de Compromiso y Oportunidad en Consejería',
                  desc: 'Monitorea las 6h o 24h máximas de atención oportuna para solicitudes prioritarias.',
                  badge: 'Consejería Pastoral',
                  badgeColor: 'bg-rose-100 text-rose-800',
                },
                {
                  key: 'alertasNuevasDecisionesSalvacion' as const,
                  title: '⭐ Alertas de Nuevas Decisiones de Fe (Tarjeta de Conexión)',
                  desc: 'Notificación prioritaria cuando alguien marque «Hoy decidí entregar mi vida a Jesús» en el culto.',
                  badge: 'Evangelismo & Salvación',
                  badgeColor: 'bg-emerald-100 text-emerald-800',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-800">{item.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAlerta(item.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                      alertas[item.key] ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
                        alertas[item.key] ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Botón Guardar Cambios */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {savedSuccess ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Configuración guardada exitosamente!
                  </span>
                ) : (
                  'Los cambios aplican de inmediato en toda la aplicación.'
                )}
              </span>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Guardar Ajustes de Alertas
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Verificador de Funcionamiento en Vivo (Health Check) */}
        <div className="space-y-6">
          {/* Card de Diagnóstico del Sistema */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
                <h3 className="font-extrabold text-sm text-slate-900">Diagnóstico de la App</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                En Línea
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Supabase Status */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Base de Datos</span>
                    <span className="text-[10px] text-slate-500">PostgreSQL / Supabase</span>
                  </div>
                </div>
                <button
                  onClick={() => testSupabase()}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 cursor-pointer shadow-2xs"
                >
                  Test Ping
                </button>
              </div>

              {/* Telegram Bot */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Bot de Telegram</span>
                    <span className="text-[10px] text-slate-500">ID: {config.telegramChatId || 'Sin configurar'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('settings')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-sky-700 font-bold text-[11px] hover:bg-slate-100 cursor-pointer shadow-2xs"
                >
                  Seguridad Token
                </button>
              </div>

              {/* WhatsApp Links */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Generador WhatsApp</span>
                    <span className="text-[10px] text-slate-500">Prefijo (+57 Colombia)</span>
                  </div>
                </div>
                <span className="text-emerald-600 font-black text-[11px]">Activo</span>
              </div>
            </div>
          </div>

          {/* Banco de Disparo de Pruebas en Vivo */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-600" />
                <span>Banco de Pruebas de Alertas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Haz clic en cualquier botón para simular una alerta y verificar que llegue a la campana y a Telegram.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-start gap-2 animate-in zoom-in-95 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-medium">{testResult.message}</div>
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                disabled={testingType !== null}
                onClick={() => runLiveTest('semanal')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Probar Alerta Semanal</span>
                </div>
                <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-semibold">
                  {testingType === 'semanal' ? 'Disparando...' : 'Disparar'}
                </span>
              </button>

              <button
                type="button"
                disabled={testingType !== null}
                onClick={() => runLiveTest('ausencia')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. Probar Alerta de Ausencia</span>
                </div>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-semibold">
                  {testingType === 'ausencia' ? 'Disparando...' : 'Disparar'}
                </span>
              </button>

              <button
                type="button"
                disabled={testingType !== null}
                onClick={() => runLiveTest('proxima_clase')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-slate-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>3. Probar Recordatorio Próxima Clase</span>
                </div>
                <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md font-semibold">
                  {testingType === 'proxima_clase' ? 'Disparando...' : 'Disparar'}
                </span>
              </button>

              <button
                type="button"
                disabled={testingType !== null}
                onClick={() => runLiveTest('graduacion')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-slate-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>4. Probar Graduación al Pastor</span>
                </div>
                <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md font-semibold">
                  {testingType === 'graduacion' ? 'Disparando...' : 'Disparar'}
                </span>
              </button>

              <button
                type="button"
                disabled={testingType !== null}
                onClick={() => runLiveTest('decision_salvacion')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5. Probar Decisión por Cristo (⭐)</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">
                  {testingType === 'decision_salvacion' ? 'Disparando...' : 'Disparar'}
                </span>
              </button>

              <button
                type="button"
                disabled={testingType !== null}
                onClick={() => runLiveTest('consejeria_sla')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-slate-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                  <span>6. Probar Alerta Consejería SLA</span>
                </div>
                <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md font-semibold">
                  {testingType === 'consejeria_sla' ? 'Disparando...' : 'Disparar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
