import { GoogleGenAI } from '@google/genai';
import { FichaTecnicaSchema } from '../lib/schemas.js';
import { parseFallback } from './parser-fallback.js';

let aiInstance = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const SYSTEM_PROMPT = `Sos un extractor de datos logísticos de comercio exterior para el NOA argentino (Jujuy y Salta). Extraé del texto del usuario una ficha técnica JSON.

REGLAS ESTRICTAS:
- Devolvé ÚNICAMENTE JSON válido que cumpla el schema exacto, sin markdown (\`\`\`json) ni comentarios.
- Campo ausente en el texto = null. NUNCA inventes datos ni asumas valores no explícitos.
- Normalizá pesos siempre a kg (pesoKg) y volúmenes a m3 (volumenM3). Ej: 25 tn -> 25000, 500 kg -> 500.
- "contenedor" solo puede ser: "20ST", "40ST", "40HC", "LCL", "reefer" o null.
- "operacion" solo: "exportacion", "importacion" o null.
- "incoterm": código de 3 letras mayúsculas (ej. FOB, CIF, EXW, CFR) o null.
- "operativa.ritmoCargaDiario": texto libre si el texto indica ritmo de despacho (ej. "2 contenedores por día", "1 contenedor/día").
- "operativa.plazoSobreestadiaDias": número entero de días si menciona free time, días libres o sobreestadía/demurrage (ej. 14).
- "operativa.depositoFiscalVacios": nombre del depósito fiscal si menciona retiro/devolución local de vacíos (ej. "COCEL Salta").
- Jerga regional:
  * "un 40", "container de 40" -> "40ST"
  * "un 20", "container de 20" -> "20ST"
  * "40 high cube", "40HC" -> "40HC"
  * "pallets sueltos", "compartido", "suelto" -> "LCL"
  * "reefer", "camara fria" -> "reefer"
  * Orígenes típicos NOA: Salta, Jujuy, General Güemes, Perico, Orán.

SCHEMA ESPERADO:
{
  "contacto": { "nombre": "string | null", "empresa": "string | null" },
  "operacion": "exportacion | importacion | null",
  "origen": { "ciudad": "string | null", "provincia": "string | null" },
  "destino": { "ciudad": "string | null", "pais": "string | null" },
  "carga": {
    "tipo": "string | null",
    "pesoKg": "number | null",
    "volumenM3": "number | null",
    "contenedor": "20ST | 40ST | 40HC | LCL | reefer | null",
    "cantidad": "number | null"
  },
  "incoterm": "string | null",
  "fechaEstimada": "string | null",
  "operativa": {
    "ritmoCargaDiario": "string | null",
    "plazoSobreestadiaDias": "number | null",
    "depositoFiscalVacios": "string | null"
  },
  "observaciones": "string | null"
}`;

/**
 * Extrae la FichaTecnica del texto usando Gemini o fallback heurístico si falla o no hay API key.
 * @param {string} textoOriginal
 * @returns {Promise<{ ficha: object, modo: "gemini" | "fallback" }>}
 */
export async function extraerFichaTecnica(textoOriginal) {
  const ai = getAIClient();

  if (!ai) {
    console.warn('⚠️ [Gemini] GEMINI_API_KEY no presente. Ejecutando fallback heurístico.');
    const fichaFallback = parseFallback(textoOriginal);
    return {
      ficha: FichaTecnicaSchema.parse(fichaFallback),
      modo: 'fallback'
    };
  }

  try {
    const prompt = `${SYSTEM_PROMPT}\n\nTEXTO DEL USUARIO:\n"""${textoOriginal}"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0
      }
    });

    const responseText = response?.text?.trim() || '';
    let parsedJson;

    try {
      parsedJson = JSON.parse(responseText);
    } catch (parseErr) {
      console.warn('⚠️ [Gemini] JSON inválido devuelto por Gemini. Reintentando limpieza...');
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsedJson = JSON.parse(cleaned);
    }

    const fichaValidada = FichaTecnicaSchema.parse(parsedJson);

    return {
      ficha: fichaValidada,
      modo: 'gemini'
    };
  } catch (err) {
    console.error('⚠️ [Gemini] Error llamando a la API de Gemini (5xx o parse error):', err.message);
    console.log('🔄 Activando fallback heurístico seguro...');
    const fichaFallback = parseFallback(textoOriginal);
    return {
      ficha: FichaTecnicaSchema.parse(fichaFallback),
      modo: 'fallback'
    };
  }
}
