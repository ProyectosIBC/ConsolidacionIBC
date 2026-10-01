import React, { useState } from 'react';
import { SUPABASE_SQL_SCHEMA, ARCHITECTURE_FOLDERS } from '../../data/sqlSchema';
import { useApp } from '../../context/AppContext';
import {
  FileCode2,
  Copy,
  Check,
  FolderTree,
  Database,
  Cloud,
  Mail,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Bot,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { SUPABASE_URL } from '../../lib/supabaseClient';

export const DatabaseSetupView: React.FC = () => {
  const { config, showToast, supabaseStatus, supabaseMessage, testSupabase } = useApp();
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedFolders, setCopiedFolders] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'conexion' | 'sql' | 'integracion' | 'carpetas'>('conexion');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showToast('success', 'Esquema SQL copiado al portapapeles', 'Copiado');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyFolders = () => {
    navigator.clipboard.writeText(ARCHITECTURE_FOLDERS);
    setCopiedFolders(true);
    showToast('success', 'Estructura de carpetas copiada al portapapeles', 'Copiado');
    setTimeout(() => setCopiedFolders(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(SUPABASE_URL);
    setCopiedUrl(true);
    showToast('success', 'URL de Supabase copiada', 'Copiado');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleManualTest = async () => {
    setTesting(true);
    await testSupabase();
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Estado de Conexión en Vivo con Supabase */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-5 rounded-3xl border border-emerald-800/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Base de Datos Cloud Activa
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  supabaseStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : supabaseStatus === 'checking'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    supabaseStatus === 'connected'
                      ? 'bg-emerald-400 animate-pulse'
                      : supabaseStatus === 'checking'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-rose-400'
                  }`}
                />
                {supabaseStatus === 'connected'
                  ? 'Supabase Conectado'
                  : supabaseStatus === 'checking'
                  ? 'Verificando...'
                  : 'Desconectado'}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5 break-all font-mono">
              {SUPABASE_URL}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">{supabaseMessage}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualTest}
            disabled={testing}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Probando...' : 'Verificar Conexión'}</span>
          </button>
          <a
            href="https://supabase.com/dashboard/project/ocpxdgnrnrywjgztgjlg"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panel Supabase</span>
          </a>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('conexion')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'conexion'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>Configuración & Credenciales</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sql'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-blue-600" />
          <span>Esquema SQL Oficial (DDL)</span>
        </button>

        <button
          onClick={() => setActiveTab('integracion')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'integracion'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cloud className="w-4 h-4 text-indigo-600" />
          <span>Integración Google ({config.proyectosGoogleEmail})</span>
        </button>

        <button
          onClick={() => setActiveTab('carpetas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'carpetas'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderTree className="w-4 h-4 text-purple-600" />
          <span>Estructura del Proyecto</span>
        </button>
      </div>

      {/* PESTAÑA: CONEXIÓN ACTIVA */}
      {activeTab === 'conexion' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Credenciales Configuradas en el Proyecto
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tu proyecto de Supabase ya quedó vinculado a la aplicación web mediante variables de entorno.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Project URL (VITE_SUPABASE_URL):
              </span>
              <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold text-slate-800 break-all">
                <span>{SUPABASE_URL}</span>
                <button
                  onClick={handleCopyUrl}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 shrink-0"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Anon Public Key:
              </span>
              <p className="font-mono text-xs font-bold text-slate-800 truncate">
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                ✓ Clave pública cargada en .env
              </span>
            </div>
          </div>

          {/* Tablas sincronizadas en Supabase */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
              Tablas Activas en tu Base de Datos PostgreSQL:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-blue-700 block">public.miembros</span>
                <span className="text-[10px] text-slate-400 font-sans">Consolidación y Visitantes</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-rose-700 block">public.consejeria</span>
                <span className="text-[10px] text-slate-400 font-sans">Tiempo oportuno</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-emerald-700 block">public.donaciones</span>
                <span className="text-[10px] text-slate-400 font-sans">Libro contable</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-indigo-700 block">public.seguimiento</span>
                <span className="text-[10px] text-slate-400 font-sans">8 semanas</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-purple-700 block">public.usuarios</span>
                <span className="text-[10px] text-slate-400 font-sans">Equipo pastoral</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ESQUEMA SQL SUPABASE */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Script SQL Oficial para Supabase (PostgreSQL)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tablas requeridas: <b>usuarios, miembros, consejeria, donaciones, seguimiento</b>, tipos enum, trigger de atención oportuna y RLS.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copiado' : 'Copiar Código SQL'}</span>
            </button>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <b>¡Script ya ejecutado exitosamente!</b> Tu base de datos PostgreSQL en Supabase ya tiene todas estas tablas, tipos y triggers creados.
            </span>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
              <code>{SUPABASE_SQL_SCHEMA}</code>
            </pre>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: INTEGRACIÓN GOOGLE */}
      {activeTab === 'integracion' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  Cuenta Oficial de Proyectos
                </span>
                <h3 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>{config.proyectosGoogleEmail}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Centraliza el acceso a Supabase, Google Sheets, Google Workspace y alertas pastorales a costo $0.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs space-y-1">
                <p className="font-semibold text-blue-200">Presupuesto Mensual:</p>
                <p className="text-xl font-black text-emerald-400">$0.00 USD / mes</p>
                <p className="text-[11px] text-slate-300">Capa gratuita permanente</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: ESTRUCTURA DE CARPETAS */}
      {activeTab === 'carpetas' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-indigo-600" />
                <span>Estructura de Carpetas Propuesta (Clean Architecture)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Arquitectura escalable, modular y desacoplada para React / TypeScript.
              </p>
            </div>

            <button
              onClick={handleCopyFolders}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0"
            >
              {copiedFolders ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedFolders ? 'Copiado' : 'Copiar Árbol'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
              <code>{ARCHITECTURE_FOLDERS}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
