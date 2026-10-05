import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
  PhoneCall,
  Send,
  UserCheck,
  Shield,
  Sparkles,
  HeartHandshake,
  Bot,
  X,
  Mail,
  Users,
  Calendar,
} from 'lucide-react';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';
import { AppNotification } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendTeamMessage,
    activeProfile,
    activeUserProfile,
    activeRole,
    userProfiles,
    setCurrentView,
  } = useApp();

  const [filterTab, setFilterTab] = useState<'todas' | 'no_leidas' | 'proxima_semana' | 'mensajes'>('todas');
  const [isComposing, setIsComposing] = useState(false);
  const [destinatarioId, setDestinatarioId] = useState('pastor');
  const [mensajeTitulo, setMensajeTitulo] = useState('');
  const [mensajeTexto, setMensajeTexto] = useState('');

  if (!isOpen) return null;

  // Filtrar notificaciones pertenecientes a este perfil o a 'todos'
  const myNotifications = notifications.filter(
    (n) => n.destinatarioPerfilId === activeProfile || n.destinatarioPerfilId === 'todos'
  );

  const unreadCount = myNotifications.filter((n) => !n.leida).length;
  const teamMessagesCount = myNotifications.filter((n) => n.tipo === 'mensaje_equipo').length;
  const nextWeekCount = myNotifications.filter(
    (n) => n.id.startsWith('sched-') || n.titulo.includes('Programado') || n.titulo.includes('Próxima Semana')
  ).length;

  const filtered = myNotifications.filter((n) => {
    if (filterTab === 'no_leidas') return !n.leida;
    if (filterTab === 'mensajes') return n.tipo === 'mensaje_equipo';
    if (filterTab === 'proxima_semana') {
      return n.id.startsWith('sched-') || n.titulo.includes('Programado') || n.titulo.includes('Próxima Semana');
    }
    return true;
  });

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensajeTitulo.trim() || !mensajeTexto.trim()) return;

    sendTeamMessage(destinatarioId, mensajeTitulo.trim(), mensajeTexto.trim());
    setMensajeTitulo('');
    setMensajeTexto('');
    setIsComposing(false);
  };

  const getNotificationIcon = (tipo: AppNotification['tipo']) => {
    switch (tipo) {
      case 'consejeria':
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      case 'miembro':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'mensaje_equipo':
        return <MessageCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Bot className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in-20">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header del Buzón */}
        <div className="p-5 border-b border-slate-200 space-y-3 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Buzón de Notificaciones
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {activeUserProfile.nombre} ({activeUserProfile.rolLabel})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de estado y marcar leídas */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>
                {unreadCount === 0
                  ? 'Buzón al día (0 no leídas)'
                  : `${unreadCount} ${unreadCount === 1 ? 'notificación pendiente' : 'notificaciones pendientes'}`}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(activeProfile)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Tabs de Filtro */}
          <div className="grid grid-cols-4 gap-1 bg-slate-200/70 p-1 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setFilterTab('todas')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                filterTab === 'todas' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Todas ({myNotifications.length})
            </button>
            <button
              onClick={() => setFilterTab('no_leidas')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                filterTab === 'no_leidas' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              No leídas ({unreadCount})
            </button>
            <button
              onClick={() => setFilterTab('proxima_semana')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                filterTab === 'proxima_semana' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Próx. Sem. ({nextWeekCount})
            </button>
            <button
              onClick={() => setFilterTab('mensajes')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                filterTab === 'mensajes' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Equipo ({teamMessagesCount})
            </button>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Formulario de Redactar Mensaje al Equipo (desplegable) */}
          {isComposing ? (
            <form onSubmit={handleSendCompose} className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-purple-100">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>Enviar Mensaje al Equipo</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Para:</label>
                <select
                  value={destinatarioId}
                  onChange={(e) => setDestinatarioId(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-purple-200 bg-white font-bold"
                >
                  {userProfiles
                    .filter((p) => p.id !== activeProfile)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.rolLabel})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Asunto:</label>
                <input
                  type="text"
                  required
                  value={mensajeTitulo}
                  onChange={(e) => setMensajeTitulo(e.target.value)}
                  placeholder="Ej. Saludo pastoral o aviso de llamada"
                  className="w-full text-xs p-2 rounded-xl border border-purple-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mensaje:</label>
                <textarea
                  rows={2}
                  required
                  value={mensajeTexto}
                  onChange={(e) => setMensajeTexto(e.target.value)}
                  placeholder="Escribe el mensaje fraterno..."
                  className="w-full text-xs p-2 rounded-xl border border-purple-200 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsComposing(true)}
              className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-purple-600" />
              <span>+ Enviar Mensaje a otro Miembro del Equipo</span>
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
              <p className="text-xs font-bold text-slate-700">No hay notificaciones en este filtro</p>
              <p className="text-[11px] text-slate-400">Todas las alertas y mensajes están al día.</p>
            </div>
          ) : (
            filtered.map((notif) => {
              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    !notif.leida
                      ? 'border-blue-300 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                        {getNotificationIcon(notif.tipo)}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                          {notif.titulo}
                        </h4>
                        {notif.remitenteNombre && (
                          <p className="text-[10px] text-slate-500">De: {notif.remitenteNombre}</p>
                        )}
                      </div>
                    </div>

                    {!notif.leida && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{notif.mensaje}</p>

                  {/* Detalle de Disponibilidad u Horario */}
                  {notif.disponibilidad && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[11px]">
                      <span>Horario preferido: {notif.disponibilidad}</span>
                    </div>
                  )}

                  {/* Acciones directas (Llamar / WhatsApp / Marcar Leída) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {notif.telefono && (
                        <>
                          <a
                            href={`tel:${notif.telefono}`}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-2xs"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Llamar</span>
                          </a>

                          <a
                            href={generarEnlaceWhatsApp(
                              notif.telefono,
                              `¡Hola! Te saludo de parte de la Iglesia Bautista Central de Bogotá.`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </>
                      )}

                      {notif.tipo === 'consejeria' && (
                        <button
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            onClose();
                            setCurrentView('counseling');
                          }}
                          className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                        >
                          Ver Consejerías →
                        </button>
                      )}

                      {notif.tipo === 'miembro' && (
                        <button
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            onClose();
                            setCurrentView('kanban');
                          }}
                          className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          Ver Kanban →
                        </button>
                      )}
                    </div>

                    {!notif.leida ? (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
                      >
                        Marcar leída
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Leída ✓</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer del Drawer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium">
            Notificaciones sincronizadas con Telegram & CRM
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
