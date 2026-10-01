/**
 * Servicio de integración con Telegram Bot API directa
 * Funciona de forma nativa en Vercel, Netlify y entornos locales (CORS habilitado por Telegram)
 */

export interface TelegramSendResult {
  success: boolean;
  message: string;
  response?: any;
}

/**
 * Función central de comunicación con la API oficial de Telegram
 */
async function callTelegramApi(
  token: string,
  endpoint: string,
  payload: Record<string, any>
): Promise<TelegramSendResult> {
  if (!token) {
    return { success: false, message: 'Token del Bot de Telegram no configurado' };
  }

  const cleanToken = token.trim();
  const url = `https://api.telegram.org/bot${cleanToken}/${endpoint}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!data) {
      return {
        success: false,
        message: 'Respuesta inválida recibida del servidor de Telegram',
      };
    }

    if (data.ok) {
      return {
        success: true,
        message: 'Mensaje enviado a Telegram con éxito',
        response: data.result,
      };
    } else {
      return {
        success: false,
        message: data.description || `Error devuelto por Telegram (${data.error_code || 'desconocido'})`,
        response: data,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Error de conexión con la API de Telegram',
    };
  }
}

/**
 * Envía notificación de texto formateado en HTML a Telegram
 */
export async function enviarNotificacionTelegram(
  token: string,
  chatId: string,
  texto: string
): Promise<TelegramSendResult> {
  if (!token || !chatId) {
    return {
      success: false,
      message: 'Token de bot o Chat ID no configurados',
    };
  }

  return callTelegramApi(token, 'sendMessage', {
    chat_id: chatId.trim(),
    text: texto,
    parse_mode: 'HTML',
  });
}

/**
 * Dispara el resumen semanal automático para Pastor y Consolidadores
 */
export async function enviarResumenSemanalTelegram(
  token: string,
  chatIdPastor: string,
  chatIdConsolidadores: string,
  stats: {
    counselingPending: number;
    counselingHighPriority: number;
    membersThisMonth: number;
    donationsWeek: string;
    activeFollowUps: number;
  }
): Promise<TelegramSendResult> {
  const fechaStr = new Date().toLocaleDateString('es-CO', { dateStyle: 'full' });
  const results: any[] = [];

  // A. Resumen para el Pastor Edgar
  if (chatIdPastor) {
    const pastorMsg =
      `📊 <b>RESUMEN SEMANAL PASTORAL — IBC BOGOTÁ</b>\n` +
      `📅 <i>${fechaStr}</i>\n\n` +
      `🙏 <b>Consejerías Pendientes:</b> ${stats?.counselingPending || 0} (${stats?.counselingHighPriority || 0} de alta prioridad)\n` +
      `👥 <b>Nuevos Miembros (Mes):</b> ${stats?.membersThisMonth || 0}\n` +
      `💰 <b>Ofrendas (Últimos 7 días):</b> ${stats?.donationsWeek || '$0'}\n\n` +
      `<i>"Procurad la paz de la ciudad... y orad por ella al Señor." — Jeremías 29:7</i>`;

    const resPastor = await enviarNotificacionTelegram(token, chatIdPastor, pastorMsg);
    results.push({ target: 'Pastor', success: resPastor.success, message: resPastor.message });
  }

  // B. Resumen para el Grupo de Consolidadores
  if (chatIdConsolidadores) {
    const consolidatorMsg =
      `🤝 <b>RESUMEN SEMANAL DE CONSOLIDADORES — IBC BOGOTÁ</b>\n` +
      `📅 <i>${fechaStr}</i>\n\n` +
      `✨ <b>Hermanos en Consolidación:</b> ${stats?.activeFollowUps || 0} personas en ruta formativa de 8 semanas.\n` +
      `📞 <b>Misión de esta semana:</b> Realizar llamadas de afirmación, compartir el versículo semanal y animar la asistencia dominical.\n\n` +
      `👥 <b>Equipo de Consolidadores:</b>\n` +
      `• <b>Consolidador 1:</b> Martha Cecilia Gómez\n` +
      `• <b>Consolidador 2:</b> Andrés Felipe Pardo\n` +
      `• <b>Consolidador 3:</b> Viviana Torres Mora\n\n` +
      `📖 <i>«Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre, sabiendo que vuestro trabajo en el Señor no es en vano.» — 1 Corintios 15:58</i>`;

    const resCons = await enviarNotificacionTelegram(token, chatIdConsolidadores, consolidatorMsg);
    results.push({ target: 'Consolidadores', success: resCons.success, message: resCons.message });
  }

  const anySuccess = results.some((r) => r.success);
  return {
    success: anySuccess,
    message: anySuccess
      ? 'Resúmenes semanales enviados a Telegram con éxito'
      : (results[0]?.message || 'No se pudo enviar el resumen'),
    response: results,
  };
}

/**
 * Alerta al Pastor sobre consejerías pendientes
 */
export async function enviarAlertaCounselingPastor(
  token: string,
  chatIdPastor: string,
  counselingItem: {
    nombre: string;
    telefono: string;
    urgencia: string;
    motivo?: string;
  }
): Promise<TelegramSendResult> {
  const msg =
    `🚨 <b>ALERTA DE CONSEJERÍA PENDIENTE — PASTOR</b>\n\n` +
    `👤 <b>Hermano(a):</b> ${counselingItem.nombre}\n` +
    `📞 <b>Contacto:</b> ${counselingItem.telefono}\n` +
    `⚠️ <b>Urgencia:</b> ${counselingItem.urgencia}\n` +
    `📝 <b>Motivo:</b> ${counselingItem.motivo || 'Solicitud de atención pastoral'}\n\n` +
    `<i>Por favor gestionar en el CRM lo antes posible.</i>`;

  return enviarNotificacionTelegram(token, chatIdPastor, msg);
}

/**
 * Alerta a consolidadores sobre cambios de estado en la gestión de miembros
 */
export async function enviarAlertaEstadoMiembro(
  token: string,
  chatIdConsolidadores: string,
  memberName: string,
  oldStatus: string,
  newStatus: string,
  assignedTo: string
): Promise<TelegramSendResult> {
  const msg =
    `🔄 <b>ACTUALIZACIÓN EN GESTIÓN DE MIEMBRO</b>\n\n` +
    `👤 <b>Hermano(a):</b> ${memberName}\n` +
    `📈 <b>Cambio de Estado:</b> <code>${oldStatus || 'Nuevo'}</code> ➡️ <b>${newStatus}</b>\n` +
    `🤝 <b>Responsable:</b> ${assignedTo || 'Equipo de Consolidación'}\n\n` +
    `<i>Actualizado en el Sistema de Consolidación IBC.</i>`;

  return enviarNotificacionTelegram(token, chatIdConsolidadores, msg);
}

/**
 * Envía video o foto (predica, video del pastor, flyer) a Telegram
 */
export async function enviarMultimediaTelegram(
  token: string,
  chatId: string,
  mediaType: 'video' | 'photo',
  mediaUrl: string,
  caption: string
): Promise<TelegramSendResult> {
  if (!token || !chatId || !mediaUrl) {
    return { success: false, message: 'Token, Chat ID o URL multimedia faltantes' };
  }

  const endpoint = mediaType === 'video' ? 'sendVideo' : 'sendPhoto';
  const paramName = mediaType === 'video' ? 'video' : 'photo';

  return callTelegramApi(token, endpoint, {
    chat_id: chatId.trim(),
    [paramName]: mediaUrl.trim(),
    caption,
    parse_mode: 'HTML',
  });
}
