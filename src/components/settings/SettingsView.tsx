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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Bot de Notificaciones Telegram</h3>
                <p className="text-xs text-slate-500">Envío instantáneo de avisos de nuevos registros, ofrendas y consejerías</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testingTelegram}
              className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testingTelegram ? 'Enviando...' : 'Probar Notificación'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Bot Token:</label>
              <input
                type="text"
                value={formData.telegramToken}
                onChange={(e) => setFormData({ ...formData, telegramToken: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Chat ID Destino:</label>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            * Se han precargado las credenciales configuradas en el sistema de Apps Script original: Bot "Consolidacion IBC" y Chat ID personal.
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
