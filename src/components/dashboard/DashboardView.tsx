import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, CounselingRequest, AppLog } from '../../types';
import { formatColombianTime } from '../../lib/dateUtils';
import {
  Users,
  Coins,
  HeartHandshake,
  CalendarCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  MessageCircle,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  UserCheck,
  Bot,
  Send,
  ExternalLink,
  Code2,
  BookOpen,
  PhoneCall,
  Activity,
  Filter,
} from 'lucide-react';
import { formatearMonedaCOP, generarEnlaceWhatsApp } from '../../lib/whatsappUtils';
import { MemberProfileModal } from '../common/MemberProfileModal';
import { ROADMAP_STEPS } from '../../data/roadmapData';

export const DashboardView: React.FC = () => {
  const {
    members,
    counseling,
    donations,
    config,
    setCurrentView,
    getTiempoAtencionStatus,
    activeProfile,
    activeUserProfile,
    activeRole,
    currentConsolidator,
    setActiveProfile,
    updateCounselingStatus,
    logs,
  } = useApp();

  const [selectedMemberForModal, setSelectedMemberForModal] = useState<Member | null>(null);
  const [logFilter, setLogFilter] = useState<'todos' | 'miembro' | 'consejeria' | 'ofrenda' | 'sesion'>('todos');

  // Fechas de cálculo
  const now = new Date();
  const sieteDiasAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const nuevos7Dias = members.filter((m) => new Date(m.fechaRegistro) >= sieteDiasAtras);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const nuevosEsteMes = members.filter((m) => {
    const f = new Date(m.fechaRegistro);
    return f.getFullYear() === currentYear && f.getMonth() === currentMonth;
  });

  // Donaciones
  const donaciones7Dias = donations.filter((d) => new Date(d.fecha) >= sieteDiasAtras);
  const monto7Dias = donaciones7Dias.reduce((acc, d) => acc + d.monto, 0);
  const montoTotal = donations.reduce((acc, d) => acc + d.monto, 0);

  // Consejerías pendientes
  const consejeriasPendientes = counseling
    .filter((c) => c.estado !== 'Cerrada')
    .sort((a, b) => {
      const urgenciaOrder: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };
      return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia];
    });

  // Seguimientos activos generales
  const seguimientosActivos = members.filter(
    (m) =>
      m.estadoSeguimiento === 'Nuevo' ||
      m.estadoSeguimiento === 'En seguimiento' ||
      m.estadoSeguimiento === 'Necesita atención'
  );

  // Asignados al consolidador actual
  const misAsignados = members.filter((m) => m.consolidadorId === activeProfile);
  const misAsignadosPrioritarios = misAsignados.filter(
    (m) => m.estadoSeguimiento === 'Nuevo' || m.estadoSeguimiento === 'Necesita atención'
  );

  const integradosTotal = members.filter((m) => m.estadoSeguimiento === 'Integrado').length;

  // Filtrado de logs
  const filteredLogs = logs.filter((l) => logFilter === 'todos' || l.categoria === logFilter);

  // Versículo bíblico personalizado (RVR1960)
  const getProfileBlessing = () => {
    if (activeRole === 'desarrollador') {
      return {
        saludo: `¡Bienvenido al Panel Técnico y DevOps, ${activeUserProfile.nombre}!`,
        versiculo: '«Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres...»',
        cita: 'Colosenses 3:23 (RVR1960)',
        icono: '💻',
      };
    }
    if (activeProfile === 'cons-1') {
      return {
        saludo: `¡Dios bendiga tu siembra fraterna, hermana ${currentConsolidator?.nombre || 'Martha'}!`,
        versiculo: '«¡Cuán hermosos son sobre los montes los pies del que trae alegres nuevas, del que anuncia la paz...!»',
        cita: 'Isaías 52:7 (RVR1960)',
        icono: '🤝',
      };
    }
    if (activeProfile === 'cons-2') {
      return {
        saludo: `¡El Señor fortalezca tus manos en cada contacto, hermano ${currentConsolidator?.nombre || 'Andrés'}!`,
        versiculo: '«Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre...»',
        cita: '1 Corintios 15:58 (RVR1960)',
        icono: '🤝',
      };
    }
    if (activeProfile === 'cons-3') {
      return {
        saludo: `¡La gracia y favor del Señor colmen tu vida, hermana ${currentConsolidator?.nombre || 'Viviana'}!`,
        versiculo: '«El alma generosa será prosperada; y el que saciare, él también será saciado.»',
        cita: 'Proverbios 11:25 (RVR1960)',
        icono: '🤝',
      };
    }
    return {
      saludo: '¡La paz, sabiduría y discernimiento del Señor reposen sobre tu pastoreo, Pastor Edgar!',
      versiculo: '«Apacentad la grey de Dios que está entre vosotros, cuidando de ella, no por fuerza, sino voluntariamente...»',
      cita: '1 Pedro 5:2 (RVR1960)',
      icono: '🕊️',
    };
  };

  const blessing = getProfileBlessing();

  /* =========================================================================
     1. VISTA EXCLUSIVA PARA CONSOLIDADORES (Martha, Andrés, Viviana)
     Limpia, enfocada solo en sus hermanos asignados, avance de ruta y WhatsApp.
     ========================================================================= */
  if (activeRole === 'consolidador') {
    return (
      <div className="space-y-6 pb-12">
        {/* Banner de Bienvenida */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
              {blessing.icono}
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {blessing.saludo}
              </h3>
              <p className="text-xs text-slate-300 italic font-serif leading-relaxed max-w-2xl">
                {blessing.versiculo} <span className="font-bold not-italic text-emerald-300 ml-1">({blessing.cita})</span>
              </p>
              <p className="text-xs text-slate-400 pt-0.5">
                Rol: <strong className="text-white">{currentConsolidator?.alias}</strong> · Tienes{' '}
                <strong className="text-emerald-400">{misAsignados.length} hermanos asignados</strong> bajo tu cuidado fraterno.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('kanban')}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs shrink-0 self-start md:self-center cursor-pointer"
          >
            Ver Tablero Kanban
          </button>
        </div>

        {/* 3 Métricas Fraternas Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mis Asignados
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{misAsignados.length}</span>
              <p className="text-xs text-slate-400 mt-1">Hermanos asignados a tu cuidado</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Requieren Contacto Hoy
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{misAsignadosPrioritarios.length}</span>
              <p className="text-xs text-slate-400 mt-1">Nuevos o pendientes de respuesta</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Avanzando en la Ruta
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {misAsignados.filter((m) => m.pasoActualRuta >= 2).length}
              </span>
              <p className="text-xs text-slate-400 mt-1">En paso 2 o superior hacia el servicio</p>
            </div>
          </div>
        </div>

        {/* Sección Principal: Mis Hermanos Asignados */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Mis Hermanos Asignados — Plan de Cuidado Fraterno
              </h3>
              <p className="text-xs text-slate-500">
                Acompaña a cada persona, haz contacto por WhatsApp y celebra su avance en los 6 pasos.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('schedule')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ver Plantillas de Mensajes</span>
            </button>
          </div>

          {misAsignados.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">No tienes hermanos asignados en este momento</p>
              <p className="text-xs text-slate-400">El pastor te asignará nuevos visitantes según lleguen a la congregación.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {misAsignados.map((member) => {
                const pasoInfo = ROADMAP_STEPS.find((s) => s.paso === member.pasoActualRuta) || ROADMAP_STEPS[0];
                const needsAttention = member.estadoSeguimiento === 'Necesita atención';

                const defaultMsg = `¡Hola, ${member.nombre}! Te saluda ${currentConsolidator?.nombre || 'tu consolidador'} de la Iglesia Bautista Central de Bogotá. Esperamos que hayas tenido una bendecida semana. Queríamos saludarte y saber cómo te encuentras. ¿Cómo estás hoy?`;

                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      needsAttention
                        ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{member.nombre}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            member.estadoSeguimiento === 'Nuevo'
                              ? 'bg-blue-100 text-blue-800'
                              : member.estadoSeguimiento === 'En seguimiento'
                              ? 'bg-indigo-100 text-indigo-800'
                              : member.estadoSeguimiento === 'Necesita atención'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {member.estadoSeguimiento}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{member.telefono}</span>
                        <span aria-hidden="true">·</span>
                        <span>{member.tipo}</span>
                        {member.deseaBautizarse && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-blue-700 font-semibold">🌊 Bautismo: {member.deseaBautizarse}</span>
                          </>
                        )}
                      </p>

                      {/* Progreso en la Ruta de 6 Pasos */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-600">
                            Paso {member.pasoActualRuta}/6: {pasoInfo.titulo}
                          </span>
                          <span className="font-bold text-indigo-600">
                            {Math.round((member.pasoActualRuta / 6) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            style={{ width: `${(member.pasoActualRuta / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedMemberForModal(member)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Ver Ruta Completa</span>
                      </button>

                      {member.telefono && (
                        <a
                          href={generarEnlaceWhatsApp(member.telefono, defaultMsg)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Expediente si se abre */}
        <MemberProfileModal
          member={selectedMemberForModal}
          onClose={() => setSelectedMemberForModal(null)}
        />
      </div>
    );
  }

  /* =========================================================================
     2. VISTA EXCLUSIVA PARA DESARROLLADOR / DEVOPS
     ========================================================================= */
  if (activeRole === 'desarrollador') {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-slate-950 text-amber-300 p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
              <Code2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight font-sans">
                Panel Técnico y DevOps (IBC Bogotá)
              </h3>
              <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                {blessing.versiculo} <strong>({blessing.cita})</strong>
              </p>
              <p className="text-xs text-slate-400 font-sans">
                Cuenta oficial: <strong>proyectosibc26@gmail.com</strong> · Supabase PostgreSQL + Telegram Bot API
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('database')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold transition-all shadow-xs shrink-0 self-start md:self-center font-sans cursor-pointer"
          >
            Editor SQL / Supabase
          </button>
        </div>

        {/* Diagnósticos Técnicos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                PostgreSQL (Supabase)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900">Activo</span>
              <p className="text-xs text-slate-400 mt-1">DDL sincronizado con triggers de atención</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Telegram Bot API
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900">Conectado</span>
              <p className="text-xs text-slate-400 mt-1">Alertas automáticas y envío multimedia activo</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Registros en Memoria / DB
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900">{members.length} Miembros</span>
              <p className="text-xs text-slate-400 mt-1">{counseling.length} consejerías · {donations.length} ofrendas</p>
            </div>
          </div>
        </div>

        {/* Barra de Prueba Persona por Persona */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900">Probar Aplicación Persona por Persona:</h4>
            <span className="text-xs text-slate-400">Valida que cada perfil vea solo lo asignado</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <button
              onClick={() => setActiveProfile('pastor')}
              className="p-3 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-left transition-colors cursor-pointer"
            >
              <p className="text-xs font-bold text-blue-900">🕊️ Pastor Edgar</p>
              <p className="text-[11px] text-blue-700">Pastor Principal</p>
            </button>
            <button
              onClick={() => setActiveProfile('cons-1')}
              className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left transition-colors cursor-pointer"
            >
              <p className="text-xs font-bold text-emerald-900">🤝 Martha Cecilia</p>
              <p className="text-[11px] text-emerald-700">Consolidador 1</p>
            </button>
            <button
              onClick={() => setActiveProfile('cons-2')}
              className="p-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-left transition-colors cursor-pointer"
            >
              <p className="text-xs font-bold text-indigo-900">🤝 Andrés Felipe</p>
              <p className="text-[11px] text-indigo-700">Consolidador 2</p>
            </button>
            <button
              onClick={() => setActiveProfile('cons-3')}
              className="p-3 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-left transition-colors cursor-pointer"
            >
              <p className="text-xs font-bold text-purple-900">🤝 Viviana Torres</p>
              <p className="text-[11px] text-purple-700">Consolidador 3</p>
            </button>
            <button
              onClick={() => setActiveProfile('dev')}
              className="p-3 rounded-2xl border border-amber-300 bg-amber-50 text-left transition-colors cursor-pointer font-bold text-amber-900"
            >
              <p className="text-xs">💻 Desarrollador</p>
              <p className="text-[11px] text-amber-700">Modo Activo</p>
            </button>
          </div>
        </div>

        {/* Registro de Auditoría / Logs en Vivo */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-extrabold text-slate-900">Auditoría y Logs de la Aplicación</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">{logs.length} eventos registrados</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900">[{log.usuario}]</span>{' '}
                  <span className="text-indigo-600 font-semibold">{log.accion}:</span>{' '}
                  <span className="text-slate-700 font-sans">{log.detalle}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatColombianTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     3. VISTA EXCLUSIVA PARA EL PASTOR EDGAR (Pastor Principal)
     Sencilla, gráfica, letras grandes, teléfono gigante para llamada directa.
     ========================================================================= */
  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Bienvenida Cálido y Sencillo */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
            🕊️
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Bienvenido, Pastor Edgar
            </h2>
            <p className="text-sm text-slate-300">
              Aquí tiene el resumen de su congregación y las llamadas pastorales pendientes para hoy.
            </p>
          </div>
        </div>

        {/* 🌟 Modo Enfoque Pastoral (Alerta de Acción Inmediata) */}
        {(consejeriasPendientes.length > 0 || nuevos7Dias.length > 0) && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">Enfoque de Atención Prioritaria para Hoy</h4>
                <p className="text-xs text-blue-100">
                  Hay {consejeriasPendientes.filter(c => c.urgencia === 'Alta' || getTiempoAtencionStatus(c).status === 'breached').length} consejerías prioritarias y {nuevos7Dias.length} visitantes recientes esperando cuidado pastoral.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCurrentView('counseling')}
                className="px-4 py-2 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs"
              >
                Atender Consejerías ({consejeriasPendientes.length})
              </button>
              <button
                onClick={() => setCurrentView('kanban')}
                className="px-4 py-2 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 text-white font-bold text-xs border border-blue-400/30 transition-colors"
              >
                Ver Consolidación
              </button>
            </div>
          </div>
        )}

        {/* Botón Rápido para simular / probar otros perfiles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-bold">Probar como:</span>
          <button
            onClick={() => setActiveProfile('cons-1')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold cursor-pointer transition-all"
            title="Probar vista de Martha Gómez"
          >
            Martha G.
          </button>
          <button
            onClick={() => setActiveProfile('cons-2')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold cursor-pointer transition-all"
            title="Probar vista de Andrés Pardo"
          >
            Andrés P.
          </button>
          <button
            onClick={() => setActiveProfile('cons-3')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold cursor-pointer transition-all"
            title="Probar vista de Viviana Torres"
          >
            Viviana T.
          </button>
        </div>
      </div>

      {/* 4 GRANDES TARJETAS VISUALES PARA EL PASTOR (Números Grandes y Claros) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta 1: Nuevos Hermanos */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Nuevos esta semana
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              👥
            </div>
          </div>
          <div className="mt-3">
            <span className="text-4xl font-black text-slate-900">{nuevos7Dias.length}</span>
            <p className="text-xs text-slate-500 font-medium mt-1">
              En el mes: <strong className="text-slate-800">{nuevosEsteMes.length} personas</strong>
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Consejerías Pendientes */}
        <div className="bg-white p-6 rounded-3xl border border-rose-200 bg-rose-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
              Esperan tu llamada
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              📞
            </div>
          </div>
          <div className="mt-3">
            <span className="text-4xl font-black text-rose-900">{consejeriasPendientes.length}</span>
            <p className="text-xs text-rose-700 font-bold mt-1">
              {consejeriasPendientes.length === 1 ? '1 persona esperando' : `${consejeriasPendientes.length} personas esperando`}
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Almas en Consolidación */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              En Consolidación
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              🌱
            </div>
          </div>
          <div className="mt-3">
            <span className="text-4xl font-black text-slate-900">{seguimientosActivos.length}</span>
            <p className="text-xs text-slate-500 font-medium mt-1">
              <strong className="text-emerald-700">{integradosTotal}</strong> ya integrados y sirviendo
            </p>
          </div>
        </div>

        {/* Tarjeta 4: Ofrendas Semanales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Ofrendas (7 días)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              💰
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 truncate block">
              {formatearMonedaCOP(monto7Dias)}
            </span>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Total acumulado: <strong className="text-slate-800">{formatearMonedaCOP(montoTotal)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN ESTRELLA PARA EL PASTOR: NÚMEROS GIGANTES PARA LLAMAR DE INMEDIATO */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black mb-1">
              <span>PRIORIDAD DE ATENCIÓN DIRECTA</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Consejerías Pendientes — Llama Directamente a estos Hermanos
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Toque el botón verde grande para llamar de inmediato desde su teléfono o coordinar por WhatsApp.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('counseling')}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-extrabold transition-all self-start sm:self-center cursor-pointer"
          >
            Ver Módulo de Consejería Completo →
          </button>
        </div>

        {consejeriasPendientes.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
            <h4 className="text-base font-bold text-slate-800">¡Al día! No hay llamadas pendientes</h4>
            <p className="text-xs text-slate-400">Todas las solicitudes de consejería recibidas han sido atendidas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consejeriasPendientes.map((req) => {
              const defaultMsg = `¡Hola, ${req.nombre}! Le saluda con mucho afecto el Pastor Edgar de la Iglesia Bautista Central de Bogotá. He recibido su solicitud de consejería sobre "${req.tema}" y me gustaría hablar con usted en este momento. ¿Cómo se encuentra hoy?`;

              return (
                <div
                  key={req.id}
                  className="p-5 sm:p-6 rounded-3xl border-2 border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-400 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-lg sm:text-xl font-black text-slate-900">{req.nombre}</span>
                      
                      {/* Horario de Disponibilidad destacado */}
                      {req.disponibilidadHorario && (
                        <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 font-black text-xs uppercase flex items-center gap-1 shadow-2xs">
                          {req.disponibilidadHorario === 'Mañana' && '🌅'}
                          {req.disponibilidadHorario === 'Tarde' && '☀️'}
                          {req.disponibilidadHorario === 'Noche' && '🌙'}
                          <span>Disponibilidad: {req.disponibilidadHorario}</span>
                        </span>
                      )}

                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-slate-200 text-slate-700">
                        Tema: {req.tema}
                      </span>
                    </div>

                    {/* NÚMERO DE TELÉFONO GIGANTE PARA EL PASTOR */}
                    <div className="pt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Número Telefónico:</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-wider select-all inline-block bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                        {req.contacto}
                      </span>
                    </div>

                    {req.detalles && (
                      <p className="text-xs sm:text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        <strong className="text-slate-800">Nota del hermano:</strong> {req.detalles}
                      </p>
                    )}
                  </div>

                  {/* BOTONES DE LLAMADA GRANDES Y CLAROS */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <a
                      href={`tel:${req.contacto}`}
                      className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                      <PhoneCall className="w-5 h-5 animate-pulse" />
                      <span>LLAMAR AHORA</span>
                    </a>

                    <a
                      href={generarEnlaceWhatsApp(req.contacto, defaultMsg)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => updateCounselingStatus(req.id, 'En acompañamiento')}
                      className="px-4 py-4 rounded-2xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Marcar como atendida en acompañamiento"
                    >
                      <span>✓ En Acompañamiento</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN DE LOGS DE ACTIVIDAD: PARA SEGUIR LO QUE HACE CADA MIEMBRO/CONSOLIDADOR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Registro de Actividad del Equipo (Logs en Vivo)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Siga en tiempo real las llamadas, visitas y avances que realiza cada consolidador en la iglesia.
            </p>
          </div>

          {/* Filtros de Logs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setLogFilter('todos')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                logFilter === 'todos' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Todos ({logs.length})
            </button>
            <button
              onClick={() => setLogFilter('miembro')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                logFilter === 'miembro' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Consolidación
            </button>
            <button
              onClick={() => setLogFilter('consejeria')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                logFilter === 'consejeria' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Consejería
            </button>
            <button
              onClick={() => setLogFilter('ofrenda')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                logFilter === 'ofrenda' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Ofrendas
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No hay registros con este filtro.</p>
          ) : (
            filteredLogs.map((log) => {
              let badgeColor = 'bg-slate-100 text-slate-700';
              if (log.categoria === 'miembro') badgeColor = 'bg-emerald-100 text-emerald-800';
              if (log.categoria === 'consejeria') badgeColor = 'bg-rose-100 text-rose-800';
              if (log.categoria === 'ofrenda') badgeColor = 'bg-amber-100 text-amber-800';
              if (log.categoria === 'sesion') badgeColor = 'bg-blue-100 text-blue-800';

              return (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-slate-900 text-xs">{log.usuario}</strong>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${badgeColor}`}>
                        {log.accion}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{log.detalle}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {formatColombianTime(log.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
