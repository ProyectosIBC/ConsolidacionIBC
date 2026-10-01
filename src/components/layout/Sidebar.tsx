import React from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { IBCLogo } from '../common/IBCLogo';
import {
  LayoutDashboard,
  KanbanSquare,
  HeartHandshake,
  CalendarDays,
  Coins,
  FileCode2,
  Settings,
  ExternalLink,
  Church,
  AlertTriangle,
  Clock,
  Sparkles,
  Code2,
  Shield,
  UserCheck,
  Bot,
  X,
  BookOpen,
  Award,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const {
    currentView,
    setCurrentView,
    counseling,
    members,
    getTiempoAtencionStatus,
    activeProfile,
    activeUserProfile,
    activeRole,
    permissions,
  } = useApp();

  // Contadores de alertas
  const urgentCounselingCount = counseling.filter(
    (c) => c.estado !== 'Cerrada' && (getTiempoAtencionStatus(c).status === 'breached' || c.urgencia === 'Alta')
  ).length;

  const escalatedMembersCount = members.filter(
    (m) => m.estadoSeguimiento === 'Necesita atención'
  ).length;

  // Lista de navegación según permisos de perfil
  const allNavItems: {
    id: AppView;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    visible: boolean;
    section: 'main' | 'system';
  }[] = [
    {
      id: 'dashboard',
      label: activeRole === 'pastor' ? 'Resumen Gerencial' : activeRole === 'desarrollador' ? 'Panel de Control' : 'Mi Resumen Fraterno',
      icon: LayoutDashboard,
      visible: true,
      section: 'main',
    },
    {
      id: 'kanban',
      label: 'Sistema de Consolidación',
      icon: KanbanSquare,
      badge: escalatedMembersCount > 0 ? escalatedMembersCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      visible: true,
      section: 'main',
    },
    {
      id: 'counseling',
      label: 'Consejería Pastoral',
      icon: HeartHandshake,
      badge: urgentCounselingCount > 0 ? urgentCounselingCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      visible: permissions.puedeGestionarConsejeria || activeRole === 'pastor' || activeRole === 'desarrollador',
      section: 'main',
    },
    {
      id: 'schedule',
      label: 'Cronograma y Mensajes',
      icon: CalendarDays,
      visible: true,
      section: 'main',
    },
    {
      id: 'donations',
      label: 'Ofrendas y Donaciones',
      icon: Coins,
      visible: permissions.puedeVerOfrendas,
      section: 'main',
    },
    {
      id: 'discipleship',
      label: 'Discipulado (Nuevos Creyentes)',
      icon: BookOpen,
      visible: true,
      section: 'main',
    },
    {
      id: 'ministry-consolidation',
      label: 'Consolidado Ministerial',
      icon: Award,
      visible: activeRole === 'pastor' || activeRole === 'desarrollador',
      section: 'main',
    },
    {
      id: 'public-portal',
      label: 'Portal Público (Fichas)',
      icon: ExternalLink,
      visible: true,
      section: 'system',
    },
    {
      id: 'database',
      label: 'Base de Datos (Supabase)',
      icon: FileCode2,
      visible: permissions.puedeAccederBaseDatos,
      section: 'system',
    },
    {
      id: 'telegram-automation',
      label: 'Automatización Telegram',
      icon: Bot,
      visible: activeRole === 'pastor' || activeRole === 'desarrollador',
      section: 'system',
    },
    {
      id: 'settings',
      label: 'Ajustes y Telegram',
      icon: Settings,
      visible: permissions.puedeAccederAjustesTecnicos,
      section: 'system',
    },
  ];

  const mainItems = allNavItems.filter((item) => item.visible && item.section === 'main');
  const systemItems = allNavItems.filter((item) => item.visible && item.section === 'system');

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IBCLogo size="md" />
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              IBC Bogotá
            </h1>
            <p className="text-[11px] text-blue-300/90 font-medium italic">Donde el amor hace la diferencia</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="px-5 pt-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-[11px] text-indigo-300 font-medium">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Capa Gratuita · Costo $0/mes</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Módulos Pastorales
        </div>
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-blue-500 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Herramientas y Sistema
        </div>
        {systemItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
            {activeUserProfile.nombre.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{activeUserProfile.nombre}</h4>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {activeUserProfile.rolLabel}
            </p>
          </div>
        </div>

        {activeRole === 'desarrollador' && (
          <div className="mt-2.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-mono flex items-center justify-between">
            <span>MODO DEVOPS ACTIVO</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          </div>
        )}

        {urgentCounselingCount > 0 && activeRole !== 'consolidador' && (
          <div className="mt-2.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{urgentCounselingCount} consejería(s) pendientes</span>
          </div>
        )}
      </div>
    </aside>
  );
};
