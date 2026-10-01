import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, FollowUpStatus } from '../../types';
import { ROADMAP_STEPS } from '../../data/roadmapData';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageCircle,
  Car,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Send,
  UserCheck,
  Building,
} from 'lucide-react';
import { generarEnlaceWhatsApp, personalizarMensaje } from '../../lib/whatsappUtils';

interface MemberProfileModalProps {
  member: Member | null;
  onClose: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member, onClose }) => {
  const {
    consolidators,
    reassignConsolidator,
    advanceMemberRoadmap,
    changeMemberStatus,
    registerContactAttempt,
    config,
  } = useApp();

  const [stepNote, setStepNote] = useState('');
  const [selectedConsolidator, setSelectedConsolidator] = useState(member?.consolidadorId || '');

  if (!member) return null;

  const currentStepInfo =
    ROADMAP_STEPS.find((s) => s.paso === member.pasoActualRuta) || ROADMAP_STEPS[0];

  // Mensaje de WhatsApp personalizado según la etapa actual
  const rawMsg = currentStepInfo.mensajePredeterminado;
  const personalizedMsg = personalizarMensaje(rawMsg, {
    nombre: member.nombre,
    iglesia: config.nombreIglesia,
    tuNombre: member.consolidadorNombre.split('(')[0].trim() || config.pastorNombre,
  });

  const whatsappUrl = member.telefono
    ? generarEnlaceWhatsApp(member.telefono, personalizedMsg, config.prefijoPais)
    : '#';

  const handleAdvanceStep = () => {
    advanceMemberRoadmap(member.id, member.pasoActualRuta + 1, stepNote.trim());
    setStepNote('');
  };

  const handleReassign = (newConsId: string) => {
    setSelectedConsolidator(newConsId);
    reassignConsolidator(member.id, newConsId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in zoom-in-95">
        {/* Header del Expediente */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 font-black text-lg flex items-center justify-center shrink-0">
              {member.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  {member.nombre}
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {member.tipo}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Semana {member.semanaActual} de 8
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {member.telefono || 'Sin teléfono'}
                </span>
                {member.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {member.email}
                  </span>
                )}
                {member.necesitaTransporte && (
                  <span className="text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Car className="w-3 h-3 text-amber-600" /> Requiere Transporte
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Asignación de Consolidador y Estado */}
        <div className="py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-600">Consolidador Asignado:</span>
            <select
              value={selectedConsolidator || member.consolidadorId}
              onChange={(e) => handleReassign(e.target.value)}
              className="text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 shadow-2xs"
            >
              {consolidators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.alias} — {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Estado de Consolidación:</span>
            <select
              value={member.estadoSeguimiento}
              onChange={(e) => changeMemberStatus(member.id, e.target.value as FollowUpStatus)}
              className="text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 shadow-2xs"
            >
              <option value="Nuevo">1. Nuevo</option>
              <option value="En seguimiento">2. En seguimiento</option>
              <option value="Necesita atención">3. Necesita atención</option>
              <option value="Consejería activa">4. Consejería activa</option>
              <option value="Integrado">5. Integrado 🎉</option>
            </select>
          </div>
        </div>

        {/* Contenedor con Scroll de la Ruta */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* TÍTULO DE LA RUTA */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Ruta de Crecimiento y Consolidación hacia el Servicio</span>
              </h4>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Paso {member.pasoActualRuta} de 6
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trayecto formativo desde su llegada hasta servir activamente en un ministerio de la IBC Bogotá.
            </p>
          </div>

          {/* LÍNEA DE TIEMPO VISUAL (STEPPER 1 A 6) */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {ROADMAP_STEPS.map((step) => {
              const isPast = step.paso < member.pasoActualRuta;
              const isCurrent = step.paso === member.pasoActualRuta;
              const isFuture = step.paso > member.pasoActualRuta;

              return (
                <div key={step.paso} className="relative group">
                  {/* Círculo indicador */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                      isPast
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-md animate-pulse'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.paso}
                  </div>

                  {/* Tarjeta de la Etapa */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/50 border-blue-300 shadow-xs ring-1 ring-blue-200'
                        : isPast
                        ? 'bg-white border-slate-200/90 opacity-90'
                        : 'bg-slate-50/70 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Paso {step.paso}: {step.titulo}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {step.semanas}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-fit">
                          📌 Dónde está hoy
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {step.descripcion}
                    </p>

                    {/* Acción siguiente del consolidador */}
                    {isCurrent && (
                      <div className="mt-3 pt-3 border-t border-blue-200/60 bg-white p-3 rounded-xl border border-blue-100 space-y-2.5">
                        <div>
                          <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider block">
                            🎯 Siguiente Paso a Dar según el Protocolo:
                          </span>
                          <p className="text-xs text-slate-700 font-medium mt-0.5">
                            {step.accionSiguiente}
                          </p>
                        </div>

                        {/* Mensaje Sugerido para WhatsApp */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 italic">
                          "{personalizedMsg}"
                        </div>

                        {/* Botones de Acción Inmediata */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {member.telefono && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => registerContactAttempt(member.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Enviar por WhatsApp</span>
                            </a>
                          )}

                          {member.pasoActualRuta < 6 && (
                            <button
                              onClick={handleAdvanceStep}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completar y Pasar al Paso {member.pasoActualRuta + 1}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Último contacto: {member.ultimoContacto ? new Date(member.ultimoContacto).toLocaleDateString('es-CO') : 'Sin registrar'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
