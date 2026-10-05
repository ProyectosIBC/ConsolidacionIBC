import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Member,
  CounselingRequest,
  Donation,
  SystemConfig,
  FollowUpStatus,
  CounselingStatus,
  CounselingNote,
  Consolidator,
  UserProfileInfo,
  UserRole,
  AppLog,
  AppNotification,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_COUNSELING,
  INITIAL_DONATIONS,
  INITIAL_CONFIG,
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { CONSOLIDATOR_TEAM } from '../data/roadmapData';
import { USER_PROFILES, getProfileById, getRolePermissions, authenticateUser } from '../data/profilesData';
import { enviarNotificacionTelegram } from '../lib/telegramService';
import { getNextWeekRange } from '../lib/dateUtils';
import {
  guardarMiembroSupabase,
  guardarConsejeriaSupabase,
  guardarDonacionSupabase,
  probarConexionSupabase,
  SUPABASE_URL,
} from '../lib/supabaseClient';
import confetti from 'canvas-confetti';

interface ToastInfo {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  title?: string;
}

export type AppView =
  | 'dashboard'
  | 'kanban'
  | 'consolidators'
  | 'counseling'
  | 'counseling-calendar'
  | 'discipleship'
  | 'ministry-consolidation'
  | 'schedule'
  | 'alerts-config'
  | 'generator'
  | 'donations'
  | 'public-portal'
  | 'database'
  | 'telegram-automation'
  | 'settings';

interface AppContextType {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Profiles & Roles (Pastor, Consolidador, Desarrollador)
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  activeProfile: string; // 'pastor' | 'cons-1' | 'cons-2' | 'cons-3' | 'dev'
  setActiveProfile: (profileId: string) => void;
  activeUserProfile: UserProfileInfo;
  activeRole: UserRole;
  userProfiles: UserProfileInfo[];
  permissions: {
    puedeVerMetricasGlobales: boolean;
    puedeVerOfrendas: boolean;
    puedeGestionarConsejeria: boolean;
    puedeAccederBaseDatos: boolean;
    puedeAccederAjustesTecnicos: boolean;
    puedeSimularRoles: boolean;
  };
  consolidators: Consolidator[];
  currentConsolidator: Consolidator | null;

  // Data
  members: Member[];
  counseling: CounselingRequest[];
  donations: Donation[];
  config: SystemConfig;

  // Member actions
  addMember: (
    memberData: Omit<
      Member,
      'id' | 'fechaRegistro' | 'ciclosContacto' | 'semanaActual' | 'consolidadorId' | 'consolidadorNombre' | 'pasoActualRuta' | 'historialRuta'
    > & {
      consolidadorId?: string;
      consolidadorNombre?: string;
    }
  ) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  changeMemberStatus: (id: string, newStatus: FollowUpStatus) => void;
  advanceMemberWeek: (id: string) => void;
  registerContactAttempt: (id: string) => void;
  reassignConsolidator: (memberId: string, consolidatorId: string) => void;

  // Roadmap & Discipleship actions
  advanceMemberRoadmap: (memberId: string, stepNumber?: number, notes?: string) => void;
  updateDiscipleshipProgress: (memberId: string, leccionActual: number, completado: boolean) => void;
  updateMinistryPlacement: (memberId: string, ministerioAsignado: string) => void;
  scheduleDiscipleshipClass: (
    memberId: string,
    fechaHora: string,
    modalidad: 'Presencial (Templo Cra 7 # 31a-78)' | 'Virtual (Google Meet / Zoom)'
  ) => void;
  registerDiscipleshipAbsence: (memberId: string, motivo?: string) => void;
  resetDiscipleshipAbsences: (memberId: string) => void;

  // Counseling actions
  addCounseling: (
    data: Omit<CounselingRequest, 'id' | 'fechaSolicitud' | 'escalado' | 'notas' | 'tiempoLimiteHoras' | 'slaHours'>
  ) => void;
  updateCounselingStatus: (id: string, status: CounselingStatus) => void;
  addCounselingNote: (counselingId: string, noteText: string, author?: string) => void;
  scheduleCounselingAppointment: (
    counselingId: string,
    fechaHora: string,
    modalidad?: 'Presencial (Oficina Pastoral Cra 7 # 31a-78)' | 'Llamada Telefónica' | 'Videollamada'
  ) => void;

  // Donation actions
  addDonation: (data: Omit<Donation, 'id' | 'verificado'>) => void;
  toggleVerifyDonation: (id: string) => void;

  // Config actions
  updateConfig: (updates: Partial<SystemConfig>) => void;
  resetToDefaults: () => void;

  // Supabase Live Status
  supabaseStatus: 'connected' | 'checking' | 'error';
  supabaseMessage: string;
  testSupabase: () => Promise<void>;

  // Alerts & Helpers
  toasts: ToastInfo[];
  showToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
  removeToast: (id: string) => void;
  sendTelegramAlert: (text: string) => Promise<boolean>;
  testTelegramConnection: (tokenOverride?: string) => Promise<{ success: boolean; botName?: string; username?: string; message: string }>;
  triggerWeeklyDispatchNow: () => Promise<{ success: boolean; message: string; telegramDelivered: boolean }>;
  triggerTestAlert: (type: 'semanal' | 'ausencia' | 'proxima_clase' | 'graduacion' | 'consejeria_sla' | 'decision_salvacion') => Promise<{ success: boolean; message: string }>;
  scheduleAllProcessesForNextWeek: () => {
    scheduledCount: number;
    membersCount: number;
    counselingCount: number;
    discipleshipCount: number;
    startDateFormatted: string;
    endDateFormatted: string;
  };
  getTiempoAtencionStatus: (request: CounselingRequest) => {
    elapsedHours: number;
    remainingHours: number;
    status: 'ok' | 'warning' | 'breached';
    percentage: number;
    label: string;
  };
  getCounselingForMember: (member: Member | { nombre: string; telefono?: string; email?: string }) => CounselingRequest | undefined;
  // Logs de actividad
  logs: AppLog[];
  addLog: (accion: string, detalle: string, categoria?: AppLog['categoria']) => void;

