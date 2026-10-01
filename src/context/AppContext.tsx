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
  | 'counseling'
  | 'discipleship'
  | 'ministry-consolidation'
  | 'schedule'
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

  // Roadmap actions
  advanceMemberRoadmap: (memberId: string, stepNumber?: number, notes?: string) => void;
  updateDiscipleshipProgress: (memberId: string, leccionActual: number, completado: boolean) => void;
  updateMinistryPlacement: (memberId: string, ministerioAsignado: string) => void;

  // Counseling actions
  addCounseling: (
    data: Omit<CounselingRequest, 'id' | 'fechaSolicitud' | 'escalado' | 'notas' | 'tiempoLimiteHoras' | 'slaHours'>
  ) => void;
  updateCounselingStatus: (id: string, status: CounselingStatus) => void;
  addCounselingNote: (counselingId: string, noteText: string, author?: string) => void;

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
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
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
    const telegramMsg = `🆕 <b>Nuevo Registro en IBC Bogotá</b>\n\n<b>Nombre:</b> ${newMember.nombre}\n<b>Teléfono:</b> ${newMember.telefono || 'No reportado'}\n<b>Asignado a:</b> ${assignedConsolidator.alias} (${assignedConsolidator.nombre})\n<b>Paso Inicial:</b> Paso 1 - Bienvenida Dominical\n\n<i>Expediente y ruta de crecimiento hacia el servicio activados.</i>`;
    sendTelegramAlert(telegramMsg);

    addLog(
      'Nuevo Registro',
      `${newMember.nombre} registrado. Asignado a ${assignedConsolidator.alias}. ${newMember.deseaBautizarse ? 'Desea bautizarse: ' + newMember.deseaBautizarse : ''}`,
      'miembro'
    );

    addNotification({
      destinatarioPerfilId: assignedConsolidator.id,
      remitenteNombre: 'Sistema de Consolidación',
      titulo: '🤝 Nuevo Hermano Asignado',
      mensaje: `${newMember.nombre} te fue asignado(a) tras el culto dominical. ${newMember.deseaBautizarse ? 'Desea bautizarse: ' + newMember.deseaBautizarse : ''}`,
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
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const disc = m.discipulado || { leccionActual: 1, completado: false, discipuladorNombre: activeUserProfile.nombre };
        const updatedDisc = {
          ...disc,
          leccionActual,
          completado,
          discipuladorId: activeUserProfile.id,
          discipuladorNombre: activeUserProfile.nombre,
          fechaCompletado: completado ? new Date().toISOString() : undefined,
        };
        addLog('Discipulado', `Actualizada lección ${leccionActual}/13 para ${m.nombre} (Libro Nuevos Creyentes)`, 'discipulado');
        showToast('success', `Progreso de discipulado actualizado: Lección ${leccionActual}/13`, 'Discipulado Actualizado');
        return {
          ...m,
          discipulado: updatedDisc,
          pasoActualRuta: completado ? 5 : m.pasoActualRuta,
        };
      })
    );
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
        addCounseling,
        updateCounselingStatus,
        addCounselingNote,
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
