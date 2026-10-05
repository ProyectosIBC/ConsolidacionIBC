import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IBCLogo } from '../common/IBCLogo';
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
    <div className="min-h-screen bg-gradient-to-br from-[#232c1e] via-[#35432d] to-[#20271a] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans-karla text-[#f4efe4]">
      {/* Top Header bar with portal link */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <IBCLogo size="sm" />
          <div>
            <h1 className="font-serif-fraunces text-sm font-bold text-white tracking-tight">IBC Bogotá</h1>
            <p className="text-[10px] text-[#a9bb9e] font-serif-fraunces italic">Donde el amor hace la diferencia</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('public-portal')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all backdrop-blur-xs cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#f3ddd2]" />
          <span>Portal Público de Visitas</span>
        </button>
      </header>

      {/* Main Login Card */}
      <div className="max-w-4xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Pastoral Welcome & Verse */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="flex items-center gap-3">
            <IBCLogo size="xl" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#46543c]/80 border border-[#a9bb9e]/40 text-xs text-[#d6decf]">
              <Sparkles className="w-3.5 h-3.5 text-[#f3ddd2]" />
              <span className="font-mono-space">Capa Gratuita · $0 USD/mes</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-fraunces font-bold text-white tracking-tight leading-tight">
              Iglesia Bautista Central de Bogotá
            </h2>
            <p className="text-sm sm:text-base text-[#f3ddd2] italic font-serif-fraunces">
              «IBC, donde el amor hace la diferencia»
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#d6decf] leading-relaxed font-sans-karla">
            Plataforma para el acompañamiento y discipulado congregacional, atención en consejería pastoral, cronograma semanal de cuidado y administración transparente.
          </p>

          {/* Cita Bíblica Reina-Valera 1960 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1.5">
            <p className="text-xs text-[#f4efe4] italic font-serif-fraunces leading-relaxed">
              «Apacentad la grey de Dios que está entre vosotros, cuidando de ella, no por fuerza, sino voluntariamente; no por ganancia deshonesta, sino con ánimo pronto.»
            </p>
            <p className="text-[11px] font-bold text-[#a9bb9e] text-right font-serif-fraunces">
              — 1 Pedro 5:2 (RVR1960)
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-6">
          <div className="bg-[#faf8f1] text-[#332921] p-6 sm:p-8 rounded-3xl shadow-2xl border border-[#e8e2d5]">
            <div className="text-center space-y-1 mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#edf3eb] text-[#46543c] flex items-center justify-center mb-2 shadow-2xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif-fraunces font-bold text-[#332921]">Iniciar Sesión</h3>
              <p className="text-xs text-[#6b5a4d]">
                Ingresa con tu usuario y contraseña asignados
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#f3ddd2] border border-[#bd5c3f]/40 flex items-start gap-2.5 text-[#a54b30] text-xs">
                <AlertCircle className="w-4 h-4 text-[#bd5c3f] shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#332921] mb-1">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6b5a4d]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ej. pastor.edgar o martha.gomez"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e8e2d5] bg-white text-xs sm:text-sm text-[#332921] placeholder:text-[#a9bb9e] focus:outline-none focus:ring-2 focus:ring-[#bd5c3f]/20 focus:border-[#bd5c3f] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332921] mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6b5a4d]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña asignada"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#e8e2d5] bg-white text-xs sm:text-sm text-[#332921] placeholder:text-[#a9bb9e] focus:outline-none focus:ring-2 focus:ring-[#bd5c3f]/20 focus:border-[#bd5c3f] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6b5a4d] hover:text-[#332921] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#bd5c3f] hover:bg-[#a54b30] active:bg-[#8f3f26] text-white font-bold text-sm shadow-md shadow-[#bd5c3f]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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
            <div className="mt-6 pt-5 border-t border-[#e8e2d5]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b5a4d] mb-2.5 text-center font-mono-space">
                Credenciales Asignadas por Rol (Acceso Rápido)
              </p>
              <div className="space-y-2">
                {/* Pastor */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('pastor.edgar', 'Pastor2026*')}
                  className="w-full p-2.5 rounded-xl bg-[#edf3eb] hover:bg-[#dfecdd] border border-[#a9bb9e]/60 text-left flex items-center justify-between text-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#46543c] text-white flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#332921] font-serif-fraunces">Pastor Edgar</p>
                      <p className="text-[10px] text-[#6b5a4d] font-mono-space">pastor.edgar · Pastor2026*</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#46543c] bg-white px-2 py-0.5 rounded-md shadow-2xs group-hover:bg-[#46543c] group-hover:text-white transition-colors">
                    Entrar como Pastor
                  </span>
                </button>

                {/* Consolidadores */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('martha.gomez', 'Martha2026*')}
                    className="p-2 rounded-xl bg-[#f4efe4] hover:bg-[#ede5d6] border border-[#e8e2d5] text-left text-xs transition-all cursor-pointer"
                    title="Martha Gómez (Consolidador 1)"
                  >
                    <p className="font-bold text-[#332921] truncate font-serif-fraunces">Martha G.</p>
                    <p className="text-[9px] text-[#46543c] font-semibold truncate">Consolidador 1</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('andres.pardo', 'Andres2026*')}
                    className="p-2 rounded-xl bg-[#f4efe4] hover:bg-[#ede5d6] border border-[#e8e2d5] text-left text-xs transition-all cursor-pointer"
                    title="Andrés Pardo (Consolidador 2)"
                  >
                    <p className="font-bold text-[#332921] truncate font-serif-fraunces">Andrés P.</p>
                    <p className="text-[9px] text-[#46543c] font-semibold truncate">Consolidador 2</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('viviana.torres', 'Viviana2026*')}
                    className="p-2 rounded-xl bg-[#f4efe4] hover:bg-[#ede5d6] border border-[#e8e2d5] text-left text-xs transition-all cursor-pointer"
                    title="Viviana Torres (Consolidador 3)"
                  >
                    <p className="font-bold text-[#332921] truncate font-serif-fraunces">Viviana T.</p>
                    <p className="text-[9px] text-[#46543c] font-semibold truncate">Consolidador 3</p>
                  </button>
                </div>

                {/* Desarrollador */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('desarrollador', 'DevIBC2026*')}
                  className="w-full p-2.5 rounded-xl bg-[#283322] hover:bg-[#35432d] text-left flex items-center justify-between text-xs text-white transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#bd5c3f] text-white font-black flex items-center justify-center">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-white font-serif-fraunces">Desarrollador (Proyectos IBC)</p>
                      <p className="text-[10px] text-[#a9bb9e] font-mono-space">desarrollador · DevIBC2026*</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#f3ddd2] bg-[#3e4c35] px-2 py-0.5 rounded-md border border-[#a9bb9e]/30 group-hover:bg-[#bd5c3f] group-hover:text-white transition-colors">
                    DevOps
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-[#a9bb9e] py-3 border-t border-white/10 font-serif-fraunces">
        <p>
          Iglesia Bautista Central de Bogotá — <i>«IBC, donde el amor hace la diferencia»</i> · Bogotá, Colombia
        </p>
      </footer>
    </div>
  );
};