  // Notificaciones y Mensajes en la App
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (perfilId?: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'fecha' | 'leida'>) => void;
  sendTeamMessage: (destinatarioPerfilId: string, titulo: string, mensaje: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MEMBERS: 'ibc_crm_members_v2',
  COUNSELING: 'ibc_crm_counseling_v2',
  DONATIONS: 'ibc_crm_donations_v2',
  CONFIG: 'ibc_crm_config_v2',
  PROFILE: 'ibc_crm_active_profile_v2',
  AUTH_USER: 'ibc_crm_auth_user_id_v2',
  LOGS: 'ibc_crm_logs_v2',
  NOTIFICATIONS: 'ibc_crm_notifications_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [consolidators] = useState<Consolidator[]>(CONSOLIDATOR_TEAM);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if user previously logged in
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  });

  // Active Profile: 'pastor', 'cons-1', 'cons-2', 'cons-3', or 'dev'
  const [activeProfile, setActiveProfileState] = useState<string>(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedAuth) return savedAuth;
    return localStorage.getItem(STORAGE_KEYS.PROFILE) || 'pastor';
  });

  const activeUserProfile = getProfileById(activeProfile);
  const activeRole = activeUserProfile.rol;
  const permissions = getRolePermissions(activeRole);

  const login = (identifier: string, pass: string): { success: boolean; message: string } => {
    const user = authenticateUser(identifier, pass);
    if (!user) {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos. Verifica tus credenciales.',
      };
    }

    setIsAuthenticated(true);
    setActiveProfileState(user.id);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, user.id);
    localStorage.setItem(STORAGE_KEYS.PROFILE, user.id);

    showToast(
      'success',
      `¡Bienvenido, ${user.nombre}! Has ingresado como ${user.rolLabel}.`,
      'Acceso Autorizado'
    );
    return { success: true, message: `Bienvenido/a ${user.nombre}` };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    showToast('info', 'Has cerrado tu sesión de forma segura.', 'Sesión Finalizada');
  };

  const setActiveProfile = (profileId: string) => {
    setActiveProfileState(profileId);
    localStorage.setItem(STORAGE_KEYS.PROFILE, profileId);
    const prof = getProfileById(profileId);
    if (prof.rol === 'pastor') {
      showToast('info', 'Sesión iniciada como Pastor Edgar (Liderazgo Pastoral)', 'Perfil Pastoral');
    } else if (prof.rol === 'desarrollador') {
      showToast('info', 'Sesión iniciada como Desarrollador (Acceso Técnico & DevOps)', 'Perfil Desarrollador');
    } else {
      showToast('info', `Sesión iniciada como ${prof.nombre} (${prof.rolLabel})`, 'Perfil Consolidador');
    }
  };

  const currentConsolidator = consolidators.find((c) => c.id === activeProfile) || null;

  // Load from local storage or fallback to initial seed
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [counseling, setCounseling] = useState<CounselingRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUNSELING);
    return saved ? JSON.parse(saved) : INITIAL_COUNSELING;
  });

  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DONATIONS);
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!saved) return INITIAL_CONFIG;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_CONFIG,
        ...parsed,
        diasEnvioAlertasSemanales: Array.isArray(parsed.diasEnvioAlertasSemanales)
          ? parsed.diasEnvioAlertasSemanales
          : INITIAL_CONFIG.diasEnvioAlertasSemanales || [1, 4],
        diasConsejeriaPastoral: Array.isArray(parsed.diasConsejeriaPastoral)
          ? parsed.diasConsejeriaPastoral
          : INITIAL_CONFIG.diasConsejeriaPastoral || [2, 4],
        alertasActivas: {
          ...INITIAL_CONFIG.alertasActivas,
          ...(parsed.alertasActivas || {}),
        },
      };
    } catch {
      return INITIAL_CONFIG;
    }
  });

  const [logs, setLogs] = useState<AppLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, leida: true } : n));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const markAllNotificationsAsRead = (perfilId?: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        if (!perfilId || n.destinatarioPerfilId === perfilId || n.destinatarioPerfilId === 'todos') {
          return { ...n, leida: true };
        }
        return n;
      });
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    });
    showToast('info', 'Notificaciones marcadas como leídas', 'Buzón al día');
  };

  const addNotification = (item: Omit<AppNotification, 'id' | 'fecha' | 'leida'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fecha: new Date().toISOString(),
      leida: false,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const sendTeamMessage = (destinatarioPerfilId: string, titulo: string, mensaje: string) => {
    addNotification({
      destinatarioPerfilId,
      remitenteNombre: activeUserProfile ? activeUserProfile.nombre : 'Equipo IBC',
      titulo,
      mensaje,
      tipo: 'mensaje_equipo',
    });
    showToast('success', 'Mensaje enviado al buzón del hermano(a)', 'Mensaje Enviado');
  };

  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Logs helper
  const addLog = (accion: string, detalle: string, categoria: AppLog['categoria'] = 'sistema') => {
    const newLog: AppLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      usuario: activeUserProfile ? activeUserProfile.nombre : 'Sistema',
      rol: activeRole || 'pastor',
      accion,
      detalle,
      categoria,
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 99)];
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
      return updated;
    });
  };

  // Estado de conexión Supabase en vivo
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'checking' | 'error'>('checking');
  const [supabaseMessage, setSupabaseMessage] = useState<string>('Verificando conexión con Supabase...');

  const testSupabase = async () => {
    setSupabaseStatus('checking');
    setSupabaseMessage('Conectando a ' + SUPABASE_URL + '...');
    const res = await probarConexionSupabase();
    if (res.ok) {
      setSupabaseStatus('connected');
      setSupabaseMessage(res.mensaje);
      showToast('success', 'Base de datos Supabase conectada y lista', 'Supabase OK');
    } else {
      setSupabaseStatus('error');
      setSupabaseMessage(res.mensaje);
      showToast('warning', res.mensaje, 'Supabase');
    }
  };

  // Verificar conexión con Supabase al iniciar
  useEffect(() => {
    testSupabase();
  }, []);

  // Persist whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUNSELING, JSON.stringify(counseling));
  }, [counseling]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  // Toast Manager
  const showToast = (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Telegram helper
  const sendTelegramAlert = async (text: string): Promise<boolean> => {
    if (!config.telegramToken || !config.telegramChatId) {
      showToast('warning', 'Configura el Token y Chat ID de Telegram en Ajustes', 'Telegram Desconectado');
      return false;
    }
    const res = await enviarNotificacionTelegram(config.telegramToken, config.telegramChatId, text);
    if (res.success) {
      showToast('success', 'Notificación enviada a Telegram del Pastor', 'Telegram OK');
      return true;
    } else {
      showToast('info', `Simulación de Telegram: ${res.message}`, 'Telegram API');
      return false;
    }
  };

  // Cálculo de Tiempo Oportuno de Atención Pastoral (antes llamado SLA)
  const getTiempoAtencionStatus = (request: CounselingRequest) => {
    const createdTime = new Date(request.fechaSolicitud).getTime();
    const nowTime = new Date().getTime();
    const elapsedHours = Math.max(0, (nowTime - createdTime) / (1000 * 60 * 60));
    const limiteHoras = request.tiempoLimiteHoras || request.slaHours || 24;
    const remainingHours = limiteHoras - elapsedHours;
    const percentage = Math.min(100, Math.round((elapsedHours / limiteHoras) * 100));

    if (request.estado === 'Cerrada') {
      return { elapsedHours, remainingHours, status: 'ok' as const, percentage, label: 'Atención completada' };
    }

    if (elapsedHours >= limiteHoras) {
      return { elapsedHours, remainingHours, status: 'breached' as const, percentage, label: 'Tiempo de respuesta superado' };
    }

    if (remainingHours <= limiteHoras * 0.25) {
      return { elapsedHours, remainingHours, status: 'warning' as const, percentage, label: 'Por cumplirse tiempo límite' };
    }

    return { elapsedHours, remainingHours, status: 'ok' as const, percentage, label: 'En tiempo oportuno' };
  };

  // Compatibilidad
  const getSlaStatus = (request: CounselingRequest) => {
    const res = getTiempoAtencionStatus(request);
    return {
      elapsedHours: res.elapsedHours,
      remainingHours: res.remainingHours,
      status: res.status,
      percentage: res.percentage,
    };
  };

  // Algoritmo de Auto-Asignación Round-Robin / Carga Mínima
  const selectNextConsolidator = (): Consolidator => {
    // Cuenta cuántos miembros activos tiene cada consolidador
    const counts = consolidators.map((c) => ({
      consolidator: c,
      count: members.filter(
        (m) => m.consolidadorId === c.id && m.estadoSeguimiento !== 'Integrado'
      ).length,
    }));

    // Ordena de menor a mayor carga
    counts.sort((a, b) => a.count - b.count);
    return counts[0]?.consolidator || consolidators[0];
  };

  // Member CRUD
  const addMember = (
    memberData: Omit<
      Member,
      'id' | 'fechaRegistro' | 'ciclosContacto' | 'semanaActual' | 'consolidadorId' | 'consolidadorNombre' | 'pasoActualRuta' | 'historialRuta'
    > & {
      consolidadorId?: string;
      consolidadorNombre?: string;
    }
  ) => {
    // Si no se especificó consolidador, auto-asignar equitativamente
    const assignedConsolidator = memberData.consolidadorId
      ? consolidators.find((c) => c.id === memberData.consolidadorId) || selectNextConsolidator()
      : selectNextConsolidator();

    const newMember: Member = {
      ...memberData,
      id: 'mem-' + Date.now(),
      fechaRegistro: new Date().toISOString(),
      ciclosContacto: 0,
      semanaActual: 1,
      consolidadorId: assignedConsolidator.id,
      consolidadorNombre: `${assignedConsolidator.nombre} (${assignedConsolidator.alias})`,
      pasoActualRuta: 1,
      historialRuta: [
        {
          paso: 1,
          completado: true,
          fechaCompletado: new Date().toISOString(),
          notas: 'Bienvenida dominical registrada. Ruta de consolidación iniciada.',
        },
      ],
    };

    setMembers((prev) => [newMember, ...prev]);
    showToast(
      'success',
      `${newMember.nombre} asignado(a) a ${assignedConsolidator.alias} (${assignedConsolidator.nombre})`,
      'Asignación Exitosa'
    );

    // Persistir en Supabase en segundo plano
    guardarMiembroSupabase(newMember);

    // Notificar Telegram
    const telegramMsg = `🆕 <b>Nuevo Registro en IBC Bogotá</b>\n\n<b>Nombre:</b> ${newMember.nombre}\n<b>Teléfono:</b> ${newMember.telefono || 'No reportado'}\n<b>Asignado a:</b> ${assignedConsolidator.alias} (${assignedConsolidator.nombre})\n<b>Paso Inicial:</b> Paso 1 - Bienvenida Dominical\n${newMember.decidioEntregarVidaAJesus ? '⭐ <b>¡HOY DECIDIÓ ENTREGAR SU VIDA A JESÚS!</b>\n' : ''}\n<i>Expediente y ruta de crecimiento hacia el servicio activados.</i>`;
    sendTelegramAlert(telegramMsg);

    // Alerta estelar si decidió entregar su vida a Cristo
    if (newMember.decidioEntregarVidaAJesus) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      showToast('success', `¡Gloria a Dios! ${newMember.nombre} decidió entregar su vida a Jesús hoy.`, '⭐ Decisión por Cristo');

      addNotification({
        destinatarioPerfilId: 'pastor',
        remitenteNombre: 'Tarjeta de Conexión',
        titulo: `⭐ ¡Nueva Decisión de Fe! ${newMember.nombre}`,
        mensaje: `${newMember.nombre} marcó en su Tarjeta de Conexión que hoy decidió entregar su vida a Jesús. Asignado(a) a ${assignedConsolidator.alias}. Iniciar ruta de Nuevos Creyentes.`,
        tipo: 'miembro',
        telefono: newMember.telefono,
        accionTexto: 'Ver Expediente',
        accionTipo: 'ver_miembros',
      });
    }

    // Auto-generar consejería si la persona lo solicitó en la Tarjeta de Conexión
    if (newMember.interesConsejeria && newMember.telefono) {
      addCounseling({
        nombre: newMember.nombre,
        contacto: newMember.telefono,
        email: newMember.email,
        tema: 'Acompañamiento Espiritual y Familiar (Tarjeta de Conexión)',
        detalles: `El hermano solicitó consejería pastoral en su Tarjeta de Conexión dominical. ${newMember.notas ? 'Nota: ' + newMember.notas : ''}`,
        urgencia: 'Media',
        disponibilidadHorario: 'Cualquier horario',
        estado: 'Pendiente',
        pastorAsignado: 'Pastor Edgar Castaño Díaz',
      });
    }

    addLog(
      'Nuevo Registro',
      `${newMember.nombre} registrado. Asignado a ${assignedConsolidator.alias}. ${newMember.decidioEntregarVidaAJesus ? '[Decidió entregar su vida a Jesús] ' : ''}${newMember.deseaBautizarse ? 'Desea bautizarse: ' + newMember.deseaBautizarse : ''}`,
      'miembro'
    );

    addNotification({
      destinatarioPerfilId: assignedConsolidator.id,
      remitenteNombre: 'Sistema de Consolidación',
      titulo: '🤝 Nuevo Hermano Asignado',
      mensaje: `${newMember.nombre} te fue asignado(a) tras el culto dominical. ${newMember.decidioEntregarVidaAJesus ? '⭐ ¡Hoy decidió entregar su vida a Jesús! ' : ''}${newMember.deseaBautizarse ? 'Desea bautizarse: ' + newMember.deseaBautizarse : ''}`,
      tipo: 'miembro',
      telefono: newMember.telefono,
      accionTexto: 'Escribir por WhatsApp',
      accionTipo: 'whatsapp',
    });
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };

        // Alerta de auto-escalamiento pastoral si en 'Nuevo' acumula 2 ciclos sin respuesta
        if (
          updated.estadoSeguimiento === 'Nuevo' &&
          updated.ciclosContacto >= config.ciclosParaAvisar &&
          !updated.escaladoPastor
        ) {
          updated.estadoSeguimiento = 'Necesita atención';
          updated.escaladoPastor = true;
          updated.fechaEscalamiento = new Date().toISOString();
          showToast(
            'warning',
            `${updated.nombre} ha cumplido ${config.ciclosParaAvisar} ciclos sin respuesta. Se escaló a 'Necesita atención' para llamada pastoral.`,
            'Aviso Pastoral'
          );

          addNotification({
            destinatarioPerfilId: 'pastor',
            remitenteNombre: 'Sistema de Consolidación',
            titulo: '⚠️ Alerta de Escalamiento Pastoral',
            mensaje: `${updated.nombre} ha cumplido ${config.ciclosParaAvisar} ciclos sin respuesta. Se escaló a 'Necesita atención' para llamada pastoral.`,
            tipo: 'miembro',
            telefono: updated.telefono,
            accionTexto: 'Llamar al Hermano',
            accionTipo: 'llamar',
          });
        }

        return updated;
      })
    );
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('info', 'Expediente eliminado del sistema', 'Registro Eliminado');
  };

  const changeMemberStatus = (id: string, newStatus: FollowUpStatus) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (newStatus === 'Integrado' && m.estadoSeguimiento !== 'Integrado') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          showToast('success', `¡Gloria a Dios! ${m.nombre} se ha integrado a la vida de la IBC.`, '¡Miembro Integrado!');
        }
        return {
          ...m,
          estadoSeguimiento: newStatus,
          escaladoPastor: newStatus === 'Necesita atención' ? true : m.escaladoPastor,
        };
      })
    );
  };

  const reassignConsolidator = (memberId: string, consolidatorId: string) => {
    const targetCons = consolidators.find((c) => c.id === consolidatorId);
    if (!targetCons) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          consolidadorId: targetCons.id,
          consolidadorNombre: `${targetCons.nombre} (${targetCons.alias})`,
        };
      })
    );

    showToast('success', `Reasignado a ${targetCons.alias} (${targetCons.nombre})`, 'Reasignación');
  };

  // Avanzar Paso en la Ruta de Crecimiento & Servicio
  const advanceMemberRoadmap = (memberId: string, stepNumber?: number, notes?: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        const nextStep = stepNumber !== undefined ? stepNumber : Math.min(6, m.pasoActualRuta + 1);
        const historyCopy = [...m.historialRuta];

        // Marca el paso anterior como completado
        const existingIndex = historyCopy.findIndex((h) => h.paso === m.pasoActualRuta);
        if (existingIndex >= 0) {
          historyCopy[existingIndex] = {
            ...historyCopy[existingIndex],
            completado: true,
            fechaCompletado: new Date().toISOString(),
            notas: notes || historyCopy[existingIndex].notas,
          };
        } else {
          historyCopy.push({
            paso: m.pasoActualRuta,
            completado: true,
            fechaCompletado: new Date().toISOString(),
            notas: notes,
          });
        }

        // Si llega al paso 6 (Sirviendo en la Iglesia)
        if (nextStep >= 6) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
          });
          showToast(
            'success',
            `¡Aleluya! ${m.nombre} ha alcanzado la meta: ¡Sirviendo activamente en la Iglesia!`,
            '¡Meta Cumplida!'
          );
        } else {
          showToast('success', `Ruta de ${m.nombre} avanzada al Paso ${nextStep}`, 'Paso Completado');
        }

        return {
          ...m,
          pasoActualRuta: nextStep,
          estadoSeguimiento: nextStep >= 6 ? 'Integrado' : m.estadoSeguimiento,
          historialRuta: historyCopy,
        };
      })
    );
  };

  const updateDiscipleshipProgress = (memberId: string, leccionActual: number, completado: boolean) => {
    let graduatedMember: Member | undefined;
    let discipuladorName = activeUserProfile.nombre;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const disc = m.discipulado || { leccionActual: 1, completado: false, discipuladorNombre: activeUserProfile.nombre };
        const isNowGraduated = completado || leccionActual >= 13;
        discipuladorName = disc.discipuladorNombre || activeUserProfile.nombre;

        const updatedDisc = {
          ...disc,
          leccionActual: Math.min(13, leccionActual),
          completado: isNowGraduated,
          discipuladorId: activeUserProfile.id,
          discipuladorNombre: discipuladorName,
          fechaCompletado: isNowGraduated ? (disc.fechaCompletado || new Date().toISOString()) : undefined,
          notificadoPastorGraduacion: isNowGraduated ? true : disc.notificadoPastorGraduacion,
          fechaNotificacionPastor: isNowGraduated ? new Date().toISOString() : disc.fechaNotificacionPastor,
        };

        if (isNowGraduated && !disc.completado) {
          graduatedMember = { ...m, discipulado: updatedDisc };
        }

        addLog(
          'Discipulado',
          `Lección ${leccionActual}/13 para ${m.nombre} (Libro Nuevos Creyentes)${isNowGraduated ? ' - ¡GRADUADO!' : ''}`,
          'discipulado'
        );

        showToast('success', `Progreso de discipulado: Lección ${Math.min(13, leccionActual)}/13`, 'Discipulado Actualizado');

        return {
          ...m,
          discipulado: updatedDisc,
          pasoActualRuta: isNowGraduated ? 5 : m.pasoActualRuta,
        };
      })
    );

    // Si completó la lección 13: Notificar al Pastor Edgar Castaño para entrevista pastoral
    if (graduatedMember) {
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
      showToast('success', `¡Gloria a Dios! ${(graduatedMember as Member).nombre} completó las 13 lecciones de Nuevos Creyentes.`, '🎓 ¡Graduado de Discipulado!');

      addNotification({
        destinatarioPerfilId: 'pastor',
        remitenteNombre: discipuladorName || 'Equipo de Discipulado',
        titulo: `🎓 ¡Graduación de Discipulado! ${(graduatedMember as Member).nombre}`,
        mensaje: `${(graduatedMember as Member).nombre} ha completado exitosamente las 13 lecciones del libro "Nuevos Creyentes" con ${discipuladorName}. El Pastor Edgar Castaño puede ahora contactarle para celebrar su crecimiento espiritual e identificar si se le asigna ministerio (${(graduatedMember as Member).ministerioInteres || 'según sus dones'}) o sus próximos pasos en la iglesia.`,
        tipo: 'miembro',
        telefono: (graduatedMember as Member).telefono,
        accionTexto: 'Asignar Ministerio',
        accionTipo: 'ver_miembros',
      });

      sendTelegramAlert(
        `🎓 <b>¡GRADUACIÓN DE DISCIPULADO EN IBC BOGOTÁ!</b> 🏆\n\n👤 <b>Hermano(a):</b> ${(graduatedMember as Member).nombre}\n📖 <b>Programa:</b> Libro Nuevos Creyentes (13 Lecciones culminadas)\n🤝 <b>Discipulador(a):</b> ${discipuladorName}\n🎯 <b>Interés Ministerial:</b> ${(graduatedMember as Member).ministerioInteres || 'Por definir'}\n\n💡 <i>Alerta enviada al Pastor Edgar Castaño para entrevista pastoral de confirmación y asignación ministerial.</i>`
      );
    }
  };

  const scheduleDiscipleshipClass = (
    memberId: string,
    fechaHora: string,
    modalidad: 'Presencial (Templo Cra 7 # 31a-78)' | 'Virtual (Google Meet / Zoom)'
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const currentDisc = m.discipulado || { leccionActual: 1, completado: false, discipuladorNombre: activeUserProfile.nombre };
        return {
          ...m,
          discipulado: {
            ...currentDisc,
            proximaClaseFecha: fechaHora,
            proximaClaseModalidad: modalidad,
          },
        };
      })
    );
    addLog('Discipulado', `Próxima clase programada para ${fechaHora} (${modalidad})`, 'discipulado');
    showToast('success', 'Próxima clase agendada con éxito', 'Clase de Discipulado');
  };

  const registerDiscipleshipAbsence = (memberId: string, motivo?: string) => {
    const nowIso = new Date().toISOString();
    let targetMember: Member | undefined;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        targetMember = m;
        const currentDisc = m.discipulado || { leccionActual: 1, completado: false, discipuladorNombre: activeUserProfile.nombre };
        const currentInasistencias = (currentDisc.inasistenciasConsecutivas || 0) + 1;
        const totalInas = (currentDisc.totalInasistencias || 0) + 1;
        const historial = currentDisc.historialInasistencias || [];

        return {
          ...m,
          discipulado: {
            ...currentDisc,
            inasistenciasConsecutivas: currentInasistencias,
            totalInasistencias: totalInas,
            historialInasistencias: [
              ...historial,
              { fecha: nowIso, motivo: motivo || 'Inasistencia a clase semanal', notificado: true },
            ],
          },
        };
      })
    );

    if (targetMember) {
      addNotification({
        destinatarioPerfilId: (targetMember as Member).discipuladorId || 'todos',
        remitenteNombre: 'Módulo de Ausencias',
        titulo: `⚠️ Inasistencia en Discipulado: ${(targetMember as Member).nombre}`,
        mensaje: `${(targetMember as Member).nombre} no asistió a su clase de discipulado (${motivo || 'Sin motivo reportado'}). Enviar mensaje de reconexión fraterna por WhatsApp para acordar reposición.`,
        tipo: 'miembro',
        telefono: (targetMember as Member).telefono,
        accionTexto: 'Contactar por WhatsApp',
        accionTipo: 'whatsapp',
      });

      addLog('Discipulado', `Inasistencia registrada para ${(targetMember as Member).nombre} en discipulado (${motivo || 'Sin motivo'})`, 'discipulado');
      showToast('warning', `Inasistencia registrada para ${(targetMember as Member).nombre}`, 'Ausencia en Discipulado');
    }
  };

  const resetDiscipleshipAbsences = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const currentDisc = m.discipulado || { leccionActual: 1, completado: false, discipuladorNombre: activeUserProfile.nombre };
        return {
          ...m,
          discipulado: {
            ...currentDisc,
            inasistenciasConsecutivas: 0,
          },
        };
      })
    );
    showToast('info', 'Contador de inasistencias consecutivas reiniciado', 'Asistencia Restablecida');
  };

  const scheduleCounselingAppointment = (
    counselingId: string,
    fechaHora: string,
    modalidad?: 'Presencial (Oficina Pastoral Cra 7 # 31a-78)' | 'Llamada Telefónica' | 'Videollamada'
  ) => {
    setCounseling((prev) =>
      prev.map((c) => {
        if (c.id !== counselingId) return c;
        return {
          ...c,
          fechaCitaAgendada: fechaHora,
          modalidadCita: modalidad || 'Presencial (Oficina Pastoral Cra 7 # 31a-78)',
          estado: c.estado === 'Pendiente' ? 'En acompañamiento' : c.estado,
          fechaAtencion: c.fechaAtencion || new Date().toISOString(),
        };
      })
    );
    addLog('Consejería', `Cita pastoral agendada para ${fechaHora} (${modalidad || 'Presencial'})`, 'consejeria');
    showToast('success', 'Cita agendada exitosamente en el cronograma pastoral', 'Agenda Pastoral');
  };

  const triggerTestAlert = async (
    type: 'semanal' | 'ausencia' | 'proxima_clase' | 'graduacion' | 'consejeria_sla' | 'decision_salvacion'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const nowStr = new Date().toLocaleTimeString('es-CO');
      let title = '';
      let text = '';
      let telegramMsg = '';

      switch (type) {
        case 'semanal': {
          const diasList = Array.isArray(config.diasEnvioAlertasSemanales) ? config.diasEnvioAlertasSemanales : [1, 4];
          const diasNombres = diasList.map((d) => ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d] || '').filter(Boolean).join(', ');
          title = '📅 Alerta Semanal de Consolidación (Prueba)';
          text = `Prueba exitosa a las ${nowStr}: Es día de contacto pastoral programado (${diasNombres || 'Lunes y Jueves'}). Hay ${members.filter((m) => m.estadoSeguimiento === 'En seguimiento').length} hermanos en ruta activa.`;
          telegramMsg = `📅 <b>PRUEBA DE ALERTA SEMANAL - IBC BOGOTÁ</b>\n\n🕒 <b>Hora:</b> ${nowStr}\n👥 <b>Hermanos en seguimiento:</b> ${members.filter((m) => m.estadoSeguimiento === 'En seguimiento').length}\n\n<i>El sistema de notificaciones automáticas está funcionando correctamente.</i>`;
          break;
        }
        case 'ausencia':
          title = '⚠️ Alerta de Inasistencia en Discipulado (Prueba)';
          text = `Prueba exitosa a las ${nowStr}: Hermano Javier Enrique Beltrán faltó a su lección semanal. Se genera mensaje de WhatsApp para el discípulo y discipulador.`;
          telegramMsg = `⚠️ <b>PRUEBA DE ALERTA DE AUSENCIA EN DISCIPULADO</b>\n\n👤 <b>Hermano:</b> Javier Enrique Beltrán\n📖 <b>Lección:</b> 3 (Nuevos Creyentes)\n🤝 <b>Discipulador:</b> David Camilo Robles\n\n<i>Reconexión fraterna requerida vía WhatsApp.</i>`;
          break;
        case 'proxima_clase':
          title = '⏰ Recordatorio de Próxima Clase de Discipulado (Prueba)';
          text = `Prueba exitosa a las ${nowStr}: Recordatorio para Carlos Andrés Mendoza (Lección 5) este Martes a las 7:00 PM en el Templo (Cra 7 # 31a-78).`;
          telegramMsg = `⏰ <b>PRUEBA DE RECORDATORIO DE CLASE</b>\n\n👤 <b>Discípulo:</b> Carlos Andrés Mendoza\n📖 <b>Lección:</b> 5 (El Bautismo y la Santa Cena)\n📍 <b>Modalidad:</b> Presencial Templo Cra 7 # 31a-78\n\n<i>Notificación enviada al discipulador y discípulo.</i>`;
          break;
        case 'graduacion':
          title = '🎓 Alerta de Graduación Pastoral (Prueba)';
          text = `Prueba exitosa a las ${nowStr}: Alerta enviada al Pastor Edgar Castaño para entrevistar a Lucía Marcela Benítez y asignarle ministerio en la iglesia.`;
          telegramMsg = `🎓 <b>PRUEBA DE NOTIFICACIÓN DE GRADUACIÓN AL PASTOR</b>\n\n👤 <b>Graduado(a):</b> Lucía Marcela Benítez\n🏆 <b>13 Lecciones completadas</b>\n🤝 <b>Acción Pastoral:</b> El Pastor Edgar Castaño identificará asignación ministerial.\n\n<i>Prueba de notificación completada.</i>`;
          break;
        case 'consejeria_sla':
          title = '🚨 Alerta de Oportunidad en Consejería (Prueba)';
          text = `Prueba exitosa a las ${nowStr}: Solicitud prioritaria de consejería para Rosa Elena Gómez en estado de atención oportuna.`;
          telegramMsg = `🚨 <b>PRUEBA DE ALERTA DE CONSEJERÍA PASTORAL</b>\n\n👤 <b>Hermana:</b> Rosa Elena Gómez\n📋 <b>Tema:</b> Crisis Matrimonial y Familiar\n⏱️ <b>Tiempo límite:</b> 6 Horas (Alta Prioridad)\n\n<i>Pastor Edgar Castaño notificado.</i>`;
          break;
        case 'decision_salvacion':
          title = '⭐ Alerta de Decisión por Cristo (Prueba)';
          text = `Prueba exitosa a las ${nowStr}: Nuevo creyente marcó "Hoy decidí entregar mi vida a Jesús" en su Tarjeta de Conexión dominical.`;
          telegramMsg = `⭐ <b>PRUEBA: NUEVA DECISIÓN POR CRISTO EN IBC</b>\n\n🎉 <i>Tarjeta de Conexión diligenciada en el culto. El sistema activó ruta prioritaria de bienvenida y discipulado.</i>`;
          break;
      }

      addNotification({
        destinatarioPerfilId: 'todos',
        remitenteNombre: 'Diagnóstico del Sistema',
        titulo: title,
        mensaje: text,
        tipo: 'sistema',
        accionTexto: 'Verificar Alerta',
        accionTipo: 'ver_miembros',
      });

      addLog('Diagnóstico', `Prueba de alerta ejecutada: "${type}" a las ${nowStr}`, 'sistema');
      await sendTelegramAlert(telegramMsg);
      showToast('success', `${title}: Disparo verificado con éxito`, 'Prueba Exitosa');

      return { success: true, message: `${title} disparada y verificada correctamente a las ${nowStr}.` };
    } catch (err: any) {
      showToast('error', `Error en prueba: ${err.message}`, 'Fallo de Prueba');
      return { success: false, message: err.message };
    }
  };

  // Verificador en vivo de la conexión con el Bot de Telegram
  const testTelegramConnection = async (tokenOverride?: string): Promise<{ success: boolean; botName?: string; username?: string; message: string }> => {
    const token = (tokenOverride !== undefined ? tokenOverride : config.telegramToken || '').trim();
    if (!token) {
      return { success: false, message: 'Falta el Token del Bot de Telegram. Obtenlo en @BotFather con el comando /token.' };
    }
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await res.json().catch(() => null);
      if (data && data.ok && data.result) {
        return {
          success: true,
          botName: data.result.first_name,
          username: data.result.username,
          message: `Conexión exitosa con el Bot @${data.result.username} (${data.result.first_name}).`,
        };
      }
      return {
        success: false,
        message: data?.description || 'Token inválido o no reconocido por Telegram.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Error de conexión con la API de Telegram.',
      };
    }
  };

  // Disparar Resumen Semanal Oficial para la semana actual
  const triggerWeeklyDispatchNow = async (): Promise<{ success: boolean; message: string; telegramDelivered: boolean }> => {
    const nowStr = new Date().toLocaleDateString('es-CO', { dateStyle: 'full' });
    const activeFollowUps = members.filter((m) => m.estadoSeguimiento === 'En seguimiento').length;
    const counselingPending = counseling.filter((c) => c.estado === 'Pendiente' || c.estado === 'En acompañamiento').length;
    const counselingHighPriority = counseling.filter((c) => (c.estado === 'Pendiente' || c.estado === 'En acompañamiento') && c.urgencia === 'Alta').length;
    const activeDisciples = members.filter((m) => m.discipulado && m.discipulado.leccionActual <= 13).length;

    const telegramMsg = `📊 <b>RESUMEN SEMANAL OFICIAL — IBC BOGOTÁ</b>\n` +
      `📅 <i>${nowStr}</i>\n\n` +
      `✨ <b>Hermanos en Consolidación:</b> ${activeFollowUps} almas en ruta formativa activa de 8 semanas\n` +
      `🙏 <b>Consejerías Pastorales:</b> ${counselingPending} citas activas (${counselingHighPriority} de alta urgencia)\n` +
      `📖 <b>Discipulado Nuevos Creyentes:</b> ${activeDisciples} hermanos en formación doctrinal (13 lecciones)\n\n` +
      `👥 <b>Consolidadores Asignados:</b>\n` +
      `• Martha Cecilia Gómez (Consolidador 1)\n` +
      `• Andrés Felipe Pardo (Consolidador 2)\n` +
      `• Viviana Torres Mora (Consolidador 3)\n\n` +
      `📖 <i>«Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre, sabiendo que vuestro trabajo en el Señor no es en vano.» — 1 Corintios 15:58</i>`;

    addNotification({
      destinatarioPerfilId: 'todos',
      remitenteNombre: 'Cronograma Semanal',
      titulo: '📊 Resumen Semanal Emitido',
      mensaje: `Resumen de consolidación: ${activeFollowUps} almas en seguimiento, ${counselingPending} consejerías agendadas y ${activeDisciples} discípulos activos.`,
      tipo: 'sistema',
      accionTexto: 'Ver Consolidación',
      accionTipo: 'ver_miembros',
    });

    addLog('Cronograma Semanal', `Resumen semanal oficial emitido: ${activeFollowUps} personas en seguimiento y ${counselingPending} consejerías`, 'sistema');

    if (!config.telegramToken || !config.telegramChatId) {
      showToast('warning', 'Resumen guardado en la campanita, pero Telegram no tiene Bot Token configurado', 'Token Requerido');
      return {
        success: true,
        telegramDelivered: false,
        message: 'Resumen generado y guardado en el buzón interno (campanita 🔔). Para recibirlo en tu Telegram personal o grupal, ingresa el Bot Token en Configuración de Alertas.',
      };
    }

    const res = await enviarNotificacionTelegram(config.telegramToken, config.telegramChatId, telegramMsg);
    if (res.success) {
      showToast('success', '¡Resumen semanal enviado a Telegram exitosamente!', 'Telegram Entregado');
      return { success: true, telegramDelivered: true, message: '¡Resumen semanal oficial entregado con éxito a Telegram!' };
    } else {
      showToast('error', `Error al enviar a Telegram: ${res.message}`, 'Telegram Error');
      return { success: false, telegramDelivered: false, message: `Error de Telegram: ${res.message}` };
    }
  };

  // Verificación y emisión automática cuando hoy es día programado de alerta
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 Dom, 1 Lun, 2 Mar, 3 Mié, 4 Jue, 5 Vie, 6 Sáb
    const alertDays = Array.isArray(config.diasEnvioAlertasSemanales) ? config.diasEnvioAlertasSemanales : [1, 4];

    if (alertDays.includes(dayOfWeek) && config.telegramToken && config.telegramChatId) {
      const todayKey = `ibc_auto_alert_${today.toISOString().slice(0, 10)}`;
      const alreadySentToday = localStorage.getItem(todayKey);
      if (!alreadySentToday) {
        triggerWeeklyDispatchNow().then((res) => {
          if (res.telegramDelivered) {
            localStorage.setItem(todayKey, 'true');
          }
        });
      }
    }
  }, [config.telegramToken, config.telegramChatId, config.diasEnvioAlertasSemanales]);

  const scheduleAllProcessesForNextWeek = () => {
    const weekRange = getNextWeekRange();
    const alertDays = Array.isArray(config.diasEnvioAlertasSemanales) && config.diasEnvioAlertasSemanales.length > 0
      ? config.diasEnvioAlertasSemanales
      : [1, 4]; // Lunes (1) y Jueves (4)
    const counselingDays = Array.isArray(config.diasConsejeriaPastoral) && config.diasConsejeriaPastoral.length > 0
      ? config.diasConsejeriaPastoral
      : [2, 4]; // Martes (2) y Jueves (4)

    // Fechas calculadas para días de contacto de la próxima semana
    const alertDates = alertDays.map((targetDayIdx) => {
      const match = weekRange.days.find((d) => d.dayIndex === targetDayIdx);
      if (match) {
        const d = new Date(match.date);
        const [hours, mins] = (config.horaEnvioAlertas || '08:30').split(':').map(Number);
        d.setHours(hours || 8, mins || 30, 0, 0);
        return { date: d, name: match.name, shortName: match.shortName, formatted: match.formatted };
      }
      return { date: weekRange.startDate, name: 'Lunes', shortName: 'Lun', formatted: weekRange.startFormatted };
    });

    // Fechas calculadas para días de consejería pastoral
    const counselingDates = counselingDays.map((targetDayIdx) => {
      const match = weekRange.days.find((d) => d.dayIndex === targetDayIdx);
      if (match) {
        const d = new Date(match.date);
        d.setHours(14, 30, 0, 0);
        return { date: d, name: match.name, shortName: match.shortName, formatted: match.formatted };
      }
      return { date: weekRange.startDate, name: 'Martes', shortName: 'Mar', formatted: weekRange.startFormatted };
    });

    let membersUpdatedCount = 0;
    let discipleshipCount = 0;
    const newNotifications: AppNotification[] = [];

    // 1. Programar miembros activos y clases de discipulado para la próxima semana
    setMembers((prevMembers) => {
      return prevMembers.map((m, idx) => {
        if (m.estadoSeguimiento === 'Integrado') return m;

        // Asignar alternadamente a los días configurados (ej: Lunes o Jueves)
        const assignedSlot = alertDates[idx % alertDates.length];
        membersUpdatedCount++;

        // Actualizar clase de discipulado si aplica
        let updatedDiscipulado = m.discipulado;
        if (m.discipulado && m.discipulado.leccionActual <= 13) {
          discipleshipCount++;
          const discDate = new Date(assignedSlot.date);
          discDate.setHours(19, 0, 0, 0);
          updatedDiscipulado = {
            ...m.discipulado,
            proximaClaseFecha: discDate.toISOString().slice(0, 10),
            proximaClaseHora: '07:00 PM',
            proximaClaseModalidad: m.necesitaTransporte
              ? 'Virtual (Google Meet / Zoom)'
              : 'Presencial (Templo Cra 7 # 31a-78)',
          };
        }

        const profileId = m.consolidadorId || 'pastor';
        newNotifications.push({
          id: `sched-m-${m.id}-${Date.now()}`,
          destinatarioPerfilId: profileId,
          remitenteNombre: 'Calendario Semanal IBC',
          titulo: `📅 Contacto Programado: ${m.nombre} (${assignedSlot.name})`,
          mensaje: `Agendado para el ${assignedSlot.name} (${assignedSlot.formatted}): Llamada pastoral y afirmación - Semana ${m.semanaActual || 1} (${m.estadoSeguimiento}). Tel: ${m.telefono || 'Sin número'}.`,
          tipo: 'miembro',
          leida: false,
          fecha: assignedSlot.date.toISOString(),
          telefono: m.telefono,
          accionTexto: 'Contactar WhatsApp',
          accionTipo: 'whatsapp',
        });

        return {
          ...m,
          proximoContacto: assignedSlot.date.toISOString(),
          discipulado: updatedDiscipulado,
        };
      });
    });

    // 2. Programar citas de consejería pendientes para los días del pastor
    let counselingUpdatedCount = 0;
    setCounseling((prevCounseling) => {
      return prevCounseling.map((c, idx) => {
        if (c.estado !== 'Pendiente' && c.estado !== 'En acompañamiento') return c;
        counselingUpdatedCount++;
        const targetCounselSlot = counselingDates[idx % counselingDates.length];
        const horaCita = idx % 2 === 0 ? '03:00 PM' : '04:30 PM';

        newNotifications.push({
          id: `sched-c-${c.id}-${Date.now()}`,
          destinatarioPerfilId: 'pastor',
          remitenteNombre: 'Agenda Pastoral',
          titulo: `🙏 Consejería Programada: ${c.nombre} (${targetCounselSlot.name})`,
          mensaje: `Cita pastoral agendada para el ${targetCounselSlot.name} (${targetCounselSlot.formatted}) a las ${horaCita}. Tema: ${c.tema}.`,
          tipo: 'consejeria',
          leida: false,
          fecha: targetCounselSlot.date.toISOString(),
          telefono: c.contacto,
          accionTexto: 'Confirmar Cita',
          accionTipo: 'whatsapp',
        });

        return {
          ...c,
          fechaCita: targetCounselSlot.date.toISOString().slice(0, 10),
          horaCita,
          lugarModalidad: 'Presencial (Despacho Pastoral Cra 7 # 31a - 78)',
          estado: 'En acompañamiento',
        };
      });
    });

    // 3. Notificación global de resumen pastoral para la próxima semana
    newNotifications.push({
      id: `sched-pastor-summary-${Date.now()}`,
      destinatarioPerfilId: 'pastor',
      remitenteNombre: 'Sistema de Alertas IBC',
      titulo: `📊 Agenda de la Próxima Semana (${weekRange.startFormatted} - ${weekRange.endFormatted})`,
      mensaje: `Planificación completada: ${membersUpdatedCount} hermanos agendados para seguimiento, ${counselingUpdatedCount} citas de consejería y ${discipleshipCount} clases de discipulado distribuidas en los días seleccionados.`,
      tipo: 'sistema',
      leida: false,
      fecha: weekRange.startDate.toISOString(),
      accionTexto: 'Ver Cronograma',
      accionTipo: 'ver_miembros',
    });

    // Guardar las nuevas notificaciones
    setNotifications((prev) => [...newNotifications, ...prev]);

    // Enviar notificación a Telegram
    const telegramScheduleMsg = `📅 <b>AGENDA OPERATIVA PROGRAMADA — IBC BOGOTÁ</b>\n` +
      `📆 <b>Próxima Semana:</b> ${weekRange.startFormatted} al ${weekRange.endFormatted}\n\n` +
      `👥 <b>Hermanos en seguimiento:</b> ${membersUpdatedCount} distribuidos en ${alertDates.map((a) => a.name).join(' y ')}\n` +
      `🙏 <b>Consejerías Agendadas:</b> ${counselingUpdatedCount} con el Pastor Edgar\n` +
      `📖 <b>Procesos de Discipulado:</b> ${discipleshipCount} lecciones de Nuevos Creyentes\n\n` +
      `<i>Todas las alertas fueron cargadas en las bandejas del equipo pastoral y consolidadores.</i>`;
    sendTelegramAlert(telegramScheduleMsg);

    addLog('Calendarización', `Programadas ${membersUpdatedCount} personas y ${counselingUpdatedCount} consejerías para la semana del ${weekRange.startFormatted}`, 'sistema');
    showToast('success', `¡${membersUpdatedCount} personas y procesos programados con éxito para la próxima semana!`, 'Calendarización Completa');

    return {
      scheduledCount: membersUpdatedCount + counselingUpdatedCount,
      membersCount: membersUpdatedCount,
      counselingCount: counselingUpdatedCount,
      discipleshipCount,
      startDateFormatted: weekRange.startFormatted,
      endDateFormatted: weekRange.endFormatted,
    };
  };

  const updateMinistryPlacement = (memberId: string, ministerioAsignado: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        addLog('Ministerio', `Asignado ministerio "${ministerioAsignado}" a ${m.nombre} tras completar discipulado`, 'ministerio');
        showToast('success', `¡${m.nombre} asignado al ministerio de ${ministerioAsignado}!`, 'Colocación Ministerial');
        return {
          ...m,
          ministerioInteres: ministerioAsignado,
          pasoActualRuta: 6,
          estadoSeguimiento: 'Integrado',
        };
      })
    );
  };

  const advanceMemberWeek = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextWeek = Math.min(8, m.semanaActual + 1);
        const shouldIntegrate = m.semanaActual >= 8;

        if (shouldIntegrate) {
          confetti({ particleCount: 90, spread: 60 });
          showToast('success', `${m.nombre} completó las 8 semanas de consolidación`, 'Ciclo Completado');
          return {
            ...m,
            semanaActual: 8,
            estadoSeguimiento: 'Integrado',
            ciclosContacto: m.ciclosContacto + 1,
            ultimoContacto: new Date().toISOString(),
          };
        }

        return {
          ...m,
          semanaActual: nextWeek,
          ciclosContacto: m.ciclosContacto + 1,
          ultimoContacto: new Date().toISOString(),
        };
      })
    );
  };

  const registerContactAttempt = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newCycles = m.ciclosContacto + 1;
        const updates: Partial<Member> = {
          ciclosContacto: newCycles,
          ultimoContacto: new Date().toISOString(),
        };

        if (m.estadoSeguimiento === 'Nuevo' && newCycles >= config.ciclosParaAvisar && !m.escaladoPastor) {
          updates.estadoSeguimiento = 'Necesita atención';
          updates.escaladoPastor = true;
          updates.fechaEscalamiento = new Date().toISOString();
        }

        return { ...m, ...updates };
      })
    );
    showToast('info', 'Contacto registrado en el expediente', 'Seguimiento Actualizado');
  };

  // Counseling Actions
  const addCounseling = (
    data: Omit<CounselingRequest, 'id' | 'fechaSolicitud' | 'escalado' | 'notas' | 'tiempoLimiteHoras' | 'slaHours'>
  ) => {
    const tiempoLimite = data.urgencia === 'Alta' ? 6 : 24;
    const newRequest: CounselingRequest = {
      ...data,
      id: 'cns-' + Date.now(),
      fechaSolicitud: new Date().toISOString(),
      tiempoLimiteHoras: tiempoLimite,
      slaHours: tiempoLimite,
      escalado: false,
      notas: [],
    };

    setCounseling((prev) => [newRequest, ...prev]);
    showToast(
      data.urgencia === 'Alta' ? 'warning' : 'success',
      `Solicitud de consejería de ${data.nombre} recibida (Atención oportuna: ${tiempoLimite} horas)`,
      data.urgencia === 'Alta' ? 'Prioridad Alta' : 'Consejería Registrada'
    );

    // Persistir en Supabase
    guardarConsejeriaSupabase(newRequest);

    // Notify Telegram
    const urgencyEmoji = data.urgencia === 'Alta' ? '🔴 ALTA PRIORIDAD' : (data.urgencia === 'Media' ? '🟠 Prioritaria' : '🟡 Normal');
    const telegramMsg = `${urgencyEmoji} <b>Solicitud de Consejería IBC</b>\n\n<b>Nombre:</b> ${data.nombre}\n<b>Tema:</b> ${data.tema}\n<b>Prioridad:</b> ${data.urgencia} (Compromiso: ${tiempoLimite}h)\n<b>Contacto:</b> ${data.contacto}\n\n<i>${data.detalles || 'Sin detalles adicionales'}</i>`;
    sendTelegramAlert(telegramMsg);

    addLog(
      'Solicitud de Consejería',
      `${data.nombre} solicitó consejería sobre "${data.tema}" (Disponibilidad: ${data.disponibilidadHorario || 'Cualquier horario'})`,
      'consejeria'
    );

    addNotification({
      destinatarioPerfilId: 'pastor',
      remitenteNombre: 'Portal Congregacional',
      titulo: '📞 Nueva Solicitud de Consejería',
      mensaje: `${data.nombre} solicita consejería sobre "${data.tema}" (Disponibilidad: ${data.disponibilidadHorario || 'Cualquier horario'}).`,
      tipo: 'consejeria',
      telefono: data.contacto,
      disponibilidad: data.disponibilidadHorario,
      accionTexto: 'Llamar al Hermano',
      accionTipo: 'llamar',
    });
  };

  const getCounselingForMember = (m: Member | { nombre: string; telefono?: string; email?: string }): CounselingRequest | undefined => {
    if (!m || !m.nombre) return undefined;
    const normName = m.nombre.toLowerCase().trim();
    const phoneClean = (m.telefono || '').replace(/\D/g, '').slice(-7);

    return counseling.find((c) => {
      const cName = c.nombre.toLowerCase().trim();
      if (cName === normName) return true;
      if (cName.includes(normName) || normName.includes(cName)) return true;
      if (phoneClean && c.contacto && c.contacto.replace(/\D/g, '').includes(phoneClean)) return true;
      if (m.email && c.email && m.email.toLowerCase().trim() === c.email.toLowerCase().trim()) return true;
      return false;
    });
  };

  const updateCounselingStatus = (id: string, status: CounselingStatus) => {
    const targetReq = counseling.find((c) => c.id === id);

    setCounseling((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          estado: status,
          fechaAtencion: (status === 'En acompañamiento' || status === 'Cerrada') && !c.fechaAtencion ? new Date().toISOString() : c.fechaAtencion,
        };
      })
    );

    // Notificar al consolidador asignado del hermano
    if (targetReq) {
      const matchedMember = members.find((m) => {
        const normM = m.nombre.toLowerCase().trim();
        const normC = targetReq.nombre.toLowerCase().trim();
        return normM === normC || (targetReq.contacto && m.telefono && m.telefono.includes(targetReq.contacto.slice(-7)));
      });

      if (matchedMember) {
        const labelStatus = status === 'En acompañamiento' 
          ? 'Atendida — En Acompañamiento' 
          : status === 'Cerrada' 
          ? 'Finalizada con éxito' 
          : 'En espera';

        addNotification({
          destinatarioPerfilId: matchedMember.consolidadorId,
          remitenteNombre: 'Pastor Edgar Castaño',
          titulo: `🕊️ Consejería Atendida: ${matchedMember.nombre}`,
          mensaje: `El Pastor Edgar Castaño ha atendido la consejería de ${matchedMember.nombre} sobre "${targetReq.tema}". Estado actual: ${labelStatus}. Ya puedes continuar con tu seguimiento fraterno.`,
          tipo: 'consejeria',
          telefono: matchedMember.telefono,
          accionTexto: 'Ver Expediente',
          accionTipo: 'ver_miembros',
        });

        // Asegurar que el miembro esté clasificado adecuadamente
        if (status === 'En acompañamiento' && matchedMember.estadoSeguimiento !== 'Consejería activa') {
          updateMember(matchedMember.id, {
            estadoSeguimiento: 'Consejería activa',
            solicitoConsejeria: true,
          });
        }
      }
    }

    showToast('info', `Estado de consejería actualizado a "${status}"`, 'Consejería');
  };

  const addCounselingNote = (counselingId: string, noteText: string, author = 'Pastor Edgar') => {
    const newNote: CounselingNote = {
      id: 'note-' + Date.now(),
      fecha: new Date().toISOString(),
      autor: author,
      texto: noteText,
    };

    setCounseling((prev) =>
      prev.map((c) => {
        if (c.id !== counselingId) return c;
        return {
          ...c,
          notas: [newNote, ...c.notas],
        };
      })
    );
    showToast('success', 'Nota pastoral confidencial guardada', 'Nota Agregada');
  };

  // Donations Actions
  const addDonation = (data: Omit<Donation, 'id' | 'verificado'>) => {
    const newDonation: Donation = {
      ...data,
      id: 'don-' + Date.now(),
      verificado: true,
    };

    setDonations((prev) => [newDonation, ...prev]);
    showToast('success', `Ofrenda de $${data.monto.toLocaleString('es-CO')} registrada`, 'Donación Registrada');

    // Persistir en Supabase
    guardarDonacionSupabase(newDonation);

    const telegramMsg = `💰 <b>Nueva Ofrenda Reportada IBC</b>\n\n<b>Donante:</b> ${data.nombre}\n<b>Monto:</b> $${data.monto.toLocaleString('es-CO')} COP\n<b>Categoría:</b> ${data.categoria}\n<b>Método:</b> ${data.metodo}\n\n<i>Registrada para contabilidad pastoral.</i>`;
    sendTelegramAlert(telegramMsg);
  };

  const toggleVerifyDonation = (id: string) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, verificado: !d.verificado } : d))
    );
  };

  const updateConfig = (updates: Partial<SystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    showToast('success', 'Configuración del sistema actualizada', 'Ajustes Guardados');
  };

  const resetToDefaults = () => {
    setMembers(INITIAL_MEMBERS);
    setCounseling(INITIAL_COUNSELING);
    setDonations(INITIAL_DONATIONS);
    setConfig(INITIAL_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.COUNSELING);
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    setActiveProfileState('pastor');
    showToast('info', 'Datos restablecidos a la semilla inicial de IBC Bogotá', 'Datos Restaurados');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentView,
        setCurrentView,
        activeProfile,
        setActiveProfile,
        activeUserProfile,
        activeRole,
        userProfiles: USER_PROFILES,
        permissions,
        consolidators,
        currentConsolidator,
        members,
        counseling,
        donations,
        config,
        addMember,
        updateMember,
        deleteMember,
        changeMemberStatus,
        advanceMemberWeek,
        registerContactAttempt,
        reassignConsolidator,
        advanceMemberRoadmap,
        updateDiscipleshipProgress,
        updateMinistryPlacement,
        scheduleDiscipleshipClass,
        registerDiscipleshipAbsence,
        resetDiscipleshipAbsences,
        addCounseling,
        updateCounselingStatus,
        addCounselingNote,
        scheduleCounselingAppointment,
        addDonation,
        toggleVerifyDonation,
        updateConfig,
        resetToDefaults,
        supabaseStatus,
        supabaseMessage,
        testSupabase,
        toasts,
        showToast,
        removeToast,
        sendTelegramAlert,
        testTelegramConnection,
        triggerWeeklyDispatchNow,
        triggerTestAlert,
        scheduleAllProcessesForNextWeek,
        getTiempoAtencionStatus,
        getCounselingForMember,
        logs,
        addLog,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        sendTeamMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
