# Asistente Inteligente de Estructuración Logística (NOA) 🚢

API backend Express desarrollada para el hackathon. Procesa solicitudes de fletes y logística internacional con jerga regional del NOA argentino (Jujuy y Salta), estructurando expedientes técnicos, validando campos indispensables, comparando corredores bioceánicos (Pacífico vs. Atlántico) y generando RFQs formales con exportación a PDF.

---

## ⚡ Inicio Rápido (Runbook Local)

### 1. Requisitos previos
- **Node.js**: v20 o superior
- **npm**: v10 o superior

### 2. Instalación y configuración
```bash
# Ingresar al directorio del servidor
cd server

# Copiar variables de entorno
cp .env.example .env

# Instalar dependencias
npm install
```

### 3. Variables de Entorno (`server/.env`)
```ini
PORT=3001
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
AUTH_OPTIONAL=true
```

> **Nota para la Demo:** Con `AUTH_OPTIONAL=true`, el backend funciona inmediatamente sin necesidad de login previo o si no hay conexión a Supabase, utilizando un almacén de respaldo en memoria y fallback heurístico de NLP.

### 4. Ejecución en desarrollo
```bash
npm run dev
```
La API queda escuchando en `http://localhost:3001` con recarga automática.

### 5. Healthcheck Pre-Demo
Para verificar todos los endpoints y el estado del backend antes de la presentación:
```bash
npm run healthcheck
```
Genera un reporte en tabla indicando el estado (`✅ OK`), tiempos de respuesta y modo de operación.

---

## 📡 Catálogo de Endpoints (CONTRATO-API)

| Método | Endpoint | Descripción | Formato / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Smoke test del servidor | JSON |
| `POST` | `/api/parse` | Extracción inteligente de Ficha Técnica + Alertas | JSON (`{ texto }`) |
| `POST` | `/api/validate` | Validación determinística de ficha y cálculo de severidades | JSON (`{ ficha }`) |
| `GET` | `/api/corredores` | Catálogo de corredores NOA (Pacífico/Atlántico) y depósitos fiscales | JSON |
| `POST` | `/api/rfq` | Generación del documento RFQ con advertencias | JSON (`{ ficha, corredorId }`) |
| `POST` | `/api/rfq/pdf` | Descarga de documento formal en PDF binario | `application/pdf` |
| `POST` | `/api/consultas` | Persistencia de consulta y ficha en base de datos | Requiere Auth (o modo demo) |
| `GET` | `/api/consultas` | Historial de consultas del usuario | Requiere Auth (o modo demo) |
| `GET` | `/api/auth/health` | Verificación de estado de sesión / JWT | Bearer Token opcional |

---

## 🗄️ Base de Datos (Supabase)
La migración con tablas e índices se encuentra en:
`server/src/db/migrations/001_init.sql`
