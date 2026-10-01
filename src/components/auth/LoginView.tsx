import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { USER_PROFILES } from '../../data/profilesData';
import {
  Church,
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  UserCheck,
  Code2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, setCurrentView } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setIsLoading(false);
    }, 350);
  };

  const handleQuickLogin = (userVal: string, passVal: string) => {
    setIdentifier(userVal);
    setPassword(passVal);
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      login(userVal, passVal);
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans text-slate-100">
      {/* Top Header bar with portal link */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/90 border border-blue-400/30 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Church className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">IBC Bogotá</h1>
            <p className="text-[10px] text-blue-300 italic">Donde el amor hace la diferencia</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('public-portal')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all backdrop-blur-xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
          <span>Portal Público de Visitas</span>
        </button>
      </header>

      {/* Main Login Card */}
      <div className="max-w-4xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Pastoral Welcome & Verse */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-xs text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Sistema Seguro con Credenciales Asignadas</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Iglesia Bautista Central de Bogotá
            </h2>
            <p className="text-sm sm:text-base text-blue-200/90 italic font-serif">
              «IBC, donde el amor hace la diferencia»
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Plataforma para el acompañamiento y discipulado congregacional, atención en consejería pastoral, cronograma semanal de cuidado y administración transparente.
          </p>

          {/* Cita Bíblica Reina-Valera 1960 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1.5">
            <p className="text-xs text-blue-200 italic font-serif leading-relaxed">
              «Apacentad la grey de Dios que está entre vosotros, cuidando de ella, no por fuerza, sino voluntariamente; no por ganancia deshonesta, sino con ánimo pronto.»
            </p>
            <p className="text-[11px] font-bold text-blue-300 text-right">
              — 1 Pedro 5:2 (RVR1960)
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-6">
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-100">
            <div className="text-center space-y-1 mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Iniciar Sesión</h3>
              <p className="text-xs text-slate-500">
                Ingresa con tu usuario y contraseña asignados
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ej. pastor.edgar o martha.gomez"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña asignada"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
                Credenciales Asignadas por Rol (Acceso Rápido)
              </p>
              <div className="space-y-2">
                {/* Pastor */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('pastor.edgar', 'Pastor2026*')}
                  className="w-full p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 text-left flex items-center justify-between text-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Pastor Edgar</p>
                      <p className="text-[10px] text-slate-500 font-mono">pastor.edgar · Pastor2026*</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Entrar como Pastor
                  </span>
                </button>

                {/* Consolidadores */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('martha.gomez', 'Martha2026*')}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left text-xs transition-all cursor-pointer"
                    title="Martha Gómez (Consolidador 1)"
                  >
                    <p className="font-bold text-slate-900 truncate">Martha G.</p>
                    <p className="text-[9px] text-emerald-700 font-semibold truncate">Consolidador 1</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('andres.pardo', 'Andres2026*')}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left text-xs transition-all cursor-pointer"
                    title="Andrés Pardo (Consolidador 2)"
                  >
                    <p className="font-bold text-slate-900 truncate">Andrés P.</p>
                    <p className="text-[9px] text-indigo-700 font-semibold truncate">Consolidador 2</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('viviana.torres', 'Viviana2026*')}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left text-xs transition-all cursor-pointer"
                    title="Viviana Torres (Consolidador 3)"
                  >
                    <p className="font-bold text-slate-900 truncate">Viviana T.</p>
                    <p className="text-[9px] text-purple-700 font-semibold truncate">Consolidador 3</p>
                  </button>
                </div>

                {/* Desarrollador */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('desarrollador', 'DevIBC2026*')}
                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left flex items-center justify-between text-xs text-white transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Desarrollador (Proyectos IBC)</p>
                      <p className="text-[10px] text-slate-400 font-mono">desarrollador · DevIBC2026*</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded-md border border-amber-500/30 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                    DevOps
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-3 border-t border-white/10">
        <p>
          Iglesia Bautista Central de Bogotá — <i>«IBC, donde el amor hace la diferencia»</i> · Bogotá, Colombia
        </p>
      </footer>
    </div>
  );
};
