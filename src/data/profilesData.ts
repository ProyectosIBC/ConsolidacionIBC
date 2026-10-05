import { UserProfileInfo, UserRole } from '../types';

export const USER_PROFILES: UserProfileInfo[] = [
  {
    id: 'pastor',
    username: 'pastor.edgar',
    password: 'Pastor2026*',
    nombre: 'Pastor Edgar Castaño',
    email: 'pastor.edgar@ibcbogota.org',
    rol: 'pastor',
    rolLabel: 'Pastor Principal',
    badge: '🕊️ Pastoral',
    descripcion: 'Supervisión de la grey, consejería pastoral, visión global de consolidación y libro contable.',
    avatarColor: 'bg-blue-800 text-white',
  },
  {
    id: 'cons-1',
    username: 'martha.gomez',
    password: 'Martha2026*',
    nombre: 'Martha Cecilia Gómez',
    email: 'martha.gomez@ibcbogota.org',
    rol: 'consolidador',
    rolLabel: 'Consolidadora Líder 1',
    badge: '🤝 Consolidadora',
    descripcion: 'Acompañamiento personal de sus asignados, avance en la ruta de 6 pasos y llamadas de bienestar.',
    avatarColor: 'bg-emerald-600 text-white',
  },
  {
    id: 'cons-2',
    username: 'andres.pardo',
    password: 'Andres2026*',
    nombre: 'Andrés Felipe Pardo',
    email: 'andres.pardo@ibcbogota.org',
    rol: 'consolidador',
    rolLabel: 'Consolidador Líder 2',
    badge: '🤝 Consolidador',
    descripcion: 'Cuidado fraterno de sus asignados, coordinación de transporte dominical y mensajes bíblicos.',
    avatarColor: 'bg-indigo-600 text-white',
  },
  {
    id: 'cons-3',
    username: 'viviana.torres',
    password: 'Viviana2026*',
    nombre: 'Viviana Torres Mora',
    email: 'viviana.torres@ibcbogota.org',
    rol: 'consolidador',
    rolLabel: 'Consolidadora Líder 3',
    badge: '🤝 Consolidadora',
    descripcion: 'Integración a grupos de conexión y estudio bíblico, consolidación de familias y afirmación en fundamentos doctrinales.',
    avatarColor: 'bg-purple-600 text-white',
  },
  {
    id: 'disc-1',
    username: 'samuel.silva',
    password: 'Samuel2026*',
    nombre: 'Samuel Esteban Silva',
    email: 'samuel.silva@ibcbogota.org',
    rol: 'discipulador',
    rolLabel: 'Discipulador Líder 1',
    badge: '📖 Discipulador',
    descripcion: 'Acompañamiento doctrinal y estudio semanal de las 13 lecciones del libro "Nuevos Creyentes".',
    avatarColor: 'bg-amber-600 text-white',
  },
  {
    id: 'disc-2',
    username: 'claudia.roa',
    password: 'Claudia2026*',
    nombre: 'Claudia Milena Roa',
    email: 'claudia.roa@ibcbogota.org',
    rol: 'discipulador',
    rolLabel: 'Discipuladora Líder 2',
    badge: '📖 Discipuladora',
    descripcion: 'Encuentros virtuales y presenciales de fundamentación bíblica con el libro "Nuevos Creyentes".',
    avatarColor: 'bg-teal-600 text-white',
  },
  {
    id: 'disc-3',
    username: 'david.moreno',
    password: 'David2026*',
    nombre: 'David Leonardo Moreno',
    email: 'david.moreno@ibcbogota.org',
    rol: 'discipulador',
    rolLabel: 'Discipulador Líder 3',
    badge: '📖 Discipulador',
    descripcion: 'Guía en el crecimiento espiritual inicial, preparación para bautismo y fundamentación en la Palabra.',
    avatarColor: 'bg-sky-600 text-white',
  },
  {
    id: 'dev',
    username: 'desarrollador',
    password: 'DevIBC2026*',
    nombre: 'Desarrollador (Proyectos IBC)',
    email: 'proyectosibc26@gmail.com',
    rol: 'desarrollador',
    rolLabel: 'Desarrollador de la Herramienta',
    badge: '💻 Desarrollador',
    descripcion: 'Control técnico de base de datos Supabase, configuración de Telegram Bot API, backups y simulación de roles.',
    avatarColor: 'bg-slate-900 text-amber-400 border border-amber-500/40',
  },
];

export function getProfileById(id: string): UserProfileInfo {
  return USER_PROFILES.find((p) => p.id === id) || USER_PROFILES[0];
}

export function authenticateUser(identifier: string, pass: string): UserProfileInfo | null {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();

  const user = USER_PROFILES.find((p) => {
    const matchUsername = p.username.toLowerCase() === cleanId;
    const matchEmail = p.email.toLowerCase() === cleanId;
    return (matchUsername || matchEmail) && p.password === cleanPass;
  });

  return user || null;
}

export function getRolePermissions(rol: UserRole) {
  return {
    puedeVerMetricasGlobales: rol === 'pastor' || rol === 'desarrollador',
    puedeVerOfrendas: rol === 'pastor' || rol === 'desarrollador',
    puedeGestionarConsejeria: rol === 'pastor' || rol === 'desarrollador',
    puedeGestionarDiscipulado: rol === 'discipulador' || rol === 'pastor' || rol === 'desarrollador',
    puedeAccederBaseDatos: rol === 'desarrollador',
    puedeAccederAjustesTecnicos: rol === 'pastor' || rol === 'desarrollador',
    puedeSimularRoles: rol === 'desarrollador',
  };
}
