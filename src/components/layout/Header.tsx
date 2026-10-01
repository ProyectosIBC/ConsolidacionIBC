import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import {
  Plus,
  ExternalLink,
  Bot,
  HeartHandshake,
  Coins,
  UserCheck,
  Shield,
  Users,
  Code2,
  LogOut,
  Menu,
  Bell,
} from 'lucide-react';
import { NotificationsDrawer } from '../common/NotificationsDrawer';

interface HeaderProps {
  onOpenNewMemberModal: () => void;
  onOpenNewCounselingModal: () => void;
  onOpenNewDonationModal: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewMemberModal,
  onOpenNewCounselingModal,
  onOpenNewDonationModal,
  onToggleMobileMenu,
}) => {
  const {
    currentView,
    setCurrentView,
    activeProfile,
    setActiveProfile,
    activeUserProfile,
    activeRole,
    userProfiles,
    consolidators,
    permissions,
    logout,
    notifications,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(
    (n) => (n.destinatarioPerfilId === activeProfile || n.destinatarioPerfilId === 'todos') && !n.leida
  ).length;

  const viewTitles: Record<AppView, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Resumen Gerencial del Pastor',
      subtitle: 'Métricas clave, urgencias y compromisos de atención programados para hoy en la IBC Bogotá.',
    },
    kanban: {
      title: 'Consolidación de Miembros (Kanban)',
      subtitle: 'Acompañamiento en el ciclo de 8 semanas, alertas de inactividad y asignación por consolidador.',
    },
    counseling: {
      title: 'Consejería Pastoral y Tiempos de Atención',
      subtitle: 'Supervisión en tiempo real con semáforo: Alta (6h), Media (24h) y Baja (24h).',
    },
    schedule: {
      title: 'Cronograma Semanal y Plantillas',
      subtitle: 'Protocolos de Lunes, Miércoles y Viernes con las plantillas de ausentes y frecuentes.',
    },
    generator: {
      title: 'Generador de Mensajes IBC Bogotá',
      subtitle: 'Plantillas oficiales de contacto por WhatsApp, correo y teléfono.',
    },
    donations: {
      title: 'Libro Contable de Ofrendas y Diezmos',
      subtitle: 'Registro de aportes, auditoría de transferencias y visualizador de comprobantes.',
    },
    'public-portal': {
      title: 'Portal de Formularios Congregacionales',
      subtitle: 'Formularios públicos para visitantes dominicales, consejería y reporte de donaciones.',
    },
    database: {
      title: 'Estructura de Base de Datos y Supabase',
      subtitle: 'Esquema PostgreSQL DDL, triggers de atención y guía de integración.',
    },
    'telegram-automation': {
      title: 'Automatización y Contenidos de Telegram',
      subtitle: 'Repositorio de plantillas pastorales, YouTube Shorts y envío automático.',
    },
    settings: {
      title: 'Ajustes del Sistema y Telegram Bot',
      subtitle: 'Configuración del canal de alertas, WhatsApp de la iglesia y copias de seguridad.',
    },
  };

  const getHeaderInfo = () => {
    if (currentView === 'dashboard') {
      if (activeRole === 'consolidador') {
        return {
          title: `Mi Panel de Consolidación — ${activeUserProfile.nombre}`,
          subtitle: 'Acompañamiento personalizado de tus hermanos asignados y avance en la ruta de 6 pasos.',
        };
      }
      if (activeRole === 'desarrollador') {
        return {
          title: 'Panel de Administración y DevOps',
          subtitle: 'Monitoreo de infraestructura, base de datos Supabase y registros del sistema.',
        };
      }
      return {
        title: 'Resumen Gerencial del Pastor',
        subtitle: 'Métricas clave, urgencias y compromisos de atención programados para hoy en la IBC Bogotá.',
      };
    }
    return viewTitles[currentView] || {
      title: 'Iglesia Bautista Central',
      subtitle: 'Bogotá, Colombia',
    };
  };

  const current = getHeaderInfo();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
            title="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">{current.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{current.subtitle}</p>
          </div>
        </div>

        {/* Action Controls & Profile Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* PERFIL AISLADO DE SESIÓN (IDENTIDAD AUTENTICADA BLOQUEADA) */}
          {activeRole === 'desarrollador' ? (
            /* El perfil Desarrollador cuenta con selector para pruebas técnicas DevOps */
            <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 p-1 rounded-xl shadow-2xs">
              <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-bold text-amber-800">
                <Code2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Simular Rol:</span>
              </div>
              <select
                value={activeProfile}
                onChange={(e) => setActiveProfile(e.target.value)}
                className="text-xs font-bold py-1 px-2.5 rounded-lg bg-white border border-amber-200 text-amber-900 shadow-2xs focus:outline-none cursor-pointer max-w-[180px] sm:max-w-none"
              >
                <optgroup label="🕊️ Liderazgo Pastoral">
                  <option value="pastor">Pastor Edgar (Pastor Principal)</option>
                </optgroup>
                <optgroup label="🤝 Equipo de Consolidadores">
                  <option value="cons-1">Martha Cecilia Gómez (Consolidador 1)</option>
                  <option value="cons-2">Andrés Felipe Pardo (Consolidador 2)</option>
                  <option value="cons-3">Viviana Torres Mora (Consolidador 3)</option>
                </optgroup>
                <optgroup label="💻 Administración & DevOps">
                  <option value="dev">Desarrollador (Proyectos IBC)</option>
                </optgroup>
              </select>
            </div>
          ) : (
            /* Para Pastor y Consolidadores: PERFIL ESTRICTAMENTE AISLADO A SU CUENTA */
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  activeRole === 'pastor'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {activeRole === 'pastor' ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-slate-800 leading-tight">
                  {activeUserProfile.nombre}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold leading-tight">
                  {activeUserProfile.rolLabel}
                </span>
              </div>
            </div>
          )}

          {/* BOTÓN DE NOTIFICACIONES Y MENSAJES PARA CADA PERFIL */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Abrir buzón de notificaciones y mensajes del perfil"
          >
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] leading-none animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Telegram Status indicator (Solo Pastor y Desarrollador) */}
          {(activeRole === 'pastor' || activeRole === 'desarrollador') && (
            <div
              onClick={() => setCurrentView('settings')}
              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-medium text-sky-700 transition-colors"
              title="Bot de Telegram conectado"
            >
              <Bot className="w-3.5 h-3.5 text-sky-600" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          )}

          {/* Quick Action Button */}
          {currentView === 'kanban' && (
            <button
              onClick={onOpenNewMemberModal}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo Miembro</span>
            </button>
          )}

          {currentView === 'counseling' && (
            <button
              onClick={onOpenNewCounselingModal}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nueva Consejería</span>
            </button>
          )}

          {currentView === 'donations' && (
            <button
              onClick={onOpenNewDonationModal}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Registrar Ofrenda</span>
            </button>
          )}

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawer de Notificaciones y Mensajes por Perfil */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </header>
  );
};
