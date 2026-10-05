import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = Number(process.env.PORT) || 3000;

  // Helper function to send message via Telegram Bot API
  async function sendTelegramMessage(token: string, chatId: string, text: string) {
    if (!token || !chatId) {
      throw new Error('Telegram Bot Token o Chat ID no configurados');
    }
    const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description || 'Error al enviar mensaje por Telegram');
    }
    return data;
  }

  // API Endpoints for Telegram Integration
  
  // 1. Send generic or test message
  app.post('/api/telegram/send', async (req, res) => {
    try {
      const { token, chatId, text } = req.body;
      if (!token || !chatId || !text) {
        return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos (token, chatId, text)' });
      }
      const result = await sendTelegramMessage(token, chatId, text);
      res.json({ success: true, message: 'Mensaje enviado a Telegram con éxito', response: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' });
    }
  });

  // 2. Automated Weekly Summary (Pastor & Consolidators)
  app.post('/api/telegram/weekly-summary', async (req, res) => {
    try {
      const { token, chatIdPastor, chatIdConsolidadores, stats } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: 'Telegram Bot Token requerido' });
      }

      const fechaStr = new Date().toLocaleDateString('es-CO', { dateStyle: 'full' });
      const results = [];

      // A. Pastor Summary (Pending counseling, financial totals, general health)
      if (chatIdPastor) {
        const pastorMsg = `📊 <b>RESUMEN SEMANAL PASTORAL — IBC BOGOTÁ</b>\n` +
          `📅 <i>${fechaStr}</i>\n\n` +
          `🙏 <b>Consejerías Pendientes:</b> ${stats?.counselingPending || 0} (${stats?.counselingHighPriority || 0} de alta prioridad)\n` +
          `👥 <b>Nuevos Miembros (Mes):</b> ${stats?.membersThisMonth || 0}\n` +
          `💰 <b>Ofrendas (Últimos 7 días):</b> ${stats?.donationsWeek || '$0'}\n\n` +
          `<i>"Procurad la paz de la ciudad... y orad por ella al Señor." — Jeremías 29:7</i>`;
        
        try {
          await sendTelegramMessage(token, chatIdPastor, pastorMsg);
          results.push({ target: 'Pastor', success: true });
        } catch (e: any) {
          results.push({ target: 'Pastor', success: false, error: e.message });
        }
      }

      // B. Consolidators Summary (Active followers, tasks, pending calls)
      if (chatIdConsolidadores) {
        const consolidatorMsg = `🤝 <b>RESUMEN SEMANAL DE CONSOLIDADORES — IBC BOGOTÁ</b>\n` +
          `📅 <i>${fechaStr}</i>\n\n` +
          `✨ <b>Hermanos en Consolidación:</b> ${stats?.activeFollowUps || 0} personas en ruta formativa de 8 semanas.\n` +
          `📞 <b>Misión de esta semana:</b> Realizar llamadas de afirmación, compartir el versículo semanal y animar la asistencia dominical.\n\n` +
          `👥 <b>Equipo de Consolidadores:</b>\n` +
          `• <b>Consolidador 1:</b> Martha Cecilia Gómez\n` +
          `• <b>Consolidador 2:</b> Andrés Felipe Pardo\n` +
          `• <b>Consolidador 3:</b> Viviana Torres Mora\n\n` +
          `📖 <i>«Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre, sabiendo que vuestro trabajo en el Señor no es en vano.» — 1 Corintios 15:58</i>`;
        
        try {
          await sendTelegramMessage(token, chatIdConsolidadores, consolidatorMsg);
          results.push({ target: 'Consolidadores', success: true });
        } catch (e: any) {
          results.push({ target: 'Consolidadores', success: false, error: e.message });
        }
      }

      res.json({ success: true, message: 'Resúmenes semanales procesados', results });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3. Pastor Counseling Alert
  app.post('/api/telegram/counseling-alert', async (req, res) => {
    try {
      const { token, chatIdPastor, counselingItem } = req.body;
      if (!token || !chatIdPastor || !counselingItem) {
        return res.status(400).json({ success: false, error: 'Faltan datos para la alerta de consejería' });
      }

      const msg = `🚨 <b>ALERTA DE CONSEJERÍA PENDIENTE — PASTOR</b>\n\n` +
        `👤 <b>Hermano(a):</b> ${counselingItem.nombre}\n` +
        `📞 <b>Contacto:</b> ${counselingItem.telefono}\n` +
        `⚠️ <b>Urgencia:</b> ${counselingItem.urgencia}\n` +
        `📝 <b>Motivo:</b> ${counselingItem.motivo || 'Solicitud de atención pastoral'}\n\n` +
        `<i>Por favor gestionar en el CRM lo antes posible.</i>`;

      await sendTelegramMessage(token, chatIdPastor, msg);
      res.json({ success: true, message: 'Alerta de consejería enviada al Pastor' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 4. Consolidator Member Status Change Alert
  app.post('/api/telegram/member-status-alert', async (req, res) => {
    try {
      const { token, chatIdConsolidadores, memberName, oldStatus, newStatus, assignedTo } = req.body;
      if (!token || !chatIdConsolidadores || !memberName) {
        return res.status(400).json({ success: false, error: 'Faltan datos para la alerta de estado' });
      }

      const msg = `🔄 <b>ACTUALIZACIÓN EN GESTIÓN DE MIEMBRO</b>\n\n` +
        `👤 <b>Hermano(a):</b> ${memberName}\n` +
        `📈 <b>Cambio de Estado:</b> <code>${oldStatus || 'Nuevo'}</code> ➡️ <b>${newStatus}</b>\n` +
        `🤝 <b>Responsable:</b> ${assignedTo || 'Equipo de Consolidación'}\n\n` +
        `<i>El seguimiento continúa avanzando en la ruta de afirmación.</i>`;

      await sendTelegramMessage(token, chatIdConsolidadores, msg);
      res.json({ success: true, message: 'Alerta de cambio de estado enviada a consolidadores' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5. Send photo or video via Telegram Bot API
  app.post('/api/telegram/send-media', async (req, res) => {
    try {
      let { token, chatId, mediaType, mediaUrl, caption } = req.body;
      if (!token || !chatId || !mediaUrl) {
        return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos (token, chatId, mediaUrl)' });
      }

      // Convert Google Drive share links to direct raw content links (lh3.googleusercontent.com/d/FILE_ID)
      const driveMatch = mediaUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || mediaUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        const fileId = driveMatch[1];
        mediaUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      }

      // Check if URL is YouTube (including Shorts)
      const ytMatch = mediaUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      let isYouTube = false;
      let ytThumbnail = '';
      let ytWatchUrl = mediaUrl;

      if (ytMatch && ytMatch[2].length === 11) {
        isYouTube = true;
        const videoId = ytMatch[2];
        ytThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        ytWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }

      let endpoint, requestBody;
      if (isYouTube) {
        endpoint = `https://api.telegram.org/bot${token}/sendPhoto`;
        requestBody = {
          chat_id: chatId,
          photo: ytThumbnail,
          caption: `${caption || ''}\n\n▶️ <b>Ver video completo en YouTube:</b> ${ytWatchUrl}`,
          parse_mode: 'HTML',
        };
      } else {
        const method = mediaType === 'video' ? 'sendVideo' : 'sendPhoto';
        const bodyKey = mediaType === 'video' ? 'video' : 'photo';
        endpoint = `https://api.telegram.org/bot${token}/${method}`;
        requestBody = {
          chat_id: chatId,
          [bodyKey]: mediaUrl,
          caption: caption || '',
          parse_mode: 'HTML',
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!data.ok) {
        const fallbackEndpoint = `https://api.telegram.org/bot${token}/sendMessage`;
        const fallbackRes = await fetch(fallbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `${caption || ''}\n\n🔗 <b>Enlace multimedia:</b> ${ytWatchUrl || mediaUrl}\n<i>(Nota: Asegúrate de que el archivo o enlace sea público).</i>`,
            parse_mode: 'HTML',
          }),
        });
        const fallbackData = await fallbackRes.json();
        if (!fallbackData.ok) {
          throw new Error(data.description || 'Error al enviar multimedia por Telegram');
        }
        return res.json({ success: true, message: 'Enviado como enlace de respaldo', response: fallbackData });
      }

      res.json({ success: true, message: 'Multimedia enviada a Telegram con éxito', response: data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' });
    }
  });

  // 3. Webhook / Public API for ibcbogota.com Counseling & Contact submissions
  app.post('/api/external/counseling', async (req, res) => {
    try {
      const { nombre, contacto, email, tema, detalles, urgencia, disponibilidadHorario } = req.body;
      if (!nombre || !contacto || !tema) {
        return res.status(400).json({ success: false, error: 'Faltan campos obligatorios (nombre, contacto, tema)' });
      }

      const notificationText = `🚨 <b>NUEVA SOLICITUD DE CONSEJERÍA DESDE WEB (ibcbogota.com)</b>\n\n` +
        `👤 <b>Nombre:</b> ${nombre}\n` +
        `📞 <b>Contacto:</b> <code>${contacto}</code>\n` +
        `✉️ <b>Email:</b> ${email || 'No proporcionado'}\n` +
        `📋 <b>Tema:</b> ${tema}\n` +
        `📝 <b>Detalle:</b> ${detalles || 'Sin detalles adicionales'}\n` +
        `⚡ <b>Urgencia:</b> ${urgencia || 'Media'}\n` +
        `🕒 <b>Disponibilidad:</b> ${disponibilidadHorario || 'Cualquier horario'}\n\n` +
        `<i>Enviado desde el formulario público de la web oficial ibcbogota.com.</i>`;

      const token = process.env.TELEGRAM_BOT_TOKEN || req.body.token;
      const chatId = process.env.TELEGRAM_CHAT_ID || req.body.chatId;
      if (token && chatId) {
        await sendTelegramMessage(token, chatId, notificationText);
      }

      res.json({
        success: true,
        message: 'Solicitud de consejería recibida e integrada correctamente desde ibcbogota.com',
        receivedData: { nombre, contacto, tema, fecha: new Date().toISOString() }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Error interno al procesar consejería externa' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor backend IBC corriendo en http://localhost:${PORT}`);
  });
}

startServer();
