import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, CheckCircle2, Shield, Church, Users, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';

export const MinistryConsolidationView: React.FC = () => {
  const { members, updateMinistryPlacement } = useApp();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState<string>('Matrimonios / Células de Hogar');

  // Miembros que ya completaron el discipulado (13 lecciones) o están en fase avanzada listos para ministerio
  const graduatedMembers = members.filter((m) => m.discipulado && m.discipulado.completado);

  const ministriesList = [
    'Matrimonios / Células de Hogar',
    'Jóvenes y Adolescentes',
    'Alabanza y Adoración',
    'Escuela Dominical (Niños)',
    'Diaconado y Logística',
    'Evangelismo y Misiones',
    'Multimedia y Transmisión',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Superior Pastores */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 backdrop-blur-md text-blue-200 text-xs font-bold border border-blue-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>Consolidado Pastoral Exclusivo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Colocación en Ministerios — Hermanos Discipulados
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Listado oficial de creyentes que han culminado satisfactoriamente las 13 lecciones del libro «Nuevos Creyentes» y están listos para ser involucrados activamente en los ministerios de la Iglesia Bautista Central.
          </p>
        </div>
      </div>

      {/* Tarjetas de Graduados de Discipulado */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Graduados de Discipulado Listos para Servicio ({graduatedMembers.length})</span>
          </h2>
        </div>

        {graduatedMembers.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <Award className="w-12 h-12 text-slate-400 mx-auto opacity-70" />
            <h4 className="text-base font-bold text-slate-800">Aún no hay graduados registrados</h4>
            <p className="text-xs text-slate-400">Cuando los discipuladores marquen como completadas las 13 lecciones, aparecerán aquí para la asignación pastoral.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {graduatedMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{member.nombre}</h3>
                      <p className="text-xs text-slate-500 font-mono">{member.telefono}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      Discipulado 13/13 ✅
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Discipulador:</span>
                      <span className="font-bold text-slate-800">{member.discipulado?.discipuladorNombre || 'Asignado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interés Expresado:</span>
                      <span className="font-bold text-indigo-700">{member.ministerioInteres || 'Por definir'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Ministerio Asignado:</span>
                      <span className="font-extrabold text-emerald-700">{member.ministerioInteres || 'Pendiente de Pastor'}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones de Asignación Pastoral */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={generarEnlaceWhatsApp(
                      member.telefono,
                      `¡Hola ${member.nombre}! 🙏 Le saluda el Pastor Edgar de la Iglesia Bautista Central de Bogotá. Nos alegra enormemente que hayas completado tus 13 lecciones de discipulado. Queremos invitarte a integrarte al ministerio de ${member.ministerioInteres || 'servicio'} para poner tus dones al servicio del Señor. ¿Te parece bien si conversamos este domingo?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs flex-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Llamado Pastor</span>
                  </a>

                  <button
                    onClick={() => {
                      setAssigningId(member.id);
                      setSelectedMinistry(member.ministerioInteres || ministriesList[0]);
                    }}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Church className="w-3.5 h-3.5" />
                    <span>Asignar Ministerio</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Asignar Ministerio */}
      {assigningId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Asignar Ministerio Pastoral</h3>
            <p className="text-xs text-slate-500">
              Selecciona el ministerio definitivo en el cual el hermano comenzará a servir activamente:
            </p>

            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ministriesList.map((min) => (
                <option key={min} value={min}>{min}</option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssigningId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateMinistryPlacement(assigningId, selectedMinistry);
                  setAssigningId(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Guardar Asignación ✅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
