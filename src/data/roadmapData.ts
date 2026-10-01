import { RoadmapStepInfo, Consolidator } from '../types';

export const CONSOLIDATOR_TEAM: Consolidator[] = [
  {
    id: 'cons-1',
    nombre: 'Martha Cecilia Gómez',
    alias: 'Consolidador 1',
    rol: 'Líder de Bienvenida y Consolidación',
    telefono: '573195335076',
    email: 'martha.gomez@ibcbogota.org',
    activo: true,
    avatarColor: 'bg-emerald-600 text-white',
  },
  {
    id: 'cons-2',
    nombre: 'Andrés Felipe Pardo',
    alias: 'Consolidador 2',
    rol: 'Diácono de Cuidado Congregacional',
    telefono: '573105551234',
    email: 'andres.pardo@ibcbogota.org',
    activo: true,
    avatarColor: 'bg-blue-600 text-white',
  },
  {
    id: 'cons-3',
    nombre: 'Viviana Torres Mora',
    alias: 'Consolidador 3',
    rol: 'Líder de Grupos de Conexión',
    telefono: '573204991244',
    email: 'viviana.torres@ibcbogota.org',
    activo: true,
    avatarColor: 'bg-purple-600 text-white',
  },
];

export const ROADMAP_STEPS: RoadmapStepInfo[] = [
  {
    paso: 1,
    titulo: 'Bienvenida Dominical',
    fase: 'Recepción y Saludo',
    semanas: 'Semana 1',
    descripcion: 'Recepción en el templo, tarjeta de registro completada y primer saludo pastoral.',
    accionSiguiente: 'Enviar mensaje fraternal por WhatsApp el lunes para agradecer su visita y confirmar que todo esté bien.',
    mensajePredeterminado:
      '¡Hola [Nombre]! 🙏 Qué alegría haberte tenido este domingo en la Iglesia Bautista Central de Bogotá. Esperamos que hayas sentido el calor de la familia de Dios. ¿Tienes alguna pregunta o podemos orar por ti esta semana? ¡Cuenta con nosotros!',
  },
  {
    paso: 2,
    titulo: 'Primer Contacto & Café de Conexión',
    fase: 'Relación y Escucha',
    semanas: 'Semanas 1 - 2',
    descripcion: 'Llamada testimonial o café informal con el consolidador asignado para resolver inquietudes y escuchar sus necesidades.',
    accionSiguiente: 'Invitarlo a una reunión de grupo pequeño / célula de hogar según su afinidad (matrimonios, jóvenes, familias).',
    mensajePredeterminado:
      '¡Hola [Nombre]! Te saluda [Tu Nombre] de la Iglesia Bautista Central. Nos encantaría compartir un café o una llamada corta para saludarte, saber cómo te has sentido en la iglesia y responder cualquier inquietud. ¿Qué día te queda mejor esta semana? 😊',
  },
  {
    paso: 3,
    titulo: 'Grupo de Conexión / Célula de Hogar',
    fase: 'Vida en Comunidad',
    semanas: 'Semanas 3 - 4',
    descripcion: 'Participación activa en un grupo pequeño en casa, devocionales semanales y comunión fraternal con otros hermanos.',
    accionSiguiente: 'Animar a dar el paso a los talleres de Fundamentos de la Fe y Discipulado Bíblico.',
    mensajePredeterminado:
      '¡Hola [Nombre]! Esperamos que estés muy bien. Queremos invitarte a nuestro grupo pequeño de estudio bíblico y amistad esta semana. Es un espacio hermoso para aprender la palabra y compartir en familia. ¿Te animas a acompañarnos? ¡Te guardamos un lugar!',
  },
  {
    paso: 4,
    titulo: 'Fundamentos de la Fe & Discipulado',
    fase: 'Crecimiento Bíblico',
    semanas: 'Semanas 5 - 6',
    descripcion: 'Afirmación de doctrinas básicas de la fe cristiana, estudio sistemático y preparación para el bautismo (si aplica).',
    accionSiguiente: 'Coordinar con el Pastor Edgar la entrevista para presentar su deseo de formalizar su membresía.',
    mensajePredeterminado:
      '¡Hola [Nombre]! Vemos con gran gozo cómo Dios está obrando en tu vida en la IBC. Queremos invitarte a iniciar las clases de Fundamentos de la Fe y Discipulado. Son 4 sesiones clave para tu crecimiento espiritual. ¿Comenzamos este sábado?',
  },
  {
    paso: 5,
    titulo: 'Membresía Formal de la IBC',
    fase: 'Compromiso Congregacional',
    semanas: 'Semanas 7 - 8',
    descripcion: 'Entrevista pastoral con el Pastor Edgar, compromiso con la congregación y recepción oficial como miembro activo.',
    accionSiguiente: 'Identificar sus dones espirituales y canalizarlo a un ministerio donde pueda servir a Dios y al prójimo.',
    mensajePredeterminado:
      '¡Hola [Nombre]! Ya has cumplido un tiempo hermoso caminando con nosotros y esta ya es tu casa. Queremos coordinar un encuentro especial con el Pastor Edgar para dar el paso a la membresía formal de la Iglesia Bautista Central. ¿Podemos agendarlo?',
  },
  {
    paso: 6,
    titulo: 'Sirviendo en la Iglesia (¡Meta Cumplida!)',
    fase: 'Siervo Activo del Señor',
    semanas: 'Servicio Continuo',
    descripcion: 'El creyente sirve activamente al Señor en ministerios como Alabanza, Bienvenida/Ujieres, Niños, Consolidación o Misiones.',
    accionSiguiente: 'Acompañar su servicio, motivarle en oración y que ahora sea él/ella quien consolide a nuevos visitantes.',
    mensajePredeterminado:
      '¡Gloria a Dios por tu vida, [Nombre]! Es un deleite y una bendición del Señor verte sirviendo en la casa de Dios. Tu testimonio edifica a toda la congregación. ¡Sigamos adelante sirviendo al Señor con alegría y fidelidad!',
  },
];
