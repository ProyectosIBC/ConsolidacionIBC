import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatColombianTime, formatColombianDateTime } from '../../lib/dateUtils';
import { USER_PROFILES } from '../../data/profilesData';
import {
  Settings,
  Bot,
  Send,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Church,
  Phone,
  Mail,
  Shield,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Lock,
  RefreshCw,
  Trash2,
  Users,
  BookOpen,
  KeyRound,
  Copy,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    config,
    updateConfig,
    resetToDefaults,
    clearAllDataForProduction,
    importOfficialData,
    sendTelegramAlert,
    showToast,
    members,
    counseling,
    donations,
  } = useApp();

  const [formData, setFormData] = useState({
    nombreIglesia: config.nombreIglesia,
    pastorNombre: config.pastorNombre,
    pastorEmail: config.pastorEmail,
    encargadoEmail: config.encargadoEmail,
    numeroIglesia: config.numeroIglesia,
    proyectosGoogleEmail: config.proyectosGoogleEmail,
    telegramToken: config.telegramToken,
    telegramChatId: config.telegramChatId,
    ciclosParaAvisar: config.ciclosParaAvisar,
  });

  const [testingTelegram, setTestingTelegram] = useState(false);
  const [verifyingBot, setVerifyingBot] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState('');
  const [botStatusResult, setBotStatusResult] = useState<{
    checked: boolean;
    valid?: boolean;
    botName?: string;
    username?: string;
    canJoinGroups?: boolean;
    error?: string;
  } | null>(null);

  const handleVerifyBotToken = async () => {
    const token = formData.telegramToken.trim();
    if (!token) {
      showToast('warning', 'Ingresa un token de bot para verificar', 'Token Requerido');
      return;
    }
    setVerifyingBot(true);
    setBotStatusResult(null);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await res.json();
      if (data.ok && data.result) {
        setBotStatusResult({
          checked: true,
          valid: true,
          botName: data.result.first_name,
          username: data.result.username,
          canJoinGroups: data.result.can_join_groups,
        });
        showToast('success', `Bot conectado: @${data.result.username}`, 'Token Válido');
      } else {
        setBotStatusResult({
          checked: true,
          valid: false,
          error: data.description || 'Token inválido o revocado en Telegram',
        });
        showToast('error', data.description || 'Token inválido', 'Error de Autenticación');
      }
    } catch (err: any) {
      setBotStatusResult({
        checked: true,
        valid: false,
        error: err.message || 'Error de red al conectar con Telegram',
      });
      showToast('error', 'No se pudo conectar con la API de Telegram', 'Fallo de Red');
    } finally {
      setVerifyingBot(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    const timeTxt = formatColombianTime(new Date());
    const msg = `✅ <b>Prueba de Conexión — CRM Iglesia Bautista Central</b>\n\n<b>Hora:</b> ${timeTxt}\n<b>Estado:</b> El sistema de alertas está conectado y funcionando correctamente.\n\n<i>Avisos de nuevos visitantes, ofrendas y consejerías llegarán por esta vía.</i>`;
    await sendTelegramAlert(msg);
    setTestingTelegram(false);
  };

  const handleExportData = () => {
    const data = {
      exportDate: formatColombianDateTime(new Date()),
      config,
      members,
      counseling,
      donations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IBC_Bogota_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Copia de seguridad descargada exitosamente', 'Backup Generado');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos de la Iglesia */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Church className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Datos Institucionales de la Iglesia</h3>
              <p className="text-xs text-slate-500">Configuración pastoral de la Iglesia Bautista Central de Bogotá</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Iglesia:</label>
              <input
                type="text"
                value={formData.nombreIglesia}
                onChange={(e) => setFormData({ ...formData, nombreIglesia: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pastor Principal:</label>
              <input
                type="text"
                value={formData.pastorNombre}
                onChange={(e) => setFormData({ ...formData, pastorNombre: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Oficial de la Iglesia (con 57):</label>
              <input
                type="text"
                value={formData.numeroIglesia}
                onChange={(e) => setFormData({ ...formData, numeroIglesia: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo del Pastor (Alertas):</label>
              <input
                type="email"
                value={formData.pastorEmail}
                onChange={(e) => setFormData({ ...formData, pastorEmail: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cuenta Google / Proyectos:</label>
              <input
                type="email"
                value={formData.proyectosGoogleEmail}
                onChange={(e) => setFormData({ ...formData, proyectosGoogleEmail: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ciclos sin respuesta antes de alertar al Pastor:</label>
              <input
                type="number"
                min={1}
                max={5}
                value={formData.ciclosParaAvisar}
                onChange={(e) => setFormData({ ...formData, ciclosParaAvisar: parseInt(e.target.value, 10) || 2 })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Telegram Bot */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Bot de Notificaciones Telegram</h3>
                <p className="text-xs text-slate-500">Envío instantáneo de avisos de nuevos registros, ofrendas y consejerías</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyBotToken}
                disabled={verifyingBot}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifyingBot ? 'animate-spin' : ''}`} />
                <span>{verifyingBot ? 'Verificando...' : 'Verificar Token'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingTelegram ? 'Enviando...' : 'Probar Notificación'}</span>
              </button>
            </div>
          </div>

          {/* Resultado de Verificación del Bot */}
          {botStatusResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs space-y-1.5 border animate-in zoom-in-95 ${
                botStatusResult.valid
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {botStatusResult.valid ? (
                <>
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bot Conectado: {botStatusResult.botName} (@{botStatusResult.username})</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 space-y-0.5 pl-6">
                    <p>• Estado en Telegram API: Activo y respondiendo con éxito.</p>
                    <p>
                      • ¿Permite unirse a grupos?:{' '}
                      <strong className={botStatusResult.canJoinGroups ? 'text-amber-800' : 'text-emerald-800'}>
                        {botStatusResult.canJoinGroups
                          ? 'SÍ (Recomendado: Desactivarlo en @BotFather para evitar que lo añadan a grupos de spam)'
                          : 'NO (Protegido contra adición a grupos externos)'}
                      </strong>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Token no válido o revocado:</span>
                    <span className="text-[11px]">{botStatusResult.error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Protocolo de Emergencia Anti-Spam en Ruso */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 text-amber-950 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  🛡️ ¿Por qué mi bot envía mensajes de spam en ruso y cómo protegerlo?
                </h4>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  <b>Causa:</b> El Token del bot fue filtrado públicamente (en código o repositorios). Redes automatizadas de ciberdelincuentes escanean internet 24/7 buscando tokens de Telegram para secuestrarlos y enviar spam masivo de criptomonedas, casinos y canales no deseados en ruso.
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-2">
              <span className="font-extrabold text-[11px] text-slate-900 uppercase block tracking-wider">
                Pasos Inmediatos para Blindar y Detener el Spam en 2 Minutos:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                <li>
                  Abre Telegram y busca al bot oficial{' '}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-sky-700 underline inline-flex items-center gap-0.5"
                  >
                    @BotFather <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
                <li>
                  Escribe el comando <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">/mybots</code> y selecciona tu bot.
                </li>
                <li>
                  Toca en <b>API Token</b> &gt; <b>Revoke current token</b> (Revocar token actual).
                  <span className="block text-rose-700 font-semibold pl-4">
                    ⚡ Esto anulará de inmediato el acceso de los spammers rusos y detendrá todo mensaje no autorizado.
                  </span>
                </li>
                <li>
                  Copia el <b>NUEVO TOKEN</b> generado por BotFather y pégalo abajo en el campo "Telegram Bot Token", luego haz clic en "Guardar Configuración".
                </li>
                <li>
                  En BotFather ve a <b>Bot Settings</b> &gt; <b>Allow Groups?</b> &gt; <b>Turn off</b>.
                  <span className="block text-slate-600 pl-4">
                    Esto impide que cualquier desconocido pueda añadir tu bot a grupos o canales de spam.
                  </span>
                </li>
                <li>
                  En BotFather ve a <b>Bot Settings</b> &gt; <b>Group Privacy</b> &gt; <b>Turn on</b> (Privacidad estricta).
                </li>
              </ol>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telegram Bot Token:
              </label>
              <input
                type="text"
                value={formData.telegramToken}
                onChange={(e) => setFormData({ ...formData, telegramToken: e.target.value })}
                placeholder="1234567890:ABCdefGhIJKlmNoPQRstuVWXyz..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Chat ID Destino:</label>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                placeholder="Ej: 7237466564 o -100xxxxxxxxxx"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            * El Chat ID puede ser tu ID de usuario personal o el ID de un canal/supergrupo privado donde estén el Pastor y los coordinadores de consolidación.
          </p>
        </div>

        {/* Botón Guardar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>

      {/* 👥 DIRECTORIO DE PERFILES Y CREDENCIALES OFICIALES (PASTOR, CONSOLIDADORES, DISCIPULADORES) */}
      <div className="bg-white rounded-3xl border border-[#e8e2d5] shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e8e2d5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf3eb] text-[#46543c] text-xs font-bold mb-1 border border-[#a9bb9e]/60 font-mono-space">
              <KeyRound className="w-3.5 h-3.5" />
              <span>8 Perfiles del Sistema IBC</span>
            </div>
            <h3 className="font-serif-fraunces text-lg sm:text-xl font-bold text-[#332921]">
              Directorio de Perfiles y Credenciales Asignadas
            </h3>
            <p className="text-xs text-[#6b5a4d]">
              Usuarios y contraseñas asignados por rol para el Pastor, las 3 Consolidadoras y los 3 Discipuladores.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4efe4] text-[#46543c] font-bold uppercase font-mono-space text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Rol / Función</th>
                <th className="py-2.5 px-3">Nombre</th>
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3">Contraseña Asignada</th>
                <th className="py-2.5 px-3 rounded-r-xl">Responsabilidad Principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e2d5]">
              {USER_PROFILES.map((p) => (
                <tr key={p.id} className="hover:bg-[#faf8f1] transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#332921] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#edf3eb] text-[#46543c] text-[11px] font-bold">
                      {p.badge}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#332921] font-serif-fraunces whitespace-nowrap">
                    {p.nombre}
                  </td>
                  <td className="py-3 px-3 font-mono-space text-[#46543c] font-bold whitespace-nowrap">
                    {p.username}
                  </td>
                  <td className="py-3 px-3 font-mono-space text-[#bd5c3f] font-bold whitespace-nowrap">
                    <code className="bg-[#f3ddd2] px-2 py-0.5 rounded border border-[#bd5c3f]/30">
                      {p.password}
                    </code>
                  </td>
                  <td className="py-3 px-3 text-[#6b5a4d] max-w-xs leading-relaxed">
                    {p.descripcion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 CENTRO DE MIGRACIÓN A PRODUCCIÓN: DATOS OFICIALES VS FICTICIOS */}
      <div className="bg-white rounded-3xl border-2 border-[#bd5c3f]/30 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e8e2d5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ddd2] text-[#bd5c3f] text-xs font-bold mb-1 border border-[#bd5c3f]/40 font-mono-space">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transición a Datos Reales IBC</span>
            </div>
            <h3 className="font-serif-fraunces text-lg sm:text-xl font-bold text-[#332921]">
              Centro de Migración: Poner Base de Datos en Blanco & Cargar Datos Oficiales
            </h3>
            <p className="text-xs text-[#6b5a4d] max-w-3xl leading-relaxed">
              Actualmente el sistema cuenta con registros de prueba (40 hermanos, solicitudes demo de consejería y donaciones simuladas) para que puedas probar todas las vistas. Cuando tengas listos los datos oficiales de tu congregación, puedes <b>limpiar la base de datos en blanco con 1 solo clic</b> o pasarme los datos por el chat para cargarlos de inmediato.
            </p>
          </div>
        </div>

        {/* 2 Opciones de Carga Cero Fricción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#faf8f1] border border-[#e8e2d5] space-y-2">
            <h4 className="font-bold text-xs text-[#332921] font-serif-fraunces flex items-center gap-1.5">
              <span>Opción A: Por el Chat de Asistencia (Cero Fricción)</span>
            </h4>
            <p className="text-xs text-[#6b5a4d] leading-relaxed">
              Simplemente pégame aquí en el chat la lista de tus pastores, consolidadores, discipuladores y miembros (en texto, tabla o lista de Excel). Yo ejecutaré el script de reemplazo en 10 segundos y la base de datos quedará oficial y sincronizada sin que toques ningún archivo.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf8f1] border border-[#e8e2d5] space-y-2">
            <h4 className="font-bold text-xs text-[#332921] font-serif-fraunces flex items-center gap-1.5">
              <span>Opción B: Poner en Blanco y Cargar Manualmente</span>
            </h4>
            <p className="text-xs text-[#6b5a4d] leading-relaxed">
              Usa el botón de abajo para dejar la base de datos con 0 miembros, 0 consejerías y 0 ofrendas. Desde allí, el equipo puede empezar a registrar personas con el botón <b>«+ Nuevo Miembro»</b> y mediante el formulario público de visitas.
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => setShowWipeModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#bd5c3f] hover:bg-[#a54b30] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#bd5c3f]/25 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>🧹 Poner Base de Datos en Blanco (Limpiar Ficticios)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#46543c] hover:bg-[#38432f] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>📋 Cargar / Pegar Datos Oficiales (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-[#283322] hover:bg-[#35432d] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia de Seguridad Actual (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetToDefaults();
            }}
            className="px-4 py-2.5 rounded-xl border border-[#e8e2d5] hover:bg-[#f4efe4] text-[#6b5a4d] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Semilla Demo</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación para Limpiar Base de Datos */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#332921]">
            <div className="flex items-center gap-3 text-[#bd5c3f]">
              <div className="w-10 h-10 rounded-2xl bg-[#f3ddd2] flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-[#bd5c3f]" />
              </div>
              <div>
                <h3 className="font-serif-fraunces text-base font-bold text-[#332921]">
                  Poner Base de Datos en Blanco
                </h3>
                <p className="text-[11px] text-[#6b5a4d]">Confirmación de limpieza para datos reales</p>
              </div>
            </div>

            <p className="text-xs text-[#6b5a4d] leading-relaxed">
              Esta acción <b>eliminará todos los 40 miembros de prueba</b>, solicitudes de consejería simuladas y ofrendas demo. El sistema quedará en blanco con 0 miembros, listo para que cargues los datos oficiales de IBC Bogotá.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6b5a4d] hover:bg-[#f4efe4] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllDataForProduction();
                  setShowWipeModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#bd5c3f] text-white hover:bg-[#a54b30] shadow-md cursor-pointer"
              >
                Sí, Poner en Blanco
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Pegar o Importar JSON de Datos Oficiales */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-[#332921]">
            <div className="flex items-center justify-between border-b border-[#e8e2d5] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#46543c]" />
                <h3 className="font-serif-fraunces text-base font-bold text-[#332921]">
                  Importar Lote de Datos Oficiales (JSON)
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-[#6b5a4d] hover:text-[#332921] font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6b5a4d] leading-relaxed">
              Pega aquí el contenido JSON con la estructura oficial de miembros (<code>members</code>), consejerías o donaciones:
            </p>

            <textarea
              rows={8}
              value={pastedJsonText}
              onChange={(e) => setPastedJsonText(e.target.value)}
              placeholder={`{\n  "members": [\n    {\n      "id": "mem-001",\n      "nombre": "Nombre Apellido",\n      "telefono": "573001234567",\n      "email": "correo@ejemplo.com",\n      "tipo": "Visitante Nuevo",\n      "estadoSeguimiento": "Nuevo"\n    }\n  ]\n}`}
              className="w-full text-xs font-mono-space p-3 rounded-2xl border border-[#e8e2d5] bg-[#faf8f1] focus:outline-none focus:ring-2 focus:ring-[#46543c]/20"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-[#6b5a4d]">
                O envíame la lista por el chat y yo actualizo los archivos.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6b5a4d] hover:bg-[#f4efe4] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(pastedJsonText);
                      importOfficialData(parsed);
                      setShowImportModal(false);
                      setPastedJsonText('');
                    } catch (e) {
                      showToast('error', 'El formato del texto pegado no es un JSON válido', 'Error de Importación');
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#46543c] text-white hover:bg-[#38432f] shadow-md cursor-pointer"
                >
                  Importar y Activar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
