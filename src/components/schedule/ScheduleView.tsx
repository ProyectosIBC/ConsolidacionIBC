import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TEMPLATES_DATA } from '../../data/templatesData';
import { TemplateMessage, Member } from '../../types';
import {
  CalendarDays,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Send,
  Sparkles,
  Phone,
  User,
  Car,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { generarEnlaceWhatsApp, personalizarMensaje } from '../../lib/whatsappUtils';

export const ScheduleView: React.FC = () => {
  const { members, config, showToast, sendTelegramAlert, registerContactAttempt } = useApp();

  // Estados del Cronograma
  const [activeTab, setActiveTab] = useState<'cronograma' | 'generador'>('generador');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMessage>(TEMPLATES_DATA[1]); // Mensaje 2 WhatsApp ausentes
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [customName, setCustomName] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customSenderName, setCustomSenderName] = useState<string>(config.pastorNombre);
  const [editedBody, setEditedBody] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Buscar miembro seleccionado
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  // Actualizar cuerpo al cambiar plantilla o miembro
  React.useEffect(() => {
    const targetName = customName || selectedMember?.nombre || 'Hermano(a)';
    const filled = personalizarMensaje(selectedTemplate.cuerpo, {
      nombre: targetName,
      iglesia: config.nombreIglesia,
      tuNombre: customSenderName || config.pastorNombre,
    });
    setEditedBody(filled);
  }, [selectedTemplate, selectedMember, customName, customSenderName, config]);

  // Manejo de copiado
  const handleCopy = () => {
    navigator.clipboard.writeText(editedBody);
    setCopied(true);
    showToast('success', 'Mensaje copiado al portapapeles', 'Copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  // Enviar a Telegram
  const handleSendTelegram = async () => {
    const recipientName = customName || selectedMember?.nombre || 'Hermano(a)';
    const text = `📋 <b>Mensaje Preparado IBC Bogotá</b>\n\n<b>Destinatario:</b> ${recipientName}\n<b>Canal:</b> ${selectedTemplate.canal}\n<b>Plantilla:</b> ${selectedTemplate.titulo}\n\n<i>"${editedBody}"</i>`;
    await sendTelegramAlert(text);
  };

  // Enlace wa.me
  const targetPhone = customPhone || selectedMember?.telefono || '';
  const whatsappUrl = targetPhone
    ? generarEnlaceWhatsApp(targetPhone, editedBody, config.prefijoPais)
    : '#';

  // Enlace mailto
  const targetEmail = customEmail || selectedMember?.email || '';
  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(
    selectedTemplate.asunto || 'Mensaje de la Iglesia Bautista Central'
  )}&body=${encodeURIComponent(editedBody)}`;

  // Filtrado de plantillas
  const filteredTemplates = TEMPLATES_DATA.filter((t) => {
    if (selectedCategory === 'todos') return true;
    return t.categoria === selectedCategory;
  });

  // Tareas operativas según día
  const visitantesDomingo = members.filter((m) => m.tipo === 'Visitante Nuevo');
  const ausentesParaViernes = members.filter((m) => m.tipo === 'Ausente' || m.necesitaTransporte);
  const seguimientoMiercoles = members.filter((m) => m.semanaActual === 2);

  return (
    <div className="space-y-6">
      {/* Selector de Pestaña Principal */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('generador')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'generador'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Generador de Mensajes IBC (15+ Plantillas)</span>
        </button>
        <button
          onClick={() => setActiveTab('cronograma')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'cronograma'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-indigo-600" />
          <span>Cronograma Operativo Semanal (Lunes / Miércoles / Viernes)</span>
        </button>
      </div>

      {activeTab === 'generador' ? (
        /* VISTA 1: GENERADOR OFICIAL DE MENSAJES */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Catálogo de Plantillas (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catálogo Oficial de Plantillas</h3>
              <p className="text-xs text-slate-500">
                Basado en el documento de protocolos de la Iglesia Bautista Central
              </p>
            </div>

            {/* Filtro por Categoría */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'todos', label: 'Todas' },
                { id: 'ausente', label: '10 Ausentes' },
                { id: 'frecuente_ausente', label: '5 Miembros Frecuentes' },
                { id: 'semanal_8_semanas', label: '8 Semanas Ciclo' },
                { id: 'bienvenida', label: 'Bienvenida' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista de Plantillas */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplate.id === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-slate-900">{template.titulo}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {template.canal}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{template.cuerpo}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Personalizador y Lanzador Dinámico (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Personalizar y Disparar Comunicación
                </h3>
                <p className="text-xs text-slate-500">
                  Sustitución inteligente de variables en tiempo real
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Canal: {selectedTemplate.canal}
              </span>
            </div>

            {/* Selección de Miembro o Datos Manuales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cargar desde el CRM:
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    const found = members.find((m) => m.id === e.target.value);
                    if (found) {
                      setCustomName(found.nombre);
                      setCustomPhone(found.telefono);
                      setCustomEmail(found.email || '');
                    }
                  }}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none"
                >
                  <option value="">-- Seleccionar persona del CRM --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} ({m.tipo} · Sem {m.semanaActual})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre a mostrar ([Nombre]):
                </label>
                <input
                  type="text"
                  value={customName || selectedMember?.nombre || ''}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="text"
                  value={customPhone || selectedMember?.telefono || ''}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="573105551234"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Firma / Emisor ([Tu Nombre]):
                </label>
                <input
                  type="text"
                  value={customSenderName}
                  onChange={(e) => setCustomSenderName(e.target.value)}
                  placeholder="Pastor Edgar"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Asunto si es Correo */}
            {selectedTemplate.asunto && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asunto del Correo:
                </label>
                <input
                  type="text"
                  defaultValue={selectedTemplate.asunto}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>
            )}

            {/* Previsualizador y Editor del Mensaje */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mensaje Listo para Enviar:
                </label>
                <span className="text-[11px] text-slate-400">Puedes editar el texto libremente</span>
              </div>
              <textarea
                rows={6}
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans leading-relaxed"
              />
            </div>

            {/* Botones de Disparo */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
              {/* Botón WhatsApp */}
              {targetPhone ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => selectedMember && registerContactAttempt(selectedMember.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar por WhatsApp (wa.me)</span>
                </a>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed"
                >
                  Ingresa un teléfono para WhatsApp
                </button>
              )}

              {/* Botón Email */}
              <a
                href={mailtoUrl}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Abrir Correo</span>
              </a>

              {/* Botón Copiar */}
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              {/* Botón Telegram Copia */}
              <button
                onClick={handleSendTelegram}
                className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                title="Enviar copia de este mensaje al chat de Telegram del pastor"
              >
                <Send className="w-4 h-4 text-sky-600" />
                <span>Copia a Telegram</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA 2: CRONOGRAMA OPERATIVO SEMANAL */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lunes: Contacto Inicial */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    LUN
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Lunes: Contacto Inicial</h4>
                    <span className="text-[11px] text-blue-600 font-semibold">Post-Servicio Dominical</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Enviar mensaje de bienvenida por WhatsApp a las personas nuevas que visitaron la iglesia el domingo anterior. Agradecer por asistir e invitar a ministerios o grupos pequeños.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Personas para hoy ({visitantesDomingo.length}):
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {visitantesDomingo.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No hay nuevos visitantes registrados.</p>
                    ) : (
                      visitantesDomingo.map((v) => (
                        <div key={v.id} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 truncate">{v.nombre}</span>
                          {v.telefono && (
                            <a
                              href={generarEnlaceWhatsApp(
                                v.telefono,
                                `¡Hola ${v.nombre}! Qué bendición haberte tenido este domingo en la Iglesia Bautista Central de Bogotá. ¿Cómo estás hoy? Si tienes alguna pregunta sobre nuestros grupos o ministerios, estamos para servirte.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Miércoles: Seguimiento de 2da Semana */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    MIÉ
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Miércoles: Seguimiento</h4>
                    <span className="text-[11px] text-indigo-600 font-semibold">Llamadas Testimoniales</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Llamada telefónica a quienes asistieron por primera vez hace dos semanas (Semana 2). Indagar necesidades, orar por sus peticiones y compartir testimonios inspiradores de la congregación.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    En Semana 2 ({seguimientoMiercoles.length}):
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {seguimientoMiercoles.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No hay miembros en semana 2 actualmente.</p>
                    ) : (
                      seguimientoMiercoles.map((v) => (
                        <div key={v.id} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 truncate">{v.nombre}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{v.telefono}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Viernes: Invitación con Transporte */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    VIE
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Viernes: Invitación Próximo Servicio</h4>
                    <span className="text-[11px] text-amber-700 font-semibold">Ausentes y Logística</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Videollamada o mensaje para personas ausentes. Expresarles que se les extrañó y animarles a unirse el domingo. <b>Ofrecer transporte o apoyo de acompañamiento si lo requieren.</b>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Ausentes o Transporte ({ausentesParaViernes.length}):
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {ausentesParaViernes.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Sin personas ausentes registradas.</p>
                    ) : (
                      ausentesParaViernes.map((v) => (
                        <div key={v.id} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 block truncate">{v.nombre}</span>
                            {v.necesitaTransporte && (
                              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                                <Car className="w-2.5 h-2.5" /> Necesita transporte
                              </span>
                            )}
                          </div>
                          {v.telefono && (
                            <a
                              href={generarEnlaceWhatsApp(
                                v.telefono,
                                `¡Hola ${v.nombre}! Te saludamos de la Iglesia Bautista Central. Queremos recordarte que este domingo te esperamos con los brazos abiertos. Si necesitas ayuda con transporte para llegar, escríbenos con total confianza.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
