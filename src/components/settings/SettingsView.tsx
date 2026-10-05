import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatColombianTime, formatColombianDateTime } from '../../lib/dateUtils';
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
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { config, updateConfig, resetToDefaults, sendTelegramAlert, showToast, members, counseling, donations } = useApp();

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

      {/* Copias de Seguridad y Restauración */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Gestión de Datos y Copias de Seguridad</h3>
        <p className="text-xs text-slate-500">
          Exporta todos los registros en formato JSON estándar o restablece los datos a la semilla inicial de prueba.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia de Seguridad (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Seguro que deseas restablecer todos los datos a la semilla inicial de IBC Bogotá?')) {
                resetToDefaults();
              }
            }}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Datos de Demostración</span>
          </button>
        </div>
      </div>
    </div>
  );
};
