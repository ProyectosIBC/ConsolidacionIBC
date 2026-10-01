import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Church,
  UserPlus,
  HeartHandshake,
  Coins,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DonationCategory, PaymentMethod } from '../../types';

export const PublicPortalView: React.FC = () => {
  const { addMember, addCounseling, addDonation, setCurrentView } = useApp();
  const [activeForm, setActiveForm] = useState<'registro' | 'consejeria' | 'ofrenda'>('registro');
  const [submittedSuccess, setSubmittedSuccess] = useState<string | null>(null);

  // Estados Formulario 1: Registro
  const [regNombre, setRegNombre] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMinisterio, setRegMinisterio] = useState('Matrimonios / Familia');
  const [regTransporte, setRegTransporte] = useState(false);
  const [regNotas, setRegNotas] = useState('');
  const [regBautismo, setRegBautismo] = useState<'Sí' | 'No' | 'Ya bautizado' | 'Desea información'>('Desea información');
  const [regSolicitaConsejeria, setRegSolicitaConsejeria] = useState(false);
  const [regDisponibilidad, setRegDisponibilidad] = useState<'Mañana' | 'Tarde' | 'Noche'>('Mañana');

  // Estados Formulario 2: Consejería
  const [conNombre, setConNombre] = useState('');
  const [conContacto, setConContacto] = useState('');
  const [conTema, setConTema] = useState('Crisis Familiar / Matrimonial');
  const [conDisponibilidad, setConDisponibilidad] = useState<'Mañana' | 'Tarde' | 'Noche'>('Mañana');
  const [conDetalles, setConDetalles] = useState('');

  // Estados Formulario 3: Ofrenda
  const [donNombre, setDonNombre] = useState('');
  const [donMonto, setDonMonto] = useState('');
  const [donCategoria, setDonCategoria] = useState<DonationCategory>('Ofrenda dominical');
  const [donMetodo, setDonMetodo] = useState<PaymentMethod>('Bancolombia');
  const [donReferencia, setDonReferencia] = useState('');
  const [donComprobanteUrl, setDonComprobanteUrl] = useState('');

  // Submit Registro
  const handleSubmitRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNombre.trim() || !regTelefono.trim()) return;

    addMember({
      nombre: regNombre.trim(),
      telefono: regTelefono.trim(),
      email: regEmail.trim(),
      tipo: 'Visitante Nuevo',
      estadoSeguimiento: 'Nuevo',
      proximoContacto: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notas: regNotas.trim() || 'Registrado mediante la tarjeta de bienvenida virtual dominical.',
      ministerioInteres: regMinisterio,
      necesitaTransporte: regTransporte,
      deseaBautizarse: regBautismo,
      disponibilidadContacto: regDisponibilidad,
      solicitoConsejeria: regSolicitaConsejeria,
    });

    // Si solicitó consejería directamente en la tarjeta de bienvenida
    if (regSolicitaConsejeria) {
      addCounseling({
        nombre: regNombre.trim(),
        contacto: regTelefono.trim(),
        email: regEmail.trim() || undefined,
        tema: 'Acompañamiento Pastoral (Tarjeta de Bienvenida)',
        urgencia: 'Media',
        disponibilidadHorario: regDisponibilidad,
        detalles: regNotas.trim() || 'Solicitó consejería directamente en la tarjeta de bienvenida dominical.',
        estado: 'Pendiente',
        pastorAsignado: 'Pastor Edgar',
      });
    }

    setSubmittedSuccess(
      regSolicitaConsejeria
        ? '¡Bienvenido(a) a la Iglesia Bautista Central! Tu registro y solicitud de llamada con el Pastor Edgar han sido recibidos. Te contactará en el horario seleccionado.'
        : '¡Bienvenido(a) a la Iglesia Bautista Central! Tu registro ha sido recibido. El equipo pastoral te contactará muy pronto.'
    );
    setRegNombre('');
    setRegTelefono('');
    setRegEmail('');
    setRegNotas('');
    setRegSolicitaConsejeria(false);
  };

  // Submit Consejería
  const handleSubmitConsejeria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conNombre.trim() || !conContacto.trim()) return;

    addCounseling({
      nombre: conNombre.trim(),
      contacto: conContacto.trim(),
      tema: conTema,
      urgencia: 'Media',
      disponibilidadHorario: conDisponibilidad,
      detalles: conDetalles.trim(),
      estado: 'Pendiente',
      pastorAsignado: 'Pastor Edgar',
    });

    setSubmittedSuccess(
      `Tu solicitud de consejería ha sido recibida. El Pastor Edgar priorizará comunicarse contigo en horario de la ${conDisponibilidad.toLowerCase()}.`
    );
    setConNombre('');
    setConContacto('');
    setConDetalles('');
  };

  // Submit Ofrenda
  const handleSubmitOfrenda = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(donMonto.replace(/\D/g, ''));
    if (!donNombre.trim() || isNaN(montoNum) || montoNum <= 0) return;

    addDonation({
      nombre: donNombre.trim(),
      monto: montoNum,
      fecha: new Date().toISOString(),
      categoria: donCategoria,
      metodo: donMetodo,
      referencia: donReferencia.trim(),
      comprobanteUrl: donComprobanteUrl.trim() || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    });

    setSubmittedSuccess('¡Gracias por tu ofrenda y fidelidad al Señor! El reporte ha sido registrado con éxito.');
    setDonNombre('');
    setDonMonto('');
    setDonReferencia('');
    setDonComprobanteUrl('');
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Banner de Bienvenida Institucional */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
          <Church className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Iglesia Bautista Central de Bogotá
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Portal congregacional oficial. Selecciona el formulario que deseas diligenciar el día de hoy.
        </p>
      </div>

      {/* Tabs Selector de Formulario */}
      <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1.5 rounded-2xl">
        <button
          onClick={() => {
            setActiveForm('registro');
            setSubmittedSuccess(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
            activeForm === 'registro'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4 text-blue-600" />
          <span>1. Tarjeta de Visitante</span>
        </button>

        <button
          onClick={() => {
            setActiveForm('consejeria');
            setSubmittedSuccess(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
            activeForm === 'consejeria'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-rose-600" />
          <span>2. Pedir Consejería</span>
        </button>

        <button
          onClick={() => {
            setActiveForm('ofrenda');
            setSubmittedSuccess(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
            activeForm === 'ofrenda'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-600" />
          <span>3. Reportar Ofrenda</span>
        </button>
      </div>

      {/* Mensaje de Éxito al Enviar */}
      {submittedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold">¡Envío Exitoso!</h4>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">{submittedSuccess}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setSubmittedSuccess(null)}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
              >
                Llenar otro formulario
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1 rounded-lg border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 cursor-pointer"
              >
                Ver en la Plataforma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO 1: REGISTRO DE VISITANTE CON BAUTISMO Y CONSEJERÍA INTEGRADA */}
      {activeForm === 'registro' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              Tarjeta de Bienvenida y Registro (Domingo)
            </h3>
            <p className="text-xs text-slate-500">
              ¡Qué bendición tenerte en casa! Queremos conocerte y acompañarte.
            </p>
          </div>

          <form onSubmit={handleSubmitRegistro} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Completo: *
              </label>
              <input
                type="text"
                required
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
                placeholder="Ej: Daniel Camilo Robles"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono / WhatsApp de Contacto: *
                </label>
                <input
                  type="text"
                  required
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  placeholder="Ej: 3195335076"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico (Opcional):
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nombre@gmail.com"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* PREGUNTA DE BAUTISMO */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <label className="block text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>¿Deseas bautizarte?</span>
              </label>
              <select
                value={regBautismo}
                onChange={(e) => setRegBautismo(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-blue-200 bg-white font-bold text-slate-800 focus:outline-none"
              >
                <option value="Sí">🌊 Sí, deseo dar el paso de fe del bautismo</option>
                <option value="Ya bautizado">✝️ Ya he sido bautizado(a) en las aguas</option>
                <option value="Desea información">📖 Deseo aprender más sobre el bautismo</option>
                <option value="No">Aún no por el momento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Área o Ministerio de tu Interés:
              </label>
              <select
                value={regMinisterio}
                onChange={(e) => setRegMinisterio(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none"
              >
                <option value="Matrimonios / Familia">Matrimonios / Familia</option>
                <option value="Jóvenes Universitarios">Jóvenes Universitarios</option>
                <option value="Escuela Bíblica / Discipulado">Escuela Bíblica / Discipulado</option>
                <option value="Alabanza y Música">Alabanza y Música</option>
                <option value="Bienvenida y Consolidación">Bienvenida y Consolidación</option>
                <option value="Solo deseo conocer la iglesia">Solo deseo conocer la iglesia</option>
              </select>
            </div>

            {/* CONSEJERÍA INTEGRADA EN TARJETA DE BIENVENIDA */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="checkSolicitaConsejeria"
                  checked={regSolicitaConsejeria}
                  onChange={(e) => setRegSolicitaConsejeria(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="checkSolicitaConsejeria" className="text-xs font-bold text-rose-950 cursor-pointer">
                  ¿Te gustaría recibir una llamada o consejería del Pastor Edgar?
                </label>
              </div>

              {regSolicitaConsejeria && (
                <div className="pl-6 pt-1 space-y-2 animate-in fade-in-50">
                  <label className="block text-xs font-bold text-slate-700">
                    ¿En qué horario tienes disponibilidad para hablar con el Pastor?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegDisponibilidad('Mañana')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        regDisponibilidad === 'Mañana'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      🌅 Mañana
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegDisponibilidad('Tarde')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        regDisponibilidad === 'Tarde'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ☀️ Tarde
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegDisponibilidad('Noche')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        regDisponibilidad === 'Noche'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      🌙 Noche
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <input
                type="checkbox"
                id="checkTransporte"
                checked={regTransporte}
                onChange={(e) => setRegTransporte(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="checkTransporte" className="text-xs text-slate-700 cursor-pointer">
                <b>¿Dificultad de movilidad?</b> Marca aquí si te gustaría que coordinemos transporte para el próximo servicio.
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Petición de Oración o Mensaje:
              </label>
              <textarea
                rows={2}
                value={regNotas}
                onChange={(e) => setRegNotas(e.target.value)}
                placeholder="¿Hay algo específico por lo que podamos orar por ti o tu familia?"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Tarjeta de Bienvenida</span>
            </button>
          </form>
        </div>
      )}

      {/* FORMULARIO 2: SOLICITUD DE CONSEJERÍA (SIN COMPROMISO 6H, CON HORARIO MAÑANA/TARDE/NOCHE) */}
      {activeForm === 'consejeria' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              Solicitud de Consejería con el Pastor Edgar
            </h3>
            <p className="text-xs text-slate-500">
              Acompañamiento bíblico, oración confidencial y apoyo pastoral.
            </p>
          </div>

          <form onSubmit={handleSubmitConsejeria} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Nombre Completo: *
                </label>
                <input
                  type="text"
                  required
                  value={conNombre}
                  onChange={(e) => setConNombre(e.target.value)}
                  placeholder="Ej: Rosa Gómez"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono / WhatsApp de Contacto: *
                </label>
                <input
                  type="text"
                  required
                  value={conContacto}
                  onChange={(e) => setConContacto(e.target.value)}
                  placeholder="Ej: 3187654321"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tema Principal:
                </label>
                <select
                  value={conTema}
                  onChange={(e) => setConTema(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none"
                >
                  <option value="Crisis Familiar / Matrimonial">Crisis Familiar / Matrimonial</option>
                  <option value="Duelo y Aflicción">Duelo y Aflicción</option>
                  <option value="Orientación Espiritual">Orientación Espiritual</option>
                  <option value="Toma de Decisiones Vocacionales">Toma de Decisiones Vocacionales</option>
                  <option value="Salud y Sanidad">Salud y Sanidad</option>
                  <option value="Juventud y Relaciones">Juventud y Relaciones</option>
                  <option value="Otro">Otro Asunto Confidencial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ¿En qué horario tienes disponibilidad?: *
                </label>
                <select
                  value={conDisponibilidad}
                  onChange={(e) => setConDisponibilidad(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Mañana">🌅 Mañana (8:00 AM - 12:00 PM)</option>
                  <option value="Tarde">☀️ Tarde (1:00 PM - 6:00 PM)</option>
                  <option value="Noche">🌙 Noche (6:00 PM - 9:00 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detalles breves de la situación (Confidencial):
              </label>
              <textarea
                rows={3}
                value={conDetalles}
                onChange={(e) => setConDetalles(e.target.value)}
                placeholder="Describe brevemente la necesidad para que el Pastor pueda orar por ti con anticipación..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Solicitud al Pastor Edgar</span>
            </button>
          </form>
        </div>
      )}

      {/* FORMULARIO 3: REPORTE DE OFRENDA */}
      {activeForm === 'ofrenda' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              Reporte de Diezmos y Ofrendas (IBC Bogotá)
            </h3>
            <p className="text-xs text-slate-500">
              Registro para contabilidad de la iglesia. Adjunta tu soporte de transferencia bancaria.
            </p>
          </div>

          <form onSubmit={handleSubmitOfrenda} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Donante / Familia: *
                </label>
                <input
                  type="text"
                  required
                  value={donNombre}
                  onChange={(e) => setDonNombre(e.target.value)}
                  placeholder="Ej: Familia Restrepo o Anónimo"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monto Donado (COP): *
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={donMonto}
                  onChange={(e) => setDonMonto(e.target.value)}
                  placeholder="Ej: 100000"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destino del Aporte:
                </label>
                <select
                  value={donCategoria}
                  onChange={(e) => setDonCategoria(e.target.value as DonationCategory)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none"
                >
                  <option value="Diezmo">Diezmo</option>
                  <option value="Ofrenda dominical">Ofrenda Dominical</option>
                  <option value="Pro-Templo">Pro-Templo</option>
                  <option value="Misiones">Misiones</option>
                  <option value="Acción Social">Acción Social</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medio de Pago:
                </label>
                <select
                  value={donMetodo}
                  onChange={(e) => setDonMetodo(e.target.value as PaymentMethod)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none"
                >
                  <option value="Bancolombia">Bancolombia (Ahorros)</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Efectivo">Efectivo en culto</option>
                  <option value="Datafono">Datáfono</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de Referencia o Aprobación:
              </label>
              <input
                type="text"
                value={donReferencia}
                onChange={(e) => setDonReferencia(e.target.value)}
                placeholder="Ej: TRX-99812450 o comprobante Nequi"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Registrar Ofrenda Oficial</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
