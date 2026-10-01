import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Save,
  Sparkles,
  Heart,
  BookOpen,
  Video,
  Image as ImageIcon,
  Plus,
  Play,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Film,
  FolderOpen,
  Cloud,
  Link as LinkIcon,
  Edit3,
  Eye,
} from 'lucide-react';
import { enviarNotificacionTelegram, enviarMultimediaTelegram } from '../../lib/telegramService';

interface TelegramTemplate {
  id: string;
  titulo: string;
  tipo: 'Pastor' | 'Consolidadores' | 'General';
  asunto: string;
  contenido: string;
  activo: boolean;
}

interface MediaItem {
  id: string;
  titulo: string;
  tipo: 'video_predica' | 'video_pastor' | 'imagen_flyer';
  url: string;
  thumbnail: string;
  fecha: string;
  descripcion: string;
}

export const TelegramAutomationView: React.FC = () => {
  const { config, updateConfig, showToast, members, counseling, donations } = useApp();

  const [activeTab, setActiveTab] = useState<'semanal' | 'media' | 'templates'>('semanal');
  const [sendingWeekly, setSendingWeekly] = useState<string | null>(null);

  // Tone selector for humanized messages
  const [selectedTone, setSelectedTone] = useState<'pastoral' | 'cercano' | 'informativo'>('pastoral');

  // Preview modal state
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // WhatsApp modal state
  const [whatsappItem, setWhatsappItem] = useState<MediaItem | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [whatsappName, setWhatsappName] = useState<string>('');

  // Templates state
  const [templates, setTemplates] = useState<TelegramTemplate[]>([
    {
      id: 'weekly-pastor',
      titulo: 'Resumen Semanal Pastoral',
      tipo: 'Pastor',
      asunto: '📊 Reporte de Cuidado Pastoral y Consejerías',
      contenido: `🌿 <b>Familia Pastoral — IBC Bogotá</b>\n\nQuerido Pastor, aquí tiene el pulso fraterno de la grey en esta semana:\n\n🙏 <b>Consejerías Pendientes:</b> {counselingPending} solicitudes ({counselingHighPriority} con atención prioritaria).\n👥 <b>Nuevos Integrantes:</b> {membersThisMonth} hermanos registrados en el mes.\n\n<i>"Apacentad la grey de Dios que está entre vosotros..." — 1 Pedro 5:2</i>`,
      activo: true,
    },
    {
      id: 'weekly-consolidators',
      titulo: 'Resumen Semanal para Consolidadores',
      tipo: 'Consolidadores',
      asunto: '🤝 Pulso Semanal de Consolidación y Ruta de 8 Semanas',
      contenido: `✨ <b>Equipo de Consolidación IBC</b>\n\nHermanos, tenemos {activeFollowUps} almas caminando en su ruta de afirmación esta semana. Recordémosles con un mensaje o llamada cuánto les ama el Señor.\n\n📞 <i>"Un amigo ama en todo tiempo..." — Proverbios 17:17</i>`,
      activo: true,
    },
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0].id);
  const [testingSend, setTestingSend] = useState<boolean>(false);
  const [testChatId, setTestChatId] = useState<string>(config.telegramChatId);

  // Media Repository state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: 'med-1',
      titulo: 'Predica Dominical: "La Paz que sobrepasa todo entendimiento"',
      tipo: 'video_predica',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=600',
      fecha: '2026-09-27',
      descripcion: 'Mensaje dominical enfocado en la fortaleza en tiempos de prueba basándose en Filipenses 4.',
    },
    {
      id: 'med-2',
      titulo: 'Mensaje Corto del Pastor Edgar: Bienvenida Visitantes',
      tipo: 'video_pastor',
      url: 'https://www.youtube.com/shorts/HVnWT0sP90w',
      thumbnail: 'https://img.youtube.com/vi/HVnWT0sP90w/hqdefault.jpg',
      fecha: '2026-09-26',
      descripcion: 'Saludo especial de bienvenida para los nuevos hermanos que nos acompañan por primera vez.',
    },
    {
      id: 'med-3',
      titulo: 'Flyer Oficial: Ayuno Congregacional y Vigilia de Oración',
      tipo: 'imagen_flyer',
      url: 'https://images.unsplash.com/photo-1510936421542-a89c3132e01b?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1510936421542-a89c3132e01b?auto=format&fit=crop&q=80&w=600',
      fecha: '2026-09-25',
      descripcion: 'Imagen institucional para invitar a la congregación al próximo tiempo de ayuno y oración.',
    },
  ]);

  // Modal para agregar/editar ítem multimedia
  const [isAddingMedia, setIsAddingMedia] = useState<boolean>(false);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [newMedia, setNewMedia] = useState({
    titulo: '',
    tipo: 'video_predica' as 'video_predica' | 'video_pastor' | 'imagen_flyer',
    url: '',
    thumbnail: '',
    descripcion: '',
  });

  const [sendingMediaId, setSendingMediaId] = useState<string | null>(null);

  // Google Drive Link Importer Modal
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [driveLinkInput, setDriveLinkInput] = useState<string>('');
  const [driveItemTitle, setDriveItemTitle] = useState<string>('');
  const [driveItemType, setDriveItemType] = useState<'video_predica' | 'video_pastor' | 'imagen_flyer'>('video_predica');

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleTestSendTemplate = async () => {
    if (!config.telegramToken || !testChatId) {
      showToast('error', 'Configure primero el Token y el Chat ID en Ajustes', 'Faltan Credenciales');
      return;
    }

    setTestingSend(true);
    let previewText = selectedTemplate.contenido
      .replace('{counselingPending}', String(counseling.filter((c) => c.estado !== 'Cerrada').length))
      .replace('{counselingHighPriority}', String(counseling.filter((c) => c.estado !== 'Cerrada' && c.urgencia === 'Alta').length))
      .replace('{membersThisMonth}', String(members.length))
      .replace('{activeFollowUps}', String(members.filter((m) => m.estadoSeguimiento !== 'Integrado').length));

    const res = await enviarNotificacionTelegram(config.telegramToken, testChatId, previewText);
    setTestingSend(false);

    if (res.success) {
      showToast('success', 'Mensaje enviado con éxito a Telegram', 'Prueba Exitosa');
    } else {
      showToast('error', res.message || 'Error al conectar con Telegram', 'Fallo de Envío');
    }
  };

  const getCaptionForTone = (item: MediaItem, tone: 'pastoral' | 'cercano' | 'informativo') => {
    let ytWatchUrl = item.url;
    const match = item.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (match && match[2].length === 11) {
      ytWatchUrl = `https://www.youtube.com/watch?v=${match[2]}`;
    }

    if (tone === 'pastoral') {
      let greetingHeader = '🌿 <b>Iglesia Bautista Central — Bogotá</b>';
      if (item.tipo === 'video_pastor') greetingHeader = '🌿 <b>Un mensaje pastoral para tu corazón</b>';
      else if (item.tipo === 'video_predica') greetingHeader = '📖 <b>Palabra de Dios para tu vida y tu hogar</b>';
      else greetingHeader = '🕊️ <b>Tiempo de Edificación y Oración</b>';
      return `${greetingHeader}\n\n✨ <b>${item.titulo}</b>\n\n💬 ${item.descripcion}\n\n🙏 <i>"Lámpara es a mis pies tu palabra..." Que este mensaje edifique tu fe hoy. ¡Compártelo! ❤️</i>\n\n▶️ <b>Ver contenido completo:</b> ${ytWatchUrl}`;
    } else if (tone === 'cercano') {
      return `✨ <b>¡Hola, Familia IBC! 👋</b>\n\nPreparamos este contenido con mucho cariño para ti:\n\n📌 <b>${item.titulo}</b>\n\n💬 ${item.descripcion}\n\n💛 <i>¡Esperamos que sea de gran bendición en tu semana! No olvides compartirlo con amigos y hermanos.</i>\n\n▶️ <b>Ver contenido completo:</b> ${ytWatchUrl}`;
    } else {
      return `📢 <b>RECURSO OFICIAL — IBC BOGOTÁ</b>\n\n📌 <b>${item.titulo}</b>\n\n📝 ${item.descripcion}\n\n🔗 <b>Enlace:</b> ${ytWatchUrl}`;
    }
  };

  const handleSendMediaToTelegram = async (item: MediaItem) => {
    if (!config.telegramToken || !testChatId) {
      showToast('error', 'Configure primero el Token y el Chat ID', 'Faltan Credenciales');
      return;
    }

    setSendingMediaId(item.id);
    const mediaType = item.tipo === 'imagen_flyer' ? 'photo' : 'video';
    const caption = getCaptionForTone(item, selectedTone);

    const res = await enviarMultimediaTelegram(
      config.telegramToken,
      testChatId,
      mediaType,
      item.url,
      caption
    );

    setSendingMediaId(null);

    if (res.success) {
      showToast('success', `"${item.titulo}" enviado exitosamente a Telegram`, 'Transmisión Exitosa');
    } else {
      showToast('error', res.message || 'Error al enviar contenido multimedia', 'Error de Envío');
    }
  };

  const handleOpenAddModal = () => {
    setEditingMediaId(null);
    setNewMedia({ titulo: '', tipo: 'video_predica', url: '', thumbnail: '', descripcion: '' });
    setIsAddingMedia(true);
  };

  const handleOpenEditModal = (item: MediaItem) => {
    setEditingMediaId(item.id);
    setNewMedia({
      titulo: item.titulo,
      tipo: item.tipo,
      url: item.url,
      thumbnail: item.thumbnail,
      descripcion: item.descripcion,
    });
    setIsAddingMedia(true);
  };

  const handleDeleteMedia = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este recurso del repositorio?')) {
      setMediaItems(mediaItems.filter((i) => i.id !== id));
      showToast('success', 'Recurso eliminado del repositorio', 'Eliminado');
    }
  };

  const sendWeeklyToConsolidadores = async () => {
    setSendingWeekly('cons');
    const msg = `🤝 <b>RESUMEN SEMANAL DE CONSOLIDADORES — IBC BOGOTÁ</b>\n📅 <i>Semana del Culto Dominical</i>\n\n✨ <b>ESTADO DE LA CONGREGACIÓN EN CONSOLIDACIÓN:</b>\n• Total personas en ruta de 8 semanas: <b>${members.length} hermanos</b>\n• Nuevos visitantes asignados esta semana: <b>${members.filter(m => m.semanaActual === 1).length} hermanos</b>\n• En proceso de afirmación doctrinal: <b>${members.filter(m => m.semanaActual >= 2 && m.estadoSeguimiento !== 'Integrado').length} hermanos</b>\n• Ya integrados y sirviendo activamente: <b>${members.filter(m => m.estadoSeguimiento === 'Integrado').length} siervos</b>\n\n👥 <b>ASIGNACIONES DEL EQUIPO:</b>\n• <b>Consolidadora 1 (Martha Gómez):</b> ${members.filter(m => m.consolidadorId === 'cons-1').length} asignados\n• <b>Consolidador 2 (Andrés Pardo):</b> ${members.filter(m => m.consolidadorId === 'cons-2').length} asignados\n• <b>Consolidadora 3 (Viviana Torres):</b> ${members.filter(m => m.consolidadorId === 'cons-3').length} asignados\n\n🎯 <b>METAS Y TAREAS DE LA SEMANA:</b>\n1. Llamada fraterna de bienvenida a los nuevos registros del domingo.\n2. Compartir el versículo y devocional de la semana por WhatsApp.\n3. Invitar a la reunión de oración y Escuela Bíblica del fin de semana.\n\n📖 <i>«Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre, sabiendo que vuestro trabajo en el Señor no es en vano.» — 1 Corintios 15:58 (RVR1960)</i>`;
    const res = await enviarNotificacionTelegram(config.telegramToken, testChatId || config.telegramChatId, msg);
    setSendingWeekly(null);
    if (res.success) {
      showToast('success', 'Resumen semanal enviado al Grupo de Consolidadores en Telegram', 'Telegram OK');
    } else {
      showToast('error', res.message, 'Error al enviar');
    }
  };

  const sendWeeklyToPastor = async () => {
    setSendingWeekly('pastor');
    const sieteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const donaciones7 = donations.filter(d => new Date(d.fecha) >= sieteDiasAtras).reduce((acc, d) => acc + d.monto, 0);
    const msg = `🕊️ <b>INFORME EJECUTIVO PASTORAL — IBC BOGOTÁ</b>\n📅 <i>Supervisión Pastoral General</i>\n\n📊 <b>INDICADORES CLAVE DE LA SEMANA:</b>\n• <b>Nuevos Registros Dominicales:</b> ${members.filter(m => m.semanaActual === 1).length} personas\n• <b>Consejerías Pendientes de Atención:</b> ${counseling.filter(c => c.estado !== 'Cerrada').length} hermanos\n• <b>Almas en Consolidación / Discipulado:</b> ${members.length} personas\n• <b>Ofrendas Semanales (7 días):</b> $ ${donaciones7.toLocaleString('es-CO')} COP\n\n🚨 <b>LLAMADAS PASTORALES RECOMENDADAS HOY:</b>\n${counseling.filter(c => c.estado !== 'Cerrada').slice(0, 3).map((c, i) => `${i + 1}. <b>${c.nombre}</b> — Tel: <code>${c.contacto}</code> (${c.tema}) · <i>Disponibilidad: ${c.disponibilidadHorario || 'Cualquiera'}</i>`).join('\n')}\n\n📖 <i>«Apacentad la grey de Dios que está entre vosotros, cuidando de ella, no por fuerza, sino voluntariamente...» — 1 Pedro 5:2 (RVR1960)</i>`;
    const res = await enviarNotificacionTelegram(config.telegramToken, testChatId || config.telegramChatId, msg);
    setSendingWeekly(null);
    if (res.success) {
      showToast('success', 'Informe pastoral enviado a Telegram del Pastor Edgar', 'Telegram OK');
    } else {
      showToast('error', res.message, 'Error al enviar');
    }
  };

  const sendSampleCounselingAlert = async () => {
    setSendingWeekly('counseling_alert');
    const msg = `🚨 <b>NUEVA SOLICITUD DE CONSEJERÍA PASTORAL</b>\n\n👤 <b>Hermano(a):</b> Rosa Elena Gómez\n📞 <b>Teléfono:</b> <code>318 765 4321</code>\n🕒 <b>Disponibilidad seleccionada:</b> ☀️ TARDE (1:00 PM - 6:00 PM)\n📋 <b>Tema:</b> Crisis Matrimonial y Familiar\n📝 <b>Detalle:</b> Pide cita de urgencia con su esposo. Manifiesta estar atravesando un momento crítico en su hogar.\n\n💡 <i>El Pastor Edgar puede llamar directamente tocando el número o agendar por WhatsApp desde el panel pastoral.</i>`;
    const res = await enviarNotificacionTelegram(config.telegramToken, testChatId || config.telegramChatId, msg);
    setSendingWeekly(null);
    if (res.success) {
      showToast('success', 'Alerta de consejería enviada a Telegram', 'Telegram OK');
    } else {
      showToast('error', res.message, 'Error al enviar');
    }
  };

  const sendSampleWelcomeAlert = async () => {
    setSendingWeekly('welcome_alert');
    const msg = `🆕 <b>NUEVA TARJETA DE BIENVENIDA DOMINICAL RECIBIDA</b>\n\n👤 <b>Nombre:</b> Carlos Andrés Mendoza\n📞 <b>WhatsApp:</b> <code>310 554 2318</code>\n🌊 <b>¿Desea bautizarse?:</b> ¡SÍ, desea dar el paso de fe del bautismo!\n🤝 <b>Consolidador Asignado:</b> Martha Cecilia Gómez (Consolidador 1)\n🏛️ <b>Área de Interés:</b> Matrimonios / Células de Hogar\n🙏 <b>Petición de Oración:</b> Por la salud de mi madre y la bendición de nuestro nuevo hogar en Bogotá.\n\n<i>Expediente creado en el sistema de consolidación y ruta de 6 pasos iniciada automáticamente.</i>`;
    const res = await enviarNotificacionTelegram(config.telegramToken, testChatId || config.telegramChatId, msg);
    setSendingWeekly(null);
    if (res.success) {
      showToast('success', 'Alerta de bienvenida enviada a Telegram', 'Telegram OK');
    } else {
      showToast('error', res.message, 'Error al enviar');
    }
  };

  // Auto-extraer miniatura de YouTube (incluyendo Shorts) si se ingresa un enlace de YouTube
  const handleUrlChange = (url: string) => {
    let thumbnail = newMedia.thumbnail;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    setNewMedia({ ...newMedia, url, thumbnail });
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedia.titulo || !newMedia.url) {
      showToast('warning', 'Por favor complete el título y la URL del recurso', 'Campos Incompletos');
      return;
    }

    let thumbnail = newMedia.thumbnail;
    const match = newMedia.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if ((!thumbnail || thumbnail.trim() === '') && match && match[2].length === 11) {
      thumbnail = `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    if (!thumbnail) {
      thumbnail = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=600';
    }

    if (editingMediaId) {
      // Actualizar ítem existente
      setMediaItems(
        mediaItems.map((item) =>
          item.id === editingMediaId
            ? {
                ...item,
                titulo: newMedia.titulo,
                tipo: newMedia.tipo,
                url: newMedia.url,
                thumbnail: thumbnail,
                descripcion: newMedia.descripcion,
              }
            : item
        )
      );
      showToast('success', 'Recurso multimedia actualizado correctamente', 'Actualización Exitosa');
    } else {
      // Crear nuevo ítem
      const item: MediaItem = {
        id: `med-${Date.now()}`,
        titulo: newMedia.titulo,
        tipo: newMedia.tipo,
        url: newMedia.url,
        thumbnail: thumbnail,
        fecha: new Date().toISOString().slice(0, 10),
        descripcion: newMedia.descripcion,
      };

      setMediaItems([item, ...mediaItems]);
      showToast('success', 'Recurso multimedia guardado en el repositorio', 'Repositorio Actualizado');
    }

    setNewMedia({ titulo: '', tipo: 'video_predica', url: '', thumbnail: '', descripcion: '' });
    setEditingMediaId(null);
    setIsAddingMedia(false);
  };

  // Importar desde enlace de Google Drive de proyectosibc26@gmail.com
  const handleImportDriveLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLinkInput || !driveItemTitle) {
      showToast('warning', 'Por favor ingrese el título y el enlace de Google Drive', 'Campos Incompletos');
      return;
    }

    const newItem: MediaItem = {
      id: `drive-link-${Date.now()}`,
      titulo: driveItemTitle,
      tipo: driveItemType,
      url: driveLinkInput,
      thumbnail: driveItemType === 'imagen_flyer' 
        ? 'https://images.unsplash.com/photo-1510936421542-a89c3132e01b?auto=format&fit=crop&q=80&w=600'
        : 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=600',
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: 'Vinculado desde Google Drive (proyectosibc26@gmail.com)',
    };

    setMediaItems([newItem, ...mediaItems]);
    setDriveLinkInput('');
    setDriveItemTitle('');
    setIsDriveModalOpen(false);
    showToast('success', 'Archivo de Google Drive vinculado correctamente al repositorio', 'Vinculación Exitosa');
  };

  const handleSaveRepository = () => {
    updateConfig({ telegramChatId: testChatId });
    showToast('success', 'Repositorio y configuraciones guardados exitosamente', 'Módulo Multimedia');
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/25 shrink-0">
            <Film className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-1 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Drive: proyectosibc26@gmail.com</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Repositorio Multimedia & Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Vincula y edita prédicas, videos del pastor y flyers directamente desde la cuenta oficial de la iglesia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Cloud className="w-4 h-4" />
            <span>Vincular Enlace Drive</span>
          </button>
          <button
            onClick={handleSaveRepository}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('semanal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'semanal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-sky-600" />
          <span>Notificaciones Semanales y Alertas en Vivo</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'media' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Film className="w-4 h-4 text-purple-600" />
          <span>Repositorio Multimedia ({mediaItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'templates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span>Plantillas de Texto</span>
        </button>
      </div>

      {/* GOOGLE DRIVE LINK IMPORTER MODAL */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Vincular Archivo de Google Drive</h3>
                  <p className="text-xs text-slate-500">Cuenta de la Iglesia: proyectosibc26@gmail.com</p>
                </div>
              </div>
              <button
                onClick={() => setIsDriveModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleImportDriveLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título del Contenido:</label>
                <input
                  type="text"
                  value={driveItemTitle}
                  onChange={(e) => setDriveItemTitle(e.target.value)}
                  placeholder="Ej. Prédica Dominical - Domingo 28 Sept"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Recurso:</label>
                <select
                  value={driveItemType}
                  onChange={(e: any) => setDriveItemType(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="video_predica">Video de Prédica</option>
                  <option value="video_pastor">Video del Pastor (Devocional / Saludo)</option>
                  <option value="imagen_flyer">Imagen / Flyer Oficial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enlace para Compartir de Google Drive (`proyectosibc26@gmail.com`):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={driveLinkInput}
                    onChange={(e) => setDriveLinkInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className="w-full text-xs p-3 pl-9 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Asegúrate de que el archivo en Google Drive tenga el permiso de compartir en <i>"Cualquier persona con el enlace"</i>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  Vincular y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Vista Previa en Telegram</h3>
                  <p className="text-xs text-slate-500">Tono activo: <strong className="text-purple-700 uppercase">{selectedTone}</strong></p>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Telegram Chat Simulation Bubble */}
            <div className="bg-slate-900 p-4 rounded-2xl text-white space-y-3 shadow-inner">
              <div className="flex items-center gap-2 text-[11px] text-sky-400 font-bold border-b border-slate-800 pb-2">
                <span>🤖 Bot de Telegram IBC</span>
                <span className="text-slate-500">• Vista previa del mensaje</span>
              </div>

              <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <div className="h-44 bg-slate-900 relative">
                  <img
                    src={previewItem.thumbnail}
                    alt={previewItem.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold uppercase shadow-sm">
                    {previewItem.tipo === 'video_predica' ? '🎬 Prédica' : previewItem.tipo === 'video_pastor' ? '🎥 Video Pastor' : '🖼️ Flyer'}
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs leading-relaxed text-slate-200">
                  <div className="whitespace-pre-wrap font-sans bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    {getCaptionForTone(previewItem, selectedTone)}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-right">Justo ahora ✓✓</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = previewItem;
                  setPreviewItem(null);
                  handleSendMediaToTelegram(item);
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar a Telegram Ahora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP MODAL */}
      {whatsappItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  💬
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Enviar Contenido por WhatsApp</h3>
                  <p className="text-xs text-slate-500">Selecciona o ingresa el destinatario y el mensaje humanizado</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappItem(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seleccionar desde Miembros (Opcional):</label>
                <select
                  onChange={(e) => {
                    const memberId = e.target.value;
                    const m = members.find((mem) => mem.id === memberId);
                    if (m) {
                      setWhatsappName(m.nombre);
                      setWhatsappPhone(m.telefono || '');
                    }
                  }}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="">-- Seleccionar miembro de la iglesia --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} ({m.telefono || 'Sin teléfono'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Destinatario:</label>
                <input
                  type="text"
                  value={whatsappName}
                  onChange={(e) => setWhatsappName(e.target.value)}
                  placeholder="Ej. Hermano Carlos Pérez"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de WhatsApp (con código de país, ej: +573001234567):</label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mensaje Humanizado (Preparado con tono <span className="text-purple-700 uppercase">{selectedTone}</span>):</label>
                <textarea
                  rows={5}
                  value={`¡Hola ${whatsappName || 'Hermano(a)'}! 👋\n\n` + getCaptionForTone(whatsappItem, selectedTone)}
                  readOnly
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-sans leading-relaxed bg-slate-50 text-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setWhatsappItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!whatsappPhone) {
                    showToast('warning', 'Por favor ingrese un número de teléfono válido', 'Falta Teléfono');
                    return;
                  }
                  const rawMsg = `¡Hola ${whatsappName || 'Hermano(a)'}! 👋\n\n` + getCaptionForTone(whatsappItem, selectedTone);
                  const cleanMsg = rawMsg
                    .replace(/<\/?b>/g, '*')
                    .replace(/<\/?i>/g, '_')
                    .replace(/<[^>]*>/g, '');
                  const encoded = encodeURIComponent(cleanMsg);
                  const cleanPhone = whatsappPhone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
                  window.open(waUrl, '_blank');
                  setWhatsappItem(null);
                  showToast('success', 'Abriendo WhatsApp con el mensaje preparado', 'WhatsApp Web');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>💬 Abrir WhatsApp y Enviar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: NOTIFICACIONES SEMANALES Y ALERTAS EN VIVO */}
      {activeTab === 'semanal' && (
        <div className="space-y-6">
          {/* Banner de Control y Destino */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Bot Oficial Activo: @Eqconsolida_bot</span>
              </div>
              <h3 className="text-lg font-black text-white">Centro de Notificaciones en Vivo para el Equipo Pastoral</h3>
              <p className="text-xs text-slate-300">
                Prueba y demuestra en vivo cómo recibe cada notificación el Pastor Edgar y el Grupo de Consolidadores en Telegram.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700">
              <span className="text-xs font-bold text-slate-300 pl-2">Chat ID Destino:</span>
              <input
                type="text"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                placeholder="Chat ID"
                className="text-xs p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono w-32 focus:outline-none"
              />
            </div>
          </div>

          {/* 4 CARDS DE DEMOSTRACIÓN EN VIVO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. GRUPO DE CONSOLIDADORES */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                    1. Destino: Grupo Consolidadores
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    Semanal / Lunes
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Resumen Semanal de Consolidación (Ruta de 8 Semanas)
                </h4>

                {/* Burbuja Simulación Telegram */}
                <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-sans text-xs leading-relaxed border border-slate-800 shadow-inner space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] text-sky-400 font-bold">
                    <span>🤖 Consolidacion IBC (@Eqconsolida_bot)</span>
                    <span className="text-slate-500">Grupo Telegram</span>
                  </div>
                  <p className="font-bold text-white">🤝 RESUMEN SEMANAL DE CONSOLIDADORES — IBC BOGOTÁ</p>
                  <p className="text-slate-300">
                    ✨ <b>Estado:</b> {members.length} hermanos en ruta formativa.<br />
                    • Nuevos del domingo: <b>{members.filter(m => m.semanaActual === 1).length} hermanos</b><br />
                    • En consolidación activa: <b>{members.filter(m => m.semanaActual >= 2 && m.estadoSeguimiento !== 'Integrado').length} hermanos</b><br />
                    • Ya integrados al servicio: <b>{members.filter(m => m.estadoSeguimiento === 'Integrado').length} siervos</b>
                  </p>
                  <p className="text-slate-300">
                    👥 <b>Asignaciones:</b><br />
                    • Martha Gómez: {members.filter(m => m.consolidadorId === 'cons-1').length} hermanos<br />
                    • Andrés Pardo: {members.filter(m => m.consolidadorId === 'cons-2').length} hermanos<br />
                    • Viviana Torres: {members.filter(m => m.consolidadorId === 'cons-3').length} hermanos
                  </p>
                  <p className="text-slate-400 italic text-[11px] border-t border-slate-800 pt-1.5 font-serif">
                    «Así que, hermanos míos amados, estad firmes y constantes...» — 1 Cor 15:58
                  </p>
                </div>
              </div>

              <button
                onClick={sendWeeklyToConsolidadores}
                disabled={sendingWeekly === 'cons'}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingWeekly === 'cons' ? 'Enviando a Telegram...' : 'Enviar Resumen a Consolidadores Ahora'}</span>
              </button>
            </div>

            {/* 2. INFORME EJECUTIVO PASTORAL */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                    2. Destino: Pastor Edgar (Chat Privado)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Semanal / Lunes
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Informe Ejecutivo Pastoral y Cuidado de la Grey
                </h4>

                {/* Burbuja Simulación Telegram */}
                <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-sans text-xs leading-relaxed border border-slate-800 shadow-inner space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] text-sky-400 font-bold">
                    <span>🤖 Consolidacion IBC (@Eqconsolida_bot)</span>
                    <span className="text-slate-500">Chat Pastor</span>
                  </div>
                  <p className="font-bold text-white">🕊️ INFORME EJECUTIVO PASTORAL — IBC BOGOTÁ</p>
                  <p className="text-slate-300">
                    📊 <b>Indicadores Clave:</b><br />
                    • Nuevos registros: <b>{members.filter(m => m.semanaActual === 1).length} personas</b><br />
                    • Consejerías pendientes: <b>{counseling.filter(c => c.estado !== 'Cerrada').length} hermanos</b><br />
                    • En discipulado: <b>{members.length} personas</b>
                  </p>
                  <p className="text-slate-300">
                    🚨 <b>Llamadas recomendadas hoy:</b><br />
                    • Rosa Elena Gómez (Crisis Matrimonial) — <i>Tarde</i><br />
                    • Mauricio Silva (Duelo y Oración) — <i>Mañana</i>
                  </p>
                  <p className="text-slate-400 italic text-[11px] border-t border-slate-800 pt-1.5 font-serif">
                    «Apacentad la grey de Dios que está entre vosotros...» — 1 Pedro 5:2
                  </p>
                </div>
              </div>

              <button
                onClick={sendWeeklyToPastor}
                disabled={sendingWeekly === 'pastor'}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingWeekly === 'pastor' ? 'Enviando a Telegram...' : 'Enviar Informe al Pastor Edgar Ahora'}</span>
              </button>
            </div>

            {/* 3. ALERTA INSTANTÁNEA DE CONSEJERÍA */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase text-rose-700 tracking-wider">
                    3. Alerta Inmediata: Consejería
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    En Tiempo Real
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Notificación Instantánea de Solicitud de Consejería
                </h4>

                {/* Burbuja Simulación Telegram */}
                <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-sans text-xs leading-relaxed border border-slate-800 shadow-inner space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] text-rose-400 font-bold">
                    <span>🚨 Alerta Prioritaria Telegram</span>
                    <span className="text-slate-500">Inmediato</span>
                  </div>
                  <p className="font-bold text-white">🚨 NUEVA SOLICITUD DE CONSEJERÍA PASTORAL</p>
                  <p className="text-slate-300">
                    👤 <b>Hermano:</b> Rosa Elena Gómez<br />
                    📞 <b>Teléfono:</b> <code className="text-amber-300 font-bold text-sm">318 765 4321</code><br />
                    🕒 <b>Disponibilidad:</b> ☀️ TARDE (1:00 PM - 6:00 PM)<br />
                    📋 <b>Tema:</b> Crisis Matrimonial y Familiar
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    El Pastor puede tocar el número para llamar de inmediato o abrir el panel.
                  </p>
                </div>
              </div>

              <button
                onClick={sendSampleCounselingAlert}
                disabled={sendingWeekly === 'counseling_alert'}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingWeekly === 'counseling_alert' ? 'Enviando...' : 'Disparar Alerta de Consejería de Prueba'}</span>
              </button>
            </div>

            {/* 4. ALERTA INSTANTÁNEA DE BIENVENIDA CON BAUTISMO */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
                    4. Alerta Inmediata: Bienvenida
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    En Tiempo Real
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Tarjeta de Bienvenida Dominical con Bautismo
                </h4>

                {/* Burbuja Simulación Telegram */}
                <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-sans text-xs leading-relaxed border border-slate-800 shadow-inner space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] text-emerald-400 font-bold">
                    <span>🆕 Ficha Dominical Telegram</span>
                    <span className="text-slate-500">Inmediato</span>
                  </div>
                  <p className="font-bold text-white">🆕 NUEVA TARJETA DE BIENVENIDA DOMINICAL</p>
                  <p className="text-slate-300">
                    👤 <b>Nombre:</b> Carlos Andrés Mendoza<br />
                    📞 <b>WhatsApp:</b> <code className="text-amber-300 font-bold text-sm">310 554 2318</code><br />
                    🌊 <b>Bautismo:</b> ¡SÍ, desea bautizarse!<br />
                    🤝 <b>Asignado a:</b> Martha Cecilia Gómez (Consolidador 1)
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Expediente creado y ruta de 6 pasos iniciada automáticamente.
                  </p>
                </div>
              </div>

              <button
                onClick={sendSampleWelcomeAlert}
                disabled={sendingWeekly === 'welcome_alert'}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingWeekly === 'welcome_alert' ? 'Enviando...' : 'Disparar Alerta de Bienvenida de Prueba'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: MEDIA REPOSITORY */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Biblioteca de Videos e Imágenes Oficiales</h3>
              <p className="text-xs text-slate-500">Sincronizado con proyectosibc26@gmail.com o cargados manualmente</p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Recurso Manual</span>
            </button>
          </div>

          {/* Tone Selector Library */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Biblioteca de Tonos y Estilos de Mensajes (Humanizados):
              </span>
              <span className="text-[11px] text-slate-400">Selecciona el tono para Telegram o WhatsApp</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTone('pastoral')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTone === 'pastoral' ? 'border-purple-600 bg-purple-50/70 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-0.5">
                  <span>🌿</span>
                  <span>Pastoral / Espiritual</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Enfocado en la Palabra, versículos y edificación espiritual profunda.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTone('cercano')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTone === 'cercano' ? 'border-purple-600 bg-purple-50/70 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-0.5">
                  <span>✨</span>
                  <span>Cercano / Fraterno</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Cálido, familiar, invitador y lleno de afecto para la congregación.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTone('informativo')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTone === 'informativo' ? 'border-purple-600 bg-purple-50/70 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-0.5">
                  <span>📢</span>
                  <span>Informativo / Directo</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Claro, limpio, ejecutivo y directo al grano para anuncios oficiales.</p>
              </button>
            </div>
          </div>

          {/* Add / Edit Media Modal */}
          {isAddingMedia && (
            <form onSubmit={handleAddMediaSubmit} className="bg-white rounded-2xl border border-purple-200 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Film className="w-4 h-4 text-purple-600" />
                  {editingMediaId ? 'Editar Recurso Multimedia' : 'Nuevo Recurso al Repositorio'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingMedia(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Título:</label>
                  <input
                    type="text"
                    value={newMedia.titulo}
                    onChange={(e) => setNewMedia({ ...newMedia, titulo: e.target.value })}
                    placeholder="Ej. Mensaje del Pastor"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo:</label>
                  <select
                    value={newMedia.tipo}
                    onChange={(e: any) => setNewMedia({ ...newMedia, tipo: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="video_predica">Video de Predica</option>
                    <option value="video_pastor">Video del Pastor (Ej. Mensaje corto)</option>
                    <option value="imagen_flyer">Imagen / Flyer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL del Archivo (YouTube Shorts, Drive o Web):</label>
                  <input
                    type="url"
                    value={newMedia.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtu.be/... o shorts/..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">✨ Si es de YouTube / Shorts, la miniatura se genera automáticamente.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL Miniatura (Thumbnail) — Opcional:</label>
                  <input
                    type="text"
                    value={newMedia.thumbnail}
                    onChange={(e) => setNewMedia({ ...newMedia, thumbnail: e.target.value })}
                    placeholder="Se autocompleta con YouTube o Drive..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Pie de Nota:</label>
                  <textarea
                    rows={2}
                    value={newMedia.descripcion}
                    onChange={(e) => setNewMedia({ ...newMedia, descripcion: e.target.value })}
                    placeholder="Mensaje acompañante..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMedia(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
                >
                  {editingMediaId ? 'Guardar Cambios' : 'Crear Recurso'}
                </button>
              </div>
            </form>
          )}

          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mediaItems.map((item) => {
              const isSending = sendingMediaId === item.id;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="relative h-44 bg-slate-100 overflow-hidden group">
                      <img
                        src={item.thumbnail}
                        alt={item.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end justify-between p-3">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-600 text-white">
                          {item.tipo === 'video_predica' ? '🎬 Predica' : item.tipo === 'video_pastor' ? '🎥 Video Pastor' : '🖼️ Flyer'}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Editar recurso"
                            className="w-7 h-7 rounded-lg bg-white/90 text-slate-700 hover:bg-white flex items-center justify-center font-bold shadow-sm cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            title="Eliminar recurso"
                            className="w-7 h-7 rounded-lg bg-red-500/90 text-white hover:bg-red-600 flex items-center justify-center font-bold shadow-sm cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.titulo}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.descripcion}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Fecha: {item.fecha}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-1">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>Vista</span>
                    </button>
                    <button
                      onClick={() => {
                        setWhatsappItem(item);
                        setWhatsappPhone('');
                        setWhatsappName('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>💬 WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleSendMediaToTelegram(item)}
                      disabled={isSending}
                      className="px-2.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSending ? '...' : 'Telegram'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600" />
              Plantillas del Repositorio
            </h3>
            <div className="space-y-2.5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    tpl.id === selectedTemplateId ? 'border-sky-500 bg-sky-50/50 shadow-2xs' : 'border-slate-200 bg-white'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">{tpl.titulo}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{tpl.asunto}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{selectedTemplate.titulo}</h3>
              <p className="text-xs text-slate-500">Personaliza el mensaje que se enviará automáticamente</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contenido HTML:</label>
              <textarea
                rows={6}
                value={selectedTemplate.contenido}
                onChange={(e) => {
                  const val = e.target.value;
                  setTemplates(templates.map((t) => (t.id === selectedTemplateId ? { ...t, contenido: val } : t)));
                }}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono text-slate-800"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Probar Alerta en Telegram</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testChatId}
                  onChange={(e) => setTestChatId(e.target.value)}
                  placeholder="Chat ID Destino"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={handleTestSendTemplate}
                  disabled={testingSend}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingSend ? 'Enviando...' : 'Enviar Prueba'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
