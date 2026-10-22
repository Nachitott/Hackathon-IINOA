/**
 * Parser heurístico sin LLM (Fallback seguro).
 * Fuente de verdad: 02-SKILLS/Parsing-NLP.md §4 y diccionario §2.
 */

export function parseFallback(texto) {
  const t = texto.toLowerCase();

  // 1. Operación
  let operacion = null;
  if (/export|mandar.*(a|afuera)|sacar.*del.*pais|enviar.*a/i.test(texto)) {
    operacion = 'exportacion';
  } else if (/import|traer.*(de|desde)|comprar.*afuera/i.test(texto)) {
    operacion = 'importacion';
  }

  // 2. Contenedor y Equipamiento
  let contenedor = null;
  if (/reefer|refrigerad|camara.*fria/i.test(texto)) {
    contenedor = 'reefer';
  } else if (/40\s?hc|high\s?cube|cuarenta\s?high\s?cube/i.test(texto)) {
    contenedor = '40HC';
  } else if (/40\s?st|cuarenta|un\s?40|container.*40|contenedores.*40/i.test(texto)) {
    contenedor = '40ST';
  } else if (/20\s?st|veinte\s?pies|un\s?20|container.*20|contenedores.*20/i.test(texto)) {
    contenedor = '20ST';
  } else if (/suelto|carga\s?suelta|pallets|pallet|compartido|lcl/i.test(texto)) {
    contenedor = 'LCL';
  }

  // 3. Cantidad
  let cantidad = null;
  const cantMatch = texto.match(/(\d+)\s*(?:x\s*)?(?:containers?|contenedores?|pallets?|equipos?)/i) ||
                    texto.match(/(\d+)\s*x\s*(?:40|20|reefer|hc)/i);
  if (cantMatch) {
    cantidad = parseInt(cantMatch[1], 10);
  } else if (/\bun\s+(?:container|contenedor|reefer|40|20)/i.test(texto)) {
    cantidad = 1;
  }

  // 4. Peso (Normalizado a kg)
  let pesoKg = null;
  const tnMatch = texto.match(/(\d+[.,]?\d*)\s*(?:tn|toneladas?|ton)\b/i);
  const kgMatch = texto.match(/(\d+[.,]?\d*)\s*(?:kg|kilos?|kilogramos?)\b/i);
  if (tnMatch) {
    const val = parseFloat(tnMatch[1].replace(',', '.'));
    pesoKg = Math.round(val * 1000);
  } else if (kgMatch) {
    pesoKg = Math.round(parseFloat(kgMatch[1].replace(',', '.')));
  }

  // 5. Volumen en m3
  let volumenM3 = null;
  const m3Match = texto.match(/(\d+[.,]?\d*)\s*(?:m3|metros?\s?c[uú]bicos?|cubos)\b/i);
  if (m3Match) {
    volumenM3 = parseFloat(m3Match[1].replace(',', '.'));
  }

  // 6. Incoterm
  let incoterm = null;
  const incoMatch = texto.match(/\b(EXW|FCA|FOB|CFR|CIF|DAP|DDP|CPT|CIP|FAS)\b/i);
  if (incoMatch) {
    incoterm = incoMatch[1].toUpperCase();
  }

  // 7. Origen y Destino
  let origenCiudad = null;
  let origenProvincia = null;
  let destinoCiudad = null;
  let destinoPais = null;

  // Ciudades / Provincias NOA
  if (/salta\s?(capital)?/i.test(texto)) {
    if (/sale.*salta|salimos.*de.*salta|de.*salta/i.test(texto) || operacion === 'exportacion') {
      origenCiudad = 'Salta';
      origenProvincia = 'Salta';
    } else {
      destinoCiudad = 'Salta';
      destinoPais = 'Argentina';
    }
  }
  if (/oran|orán/i.test(texto)) {
    origenCiudad = 'Orán';
    origenProvincia = 'Salta';
  }
  if (/guemes|güemes/i.test(texto)) {
    origenCiudad = 'General Güemes';
    origenProvincia = 'Salta';
  }
  if (/perico/i.test(texto)) {
    origenCiudad = 'Perico';
    origenProvincia = 'Jujuy';
  }
  if (/jujuy|san salvador/i.test(texto)) {
    if (/llegaria.*jujuy|a.*jujuy/i.test(texto) || operacion === 'importacion') {
      destinoCiudad = 'San Salvador de Jujuy';
      destinoPais = 'Argentina';
    } else {
      origenCiudad = 'San Salvador de Jujuy';
      origenProvincia = 'Jujuy';
    }
  }

  // Destinos / Orígenes Internacionales
  if (/china/i.test(texto)) destinoPais = 'China';
  if (/india/i.test(texto)) destinoPais = 'India';
  if (/ee\.?uu\.?|estados unidos|miami/i.test(texto)) {
    destinoPais = 'Estados Unidos';
    if (/miami/i.test(texto)) destinoCiudad = 'Miami';
  }
  if (/brasil|brazil/i.test(texto)) {
    if (operacion === 'importacion') {
      origenCiudad = /santos/i.test(texto) ? 'Santos' : null;
      origenProvincia = 'Brasil';
    } else {
      destinoPais = 'Brasil';
    }
  }
  if (/europa/i.test(texto)) destinoPais = 'Europa';
  if (/chile/i.test(texto)) destinoPais = 'Chile';

  // 8. Carga Tipo
  let tipoCarga = null;
  const CARGAS = ['sal', 'litio', 'arandanos', 'arándanos', 'azucar', 'azúcar', 'porotos', 'limones', 'legumbres', 'maquinaria', 'tabaco', 'minerales'];
  for (const c of CARGAS) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(texto)) {
      tipoCarga = c.toLowerCase();
      break;
    }
  }

  // 9. Parámetros operativos
  let ritmoCargaDiario = null;
  const ritmoMatch = texto.match(/(\d+\s*(?:contenedores?|pallets?|toneladas?|tn|kg)\s*(?:por|\/)\s*d[ií]a|cargamos\s*\d+\s*por\s*d[ií]a[^\.,]*)/i);
  if (ritmoMatch) {
    ritmoCargaDiario = ritmoMatch[1].trim();
  }

  let plazoSobreestadiaDias = null;
  const freeTimeMatch = texto.match(/(\d+)\s*d[ií]as?\s*(?:de\s*)?(?:free\s*time|sobreestad[ií]a|demurrage)/i);
  if (freeTimeMatch) {
    plazoSobreestadiaDias = parseInt(freeTimeMatch[1], 10);
  }

  let depositoFiscalVacios = null;
  if (/cocel\s?salta/i.test(texto)) {
    depositoFiscalVacios = 'COCEL Salta';
  } else if (/cocel/i.test(texto)) {
    depositoFiscalVacios = 'COCEL Salta';
  }

  // 10. Contacto
  let contactoNombre = null;
  let contactoEmpresa = null;
  const contactoMatch = texto.match(/soy\s+([a-záéíóúñ]+)\s+de\s+([a-záéíóúñ0-9\s]+?)(?:,|\.|\bquiero|\bnecesito)/i);
  if (contactoMatch) {
    contactoNombre = contactoMatch[1].trim();
    contactoEmpresa = contactoMatch[2].trim();
  }

  return {
    contacto: {
      nombre: contactoNombre,
      empresa: contactoEmpresa
    },
    operacion,
    origen: {
      ciudad: origenCiudad,
      provincia: origenProvincia
    },
    destino: {
      ciudad: destinoCiudad,
      pais: destinoPais
    },
    carga: {
      tipo: tipoCarga,
      pesoKg,
      volumenM3,
      contenedor,
      cantidad
    },
    incoterm,
    fechaEstimada: null,
    operativa: {
      ritmoCargaDiario,
      plazoSobreestadiaDias,
      depositoFiscalVacios
    },
    observaciones: null
  };
}
