export type FollowUpStatus = 
  | 'Nuevo' 
  | 'En seguimiento' 
  | 'Necesita atención' 
  | 'Integrado' 
  | 'Consejería activa';

export type CounselingUrgency = 'Alta' | 'Media' | 'Baja';

export type CounselingStatus = 'Pendiente' | 'En acompañamiento' | 'Cerrada';

export type DonationCategory = 'Diezmo' | 'Ofrenda dominical' | 'Pro-Templo' | 'Misiones' | 'Acción Social' | 'Otro';

export type PaymentMethod = 'Bancolombia' | 'Nequi' | 'Daviplata' | 'Efectivo' | 'Datafono' | 'Otro';

export type MemberType = 'Visitante Nuevo' | 'En Proceso' | 'Miembro Frecuente' | 'Ausente' | 'Integrado';

export type UserRole = 'pastor' | 'consolidador' | 'discipulador' | 'desarrollador';

export interface UserProfileInfo {
  id: string; // 'pastor', 'cons-1', 'cons-2', 'cons-3', 'dev'
  username: string;
  password: string;
  nombre: string;
  email: string;
  rol: UserRole;
  rolLabel: string;
  badge: string;
  descripcion: string;
  avatarColor: string;
}

export interface Consolidator {
  id: string;
  nombre: string;
  alias: string; // e.g. "Consolidador 1"
  rol: string;
  telefono: string;
  email: string;
  activo: boolean;
  avatarColor: string;
}

export interface RoadmapStepInfo {
  paso: number; // 1 to 6
  titulo: string;
  fase: string;
  semanas: string;
  descripcion: string;
  accionSiguiente: string;
  mensajePredeterminado: string;
}

export interface MemberRoadmapProgress {
  paso: number;
  completado: boolean;
  fechaCompletado?: string;
  notas?: string;
}

export interface DiscipleshipProgress {
  leccionActual: number; // 1 a 13 ("Nuevos Creyentes")
  completado: boolean; // Las 13 lecciones finalizadas
  discipuladorId?: string;
  discipuladorNombre?: string;
  fechaInicio?: string;
  fechaCompletado?: string;
  notas?: string;
}

export interface Member {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  fechaRegistro: string; // ISO date
  tipo: MemberType;
  estadoSeguimiento: FollowUpStatus;
  semanaActual: number; // 1 to 8
  proximoContacto: string; // ISO date
  ciclosContacto: number; // how many contacts attempted
  ultimoContacto?: string;
  notas: string;
  direccion?: string;
  ministerioInteres?: string;
  motivoAusencia?: string;
  necesitaTransporte?: boolean;
  escaladoPastor?: boolean;
  fechaEscalamiento?: string;
  
  // Asignación de Consolidador
  consolidadorId: string;
  consolidadorNombre: string;

  // Asignación de Discipulador (Libro Nuevos Creyentes - 13 Lecciones)
  discipuladorId?: string;
  discipuladorNombre?: string;
  discipulado?: DiscipleshipProgress;

  // Bautismo y Disponibilidad
  deseaBautizarse?: 'Sí' | 'No' | 'Ya bautizado' | 'Desea información';
  disponibilidadContacto?: 'Mañana' | 'Tarde' | 'Noche';
  solicitoConsejeria?: boolean;

  // Ruta de Crecimiento & Servicio (Pasos 1 a 6)
  pasoActualRuta: number; // 1 = Bienvenida, 2 = Conexión, 3 = Grupo Pequeño, 4 = Discipulado, 5 = Membresía, 6 = Servicio Activo
  historialRuta: MemberRoadmapProgress[];
}

export interface CounselingNote {
  id: string;
  fecha: string;
  autor: string;
  texto: string;
}

export interface CounselingRequest {
  id: string;
  nombre: string;
  contacto: string; // Phone or email
  email?: string;
  tema: string; // Matrimonial, Espiritual, Familiar, Duelo, etc.
  detalles?: string;
  urgencia: CounselingUrgency;
  disponibilidadHorario?: 'Mañana' | 'Tarde' | 'Noche' | 'Cualquier horario';
  tiempoLimiteHoras: number; // 6 for Alta, 24 for Media, 24 for Baja (antes llamado SLA)
  slaHours?: number; // compatibilidad
  fechaSolicitud: string; // ISO date-time
  estado: CounselingStatus;
  pastorAsignado?: string;
  escalado: boolean;
  fechaEscalado?: string;
  fechaAtencion?: string;
  notas: CounselingNote[];
}

export interface AppLog {
  id: string;
  timestamp: string;
  usuario: string;
  rol: UserRole;
  accion: string;
  detalle: string;
  categoria: 'miembro' | 'consejeria' | 'ofrenda' | 'sesion' | 'sistema' | 'discipulado' | 'ministerio';
}

export interface AppNotification {
  id: string;
  destinatarioPerfilId: string | 'todos'; // 'pastor', 'cons-1', 'cons-2', 'cons-3', 'dev', 'todos'
  remitenteNombre?: string;
  titulo: string;
  mensaje: string;
  tipo: 'consejeria' | 'miembro' | 'sistema' | 'mensaje_equipo' | 'ofrenda';
  leida: boolean;
  fecha: string;
  telefono?: string;
  disponibilidad?: string;
  accionTexto?: string;
  accionTipo?: 'llamar' | 'whatsapp' | 'ver_consejeria' | 'ver_miembros';
}

export interface Donation {
  id: string;
  nombre: string;
  monto: number;
  fecha: string; // ISO date
  categoria: DonationCategory;
  metodo: PaymentMethod;
  referencia?: string;
  comprobanteUrl?: string; // Image URL or base64
  verificado: boolean;
  notas?: string;
}

export interface TemplateMessage {
  id: string;
  titulo: string;
  categoria: 'ausente' | 'frecuente_ausente' | 'semanal_8_semanas' | 'bienvenida' | 'ruta_crecimiento';
  canal: 'WhatsApp' | 'Correo Electrónico' | 'SMS' | 'Llamada Telefónica';
  asunto?: string;
  cuerpo: string;
  descripcion?: string;
}

export interface SystemConfig {
  nombreIglesia: string;
  pastorNombre: string;
  pastorEmail: string;
  encargadoEmail: string;
  numeroIglesia: string; // e.g. 573195335076
  prefijoPais: string; // 57
  telegramToken: string;
  telegramChatId: string;
  proyectosGoogleEmail: string; // proyectosibc26@gmail.com
  diasContacto: number[]; // 1=Monday, 4=Thursday
  semanasSeguimiento: number; // 8
  ciclosParaAvisar: number; // 2
  diaContenido: number; // 1 = Monday
  umbralConsejeriaHoras: {
    Alta: number;
    Media: number;
    Baja: number;
  };
}
