import { z } from 'zod';

export const ContenedorEnum = z.enum(['20ST', '40ST', '40HC', 'LCL', 'reefer']);
export const OperacionEnum = z.enum(['exportacion', 'importacion']);
export const SeveridadEnum = z.enum(['alta', 'media']);
export const CorredorIdEnum = z.enum(['pacifico', 'atlantico']);

export const ContactoSchema = z.object({
  nombre: z.string().nullable().default(null),
  empresa: z.string().nullable().default(null)
}).default({});

export const OrigenSchema = z.object({
  ciudad: z.string().nullable().default(null),
  provincia: z.string().nullable().default(null)
}).default({});

export const DestinoSchema = z.object({
  ciudad: z.string().nullable().default(null),
  pais: z.string().nullable().default(null)
}).default({});

export const CargaSchema = z.object({
  tipo: z.string().nullable().default(null),
  pesoKg: z.number().nullable().default(null),
  volumenM3: z.number().nullable().default(null),
  contenedor: ContenedorEnum.nullable().default(null),
  cantidad: z.number().nullable().default(null)
}).default({});

export const OperativaSchema = z.object({
  ritmoCargaDiario: z.string().nullable().default(null),
  plazoSobreestadiaDias: z.number().nullable().default(null),
  depositoFiscalVacios: z.string().nullable().default(null)
}).default({});

export const FichaTecnicaSchema = z.object({
  contacto: ContactoSchema,
  operacion: OperacionEnum.nullable().default(null),
  origen: OrigenSchema,
  destino: DestinoSchema,
  carga: CargaSchema,
  incoterm: z.string().nullable().default(null),
  fechaEstimada: z.string().nullable().default(null),
  operativa: OperativaSchema,
  observaciones: z.string().nullable().default(null)
});

export const AlertaSchema = z.object({
  campo: z.string(),
  mensaje: z.string(),
  pregunta: z.string(),
  severidad: SeveridadEnum
});

export const PuertoSchema = z.object({
  nombre: z.string(),
  pais: z.string(),
  lat: z.number(),
  lng: z.number(),
  perfil: z.string().optional()
});

export const DepositoFiscalSchema = z.object({
  nombre: z.string(),
  ciudad: z.string(),
  provincia: z.string(),
  tipo: z.string().optional(),
  nota: z.string()
});

export const CorredorSchema = z.object({
  id: CorredorIdEnum,
  nombre: z.string(),
  descripcion: z.string().optional(),
  pasosFronterizos: z.array(z.any()).default([]),
  puertos: z.array(PuertoSchema).default([]),
  tiempoEstimadoDias: z.number(),
  distanciaAproxKm: z.record(z.number()).optional(),
  pros: z.array(z.string()).default([]),
  contras: z.array(z.string()).default([]),
  consideraciones: z.array(z.string()).default([])
});

// Request body validation schemas
export const ParseRequestBodySchema = z.object({
  texto: z.string().min(1, 'El campo "texto" es requerido y no puede estar vacío')
});

export const ValidateRequestBodySchema = z.object({
  ficha: FichaTecnicaSchema
});

export const RfqRequestBodySchema = z.object({
  ficha: FichaTecnicaSchema,
  corredorId: CorredorIdEnum.nullable().optional().default(null)
});

export const RfqPdfRequestBodySchema = z.object({
  asunto: z.string().min(1, 'El campo "asunto" es requerido'),
  texto: z.string().min(1, 'El campo "texto" es requerido')
});

export const ConsultaCreateBodySchema = z.object({
  textoOriginal: z.string().min(1, 'El campo "textoOriginal" es requerido'),
  ficha: FichaTecnicaSchema,
  alertas: z.array(AlertaSchema).default([])
});
