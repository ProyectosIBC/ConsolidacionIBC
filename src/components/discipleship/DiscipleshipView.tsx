import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  CheckCircle2,
  UserCheck,
  Sparkles,
  Phone,
  MessageCircle,
  Award,
  ChevronRight,
  User,
  Clock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Send,
  Share2,
  Check,
  ExternalLink,
  Plus,
  Flame,
} from 'lucide-react';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';
import { DISCIPLESHIP_LESSONS, getLessonByNumber } from '../../data/discipleshipLessonsData';
import { formatColombianTime } from '../../lib/dateUtils';
import { Member } from '../../types';

export const DiscipleshipView: React.FC = () => {
  const {
    members,
    updateDiscipleshipProgress,
    scheduleDiscipleshipClass,
    registerDiscipleshipAbsence,
    resetDiscipleshipAbsences,
    updateMinistryPlacement,
    activeRole,
    activeUserProfile,
    config,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'progreso' | 'ausencias' | 'lecciones' | 'graduados'>('progreso');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLessonModal, setSelectedLessonModal] = useState<number | null>(null);

  // Modal para agendar próxima clase
  const [classModalMember, setClassModalMember] = useState<Member | null>(null);
  const [classFecha, setClassFecha] = useState('');
  const [classModalidad, setClassModalidad] = useState<'Presencial (Templo Cra 7 # 31a-78)' | 'Virtual (Google Meet / Zoom)'>(
    'Presencial (Templo Cra 7 # 31a-78)'
  );

  // Modal para registrar ausencia
  const [absenceModalMember, setAbsenceModalMember] = useState<Member | null>(null);
  const [absenceMotivo, setAbsenceMotivo] = useState('');

  // Filtrar miembros en discipulado
  const discipleshipMembers = members.filter((m) => {
    const matchesSearch =
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.ministerioInteres && m.ministerioInteres.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const enCursoMembers = discipleshipMembers.filter((m) => m.discipulado && !m.discipulado.completado);
  const ausentesMembers = discipleshipMembers.filter(
    (m) => m.discipulado && (m.discipulado.inasistenciasConsecutivas || 0) > 0
  );
  const graduadosMembers = discipleshipMembers.filter((m) => m.discipulado && m.discipulado.completado);

  const handleSaveClassSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classModalMember || !classFecha) return;
    scheduleDiscipleshipClass(classModalMember.id, classFecha, classModalidad);
    setClassModalMember(null);
    setClassFecha('');
  };

  const handleSaveAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceModalMember) return;
    registerDiscipleshipAbsence(absenceModalMember.id, absenceMotivo);
    setAbsenceModalMember(null);
    setAbsenceMotivo('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Principal Doctrinal */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 backdrop-blur-md text-amber-200 text-xs font-bold border border-amber-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Formación Doctrinal Básica IBC Bogotá</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Discipulado: Libro «Nuevos Creyentes» (13 Lecciones)
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            Acompañamiento semanal personalizado para cimentar la fe en Cristo Jesús, programar clases, registrar ausencias y coordinar la graduación con el <b>Pastor Edgar Castaño Díaz</b>.
          </p>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('progreso')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'progreso'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Estudiantes & Progreso ({enCursoMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ausencias')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'ausencias'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>2. Módulo de Ausencias ({ausentesMembers.length})</span>
          {ausentesMembers.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('lecciones')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'lecciones'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3. Las 13 Lecciones (Resúmenes WhatsApp)</span>
        </button>

        <button
          onClick={() => setActiveTab('graduados')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'graduados'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>4. Graduados & Notificación al Pastor ({graduadosMembers.length})</span>
        </button>
      </div>

      {/* PESTAÑA 1: ESTUDIANTES & PROGRESO */}
      {activeTab === 'progreso' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-medium">
              Acompaña el avance lección a lección, agenda su próxima clase y comparte el resumen de estudio por WhatsApp.
            </p>
            <input
              type="text"
              placeholder="Buscar por hermano o ministerio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enCursoMembers.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <BookOpen className="w-12 h-12 text-amber-400 mx-auto opacity-70" />
                <h4 className="text-base font-bold text-slate-800">No hay estudiantes activos en este momento</h4>
                <p className="text-xs text-slate-400">Los hermanos que inicien su ruta aparecerán aquí.</p>
              </div>
            ) : (
              enCursoMembers.map((member) => {
                const disc = member.discipulado || {
                  leccionActual: 1,
                  completado: false,
                  discipuladorNombre: 'Por asignar',
                };
                const currentLesson = getLessonByNumber(disc.leccionActual);
                const progressPercent = Math.round((disc.leccionActual / 13) * 100);

                // Mensaje para recordar próxima clase
                const mensajeProximaClase = disc.proximaClaseFecha
                  ? `¡Hola, ${member.nombre}! Dios te bendiga. Te saluda ${disc.discipuladorNombre || 'tu discipulador'} de la Iglesia Bautista Central de Bogotá. Te recuerdo que nuestra próxima clase de discipulado (Lección ${disc.leccionActual}: "${currentLesson.titulo}") está programada para el ${formatColombianTime(disc.proximaClaseFecha)} (${disc.proximaClaseModalidad || 'Presencial'}). ¿Confirmas tu asistencia? Oramos por ti.`
                  : `¡Hola, ${member.nombre}! Dios te bendiga. Te saluda ${disc.discipuladorNombre || 'tu discipulador'} de la IBC Bogotá. Queremos coordinar nuestra próxima clase del libro Nuevos Creyentes (Lección ${disc.leccionActual}: "${currentLesson.titulo}"). ¿Qué día y horario te queda mejor esta semana?`;

                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{member.nombre}</h3>
                          <p className="text-xs text-slate-500 font-mono">{member.telefono || 'Sin teléfono'}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                          Lección {disc.leccionActual} / 13
                        </span>
                      </div>

                      {/* Progreso visual */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>{currentLesson.titulo}</span>
                          <span className="font-mono text-amber-700 font-bold">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Información de Clase y Discipulador */}
                      <div className="bg-slate-50 p-3 rounded-2xl space-y-2 text-xs border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Discipulador(a):</span>
                          <span className="font-bold text-slate-800">{disc.discipuladorNombre || 'Asignado'}</span>
                        </div>

                        {disc.proximaClaseFecha ? (
                          <div className="pt-1.5 border-t border-slate-200/60">
                            <span className="text-[11px] font-bold text-emerald-800 block">
                              📅 Próxima Clase Programada:
                            </span>
                            <span className="text-[11px] text-slate-700 font-mono">
                              {formatColombianTime(disc.proximaClaseFecha)}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              📍 {disc.proximaClaseModalidad || 'Presencial'}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-amber-700 italic">
                            ⏰ Sin próxima clase agendada aún
                          </div>
                        )}

                        {/* Inasistencias activas */}
                        {(disc.inasistenciasConsecutivas || 0) > 0 && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 font-semibold flex items-center justify-between">
                            <span>⚠️ {disc.inasistenciasConsecutivas} falta(s) reportada(s)</span>
                            <button
                              onClick={() => resetDiscipleshipAbsences(member.id)}
                              className="text-[10px] text-rose-700 underline font-bold"
                            >
                              Restablecer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Agendar Próxima Clase */}
                        <button
                          type="button"
                          onClick={() => {
                            setClassModalMember(member);
                            setClassFecha(disc.proximaClaseFecha || '');
                            if (disc.proximaClaseModalidad) setClassModalidad(disc.proximaClaseModalidad);
                          }}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>Agendar Clase</span>
                        </button>

                        {/* Reportar Ausencia */}
                        <button
                          type="button"
                          onClick={() => {
                            setAbsenceModalMember(member);
                            setAbsenceMotivo('');
                          }}
                          className="py-1.5 px-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Reportar falta a clase de discipulado"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Falta</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Recordar por WhatsApp */}
                        {member.telefono && (
                          <a
                            href={generarEnlaceWhatsApp(member.telefono, mensajeProximaClase)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            title="Enviar recordatorio de clase por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Recordar Clase</span>
                          </a>
                        )}

                        {/* Compartir Resumen de Lección */}
                        {member.telefono && (
                          <a
                            href={generarEnlaceWhatsApp(member.telefono, currentLesson.mensajeWhatsApp)}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors"
                            title="Enviar resumen doctrinal de la lección por WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5 text-amber-700" />
                            <span>Resumen</span>
                          </a>
                        )}

                        {/* Avanzar Lección */}
                        <button
                          type="button"
                          onClick={() => {
                            const nextLec = Math.min(13, disc.leccionActual + 1);
                            const isDone = nextLec >= 13;
                            updateDiscipleshipProgress(member.id, nextLec, isDone);
                          }}
                          className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title="Marcar lección vista y avanzar a la siguiente"
                        >
                          <span>+1</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: MÓDULO DE AUSENCIAS & INASISTENCIAS */}
      {activeTab === 'ausencias' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-3xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-extrabold text-amber-900">
                Protocolo de Reconexión de Ausencias en Discipulado
              </h4>
              <p className="text-amber-800 leading-relaxed">
                Cuando un discípulo falta a su sesión semanal, este módulo ayuda al discipulador y al discípulo a acordar una fecha de reposición de la lección para evitar que se interrumpa su crecimiento espiritual.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ausentesMembers.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">¡Al día! No hay ausencias pendientes</h4>
                <p className="text-xs text-slate-400">Todos los estudiantes se encuentran al día con sus sesiones de discipulado.</p>
              </div>
            ) : (
              ausentesMembers.map((member) => {
                const disc = member.discipulado!;
                const lesson = getLessonByNumber(disc.leccionActual);

                // Mensaje fraterno de reconexión para el discípulo
                const mensajeReconexion = `¡Hola, ${member.nombre}! Dios te bendiga grandemente. Te saluda ${disc.discipuladorNombre || 'tu discipulador'} de la Iglesia Bautista Central de Bogotá. Te extrañamos mucho en nuestra clase de discipulado sobre la Lección ${disc.leccionActual}: "${lesson.titulo}". Sabemos que a veces surgen imprevistos laborales o familiares, pero queremos animarte y acordar un momento esta semana para compartir la lección juntos. ¿Qué día te queda mejor? Oramos por ti y por tu hogar.`;

                return (
                  <div
                    key={member.id}
                    className="p-5 rounded-3xl border-2 border-amber-300 bg-amber-50/20 hover:bg-white transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-base">{member.nombre}</h4>
                        <p className="text-xs text-slate-500 font-mono">{member.telefono || 'Sin teléfono'}</p>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-black text-xs uppercase">
                        {disc.inasistenciasConsecutivas} Inasistencia(s)
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <p>
                        <strong className="text-slate-800">Lección en pausa:</strong> Lección {disc.leccionActual} — {lesson.titulo}
                      </p>
                      <p>
                        <strong className="text-slate-800">Discipulador asignado:</strong> {disc.discipuladorNombre || 'Por asignar'}
                      </p>
                      {disc.historialInasistencias && disc.historialInasistencias.length > 0 && (
                        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          Último motivo reportado: {disc.historialInasistencias[disc.historialInasistencias.length - 1].motivo}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {member.telefono && (
                        <a
                          href={generarEnlaceWhatsApp(member.telefono, mensajeReconexion)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Contactar Discípulo por WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => resetDiscipleshipAbsences(member.id)}
                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        title="Marcar clase repuesta y limpiar contador"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Clase Repuesta</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: LAS 13 LECCIONES (RESÚMENES WHATSAPP) */}
      {activeTab === 'lecciones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Plan de Estudios: Libro «Nuevos Creyentes»
              </h3>
              <p className="text-xs text-slate-500">
                13 lecciones doctrinales fundamentales con resúmenes listos para enviar al discípulo antes o después de cada clase.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISCIPLESHIP_LESSONS.map((lec) => (
              <div
                key={lec.numero}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                      {lec.numero}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 font-serif italic">
                      {lec.citaBiblica.split(';')[0]}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm leading-tight">{lec.titulo}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{lec.objetivo}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLessonModal(lec.numero)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Ver Contenido Completo
                  </button>

                  <a
                    href={generarEnlaceWhatsApp(config.numeroIglesia, lec.mensajeWhatsApp)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
                    title="Copiar o compartir resumen en WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 4: GRADUADOS & NOTIFICACIÓN AL PASTOR */}
      {activeTab === 'graduados' && (
        <div className="space-y-4">
          <div className="bg-purple-50/70 border border-purple-200 p-5 rounded-3xl flex items-start gap-3">
            <Award className="w-6 h-6 text-purple-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-purple-950">
              <h4 className="font-extrabold text-sm text-purple-950">
                Notificación Directa al Pastor Edgar Castaño Díaz
              </h4>
              <p className="leading-relaxed">
                Cuando una persona culmina la lección 13, el sistema envía una alerta prioritaria al Pastor Edgar Castaño para coordinar una entrevista pastoral, orar por él/ella e identificar si se le asigna un ministerio o se define su próximo paso de membresía y bautismo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {graduadosMembers.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <Award className="w-12 h-12 text-purple-400 mx-auto opacity-70" />
                <h4 className="text-base font-bold text-slate-800">Aún no hay graduados en este ciclo</h4>
                <p className="text-xs text-slate-400">Los estudiantes que alcancen la lección 13 aparecerán aquí listos para asignación ministerial.</p>
              </div>
            ) : (
              graduadosMembers.map((member) => {
                const disc = member.discipulado!;

                // Mensaje de felicitación del Pastor Edgar para el graduado
                const mensajePastoralGraduado = `¡Hola, ${member.nombre}! Dios te bendiga grandemente. Te habla el Pastor Edgar Castaño Díaz de la Iglesia Bautista Central de Bogotá. Me enteré con inmensa alegría de que has completado las 13 lecciones del libro "Nuevos Creyentes". ¡Damos toda la gloria a Dios por tu perseverancia y crecimiento! Queremos tener un tiempo para orar juntos y conversar sobre tus dones y colocación en un ministerio (${member.ministerioInteres || 'servicio activo'}) en nuestra congregación. ¿Tienes un momento para que hablemos?`;

                return (
                  <div
                    key={member.id}
                    className="p-5 rounded-3xl border-2 border-emerald-400 bg-white shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-black text-slate-900 text-base">{member.nombre}</h4>
                          <p className="text-xs text-slate-500 font-mono">{member.telefono || 'Sin teléfono'}</p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>13/13 Completado</span>
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Discipulador:</span>
                          <span className="font-bold text-slate-800">{disc.discipuladorNombre || 'Asignado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Interés Ministerial:</span>
                          <span className="font-bold text-indigo-700">{member.ministerioInteres || 'Por asignar'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Alerta al Pastor:</span>
                          <span className="font-bold text-emerald-700">✅ Notificada al Pastor Edgar</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {member.telefono && (
                        <a
                          href={generarEnlaceWhatsApp(member.telefono, mensajePastoralGraduado)}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Entrevista Pastoral (WhatsApp)</span>
                        </a>
                      )}

                      {/* Asignación rápida de ministerio */}
                      <div className="flex items-center gap-1.5">
                        <select
                          defaultValue={member.ministerioInteres || 'Escuela Dominical'}
                          id={`min-select-${member.id}`}
                          className="text-xs font-semibold py-1.5 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex-1"
                        >
                          <option value="Escuela Dominical (Niños)">Escuela Dominical (Niños)</option>
                          <option value="Bienvenida y Consolidación">Bienvenida y Consolidación</option>
                          <option value="Alabanza y Adoración">Alabanza y Adoración</option>
                          <option value="Jóvenes Universitarios">Jóvenes Universitarios</option>
                          <option value="Matrimonios / Familia">Matrimonios / Familia</option>
                          <option value="Misiones Urbanas">Misiones Urbanas</option>
                          <option value="Ujieres y Logística">Ujieres y Logística</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const sel = document.getElementById(`min-select-${member.id}`) as HTMLSelectElement;
                            if (sel) updateMinistryPlacement(member.id, sel.value);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Asignar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL PARA AGENDAR PRÓXIMA CLASE */}
      {classModalMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Agendar Próxima Clase de Discipulado
                </h3>
              </div>
              <button
                onClick={() => setClassModalMember(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Hermano(a): <strong className="text-slate-900">{classModalMember.nombre}</strong>
            </p>

            <form onSubmit={handleSaveClassSchedule} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha y Hora de la Sesión: *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={classFecha}
                  onChange={(e) => setClassFecha(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modalidad:</label>
                <select
                  value={classModalidad}
                  onChange={(e) => setClassModalidad(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="Presencial (Templo Cra 7 # 31a-78)">
                    Presencial (Templo Cra 7 # 31a-78)
                  </option>
                  <option value="Virtual (Google Meet / Zoom)">
                    Virtual (Google Meet / Zoom)
                  </option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClassModalMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md"
                >
                  Guardar Próxima Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA REPORTAR AUSENCIA */}
      {absenceModalMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Reportar Inasistencia a Discipulado
                </h3>
              </div>
              <button
                onClick={() => setAbsenceModalMember(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Registrar falta para: <strong className="text-slate-900">{absenceModalMember.nombre}</strong>
            </p>

            <form onSubmit={handleSaveAbsence} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo de la inasistencia (opcional):
                </label>
                <textarea
                  value={absenceMotivo}
                  onChange={(e) => setAbsenceMotivo(e.target.value)}
                  placeholder="Ej: Compromiso laboral imprevisto, quebranto de salud, viaje..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAbsenceModalMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md"
                >
                  Registrar Falta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONTENIDO DE LECCIÓN */}
      {selectedLessonModal !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          {(() => {
            const lesson = getLessonByNumber(selectedLessonModal);
            return (
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                      {lesson.numero}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{lesson.titulo}</h3>
                      <p className="text-[11px] text-amber-700 font-serif italic">{lesson.citaBiblica}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLessonModal(null)}
                    className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Objetivo Doctrinal:</h5>
                    <p className="text-slate-600 mt-0.5">{lesson.objetivo}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Resumen Ejecutivo:</h5>
                    <p className="text-slate-600 mt-0.5">{lesson.resumen}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Puntos Bíblicos Clave:</h5>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 mt-1">
                      {lesson.puntosClave.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Aplicación Práctica:</h5>
                    <p className="text-slate-600 mt-0.5">{lesson.aplicacionPractica}</p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-800 block">
                      Mensaje Preparado para Enviar por WhatsApp:
                    </span>
                    <p className="font-mono text-[11px] text-slate-700 whitespace-pre-line bg-white p-2.5 rounded-xl border border-emerald-100">
                      {lesson.mensajeWhatsApp}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedLessonModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cerrar
                  </button>
                  <a
                    href={generarEnlaceWhatsApp(config.numeroIglesia, lesson.mensajeWhatsApp)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Compartir por WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
