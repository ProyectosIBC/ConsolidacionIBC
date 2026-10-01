import { TemplateMessage } from '../types';

export const TEMPLATES_DATA: TemplateMessage[] = [
  // 10 Mensajes para personas ausentes (del protocolo IBC Bogotá)
  {
    id: 'ausente-1',
    titulo: 'Mensaje 1 — Correo Electrónico',
    categoria: 'ausente',
    canal: 'Correo Electrónico',
    asunto: 'Te Extrañamos en la Iglesia',
    cuerpo: 'Hola [Nombre], Esperamos que estés bien. Notamos que no asististe al servicio el pasado domingo. ¿Hay algo en lo que podamos apoyarte o alguna petición de oración? Estamos aquí para ti.',
    descripcion: 'Primer contacto formal por correo tras inasistencia dominical.'
  },
  {
    id: 'ausente-2',
    titulo: 'Mensaje 2 — WhatsApp Fraternal',
    categoria: 'ausente',
    canal: 'WhatsApp',
    cuerpo: 'Hola [Nombre], extrañamos verte en la iglesia el domingo. ¿Todo está bien? Si necesitas oración o algún tipo de ayuda, no dudes en decírnoslo.',
    descripcion: 'Mensaje directo y cercano para iniciar conversación por WhatsApp.'
  },
  {
    id: 'ausente-3',
    titulo: 'Mensaje 3 — SMS / Texto Corto',
    categoria: 'ausente',
    canal: 'SMS',
    cuerpo: 'Querido/a [Nombre], nos dimos cuenta de que no estuviste en la iglesia. ¿Hay algo en lo que podamos apoyarte? Estamos aquí para ti.',
    descripcion: 'Mensaje conciso ideal para mensajería de texto estándar.'
  },
  {
    id: 'ausente-4',
    titulo: 'Mensaje 4 — Guion Telefónico Pastoral',
    categoria: 'ausente',
    canal: 'Llamada Telefónica',
    cuerpo: 'Hola [Nombre], soy [Tu Nombre] de la Iglesia Bautista Central. Quería saber cómo estás y si necesitas algo. Estamos aquí para apoyarte.',
    descripcion: 'Pauta de apertura cálida para llamadas pastorales o del equipo de consolidados.'
  },
  {
    id: 'ausente-5',
    titulo: 'Mensaje 5 — Correo: Extrañamos Tu Presencia',
    categoria: 'ausente',
    canal: 'Correo Electrónico',
    asunto: 'Extrañamos Tu Presencia',
    cuerpo: 'Querido/a [Nombre], Extrañamos verte en la iglesia. Si necesitas oración o si hay algo en lo que podamos ayudarte, no dudes en comunicárnoslo.',
    descripcion: 'Correo de seguimiento empático invitando a la comunicación.'
  },
  {
    id: 'ausente-6',
    titulo: 'Mensaje 6 — WhatsApp Petición Oración',
    categoria: 'ausente',
    canal: 'WhatsApp',
    cuerpo: 'Hola [Nombre], esperamos que estés bien. Extrañamos verte en la iglesia. ¿Hay algo en lo que podamos orar por ti?',
    descripcion: 'Foco espiritual en la intercesión y apoyo ministerial.'
  },
  {
    id: 'ausente-7',
    titulo: 'Mensaje 7 — SMS Apoyo Específico',
    categoria: 'ausente',
    canal: 'SMS',
    cuerpo: 'Querido/a [Nombre], notamos que no asististe al servicio. ¿Necesitas apoyo o alguna oración específica?',
    descripcion: 'Pregunta puntual sobre necesidades concretas de la familia o hermano.'
  },
  {
    id: 'ausente-8',
    titulo: 'Mensaje 8 — Guion Llamada Verificación',
    categoria: 'ausente',
    canal: 'Llamada Telefónica',
    cuerpo: 'Hola [Nombre], solo quería verificar cómo estás. Si necesitas oración o algún tipo de ayuda, estamos aquí para ti.',
    descripcion: 'Guion de llamada rápida para confirmar bienestar familiar o personal.'
  },
  {
    id: 'ausente-9',
    titulo: 'Mensaje 9 — Correo: Tu Ausencia en la Iglesia',
    categoria: 'ausente',
    canal: 'Correo Electrónico',
    asunto: 'Tu Ausencia en la Iglesia',
    cuerpo: 'Hola [Nombre], Queríamos asegurarnos de que estés bien. Si necesitas oración o si hay algo en lo que podamos ayudarte, no dudes en decírnoslo.',
    descripcion: 'Correo de seguimiento respetuoso y atento a situaciones personales.'
  },
  {
    id: 'ausente-10',
    titulo: 'Mensaje 10 — WhatsApp Comunidad y Cuidado',
    categoria: 'ausente',
    canal: 'WhatsApp',
    cuerpo: 'Hola [Nombre], extrañamos verte en la iglesia. ¿Hay algo en lo que podamos apoyarte? Estamos aquí para ti.',
    descripcion: 'Cierre solidario recordando la presencia incondicional de la comunidad.'
  },

  // 5 Mensajes de WhatsApp para Miembros Frecuentes Ausentes (IBC Bogotá)
  {
    id: 'frecuente-1',
    titulo: 'Miembro Frecuente 1 — Apoyo Espiritual o Consejería',
    categoria: 'frecuente_ausente',
    canal: 'WhatsApp',
    cuerpo: 'Hola [Nombre], espero que estés bien. Hace un tiempo que no te vemos en la iglesia. ¿Todo está en orden? Si necesitas apoyo espiritual o consejería, no dudes en decírnoslo.',
    descripcion: 'Ofrece directamente el canal de consejería o apoyo ante ausencias prolongadas.'
  },
  {
    id: 'frecuente-2',
    titulo: 'Miembro Frecuente 2 — Invitación con Pastor Edgar',
    categoria: 'frecuente_ausente',
    canal: 'WhatsApp',
    cuerpo: 'Querido/a [Nombre], extrañamos tu presencia en la iglesia. ¿Hay algo en lo que podamos orar por ti? Además, queremos invitarte a un evento especial con el pastor Edgar. ¿Te gustaría asistir?',
    descripcion: 'Invitación a reunión de cercanía pastoral con el pastor Edgar.'
  },
  {
    id: 'frecuente-3',
    titulo: 'Miembro Frecuente 3 — Visita Personal del Pastor',
    categoria: 'frecuente_ausente',
    canal: 'WhatsApp',
    cuerpo: 'Hola [Nombre], notamos que no has venido últimamente. ¿Estás bien? Si necesitas hablar con alguien o si deseas una visita personal del pastor, estamos aquí para ti.',
    descripcion: 'Propuesta de acompañamiento presencial en su hogar o sitio de preferencia.'
  },
  {
    id: 'frecuente-4',
    titulo: 'Miembro Frecuente 4 — Consejo y Reunión Especial',
    categoria: 'frecuente_ausente',
    canal: 'WhatsApp',
    cuerpo: 'Querido/a [Nombre], tu ausencia nos preocupa. ¿Necesitas apoyo espiritual o algún consejo? También queremos invitarte a una reunión con el pastor Edgar. ¿Te gustaría participar?',
    descripcion: 'Preocupación fraternal genuina con invitación pastoral directa.'
  },
  {
    id: 'frecuente-5',
    titulo: 'Miembro Frecuente 5 — Invitación Personalizada Evento',
    categoria: 'frecuente_ausente',
    canal: 'WhatsApp',
    cuerpo: 'Hola [Nombre], esperamos que todo esté bien contigo. Si necesitas oración o si deseas hablar con alguien, no dudes en contactarnos. Además, te extendemos una invitación personalizada a un evento especial. ¿Te gustaría asistir?',
    descripcion: 'Contacto afectuoso que reconecta a través de una actividad congregacional.'
  },

  // 8 Mensajes de Seguimiento Semanal (Ciclo de Consolidación IBC)
  {
    id: 'ciclo-sem-1',
    titulo: 'Semana 1 — Saludo Inicial y Preguntas',
    categoria: 'semanal_8_semanas',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! 🙏 Te saludamos de [Iglesia]. Queremos saber cómo estás y si tienes alguna pregunta sobre la iglesia. ¡Cuenta con nosotros!',
    descripcion: 'Primer toque posterior a la visita del domingo.'
  },
  {
    id: 'ciclo-sem-2',
    titulo: 'Semana 2 — Oferta de Acompañamiento o Transporte',
    categoria: 'semanal_8_semanas',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! ¿Cómo va tu semana? Te esperamos este domingo en nuestro servicio. Si necesitas que alguien te acompañe o te recoja, escríbenos sin pena. 😊',
    descripcion: 'Ofrecimiento clave de logística y transporte para facilitar el retorno.'
  },
  {
    id: 'ciclo-sem-3',
    titulo: 'Semana 3 — Devocional y Grupos Pequeños',
    categoria: 'semanal_8_semanas',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! Esperamos que estés muy bien. ¿Te gustaría recibir el devocional semanal o participar en algún grupo de la iglesia? Cuéntanos y te ayudamos.',
    descripcion: 'Conexión a comunidades de estudio bíblico o células.'
  },
  {
    id: 'ciclo-sem-4',
    titulo: 'Semana 4 — Esta es Tu Casa & Peticiones',
    categoria: 'semanal_8_semanas',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! Queremos que sepas que esta es tu casa. Si estás pasando por un momento difícil o necesitas oración, estamos para ti. 🙏',
    descripcion: 'Afirmación de pertenencia y respaldo espiritual.'
  },
  {
    id: 'ciclo-sem-5',
    titulo: 'Semana 5 — Estudios Bíblicos y Servicio',
    categoria: 'semanal_8_semanas',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! En [Iglesia] hay estudios bíblicos y grupos de servicio. ¿Te gustaría conocerlos? Con gusto te contamos más.',
    descripcion: 'Orientación a áreas de servicio y ministerio.'
  },
  {
    id: 'ciclo-sem-6',
    titulo: 'Semana 6 — Eres Importante para Nosotros',
    categoria: 'semanal_8_semanas',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! Solo queríamos recordarte que eres importante para nuestra comunidad. ¿Hay algo en lo que podamos ayudarte esta semana?',
    descripcion: 'Reafirmación de valor y cuidado en la comunidad.'
  },
  {
    id: 'ciclo-sem-7',
    titulo: 'Semana 7 — Considerar Membresía Formal',
    categoria: 'semanal_8_semanas',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! Ya casi cumples 2 meses con nosotros. Nos encantaría que consideres formalizar tu membresía. ¿Hablamos?',
    descripcion: 'Paso formal de transición a miembro integrado.'
  },
  {
    id: 'ciclo-sem-8',
    titulo: 'Semana 8 — Cierre de Ciclo y Puertas Abiertas',
    categoria: 'semanal_8_semanas',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! Este es nuestro último mensaje de seguimiento programado, pero la puerta sigue abierta. Si deseas pertenecer formalmente a [Iglesia] o tienes dudas, escríbenos. ¡Dios te bendiga! 🙏',
    descripcion: 'Graduación del ciclo de 8 semanas e integración.'
  },

  // Protocolo Operativo Semanal Lunes / Miércoles / Viernes
  {
    id: 'operativo-lunes',
    titulo: 'Lunes — Bienvenida Post-Servicio',
    categoria: 'bienvenida',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! 🙏 Qué gran bendición haberte tenido este domingo en la Iglesia Bautista Central de Bogotá. Esperamos que la palabra haya edificado tu vida. ¿Tienes alguna pregunta sobre los horarios o grupos de estudio? ¡Cuenta con nosotros!',
    descripcion: 'Contacto inicial de lunes para los visitantes del domingo.'
  },
  {
    id: 'operativo-miercoles',
    titulo: 'Miércoles — Llamada Testimonial (2da Semana)',
    categoria: 'bienvenida',
    canal: 'Llamada Telefónica',
    cuerpo: 'Hola [Nombre], te saluda [Tu Nombre] de la Iglesia Bautista Central. Queríamos saber cómo te has sentido en estas dos semanas, compartirte un testimonio hermoso de nuestra comunidad y saber si podemos orar por ti o tu familia.',
    descripcion: 'Seguimiento de dos semanas para indagar necesidades y conectar.'
  },
  {
    id: 'operativo-viernes',
    titulo: 'Viernes — Invitación y Transporte Domingo',
    categoria: 'bienvenida',
    canal: 'WhatsApp',
    cuerpo: '¡Hola [Nombre]! 😊 Este domingo tendremos un servicio muy especial en la Iglesia Bautista Central y nos encantaría contar contigo. Si requieres apoyo de transporte o que alguien te acompañe, avísanos con confianza. ¿Te anotamos para este domingo?',
    descripcion: 'Viernes de reactivación y logística de transporte.'
  }
];
