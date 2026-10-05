import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IBCLogo } from '../common/IBCLogo';
import {
  Church,
  UserPlus,
  HeartHandshake,
  Coins,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { DonationCategory, PaymentMethod, CivilStatus, AttendanceCondition, MemberType } from '../../types';

function getUpcomingDayDate(targetDayOfWeek: number): string { // 2 = Tue, 4 = Thu
  const d = new Date();
  const diff = (targetDayOfWeek + 7 - d.getDay()) % 7;
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (diff === 0 ? 7 : diff));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

export const PublicPortalView: React.FC = () => {
  const { addMember, addCounseling, addDonation, setCurrentView } = useApp();
  const [activeForm, setActiveForm] = useState<'registro' | 'consejeria' | 'ofrenda'>('registro');
  const [submittedSuccess, setSubmittedSuccess] = useState<string | null>(null);

  const hoyStr = new Date().toISOString().split('T')[0];
  const proximoMartes = getUpcomingDayDate(2);
  const proximoJueves = getUpcomingDayDate(4);

  // Estados Formulario 1: Tarjeta Oficial de Conexión
  const [regNombre, setRegNombre] = useState('');
  const [regFechaNacimiento, setRegFechaNacimiento] = useState('');
  const [regDireccionBarrioCiudad, setRegDireccionBarrioCiudad] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEstadoCivil, setRegEstadoCivil] = useState<CivilStatus>('Soltero/a');
  const [regCondicionAsistencia, setRegCondicionAsistencia] = useState<AttendanceCondition>('Soy nuevo/a aquí');
  const [regDecidioEntregarVidaAJesus, setRegDecidioEntregarVidaAJesus] = useState(false);
  const [regMinisterio, setRegMinisterio] = useState('Matrimonios / Familia');
  const [regInteresServirVoluntario, setRegInteresServirVoluntario] = useState(false);
  const [regTransporte, setRegTransporte] = useState(false);
  const [regNotas, setRegNotas] = useState('');
  const [regBautismo, setRegBautismo] = useState<'Sí' | 'No' | 'Ya bautizado' | 'Desea información'>('Desea información');
  const [regSolicitaConsejeria, setRegSolicitaConsejeria] = useState(false);
  const [regDisponibilidad, setRegDisponibilidad] = useState<'Mañana' | 'Tarde' | 'Noche'>('Mañana');

  // Agenda con Calendario en Ficha de Conexión
  const [regConsejeriaFecha, setRegConsejeriaFecha] = useState(proximoMartes);
  const [regConsejeriaHora, setRegConsejeriaHora] = useState('15:00');
  const [regConsejeriaModalidad, setRegConsejeriaModalidad] = useState<
    'Presencial (Oficina Pastoral Cra 7 # 31a-78)' | 'Llamada Telefónica' | 'Videollamada'
  >('Presencial (Oficina Pastoral Cra 7 # 31a-78)');
  const [regConsejeriaTema, setRegConsejeriaTema] = useState('Orientación Pastoral & Acompañamiento');
  const [regConsejeriaDetalles, setRegConsejeriaDetalles] = useState('');

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

    let memberType: MemberType = 'Visitante Nuevo';
    if (regCondicionAsistencia === 'Asisto regularmente a la iglesia') {
      memberType = 'Miembro Frecuente';
    } else if (regCondicionAsistencia === 'Hace tiempo que no venía') {
      memberType = 'Ausente';
    }

    addMember({
      nombre: regNombre.trim(),
      telefono: regTelefono.trim(),
      email: regEmail.trim(),
      tipo: memberType,
      estadoSeguimiento: 'Nuevo',
      proximoContacto: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notas: regNotas.trim() || 'Registrado mediante la Tarjeta de Conexión oficial de IBC Bogotá.',
      ministerioInteres: regMinisterio,
      necesitaTransporte: regTransporte,
      deseaBautizarse: regBautismo,
      disponibilidadContacto: regDisponibilidad,
      solicitoConsejeria: regSolicitaConsejeria,
      fechaNacimiento: regFechaNacimiento.trim(),
      direccionBarrioCiudad: regDireccionBarrioCiudad.trim(),
      estadoCivil: regEstadoCivil,
      condicionAsistencia: regCondicionAsistencia,
      decidioEntregarVidaAJesus: regDecidioEntregarVidaAJesus,
      interesBautismo: regBautismo === 'Sí',
      interesConsejeria: regSolicitaConsejeria,
      interesServirVoluntario: regInteresServirVoluntario,
      ministerioDeseado: regMinisterio,
    });

    // Si solicitó consejería directamente en la tarjeta de bienvenida
    if (regSolicitaConsejeria) {
      addCounseling({
        nombre: regNombre.trim(),
        contacto: regTelefono.trim(),
        email: regEmail.trim() || undefined,
        tema: regConsejeriaTema || 'Acompañamiento Pastoral (Tarjeta de Conexión)',
        urgencia: 'Media',
        disponibilidadHorario: regConsejeriaHora < '13:00' ? 'Mañana' : 'Tarde',
        modalidadCita: regConsejeriaModalidad,
        fechaCitaAgendada: `${regConsejeriaFecha}T${regConsejeriaHora}:00`,
        detalles: regConsejeriaDetalles || regNotas.trim() || 'Solicitó consejería directamente desde la Tarjeta de Conexión dominical.',
        estado: 'En acompañamiento',
      });
    }

    if (regDecidioEntregarVidaAJesus) {
      setSubmittedSuccess(
        '⭐ ¡GLORIA A DIOS! Celebramos con inmensa alegría en el cielo y en la tierra tu decisión de entregar tu vida a Jesús. Bienvenido a la familia de la fe en la Iglesia Bautista Central de Bogotá. El Pastor Edgar Castaño y el equipo pastoral te contactarán con mucho amor para acompañarte en tus primeros pasos.'
      );
    } else if (regSolicitaConsejeria) {
      setSubmittedSuccess(
        `¡Bienvenido(a) a la Iglesia Bautista Central! Tu Tarjeta de Conexión ha sido recibida con gozo. Tu cita de consejería pastoral con el Pastor Edgar Castaño ha quedado agendada en el calendario para el ${regConsejeriaFecha} a las ${regConsejeriaHora} (${regConsejeriaModalidad}). ¡Dios bendiga tu vida!`
      );
    } else {
      setSubmittedSuccess(
        '¡Bienvenido(a) a la Iglesia Bautista Central! Tu Tarjeta de Conexión ha sido recibida con éxito. El equipo pastoral te contactará muy pronto.'
      );
    }

    setRegNombre('');
    setRegFechaNacimiento('');
    setRegDireccionBarrioCiudad('');
    setRegTelefono('');
    setRegEmail('');
    setRegEstadoCivil('Soltero/a');
    setRegCondicionAsistencia('Soy nuevo/a aquí');
    setRegDecidioEntregarVidaAJesus(false);
    setRegInteresServirVoluntario(false);
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
        <IBCLogo size="xl" showBorder className="mx-auto" />
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

      {/* FORMULARIO 1: TARJETA DE CONEXIÓN OFICIAL (DOMINGO) */}
      {activeForm === 'registro' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="pb-4 border-b border-slate-100 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                IBC Bogotá • Tarjeta de Conexión Oficial
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              BIENVENIDO esta es tu casa
            </h3>
            <p className="text-xs text-slate-500 italic">
              «Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti, y tenga de ti misericordia; Jehová alce sobre ti su rostro, y ponga en ti paz.» — Números 6:24-26
            </p>
          </div>

          <form onSubmit={handleSubmitRegistro} className="space-y-4">
            {/* Nombre y Fecha de Nacimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NOMBRE COMPLETO: *
                </label>
                <input
                  type="text"
                  required
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  placeholder="Ej: Daniel Camilo Robles"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  FECHA DE NACIMIENTO:
                </label>
                <input
                  type="text"
                  value={regFechaNacimiento}
                  onChange={(e) => setRegFechaNacimiento(e.target.value)}
                  placeholder="Día/Mes/Año"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Dirección / Barrio / Ciudad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                DIRECCIÓN / BARRIO / CIUDAD:
              </label>
              <input
                type="text"
                value={regDireccionBarrioCiudad}
                onChange={(e) => setRegDireccionBarrioCiudad(e.target.value)}
                placeholder="Ej: Carrera 7 # 31a - 78, Chapinero, Bogotá"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Teléfono y Correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WHATSAPP / TELÉFONO: *
                </label>
                <input
                  type="tel"
                  required
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  placeholder="Ej: 3163317875"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CORREO ELECTRÓNICO (OPCIONAL):
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nombre@gmail.com"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* ESTADO CIVIL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ESTADO CIVIL:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CASADO/A', 'SOLTERO/A', 'OTRO'] as const).map((est) => {
                  const mapVal: CivilStatus =
                    est === 'CASADO/A' ? 'Casado/a' : est === 'SOLTERO/A' ? 'Soltero/a' : 'Otro';
                  const isSelected = regEstadoCivil === mapVal;
                  return (
                    <button
                      key={est}
                      type="button"
                      onClick={() => setRegEstadoCivil(mapVal)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{est}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONDICIÓN DE ASISTENCIA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ¿CÓMO NOS VISITAS HOY?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Soy nuevo/a aquí',
                  'Estoy de visita en la ciudad',
                  'Hace tiempo que no venía',
                  'Asisto regularmente a la iglesia',
                ].map((cond) => {
                  const isSelected = regCondicionAsistencia === cond;
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setRegCondicionAsistencia(cond as AttendanceCondition)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && '✓'}
                      </span>
                      <span className="text-[11px]">{cond}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ⭐ CASILLA ESTELAR: HOY DECIDÍ ENTREGAR MI VIDA A JESÚS */}
            <div
              onClick={() => setRegDecidioEntregarVidaAJesus(!regDecidioEntregarVidaAJesus)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                regDecidioEntregarVidaAJesus
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-500/20'
                  : 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100/60'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center font-bold text-sm shrink-0 ${
                  regDecidioEntregarVidaAJesus ? 'bg-white text-emerald-700 border-white' : 'border-emerald-500 bg-white'
                }`}
              >
                {regDecidioEntregarVidaAJesus ? '✓' : ''}
              </span>
              <div className="flex-1">
                <span className="font-black text-sm uppercase tracking-wide block">
                  ⭐ HOY DECIDÍ ENTREGAR MI VIDA A JESÚS
                </span>
                <span
                  className={`text-[11px] block mt-0.5 ${
                    regDecidioEntregarVidaAJesus ? 'text-emerald-100' : 'text-emerald-800'
                  }`}
                >
                  Marca esta casilla si hoy tomaste tu decisión de fe o reconciliación con Cristo.
                </span>
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
                <div className="pt-2 space-y-3.5 animate-in fade-in-50 bg-white/70 p-3.5 rounded-2xl border border-rose-200">
                  <div className="flex items-center justify-between pb-1.5 border-b border-rose-100">
                    <span className="text-[11px] font-black text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-rose-600" />
                      <span>Agendar Cita en Calendario Pastoral</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Pastor Edgar Castaño
                    </span>
                  </div>

                  <p className="text-[11px] text-rose-900/90 leading-relaxed">
                    Atención presencial en templo: <strong>Martes y Jueves (2:00 PM a 6:00 PM)</strong> en Cra 7 # 31a - 78, o modalidad telefónica / videollamada.
                  </p>

                  {/* Selección de Fecha */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Elige el día para tu cita pastoral:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegConsejeriaFecha(proximoMartes)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          regConsejeriaFecha === proximoMartes
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-50'
                        }`}
                      >
                        <span>Martes {formatShortDate(proximoMartes)}</span>
                        <span className="block text-[9px] font-normal opacity-90">⭐ Día Pastoral</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegConsejeriaFecha(proximoJueves)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          regConsejeriaFecha === proximoJueves
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-50'
                        }`}
                      >
                        <span>Jueves {formatShortDate(proximoJueves)}</span>
                        <span className="block text-[9px] font-normal opacity-90">⭐ Día Pastoral</span>
                      </button>

                      <div className="col-span-2 sm:col-span-1">
                        <input
                          type="date"
                          value={regConsejeriaFecha}
                          min={hoyStr}
                          onChange={(e) => setRegConsejeriaFecha(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-rose-200 bg-white font-medium text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Franja Horaria */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Franja horaria:
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map((time) => {
                        const label = time.replace('14:', '02:').replace('15:', '03:').replace('16:', '04:').replace('17:', '05:') + ' PM';
                        const isSelected = regConsejeriaHora === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setRegConsejeriaHora(time)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-white text-slate-700 border border-rose-200 hover:bg-rose-50'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modalidad y Tema */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Modalidad:
                      </label>
                      <select
                        value={regConsejeriaModalidad}
                        onChange={(e) => setRegConsejeriaModalidad(e.target.value as any)}
                        className="w-full text-xs p-2 rounded-xl border border-rose-200 bg-white font-medium text-slate-800"
                      >
                        <option value="Presencial (Oficina Pastoral Cra 7 # 31a-78)">
                          Presencial (Sede Cra 7 # 31a-78)
                        </option>
                        <option value="Llamada Telefónica">Llamada Telefónica</option>
                        <option value="Videollamada">Videollamada (Meet / Zoom)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Motivo / Necesidad Espiritual:
                      </label>
                      <select
                        value={regConsejeriaTema}
                        onChange={(e) => setRegConsejeriaTema(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-rose-200 bg-white font-medium text-slate-800"
                      >
                        <option value="Orientación Pastoral & Acompañamiento">Orientación Pastoral General</option>
                        <option value="Crisis Matrimonial / Familiar">Crisis Matrimonial / Familiar</option>
                        <option value="Duelo / Crisis Emocional">Duelo / Crisis Emocional</option>
                        <option value="Crecimiento Espiritual / Dudas">Crecimiento Espiritual / Dudas</option>
                        <option value="Petición de Oración Especial">Petición de Oración Especial</option>
                      </select>
                    </div>
                  </div>

                  {/* Detalle o Petición */}
                  <div>
                    <input
                      type="text"
                      placeholder="Detalle confidencial para el Pastor Edgar (opcional)..."
                      value={regConsejeriaDetalles}
                      onChange={(e) => setRegConsejeriaDetalles(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 placeholder:text-slate-400"
                    />
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
