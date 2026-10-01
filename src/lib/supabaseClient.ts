import { createClient } from '@supabase/supabase-js';
import { Member, CounselingRequest, Donation } from '../types';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ocpxdgnrnrywjgztgjlg.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcHhkZ25ybnJ5d2pnenRnamxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NjUzODMsImV4cCI6MjEwNjE0MTM4M30.vqMTArsmv5K72zyyLH9NuCdyAT6FuDU8JHn3X1wad70';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Probar conexión en vivo con Supabase
export async function probarConexionSupabase(): Promise<{ ok: boolean; mensaje: string; count?: number }> {
  try {
    const { data, error, count } = await supabase
      .from('miembros')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return {
        ok: false,
        mensaje: `Error Supabase (${error.code}): ${error.message}`,
      };
    }
    return {
      ok: true,
      mensaje: 'Conectado exitosamente con Supabase PostgreSQL',
      count: count ?? 0,
    };
  } catch (err: any) {
    return {
      ok: false,
      mensaje: `Fallo de conexión de red: ${err.message || err}`,
    };
  }
}

// 1. MIEMBROS
export async function guardarMiembroSupabase(m: Member) {
  try {
    const payload: any = {
      id: m.id.startsWith('mem-') ? undefined : m.id, // dejar que uuid_generate_v4() genere si es formato temporal
      nombre_completo: m.nombre,
      telefono: m.telefono || null,
      email: m.email || null,
      tipo: m.tipo,
      estado_seguimiento: m.estadoSeguimiento,
      semana_actual: m.semanaActual,
      ciclos_contacto: m.ciclosContacto,
      proximo_contacto: m.proximoContacto || new Date().toISOString(),
      notas: m.notas || null,
      ministerio_interes: m.ministerioInteres || null,
      necesita_transporte: !!m.necesitaTransporte,
    };

    const { data, error } = await supabase.from('miembros').insert([payload]).select();
    if (error) {
      console.warn('Advertencia al insertar en Supabase miembros:', error.message);
      return null;
    }
    return data?.[0] || null;
  } catch (e) {
    console.warn('Error sinc miembro:', e);
    return null;
  }
}

// 2. CONSEJERÍA
export async function guardarConsejeriaSupabase(c: CounselingRequest) {
  try {
    const payload: any = {
      nombre_solicitante: c.nombre,
      contacto: c.contacto,
      email: c.email || null,
      tema: c.tema,
      detalles: c.detalles || null,
      urgencia: c.urgencia,
      sla_horas: c.tiempoLimiteHoras || (c.urgencia === 'Alta' ? 6 : 24),
      estado: c.estado,
      pastor_nombre: c.pastorAsignado || 'Pastor Edgar',
    };

    const { data, error } = await supabase.from('consejeria').insert([payload]).select();
    if (error) {
      console.warn('Advertencia al insertar en Supabase consejeria:', error.message);
      return null;
    }
    return data?.[0] || null;
  } catch (e) {
    console.warn('Error sinc consejería:', e);
    return null;
  }
}

// 3. DONACIONES
export async function guardarDonacionSupabase(d: Donation) {
  try {
    const payload: any = {
      donante_nombre: d.nombre,
      monto: d.monto,
      moneda: 'COP',
      categoria: d.categoria,
      metodo: d.metodo,
      referencia_bancaria: d.referencia || null,
      comprobante_url: d.comprobanteUrl || null,
      verificado: d.verificado,
      notas: d.notas || null,
    };

    const { data, error } = await supabase.from('donaciones').insert([payload]).select();
    if (error) {
      console.warn('Advertencia al insertar en Supabase donaciones:', error.message);
      return null;
    }
    return data?.[0] || null;
  } catch (e) {
    console.warn('Error sinc donación:', e);
    return null;
  }
}
