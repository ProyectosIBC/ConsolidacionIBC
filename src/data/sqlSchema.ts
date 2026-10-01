export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE (PostgreSQL)
-- IGLESIA BAUTISTA CENTRAL (IBC BOGOTÁ) — SISTEMA CRM Y GESTIÓN PASTORAL
-- Arquitectura de costo mensual $0 USD (Capa gratuita de Supabase)
-- ==============================================================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS ENUMERADOS (DOMINIOS CONTROLADOS)
DO $$ BEGIN
    CREATE TYPE rol_usuario_tipo AS ENUM ('pastor_principal', 'pastor_asociado', 'lider_consolidacion', 'diacono', 'tesorero');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_miembro_tipo AS ENUM ('Visitante Nuevo', 'En Proceso', 'Miembro Frecuente', 'Ausente', 'Integrado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_seguimiento_tipo AS ENUM ('Nuevo', 'En seguimiento', 'Necesita atención', 'Integrado', 'Consejería activa');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE urgencia_consejeria_tipo AS ENUM ('Alta', 'Media', 'Baja');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_consejeria_tipo AS ENUM ('Pendiente', 'En acompañamiento', 'Cerrada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE categoria_donacion_tipo AS ENUM ('Diezmo', 'Ofrenda dominical', 'Pro-Templo', 'Misiones', 'Acción Social', 'Otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE metodo_pago_tipo AS ENUM ('Bancolombia', 'Nequi', 'Daviplata', 'Efectivo', 'Datafono', 'Otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 3. TABLA: usuarios (Administradores y Equipo Pastoral)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    rol rol_usuario_tipo DEFAULT 'lider_consolidacion',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLA: miembros (Congregación y Visitantes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.miembros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    tipo tipo_miembro_tipo DEFAULT 'Visitante Nuevo',
    estado_seguimiento estado_seguimiento_tipo DEFAULT 'Nuevo',
    semana_actual INT DEFAULT 1 CHECK (semana_actual >= 1 AND semana_actual <= 8),
    ciclos_contacto INT DEFAULT 0,
    ultimo_contacto TIMESTAMPTZ,
    proximo_contacto TIMESTAMPTZ DEFAULT NOW(),
    motivo_ausencia TEXT,
    necesita_transporte BOOLEAN DEFAULT FALSE,
    ministerio_interes VARCHAR(150),
    notas TEXT,
    escalado_pastor BOOLEAN DEFAULT FALSE,
    fecha_escalamiento TIMESTAMPTZ,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_miembros_estado ON public.miembros(estado_seguimiento);
CREATE INDEX IF NOT EXISTS idx_miembros_tipo ON public.miembros(tipo);
CREATE INDEX IF NOT EXISTS idx_miembros_proximo ON public.miembros(proximo_contacto);

-- ==============================================================================
-- 5. TABLA: consejeria (Solicitudes y SLA de Atención)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consejeria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    miembro_id UUID REFERENCES public.miembros(id) ON DELETE SET NULL,
    nombre_solicitante VARCHAR(255) NOT NULL,
    contacto VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    tema VARCHAR(200) NOT NULL, -- Matrimonial, Familiar, Espiritual, Duelo, etc.
    detalles TEXT,
    urgencia urgencia_consejeria_tipo DEFAULT 'Media',
    sla_horas INT NOT NULL DEFAULT 24, -- Alta: 6h, Media: 24h, Baja: 24h
    estado estado_consejeria_tipo DEFAULT 'Pendiente',
    pastor_asignado_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    pastor_nombre VARCHAR(255),
    escalado_alerta BOOLEAN DEFAULT FALSE,
    fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
    fecha_primer_contacto TIMESTAMPTZ,
    fecha_cierre TIMESTAMPTZ,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consejeria_estado ON public.consejeria(estado);
CREATE INDEX IF NOT EXISTS idx_consejeria_urgencia ON public.consejeria(urgencia);
CREATE INDEX IF NOT EXISTS idx_consejeria_fecha ON public.consejeria(fecha_solicitud);

-- TABLA: notas_consejeria (Historial confidencial de acompañamiento)
CREATE TABLE IF NOT EXISTS public.notas_consejeria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consejeria_id UUID NOT NULL REFERENCES public.consejeria(id) ON DELETE CASCADE,
    autor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    autor_nombre VARCHAR(255) NOT NULL,
    texto TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLA: seguimiento (Bitácora de contactos y llamadas semanales)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.seguimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    miembro_id UUID NOT NULL REFERENCES public.miembros(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    semana_numero INT NOT NULL CHECK (semana_numero BETWEEN 1 AND 8),
    canal VARCHAR(50) NOT NULL, -- WhatsApp, Llamada, Correo, SMS, Visita
    mensaje_plantilla_id VARCHAR(100),
    mensaje_enviado TEXT,
    respuesta_miembro TEXT,
    resultado VARCHAR(100), -- Respondió, No respondió, Asistirá domingo, Pidió oración, etc.
    fecha_contacto TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seguimiento_miembro ON public.seguimiento(miembro_id);

-- ==============================================================================
-- 7. TABLA: donaciones (Reporte de Diezmos, Ofrendas y Comprobantes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.donaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    miembro_id UUID REFERENCES public.miembros(id) ON DELETE SET NULL,
    donante_nombre VARCHAR(255) NOT NULL,
    monto NUMERIC(14, 2) NOT NULL CHECK (monto > 0),
    moneda VARCHAR(10) DEFAULT 'COP',
    fecha TIMESTAMPTZ DEFAULT NOW(),
    categoria categoria_donacion_tipo DEFAULT 'Ofrenda dominical',
    metodo metodo_pago_tipo DEFAULT 'Bancolombia',
    referencia_bancaria VARCHAR(150),
    comprobante_storage_path TEXT, -- Ruta en Supabase Storage bucket 'comprobantes'
    comprobante_url TEXT,
    verificado BOOLEAN DEFAULT FALSE,
    verificado_por UUID REFERENCES public.usuarios(id),
    notas TEXT,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donaciones_fecha ON public.donaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_donaciones_categoria ON public.donaciones(categoria);

-- ==============================================================================
-- 8. TRIGGER AUTOMÁTICO: Asignación de Horas SLA según Urgencia
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.calcular_sla_consejeria()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.urgencia = 'Alta' THEN
        NEW.sla_horas := 6;
    ELSIF NEW.urgencia = 'Media' THEN
        NEW.sla_horas := 24;
    ELSE
        NEW.sla_horas := 24;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_consejeria_sla ON public.consejeria;
CREATE TRIGGER tr_consejeria_sla
BEFORE INSERT OR UPDATE OF urgencia ON public.consejeria
FOR EACH ROW EXECUTE FUNCTION public.calcular_sla_consejeria();

-- ==============================================================================
-- 9. TRIGGER: Auto-escalamiento si miembro en "Nuevo" tiene >= 2 ciclos sin respuesta
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.verificar_escalamiento_miembro()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado_seguimiento = 'Nuevo' AND NEW.ciclos_contacto >= 2 AND NEW.escalado_pastor = FALSE THEN
        NEW.estado_seguimiento := 'Necesita atención';
        NEW.escalado_pastor := TRUE;
        NEW.fecha_escalamiento := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_miembro_escalamiento ON public.miembros;
CREATE TRIGGER tr_miembro_escalamiento
BEFORE UPDATE OF ciclos_contacto ON public.miembros
FOR EACH ROW EXECUTE FUNCTION public.verificar_escalamiento_miembro();

-- ==============================================================================
-- 10. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consejeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_consejeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donaciones ENABLE ROW LEVEL SECURITY;

-- Acceso para usuarios autenticados del equipo pastoral
CREATE POLICY "Permitir lectura para usuarios autenticados" ON public.miembros
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gestión total a equipo pastoral" ON public.miembros
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permisos públicos restringidos para formularios de inscripción (INSERT anónimo)
CREATE POLICY "Permitir registro público de visitantes" ON public.miembros
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir solicitud pública de consejería" ON public.consejeria
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir reporte público de ofrenda" ON public.donaciones
    FOR INSERT TO anon WITH CHECK (true);

-- Supabase Storage Bucket para comprobantes
-- INSERT INTO storage.buckets (id, name, public) VALUES ('comprobantes', 'comprobantes', true);
`;

export const ARCHITECTURE_FOLDERS = `
Estructura Propuesta del Proyecto SaaS / CRM (Frontend + Backend):

ibc-bogota-crm/
├── public/                       # Favicons, logo oficial IBC, recursos públicos
├── src/
│   ├── components/               # Componentes UI reutilizables
│   │   ├── layout/               # Sidebar, Header pastoral, TabNav, Footer
│   │   ├── dashboard/            # KPIs, semáforos, alertas críticas, accesos directos
│   │   ├── kanban/               # Tablero Kanban 5 columnas, tarjetas con WhatsApp
│   │   ├── counseling/           # Vista SLA, semáforos en tiempo real, notas pastorales
│   │   ├── schedule/             # Cronograma Lunes/Miércoles/Viernes + Generador de 15+ plantillas
│   │   ├── donations/            # Libro contable, visor de comprobantes modal con zoom
│   │   ├── publicForms/          # Portal público congregación (registro, ofrendas, consejería)
│   │   ├── database/             # Visor del esquema SQL, scripts DDL y guía de migración
│   │   ├── settings/             # Configuración general, bot de Telegram, webhooks
│   │   └── common/               # Badges, modales, alertas Toast
│   ├── context/
│   │   └── AppContext.tsx        # Estado global reactivo con persistencia y lógica SLA
│   ├── data/
│   │   ├── initialData.ts        # Semilla con datos reales simulados de IBC Bogotá
│   │   ├── templatesData.ts      # 10 plantillas ausentes + 5 frecuentes + 8 de ciclo semanal
│   │   └── sqlSchema.ts          # Código DDL oficial para Supabase PostgreSQL
│   ├── lib/
│   │   ├── supabaseClient.ts     # Cliente Supabase JS listo para producción
│   │   ├── telegramService.ts    # Enrutador para envío de alertas Telegram Bot
│   │   └── whatsappUtils.ts      # Constructor dinámico wa.me/57... con URL encoding
│   ├── types/
│   │   └── index.ts              # Tipos estrictos de TypeScript
│   ├── App.tsx                   # Enrutamiento de vistas y renderizado principal
│   ├── main.tsx
│   └── index.css                 # Tailwind CSS 4 con tipografía Plus Jakarta Sans
├── supabase/
│   ├── migrations/               # Scripts de versión de base de datos
│   └── functions/                # Edge Functions (SLA monitor y Cron diario a Telegram)
│       ├── cron-daily-summary/   # Ejecutado a las 7:00 AM diario
│       └── cron-sla-monitor/     # Ejecutado cada 2 horas
├── .env.example                  # Variables de entorno seguras
├── package.json
└── README.md
`;
