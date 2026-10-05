import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MemberType, CivilStatus, AttendanceCondition } from '../../types';
import {
  X,
  UserPlus,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Church,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Phone,
} from 'lucide-react';

interface NewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const NewMemberModal: React.FC<NewMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember, addCounseling, consolidators, config, showToast } = useApp();

  const hoyStr = new Date().toISOString().split('T')[0];
  const proximoMartes = getUpcomingDayDate(2);
  const proximoJueves = getUpcomingDayDate(4);

  // Campos principales
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccionBarrioCiudad, setDireccionBarrioCiudad] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estadoCivil, setEstadoCivil] = useState<CivilStatus>('Soltero/a');
  const [condicionAsistencia, setCondicionAsistencia] = useState<AttendanceCondition>('Soy nuevo/a aquí');

  // ⭐ Casilla estelar verde de la tarjeta física
  const [decidioEntregarVidaAJesus, setDecidioEntregarVidaAJesus] = useState(false);

  // Intereses
  const [interesBautismo, setInteresBautismo] = useState(false);
  const [interesConsejeria, setInteresConsejeria] = useState(false);
  const [interesServirVoluntario, setInteresServirVoluntario] = useState(false);
  const [ministerioDeseado, setMinisterioDeseado] = useState('');

  // Agendamiento en Calendario de Consejería
  const [consejeriaFecha, setConsejeriaFecha] = useState(proximoMartes);
  const [consejeriaHora, setConsejeriaHora] = useState('15:00');
  const [consejeriaModalidad, setConsejeriaModalidad] = useState<
    'Presencial (Oficina Pastoral Cra 7 # 31a-78)' | 'Llamada Telefónica' | 'Videollamada'
  >('Presencial (Oficina Pastoral Cra 7 # 31a-78)');
  const [consejeriaTema, setConsejeriaTema] = useState('Orientación Pastoral & Acompañamiento');
  const [consejeriaPeticion, setConsejeriaPeticion] = useState('');

  // Logística adicional
  const [necesitaTransporte, setNecesitaTransporte] = useState(false);
  const [consolidadorId, setConsolidadorId] = useState('');
  const [notas, setNotas] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;

    // Clasificar tipo según condición de asistencia
    let memberType: MemberType = 'Visitante Nuevo';
    if (condicionAsistencia === 'Asisto regularmente a la iglesia') {
      memberType = 'Miembro Frecuente';
    } else if (condicionAsistencia === 'Hace tiempo que no venía') {
      memberType = 'Ausente';
    }

    addMember({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      tipo: memberType,
      estadoSeguimiento: 'Nuevo',
      proximoContacto: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notas: notas.trim(),
      ministerioInteres: ministerioDeseado.trim(),
      necesitaTransporte,
      deseaBautizarse: interesBautismo ? 'Sí' : 'Desea información',
      solicitoConsejeria: interesConsejeria,
      consolidadorId: consolidadorId || undefined,

      // Campos oficiales de la Tarjeta física
      fechaNacimiento: fechaNacimiento.trim(),
      direccionBarrioCiudad: direccionBarrioCiudad.trim(),
      estadoCivil,
      condicionAsistencia,
      decidioEntregarVidaAJesus,
      interesBautismo,
      interesConsejeria,
      interesServirVoluntario,
      ministerioDeseado: ministerioDeseado.trim(),
    });

    // Si solicitó consejería en la ficha, crear y agendar la cita pastoral en el calendario
    if (interesConsejeria && consejeriaFecha) {
      addCounseling({
        nombre: nombre.trim(),
        contacto: telefono.trim(),
        tema: consejeriaTema || 'Orientación Pastoral & Acompañamiento',
        urgencia: 'Media',
        estado: 'En acompañamiento',
        disponibilidadHorario: consejeriaHora < '13:00' ? 'Mañana' : 'Tarde',
        modalidadCita: consejeriaModalidad,
        fechaCitaAgendada: `${consejeriaFecha}T${consejeriaHora}:00`,
        detalles: consejeriaPeticion
          ? `Registrado en Ficha de Conexión: ${consejeriaPeticion}`
          : 'Solicitud agendada directamente desde la Ficha de Conexión.',
      });
      showToast('success', `Cita de consejería agendada en el calendario pastoral para el ${consejeriaFecha} a las ${consejeriaHora}`, 'Agenda Pastoral');
    }

    onClose();
    // Reset form
    setNombre('');
    setFechaNacimiento('');
    setDireccionBarrioCiudad('');
    setEmail('');
    setTelefono('');
    setEstadoCivil('Soltero/a');
    setCondicionAsistencia('Soy nuevo/a aquí');
    setDecidioEntregarVidaAJesus(false);
    setInteresBautismo(false);
    setInteresConsejeria(false);
    setInteresServirVoluntario(false);
    setMinisterioDeseado('');
    setNotas('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        {/* Cabecera idéntica a la Tarjeta de Conexión de la iglesia */}
        <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                IBC Bogotá • Tarjeta de Conexión Oficial
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-900 tracking-tight">
              BIENVENIDO esta es tu casa
            </h3>
            <p className="text-[11px] text-slate-500 italic">
              «Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti...» — Números 6:24-26
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 mt-4 space-y-4">
          {/* Nombre y Fecha de Nacimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NOMBRE COMPLETO: *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Daniel Camilo Robles"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                FECHA DE NACIMIENTO:
              </label>
              <input
                type="text"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                placeholder="Día/Mes/Año"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              value={direccionBarrioCiudad}
              onChange={(e) => setDireccionBarrioCiudad(e.target.value)}
              placeholder="Ej: Calle 53 # 14-25, Chapinero, Bogotá"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Correo y WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CORREO ELECTRÓNICO:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WHATSAPP / TELÉFONO: *
              </label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 3163317875"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
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
                const isSelected = estadoCivil === mapVal;
                return (
                  <button
                    key={est}
                    type="button"
                    onClick={() => setEstadoCivil(mapVal)}
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
                const isSelected = condicionAsistencia === cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondicionAsistencia(cond as AttendanceCondition)}
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
            onClick={() => setDecidioEntregarVidaAJesus(!decidioEntregarVidaAJesus)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 select-none ${
              decidioEntregarVidaAJesus
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-500/20'
                : 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100/60'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center font-bold text-sm shrink-0 ${
                decidioEntregarVidaAJesus ? 'bg-white text-emerald-700 border-white' : 'border-emerald-500 bg-white'
              }`}
            >
              {decidioEntregarVidaAJesus ? '✓' : ''}
            </span>
            <div className="flex-1">
              <span className="font-black text-sm uppercase tracking-wide block">
                ⭐ HOY DECIDÍ ENTREGAR MI VIDA A JESÚS
              </span>
              <span
                className={`text-[11px] block mt-0.5 ${
                  decidioEntregarVidaAJesus ? 'text-emerald-100' : 'text-emerald-800'
                }`}
              >
                Marca esta casilla si hoy tomaste tu decisión de fe o reconciliación con Cristo.
              </span>
            </div>
          </div>

          {/* ESTOY INTERESADO/A EN */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              ESTOY INTERESADO/A EN:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  interesBautismo ? 'bg-blue-100 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={interesBautismo}
                  onChange={(e) => setInteresBautismo(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Bautizarme</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  interesConsejeria ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={interesConsejeria}
                  onChange={(e) => setInteresConsejeria(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0"
                />
                <span>Solicitar Consejería</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  interesServirVoluntario ? 'bg-purple-100 border-purple-400 text-purple-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={interesServirVoluntario}
                  onChange={(e) => setInteresServirVoluntario(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-0"
                />
                <span>Servir como Voluntario</span>
              </label>
            </div>

            {/* SECCIÓN INTERACTIVA DE AGENDAMIENTO EN CALENDARIO PASTORAL */}
            {interesConsejeria && (
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-3.5 animate-in fade-in-50">
                <div className="flex items-center justify-between pb-2 border-b border-rose-200/70">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-black text-rose-950 uppercase tracking-wide">
                      Agendar Cita en Calendario Pastoral
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-800">
                    Pastor Edgar Castaño
                  </span>
                </div>

                <p className="text-[11px] text-rose-900/90 leading-relaxed">
                  Días oficiales de atención presencial en templo: <strong>Martes y Jueves (2:00 PM a 6:00 PM)</strong> en Carrera 7 # 31a - 78, o modalidad telefónica/virtual.
                </p>

                {/* Selección Rápida de Fecha */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-rose-600" />
                    <span>Selecciona el día de la cita:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsejeriaFecha(proximoMartes)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        consejeriaFecha === proximoMartes
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-100/50'
                      }`}
                    >
                      <span>Martes {formatShortDate(proximoMartes)}</span>
                      <span className="block text-[9px] font-normal opacity-90">⭐ Día Pastoral</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsejeriaFecha(proximoJueves)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        consejeriaFecha === proximoJueves
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-100/50'
                      }`}
                    >
                      <span>Jueves {formatShortDate(proximoJueves)}</span>
                      <span className="block text-[9px] font-normal opacity-90">⭐ Día Pastoral</span>
                    </button>

                    <div className="col-span-2 sm:col-span-1">
                      <input
                        type="date"
                        value={consejeriaFecha}
                        min={hoyStr}
                        onChange={(e) => setConsejeriaFecha(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-rose-200 bg-white font-medium text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Selección de Franja Horaria */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Franja horaria pastoral:</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map((time) => {
                      const label = time.replace('14:', '02:').replace('15:', '03:').replace('16:', '04:').replace('17:', '05:') + ' PM';
                      const isSelected = consejeriaHora === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setConsejeriaHora(time)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-rose-200 hover:bg-rose-100/40'
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
                      value={consejeriaModalidad}
                      onChange={(e) => setConsejeriaModalidad(e.target.value as any)}
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
                      Motivo Principal:
                    </label>
                    <select
                      value={consejeriaTema}
                      onChange={(e) => setConsejeriaTema(e.target.value)}
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

                {/* Petición u Oración Confidencial */}
                <div>
                  <input
                    type="text"
                    placeholder="Detalle confidencial o petición de oración para el Pastor (opcional)..."
                    value={consejeriaPeticion}
                    onChange={(e) => setConsejeriaPeticion(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* ¿En cuál ministerio? */}
            {interesServirVoluntario && (
              <div className="pt-2 animate-in fade-in-50">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ¿En cuál ministerio te gustaría servir?
                </label>
                <input
                  type="text"
                  value={ministerioDeseado}
                  onChange={(e) => setMinisterioDeseado(e.target.value)}
                  placeholder="Ej: Bienvenida, Alabanza, Niños, Logística, Misiones..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            )}
          </div>

          {/* Opciones Adicionales para Consolidación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asignar Consolidador Inicial:
              </label>
              <select
                value={consolidadorId}
                onChange={(e) => setConsolidadorId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Auto-asignar equitativamente</option>
                {consolidators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.alias} ({c.nombre})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={necesitaTransporte}
                  onChange={(e) => setNecesitaTransporte(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Requiere apoyo de transporte dominical</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notas u Observaciones del Ujier / Consolidador:
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Llegó invitado por la familia Restrepo. Interesado en discipulado entre semana..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Botones de Envío */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all cursor-pointer"
            >
              Registrar Tarjeta de Conexión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
