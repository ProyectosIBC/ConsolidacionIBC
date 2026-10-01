/**
 * Generador de Mensajes Pastorales Personalizados para WhatsApp
 * Autor: Pastor Edgar Castaño - Iglesia Bautista Central de Bogotá
 * Tono: Fraterno, empático, bíblico, en tuteo cálido y contextualizado según la necesidad.
 */

export const getFriendlyPastorGreetingName = (fullName: string): string => {
  if (!fullName) return 'hermano(a)';
  const cleaned = fullName.trim().replace(/^(Sr\.|Sra\.|Don|Doña|Hermano|Hermana|Hno\.|Hna\.)\s+/i, '');
  const parts = cleaned.split(/\s+/);

  if (parts.length >= 2) {
    const firstLower = parts[0].toLowerCase();
    // Nombres compuestos hispanos comunes que van juntos
    const compoundFirstNames = ['rosa', 'ana', 'maria', 'maría', 'juan', 'josé', 'jose', 'luis', 'carlos', 'gloria', 'martha', 'laura'];
    if (compoundFirstNames.includes(firstLower)) {
      return `${parts[0]} ${parts[1]}`;
    }
  }
  return parts[0] || fullName;
};

export const generarMensajePastoralCounseling = (
  nombre: string,
  tema: string = '',
  detalles: string = '',
  disponibilidad: string = ''
): string => {
  const nombreCercano = getFriendlyPastorGreetingName(nombre);
  const temaNorm = (tema || '').toLowerCase();
  const detallesNorm = (detalles || '').toLowerCase();

  // 1. Duelo, Pérdida y Luto
  if (
    temaNorm.includes('duelo') ||
    temaNorm.includes('luto') ||
    temaNorm.includes('fallecimiento') ||
    temaNorm.includes('pérdida') ||
    detallesNorm.includes('duelo') ||
    detallesNorm.includes('falleció') ||
    detallesNorm.includes('partida')
  ) {
    return `Hola, ${nombreCercano}, Dios te bendiga. Te habla el pastor Edgar Castaño de la Iglesia Bautista Central. Me enteré del momento tan difícil de duelo que estás atravesando y quería comunicarme contigo para saber cómo estás y acompañarte. En momentos de dolor es cuando más necesitamos la paz de Dios y la compañía de la familia de la fe. ¿Tienes un momento para que hablemos y oremos juntos?`;
  }

  // 2. Crisis Matrimonial y Familiar
  if (
    temaNorm.includes('matrimoni') ||
    temaNorm.includes('familiar') ||
    temaNorm.includes('familia') ||
    temaNorm.includes('espos') ||
    temaNorm.includes('pareja') ||
    temaNorm.includes('hogar') ||
    temaNorm.includes('hijo') ||
    detallesNorm.includes('matrimonio') ||
    detallesNorm.includes('esposo') ||
    detallesNorm.includes('esposa')
  ) {
    return `Hola, ${nombreCercano}, Dios te bendiga. Te habla el pastor Edgar Castaño de la Iglesia Bautista Central. Me enteré del momento tan difícil que están atravesando a nivel matrimonial y familiar, y quería comunicarme contigo para saber cómo estás y acompañarte. En medio de las tormentas del hogar es cuando más necesitamos la sabiduría de Dios, Su restauración y el apoyo de la iglesia. ¿Tienes un momento para que hablemos y oremos juntos?`;
  }

  // 3. Ansiedad, Desgaste Emocional, Depresión o Cargas
  if (
    temaNorm.includes('ansiedad') ||
    temaNorm.includes('estrés') ||
    temaNorm.includes('estres') ||
    temaNorm.includes('depres') ||
    temaNorm.includes('emocion') ||
    temaNorm.includes('angustia') ||
    temaNorm.includes('agotamiento') ||
    temaNorm.includes('fortalecimiento en la fe')
  ) {
    return `Hola, ${nombreCercano}, Dios te bendiga. Te habla el pastor Edgar Castaño de la Iglesia Bautista Central. Me enteré de la carga tan pesada de ansiedad y desgaste emocional por la que estás pasando, y quería comunicarme contigo para saber cómo estás y recordarte que no estás solo(a). Dios tiene una paz que sobrepasa todo entendimiento para tu corazón y aquí estamos para sostenerte en oración. ¿Tienes un momento para que hablemos y oremos juntos?`;
  }

  // 4. Toma de Decisiones, Vocación y Futuro Laboral
  if (
    temaNorm.includes('decisi') ||
    temaNorm.includes('vocacion') ||
    temaNorm.includes('vocación') ||
    temaNorm.includes('trabajo') ||
    temaNorm.includes('empleo') ||
    temaNorm.includes('laboral') ||
    temaNorm.includes('carrera') ||
    temaNorm.includes('dirección') ||
    temaNorm.includes('direccion')
  ) {
    return `Hola, ${nombreCercano}, Dios te bendiga. Te habla el pastor Edgar Castaño de la Iglesia Bautista Central. Me enteré de las decisiones tan importantes que tienes por delante a nivel vocacional y de vida, y quería comunicarme contigo para acompañarte en discernimiento y oración. Cuando buscamos la guía del Señor con un corazón dispuesto, Él promete enderezar nuestros caminos. ¿Tienes un momento para que conversemos y oremos juntos?`;
  }

  // 5. Salud, Enfermedad o Cirugía
  if (
    temaNorm.includes('salud') ||
    temaNorm.includes('enfermedad') ||
    temaNorm.includes('cirugía') ||
    temaNorm.includes('cirugia') ||
    temaNorm.includes('médic') ||
    temaNorm.includes('dolor físico') ||
    detallesNorm.includes('hospital') ||
    detallesNorm.includes('cirugía')
  ) {
    return `Hola, ${nombreCercano}, Dios te bendiga. Te habla el pastor Edgar Castaño de la Iglesia Bautista Central. Me enteré de la prueba de salud y quebranto físico que estás sobrellevando, y quería comunicarme contigo para saber cómo estás y decirte que nuestra congregación y yo estamos contigo. Creemos en un Dios de consuelo y fortaleza que cuida cada detalle de tu vida. ¿Tienes un momento para que oremos juntos y hablemos?`;
  }

  // 6. Dudas de Fe, Restauración Espiritual y Desánimo
  if (
    temaNorm.includes('espiritual') ||
    temaNorm.includes('fe') ||
    temaNorm.includes('duda') ||
    temaNorm.includes('desánimo') ||
    temaNorm.includes('desanimo') ||
    temaNorm.includes('alejamiento') ||
    temaNorm.includes('restauraci')
  ) {
    return `Hola, ${nombreCercano}, Dios te bendiga. Te habla el pastor Edgar Castaño de la Iglesia Bautista Central. Me enteré de las inquietudes espirituales y este momento de búsqueda que estás viviendo, y quería comunicarme contigo para acompañarte sin ningún señalamiento, con el amor sincero del Señor. Dios siempre renueva nuestras fuerzas cuando nos acercamos a Él con el corazón abierto. ¿Tienes un momento para que hablemos y oremos juntos?`;
  }

  // 7. Conflicto Interpersonal, Perdón y Reconciliación
  if (
    temaNorm.includes('conflicto') ||
    temaNorm.includes('perdón') ||
    temaNorm.includes('perdon') ||
    temaNorm.includes('herida') ||
    temaNorm.includes('ofensa') ||
    temaNorm.includes('reconcilia')
  ) {
    return `Hola, ${nombreCercano}, Dios te bendiga. Te habla el pastor Edgar Castaño de la Iglesia Bautista Central. Me enteré de la situación tan dolorosa de conflicto y necesidad de perdón que estás experimentando, y quería comunicarme contigo para saber cómo te encuentras y acompañarte. Sanar el corazón y restaurar la paz es posible con la gracia de Dios. ¿Tienes un momento para que hablemos y oremos juntos?`;
  }

  // 8. Mensaje Empático General (para cualquier otro tema personalizado)
  const temaLimpio = tema ? `sobre ${tema}` : 'por la que estás atravesando';
  return `Hola, ${nombreCercano}, Dios te bendiga. Te habla el pastor Edgar Castaño de la Iglesia Bautista Central. Me enteré de la situación ${temaLimpio} y quería comunicarme contigo para saber cómo estás y acompañarte. En momentos de necesidad o búsqueda es cuando más necesitamos la paz de Dios y la compañía de la familia de la fe. ¿Tienes un momento para que hablemos y oremos juntos?`;
};
