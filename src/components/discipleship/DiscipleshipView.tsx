import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, CheckCircle2, UserCheck, Sparkles, Phone, MessageCircle, Award, ChevronRight, User } from 'lucide-react';
import { generarEnlaceWhatsApp } from '../../lib/whatsappUtils';

export const DiscipleshipView: React.FC = () => {
  const { members, updateDiscipleshipProgress, updateMinistryPlacement, activeRole, activeUserProfile } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'en_curso' | 'completados'>('en_curso');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar miembros para discipulado (paso 4 en adelante o con registro de discipulado)
  const discipleshipMembers = members.filter((m) => {
    const matchesSearch = m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.ministerioInteres && m.ministerioInteres.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    if (selectedFilter === 'en_curso') {
      return m.discipulado && !m.discipulado.completado;
    } else if (selectedFilter === 'completados') {
      return m.discipulado && m.discipulado.completado;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Superior Institucional */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 backdrop-blur-md text-amber-200 text-xs font-bold border border-amber-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Programa de Formación Doctrinal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Discipulado: Libro «Nuevos Creyentes» (13 Lecciones)
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            Acompañamiento semanal personalizado (virtual o presencial) guiado por nuestros discipuladores para cimentar la fe en la Palabra de Dios antes de la incorporación ministerial.
          </p>
        </div>
      </div>

      {/* Controles y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFilter('en_curso')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'en_curso'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En Discipulado (Lecciones 1-13)
          </button>
          <button
            onClick={() => setSelectedFilter('completados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'completados'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Discipulado Completado ✅
          </button>
          <button
            onClick={() => setSelectedFilter('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'todos'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({members.length})
          </button>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por hermano o ministerio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Tarjetas de Miembros en Discipulado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {discipleshipMembers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <BookOpen className="w-12 h-12 text-amber-500 mx-auto opacity-70" />
            <h4 className="text-base font-bold text-slate-800">No hay registros en esta categoría</h4>
            <p className="text-xs text-slate-400">Los hermanos que inicien el estudio de las 13 lecciones aparecerán aquí.</p>
          </div>
        ) : (
          discipleshipMembers.map((member) => {
            const disc = member.discipulado || { leccionActual: 1, completado: false, discipuladorNombre: 'Por asignar' };
            const progressPercent = Math.round((disc.leccionActual / 13) * 100);

            const getMilestoneBadge = (lec: number, done: boolean) => {
              if (done) return { label: '🎓 Graduado IBC', color: 'bg-emerald-100 text-emerald-800' };
              if (lec <= 4) return { label: '🌱 Semilla de Fe (1-4)', color: 'bg-lime-100 text-lime-800' };
              if (lec <= 9) return { label: '🌿 Creciendo (5-9)', color: 'bg-teal-100 text-teal-800' };
              return { label: '🌳 Fundamento (10-13)', color: 'bg-amber-100 text-amber-800' };
            };
            const milestone = getMilestoneBadge(disc.leccionActual, disc.completado);

            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{member.nombre}</h3>
                      <p className="text-xs text-slate-500 font-mono">{member.telefono}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${milestone.color}`}>
                        {milestone.label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Lección {disc.leccionActual} / 13
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso 13 Lecciones */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Progreso Libro Nuevos Creyentes</span>
                      <span className="font-mono text-amber-700">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Discipulador(a):</span>
                      <span className="font-bold text-slate-800">{disc.discipuladorNombre || 'Asignación pendiente'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interés Ministerial:</span>
                      <span className="font-bold text-indigo-700 truncate max-w-[160px]">{member.ministerioInteres || 'Por definir'}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones del Discipulador / Pastor */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={generarEnlaceWhatsApp(
                      member.telefono,
                      `¡Hola ${member.nombre}! Te saluda tu discipulador de la Iglesia Bautista Central. Queremos coordinar nuestro encuentro semanal para continuar con la lección ${disc.leccionActual} del libro Nuevos Creyentes. ¿Qué día y horario te queda mejor esta semana?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs flex-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {!disc.completado ? (
                    <button
                      onClick={() => {
                        const nextLec = Math.min(13, disc.leccionActual + 1);
                        const isDone = nextLec >= 13;
                        updateDiscipleshipProgress(member.id, nextLec, isDone);
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>Avanzar Lección</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completado</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
