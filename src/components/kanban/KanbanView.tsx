import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FollowUpStatus, Member, MemberType } from '../../types';
import { ROADMAP_STEPS } from '../../data/roadmapData';
import {
  MessageCircle,
  Phone,
  ArrowRight,
  MoreVertical,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Car,
  User,
  ExternalLink,
  ChevronDown,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { generarEnlaceWhatsApp, personalizarMensaje } from '../../lib/whatsappUtils';
import { TEMPLATES_DATA } from '../../data/templatesData';
import { MemberProfileModal } from '../common/MemberProfileModal';

const KANBAN_COLUMNS: { id: FollowUpStatus; title: string; color: string; badgeBg: string }[] = [
  {
    id: 'Nuevo',
    title: '1. Nuevo',
    color: 'border-t-blue-500 bg-blue-50/20',
    badgeBg: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'En seguimiento',
    title: '2. En Seguimiento',
    color: 'border-t-indigo-500 bg-indigo-50/20',
    badgeBg: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'Necesita atención',
    title: '3. Requiere Atención',
    color: 'border-t-amber-500 bg-amber-50/30',
    badgeBg: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'Consejería activa',
    title: '4. Consejería Activa',
    color: 'border-t-rose-500 bg-rose-50/20',
    badgeBg: 'bg-rose-100 text-rose-800',
  },
  {
    id: 'Integrado',
    title: '5. Integrado',
    color: 'border-t-emerald-500 bg-emerald-50/20',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
];

interface KanbanViewProps {
  onOpenNewMemberModal: () => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ onOpenNewMemberModal }) => {
  const {
    members,
    changeMemberStatus,
    advanceMemberWeek,
    registerContactAttempt,
    config,
    activeProfile,
    currentConsolidator,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [scopeFilter, setScopeFilter] = useState<'mis_asignados' | 'todos'>(
    activeProfile !== 'pastor' ? 'mis_asignados' : 'todos'
  );
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<Member | null>(null);

  // Filtrado interactivo
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.telefono.includes(searchTerm) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'todos' || m.tipo === filterType;

    const matchesScope =
      activeProfile === 'pastor' || activeProfile === 'dev'
        ? (scopeFilter === 'todos' || m.consolidadorId === activeProfile)
        : m.consolidadorId === activeProfile;

    return matchesSearch && matchesType && matchesScope;
  });

  // Obtener plantilla correspondiente a la semana de consolidación
  const getWeeklyMessage = (member: Member) => {
    const template = TEMPLATES_DATA.find(
      (t) => t.id === `ciclo-sem-${member.semanaActual}`
    );
    const body = template
      ? template.cuerpo
      : '¡Hola [Nombre]! Te saludamos con gozo de la Iglesia Bautista Central.';
    return personalizarMensaje(body, {
      nombre: member.nombre,
      iglesia: config.nombreIglesia,
      tuNombre: member.consolidadorNombre.split('(')[0].trim() || config.pastorNombre,
    });
  };

  const myAssignedCount = members.filter((m) => m.consolidadorId === activeProfile).length;

  return (
    <div className="space-y-4">
      {/* Controles y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center flex-1 gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Selector de Ámbito solo para Pastor y Desarrollador */}
          {(activeProfile === 'pastor' || activeProfile === 'dev') ? (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setScopeFilter('todos')}
                className={`px-3 py-1 rounded-md transition-all ${
                  scopeFilter === 'todos'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toda la Iglesia ({members.length})
              </button>
              <button
                onClick={() => setScopeFilter('mis_asignados')}
                className={`px-3 py-1 rounded-md transition-all ${
                  scopeFilter === 'mis_asignados'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mis Asignados ({myAssignedCount})
              </button>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Mis Asignados ({myAssignedCount})</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Tipo:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="todos">Todos los Tipos</option>
            <option value="Visitante Nuevo">Visitante Nuevo</option>
            <option value="Ausente">Ausente</option>
            <option value="Miembro Frecuente">Miembro Frecuente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Integrado">Integrado</option>
          </select>

          <button
            onClick={onOpenNewMemberModal}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            + Registrar Persona
          </button>
        </div>
      </div>

      {/* Banner Informativo con Perfil Activo */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
            IBC
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Protocolo de Acompañamiento y Ruta de Crecimiento
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Haz clic en <b>"Ver Ruta & Expediente"</b> en cualquier tarjeta para ver los 6 pasos hacia el servicio activo.
            </p>
          </div>
        </div>

        {activeProfile !== 'pastor' && currentConsolidator && (
          <div className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Viendo asignaciones de: {currentConsolidator.alias}</span>
          </div>
        )}
      </div>

      {/* Tablero Kanban (5 Columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colMembers = filteredMembers.filter(
            (m) => m.estadoSeguimiento === col.id
          );

          return (
            <div
              key={col.id}
              className={`rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col min-h-[540px]`}
            >
              {/* Header de Columna */}
              <div className={`p-3.5 border-b border-slate-100 border-t-4 ${col.color} flex items-center justify-between`}>
                <h3 className="font-bold text-xs text-slate-800 tracking-tight">{col.title}</h3>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                  {colMembers.length}
                </span>
              </div>

              {/* Lista de Tarjetas */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[680px]">
                {colMembers.length === 0 ? (
                  <div className="py-12 text-center text-slate-300 text-xs font-medium">
                    Sin personas en esta columna
                  </div>
                ) : (
                  colMembers.map((member) => {
                    const messageText = getWeeklyMessage(member);
                    const whatsappUrl = member.telefono
                      ? generarEnlaceWhatsApp(member.telefono, messageText, config.prefijoPais)
                      : '#';

                    const isEscalated = member.estadoSeguimiento === 'Necesita atención';
                    const stepInfo = ROADMAP_STEPS.find((s) => s.paso === member.pasoActualRuta);

                    return (
                      <div
                        key={member.id}
                        className={`p-3.5 rounded-2xl border bg-white shadow-2xs hover:shadow-xs transition-all relative ${
                          isEscalated
                            ? 'border-amber-300 bg-amber-50/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Tipo y Semana */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              member.tipo === 'Ausente'
                                ? 'bg-rose-100 text-rose-700'
                                : member.tipo === 'Visitante Nuevo'
                                ? 'bg-blue-100 text-blue-700'
                                : member.tipo === 'Miembro Frecuente'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {member.tipo}
                          </span>

                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            Sem {member.semanaActual}/8
                          </span>
                        </div>

                        {/* Nombre del Miembro */}
                        <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                          {member.nombre}
                        </h4>

                        {/* Teléfono */}
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{member.telefono || 'Sin teléfono'}</span>
                        </p>

                        {/* Consolidador Asignado */}
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{member.consolidadorNombre}</span>
                        </div>

                        {/* Paso en la Ruta hacia el Servicio */}
                        <div className="mt-1.5 flex items-center justify-between text-[10px] bg-blue-50/60 text-blue-900 px-2 py-1 rounded-md border border-blue-100">
                          <span className="font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            Paso {member.pasoActualRuta}/6:
                          </span>
                          <span className="font-medium truncate max-w-[120px]">
                            {stepInfo ? stepInfo.titulo : 'Bienvenida'}
                          </span>
                        </div>

                        {/* Indicador de Transporte si aplica */}
                        {member.necesitaTransporte && (
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            <Car className="w-3 h-3 text-amber-700" />
                            <span>Requiere Transporte</span>
                          </div>
                        )}

                        {/* Botón Ver Ruta Completa & Expediente */}
                        <button
                          onClick={() => setSelectedMemberForModal(member)}
                          className="w-full mt-2.5 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>Ver Ruta & Expediente</span>
                        </button>

                        {/* Acciones Rápidas de la Tarjeta */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          {/* Botón WhatsApp */}
                          {member.telefono ? (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => registerContactAttempt(member.id)}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                              title={`Enviar mensaje de Semana ${member.semanaActual}`}
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Sem {member.semanaActual}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Sin WhatsApp</span>
                          )}

                          {/* Botón Avanzar Semana (+1) */}
                          {member.estadoSeguimiento !== 'Integrado' && (
                            <button
                              onClick={() => advanceMemberWeek(member.id)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors text-[10px] font-bold shrink-0"
                              title="Avanzar semana de consolidación"
                            >
                              +1 Sem
                            </button>
                          )}
                        </div>

                        {/* Selector para cambiar de Columna */}
                        <div className="mt-1.5">
                          <select
                            value={member.estadoSeguimiento}
                            onChange={(e) => changeMemberStatus(member.id, e.target.value as FollowUpStatus)}
                            className="w-full text-[10px] py-1 px-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
                          >
                            <option value="Nuevo">Mover: 1. Nuevo</option>
                            <option value="En seguimiento">Mover: 2. En seguimiento</option>
                            <option value="Necesita atención">Mover: 3. Requiere atención</option>
                            <option value="Consejería activa">Mover: 4. Consejería activa</option>
                            <option value="Integrado">Mover: 5. Integrado 🎉</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de la Ruta Visual de Crecimiento & Expediente */}
      <MemberProfileModal
        member={selectedMemberForModal}
        onClose={() => setSelectedMemberForModal(null)}
      />
    </div>
  );
};
