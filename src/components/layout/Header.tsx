import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { IBCLogo } from '../common/IBCLogo';
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
    consolidators: {
      title: 'Consolidadores y Discipuladores (6 Líderes Activos)',
      subtitle: 'Directorio de los 3 consolidadores y 3 discipuladores activos, credenciales, asignados y seguimiento.',
    },
    counseling: {
      title: 'Consejería Pastoral y Tiempos de Atención',
      subtitle: 'Supervisión en tiempo real con semáforo: Alta (6h), Media (24h) y Baja (24h).',
    },
    'counseling-calendar': {
      title: 'Calendario Mensual de Consejería Pastoral',
      subtitle: 'Agenda interactiva de citas, franjas horarias pastorales y confirmaciones directas por WhatsApp.',
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
    discipleship: {
      title: 'Discipulado: Libro Nuevos Creyentes (13 Lecciones)',
      subtitle: 'Acompañamiento semanal virtual o presencial guiado por discipuladores.',
    },
    'ministry-consolidation': {
      title: 'Consolidado Ministerial del Pastor',
      subtitle: 'Hermanos graduados de discipulado listos para colocación en ministerios según su interés.',
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
    'alerts-config': {
      title: 'Configuración de Alertas & Diagnóstico',
      subtitle: 'Personaliza los días de disparo de avisos, cronograma de consejería y verifica la salud de la app.',
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
    <header className="bg-[#faf8f1] border-b border-[#e8e2d5] sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-[#f4efe4] text-[#46543c] hover:bg-[#ede5d6] cursor-pointer"
            title="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
          <IBCLogo size="sm" className="lg:hidden" />
          <div>
            <h2 className="font-serif-fraunces text-base sm:text-lg font-bold text-[#332921] tracking-tight">{current.title}</h2>
            <p className="text-xs text-[#6b5a4d] mt-0.5 line-clamp-1">{current.subtitle}</p>
          </div>
        </div>

        {/* Action Controls & Profile Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* PERFIL AISLADO DE SESIÓN (IDENTIDAD AUTENTICADA BLOQUEADA) */}
          {activeRole === 'desarrollador' ? (
            /* El perfil Desarrollador cuenta con selector para pruebas técnicas DevOps */
            <div className="flex items-center gap-1.5 bg-[#f4efe4] border border-[#e8e2d5] p-1 rounded-xl shadow-2xs">
              <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-bold text-[#46543c] font-mono-space">
                <Code2 className="w-3.5 h-3.5 text-[#bd5c3f]" />
                <span>Simular Rol:</span>
              </div>
              <select
                value={activeProfile}
                onChange={(e) => setActiveProfile(e.target.value)}
                className="text-xs font-bold py-1 px-2.5 rounded-lg bg-white border border-[#e8e2d5] text-[#332921] shadow-2xs focus:outline-none cursor-pointer max-w-[180px] sm:max-w-none"
              >
                <optgroup label="🕊️ Liderazgo Pastoral">
                  <option value="pastor">Pastor Edgar Castaño (Pastor Principal)</option>
                </optgroup>
                <optgroup label="🤝 Equipo de Consolidadores">
                  <option value="cons-1">Martha Cecilia Gómez (Consolidador 1)</option>
                  <option value="cons-2">Andrés Felipe Pardo (Consolidador 2)</option>
                  <option value="cons-3">Viviana Torres Mora (Consolidador 3)</option>
                </optgroup>
                <optgroup label="📖 Equipo de Discipuladores">
                  <option value="disc-1">Samuel Esteban Silva (Discipulador 1)</option>
                  <option value="disc-2">Claudia Milena Roa (Discipuladora 2)</option>
                  <option value="disc-3">David Camilo Robles (Discipulador 3)</option>
                </optgroup>
                <optgroup label="💻 Administración & DevOps">
                  <option value="dev">Desarrollador (Proyectos IBC)</option>
                </optgroup>
              </select>
            </div>
          ) : (
            /* Para Pastor y Consolidadores: PERFIL ESTRICTAMENTE AISLADO A SU CUENTA */
            <button
              onClick={() => setCurrentView('consolidators')}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#f4efe4] hover:bg-[#ede5d6] border border-[#e8e2d5] rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Ver perfiles y equipo de consolidadores"
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  activeRole === 'pastor'
                    ? 'bg-[#46543c] text-white'
                    : 'bg-[#a9bb9e] text-[#283322]'
                }`}
              >
                {activeRole === 'pastor' ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-[#332921] leading-tight font-serif-fraunces">
                  {activeUserProfile.nombre}
                </span>
                <span className="text-[10px] text-[#6b5a4d] font-semibold leading-tight">
                  {activeUserProfile.rolLabel} • Ver Perfiles
                </span>
              </div>
            </button>
          )}

          {/* BOTÓN DE NOTIFICACIONES Y MENSAJES PARA CADA PERFIL */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative px-3 py-1.5 rounded-xl bg-[#f4efe4] hover:bg-[#ede5d6] border border-[#e8e2d5] text-[#332921] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Abrir buzón de notificaciones y mensajes del perfil"
          >
            <Bell className="w-3.5 h-3.5 text-[#bd5c3f]" />
            <span className="hidden sm:inline">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#bd5c3f] text-white font-black text-[10px] leading-none animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Telegram Status indicator (Solo Pastor y Desarrollador) */}
          {(activeRole === 'pastor' || activeRole === 'desarrollador') && (
            <div
              onClick={() => setCurrentView('alerts-config')}
              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#edf3eb] hover:bg-[#dfecdd] border border-[#a9bb9e]/60 text-xs font-medium text-[#46543c] transition-colors"
              title="Canal de Telegram"
            >
              <Bot className="w-3.5 h-3.5 text-[#46543c]" />
              <span className="w-2 h-2 rounded-full bg-[#46543c] animate-pulse"></span>
            </div>
          )}

          {/* Quick Action Button */}
          {currentView === 'kanban' && (
            <button
              onClick={onOpenNewMemberModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#bd5c3f] text-white hover:bg-[#a54b30] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shadow-[#bd5c3f]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo Miembro</span>
            </button>
          )}

          {currentView === 'counseling' && (
            <button
              onClick={onOpenNewCounselingModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#bd5c3f] text-white hover:bg-[#a54b30] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shadow-[#bd5c3f]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nueva Consejería</span>
            </button>
          )}

          {currentView === 'donations' && (
            <button
              onClick={onOpenNewDonationModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#46543c] text-white hover:bg-[#35402e] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shadow-[#46543c]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Registrar Ofrenda</span>
            </button>
          )}

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-[#f4efe4] text-[#6b5a4d] hover:bg-[#f3ddd2] hover:text-[#bd5c3f] transition-colors cursor-pointer"
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
