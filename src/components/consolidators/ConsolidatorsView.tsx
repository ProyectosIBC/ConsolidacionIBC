import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, Consolidator, UserProfileInfo } from '../../types';
import {
  Users,
  UserCheck,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Filter,
  UserPlus,
  Send,
  Heart,
  CalendarCheck,
  KeyRound,
  Copy,
} from 'lucide-react';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';
import { MemberProfileModal } from '../common/MemberProfileModal';

export const ConsolidatorsView: React.FC = () => {
  const {
    members,
    consolidators,
    userProfiles,
    activeProfile,
    setActiveProfile,
    activeUserProfile,
    activeRole,
    reassignConsolidator,
    showToast,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'todos' | 'consolidadores' | 'discipuladores'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedConsolidatorId, setExpandedConsolidatorId] = useState<string | null>('cons-1');
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<Member | null>(null);

  // Modal para reasignar miembro
  const [reassigningMember, setReassigningMember] = useState<Member | null>(null);
  const [targetConsolidatorId, setTargetConsolidatorId] = useState<string>('cons-1');

  // Estadísticas globales del equipo de consolidación
  const totalAsignados = members.filter((m) => m.consolidadorId).length;
  const enAlerta = members.filter((m) => m.estadoSeguimiento === 'Necesita atención').length;
  const integrados = members.filter((m) => m.estadoSeguimiento === 'Integrado').length;
  const enProceso = members.filter((m) => m.estadoSeguimiento === 'En seguimiento' || m.estadoSeguimiento === 'Nuevo').length;

  // Filtrado de perfiles
  const consolidatorProfiles = userProfiles.filter((p) => p.rol === 'consolidador');
  const discipuladorProfiles = userProfiles.filter((p) => p.rol === 'discipulador');

  const displayedProfiles = userProfiles.filter((profile) => {
    if (activeTab === 'consolidadores' && profile.rol !== 'consolidador') return false;
    if (activeTab === 'discipuladores' && profile.rol !== 'discipulador') return false;
    if (activeTab === 'todos' && profile.rol === 'desarrollador') return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = profile.nombre.toLowerCase().includes(term);
      const matchEmail = profile.email.toLowerCase().includes(term);
      const matchRole = profile.rolLabel.toLowerCase().includes(term);
      return matchName || matchEmail || matchRole;
    }
    return true;
  });

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningMember) return;
    const targetCons = consolidators.find((c) => c.id === targetConsolidatorId);
    if (!targetCons) return;

    reassignConsolidator(reassigningMember.id, targetCons.id);
    showToast('success', `${reassigningMember.nombre} reasignado(a) a ${targetCons.nombre}`, 'Reasignación Exitosa');
    setReassigningMember(null);
  };

  const handleSwitchProfile = (profileId: string, nombre: string) => {
    setActiveProfile(profileId);
    showToast('info', `Ahora estás operando en el sistema como ${nombre}`, 'Perfil Activo');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Superior */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-200 text-xs font-bold border border-blue-400/30">
              <Users className="w-3.5 h-3.5" />
              <span>Ministerio de Cuidado Congregacional, Consolidación y Discipulado</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Directorio Pastoral: Consolidadores y Discipuladores
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Supervisión de los <b>3 consolidadores</b> (Ruta de 6 pasos & 8 semanas) y los <b>3 discipuladores</b> (13 lecciones del libro <i>Nuevos Creyentes</i>) de la <b>Iglesia Bautista Central de Bogotá</b>.
            </p>
          </div>

          {/* Estado de Perfil Activo */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${activeUserProfile.avatarColor}`}>
              {activeUserProfile.nombre.charAt(0)}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-blue-300 font-bold block font-mono-space">
                Sesión Activa
              </span>
              <h4 className="text-sm font-extrabold text-white leading-tight">
                {activeUserProfile.nombre}
              </h4>
              <span className="text-xs text-slate-300 block">
                {activeUserProfile.rolLabel} ({activeUserProfile.badge})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Globales del Equipo (5 tarjetas) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Consolidadores</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {consolidatorProfiles.length}
            </span>
            <span className="text-xs text-emerald-600 font-bold">líderes</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Ruta de 6 Pasos</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Discipuladores</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {discipuladorProfiles.length}
            </span>
            <span className="text-xs text-amber-600 font-bold">líderes</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">13 Lecciones Creyentes</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">En Acompañamiento</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {enProceso}
            </span>
            <span className="text-xs text-blue-600 font-bold">personas</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Semanas 1 a 8</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Requieren Atención</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-600 tracking-tight">
              {enAlerta}
            </span>
            <span className="text-xs text-amber-600 font-bold">alertas</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Seguimiento pendiente</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Integrados / Graduados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600 tracking-tight">
              {integrados}
            </span>
            <span className="text-xs text-emerald-600 font-bold">hermanos</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Comunión y servicio</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Pestañas de Roles */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('consolidadores')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'consolidadores'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consolidadores ({consolidatorProfiles.length})
          </button>
          <button
            onClick={() => setActiveTab('discipuladores')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'discipuladores'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Discipuladores ({discipuladorProfiles.length})
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'todos'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todo el Equipo
          </button>
        </div>

        {/* Buscador */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, rol o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Lista de Tarjetas de Perfil de Consolidadores */}
      <div className="space-y-4">
        {displayedProfiles.map((profile) => {
          // Obtener los miembros asignados a este consolidador o discipulador
          const assignedMembers = members.filter(
            (m) => m.consolidadorId === profile.id || m.discipuladorId === profile.id
          );
          const isCurrentActive = activeProfile === profile.id;
          const isExpanded = expandedConsolidatorId === profile.id;

          const consolidatorInfo = consolidators.find((c) => c.id === profile.id);
          const telefonoContacto = consolidatorInfo?.telefono || '573195335076';

          const miembrosEnAlerta = assignedMembers.filter((m) => m.estadoSeguimiento === 'Necesita atención').length;
          const miembrosNuevos = assignedMembers.filter((m) => m.estadoSeguimiento === 'Nuevo').length;
          const miembrosEnSeguimiento = assignedMembers.filter((m) => m.estadoSeguimiento === 'En seguimiento').length;
          const miembrosIntegrados = assignedMembers.filter((m) => m.estadoSeguimiento === 'Integrado').length;

          return (
            <div
              key={profile.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                isCurrentActive
                  ? 'border-blue-500 ring-2 ring-blue-500/15 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Encabezado del Perfil */}
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  {/* Avatar con Color */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-xs ${profile.avatarColor}`}
                  >
                    {profile.nombre.charAt(0)}
                  </div>

                  {/* Datos del Consolidador */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {profile.nombre}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                        {profile.rolLabel}
                      </span>
                      {isCurrentActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-extrabold flex items-center gap-1 border border-blue-200 animate-pulse">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tu Perfil Actual</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      {profile.descripcion}
                    </p>

                    {/* Vías de Contacto */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <code>{profile.email}</code>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+{telefonoContacto}</span>
                      </span>
                    </div>

                    {/* Credenciales de Acceso */}
                    <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="text-[10px] font-bold text-amber-900 uppercase font-mono-space flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-700" />
                          <span>Credenciales de Acceso:</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">Usuario:</span>
                          <code className="bg-white px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-800 border border-amber-200 font-mono-space">{profile.username}</code>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">Clave:</span>
                          <code className="bg-white px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-800 border border-amber-200 font-mono-space">{profile.password}</code>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`Usuario: ${profile.username} | Clave: ${profile.password}`);
                          showToast('success', `Credenciales de ${profile.nombre} copiadas`, 'Copiado al Portapapeles');
                        }}
                        className="text-[10px] font-bold text-amber-800 hover:text-amber-950 bg-white hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar Clave</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Métricas Rápidas y Botones de Acción */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Resumen de Asignados */}
                  <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Asignados
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {assignedMembers.length}
                    </span>
                  </div>

                  {miembrosEnAlerta > 0 && (
                    <div className="bg-amber-50 px-3 py-2 rounded-2xl border border-amber-200 text-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">
                        En Alerta
                      </span>
                      <span className="text-lg font-black text-amber-700">
                        {miembrosEnAlerta}
                      </span>
                    </div>
                  )}

                  {/* Botón WhatsApp Directo */}
                  <a
                    href={generarEnlaceWhatsApp(
                      telefonoContacto,
                      `¡Hola ${profile.nombre}! Te saluda el Pastor Edgar Castaño de la Iglesia Bautista Central de Bogotá. ¿Cómo va el avance de consolidación con tus hermanos asignados esta semana?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Escribir al WhatsApp del consolidador"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  {/* Botón Simular / Cambiar Perfil */}
                  {!isCurrentActive ? (
                    <button
                      onClick={() => handleSwitchProfile(profile.id, profile.nombre)}
                      className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-blue-200 cursor-pointer"
                      title="Operar en el sistema con este perfil"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Activar Vista</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentView('kanban')}
                      className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ir a Mi Kanban</span>
                    </button>
                  )}

                  {/* Toggle para desplegar hermanos a cargo */}
                  <button
                    onClick={() => setExpandedConsolidatorId(isExpanded ? null : profile.id)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title={isExpanded ? 'Ocultar asignados' : 'Ver hermanos asignados'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sección Plegable: Hermanos Asignados */}
              {isExpanded && (
                <div className="bg-slate-50/70 border-t border-slate-200 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hermanos a Cargo de {profile.nombre} ({assignedMembers.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Ruta activa de consolidación de 6 pasos & 8 semanas
                    </span>
                  </div>

                  {assignedMembers.length === 0 ? (
                    <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No hay hermanos asignados actualmente a este consolidador. Puedes asignarle nuevos miembros desde el sistema Kanban o la recepción dominical.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {assignedMembers.map((member) => {
                        const statusColors: Record<string, string> = {
                          Nuevo: 'bg-blue-50 text-blue-700 border-blue-200',
                          'En seguimiento': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          'Necesita atención': 'bg-amber-50 text-amber-700 border-amber-200',
                          Integrado: 'bg-purple-50 text-purple-700 border-purple-200',
                          'Consejería activa': 'bg-rose-50 text-rose-700 border-rose-200',
                        };

                        return (
                          <div
                            key={member.id}
                            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-sm font-extrabold text-slate-900 leading-snug">
                                  {member.nombre}
                                </h5>
                                <span className="text-[11px] text-slate-500">
                                  Semana {member.semanaActual} de 8 • {member.tipo}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  statusColors[member.estadoSeguimiento] || 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {member.estadoSeguimiento}
                              </span>
                            </div>

                            {member.notas && (
                              <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                                «{member.notas}»
                              </p>
                            )}

                            {/* Acciones para el hermano asignado */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              {/* Botón WhatsApp */}
                              {member.telefono && (
                                <a
                                  href={generarEnlaceWhatsApp(
                                    member.telefono,
                                    `¡Hola ${member.nombre}! Te saluda ${profile.nombre} de la Iglesia Bautista Central de Bogotá. ¿Cómo estás esta semana? Oramos por ti y tu familia.`
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-emerald-200"
                                  title="Contactar al hermano"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              )}

                              {/* Ver Ficha Completa */}
                              <button
                                onClick={() => setSelectedMemberForModal(member)}
                                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                                title="Ver Ficha y Hoja de Vida"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              {/* Reasignar a otro consolidador */}
                              <button
                                onClick={() => {
                                  setReassigningMember(member);
                                  setTargetConsolidatorId(profile.id === 'cons-1' ? 'cons-2' : 'cons-1');
                                }}
                                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                                title="Reasignar hermano a otro consolidador"
                              >
                                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal para Reasignar Miembro */}
      {reassigningMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Reasignar Consolidador</span>
              </h3>
              <button
                onClick={() => setReassigningMember(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Selecciona el consolidador responsable que se encargará del acompañamiento fraterno y llamadas de{' '}
              <strong className="text-slate-900">{reassigningMember.nombre}</strong>.
            </p>

            <form onSubmit={handleReassign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nuevo Consolidador Responsable
                </label>
                <select
                  value={targetConsolidatorId}
                  onChange={(e) => setTargetConsolidatorId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  {consolidators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.alias}) — {c.rol}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassigningMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Confirmar Reasignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Ficha de Miembro */}
      <MemberProfileModal
        member={selectedMemberForModal}
        onClose={() => setSelectedMemberForModal(null)}
      />
    </div>
  );
};
