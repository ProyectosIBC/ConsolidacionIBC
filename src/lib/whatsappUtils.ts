/**
 * Limpia y normaliza números telefónicos para Colombia (+57)
 */
export function normalizarTelefono(tel: string, prefijoPais = '57'): string {
  if (!tel) return '';
  let cleaned = String(tel).replace(/\D/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    cleaned = prefijoPais + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = prefijoPais + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Genera el enlace directo wa.me con codificación URL
 */
export function generarEnlaceWhatsApp(telefono: string, mensaje: string, prefijoPais = '57'): string {
  const telNormalizado = normalizarTelefono(telefono, prefijoPais);
  return `https://wa.me/${telNormalizado}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Reemplaza variables en plantillas de mensaje
 */
export function personalizarMensaje(
  plantilla: string,
  variables: {
    nombre?: string;
    iglesia?: string;
    tuNombre?: string;
    tema?: string;
  }
): string {
  let resultado = plantilla;
  const nombre = variables.nombre || 'hermano(a)';
  const iglesia = variables.iglesia || 'Iglesia Bautista Central';
  const tuNombre = variables.tuNombre || 'el equipo de Consolidación';
  const tema = variables.tema || 'consejería';

  resultado = resultado
    .replace(/\[Nombre\]/gi, nombre)
    .replace(/\{nombre\}/gi, nombre)
    .replace(/\[Iglesia\]/gi, iglesia)
    .replace(/\{iglesia\}/gi, iglesia)
    .replace(/\[Tu Nombre\]/gi, tuNombre)
    .replace(/\{tuNombre\}/gi, tuNombre)
    .replace(/\[Tema\]/gi, tema)
    .replace(/\{tema\}/gi, tema);

  return resultado;
}

/**
 * Formato de moneda colombiana COP ($ 350.000)
 */
export function formatearMonedaCOP(monto: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(monto);
}
