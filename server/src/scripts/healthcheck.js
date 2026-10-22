/**
 * Script de Health-check Pre-Demo para Hackathon IINOA
 * Ejecuta: npm run healthcheck
 */

import app from '../app.js';

const PORT = 3099;

async function runHealthCheck() {
  console.log('\n======================================================');
  console.log('   🔍 HEALTH-CHECK PRE-DEMO — ASISTENTE LOGÍSTICA NOA');
  console.log('======================================================\n');

  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;
  const results = [];

  async function checkEndpoint(name, path, method = 'GET', body = null) {
    const start = Date.now();
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(`${baseUrl}${path}`, options);
      const latency = Date.now() - start;
      const ok = res.status >= 200 && res.status < 300;

      let extra = '';
      if (path === '/parse' && ok) {
        const data = await res.json();
        extra = `[Modo: ${data.modo}]`;
      } else if (path === '/corredores' && ok) {
        const data = await res.json();
        extra = `[${data.corredores?.length} corredores, ${data.depositosFiscales?.length} depósitos]`;
      } else if (path === '/consultas' && method === 'GET' && ok) {
        const data = await res.json();
        extra = `[${data.consultas?.length} consultas en historial]`;
      } else if (path === '/rfq/pdf' && ok) {
        const buf = await res.arrayBuffer();
        extra = `[${buf.byteLength} bytes binarios]`;
      }

      results.push({ name, path, method, status: res.status, latency, ok, extra });
    } catch (err) {
      results.push({ name, path, method, status: 'ERR', latency: Date.now() - start, ok: false, extra: err.message });
    }
  }

  try {
    // 1. Health base
    await checkEndpoint('Health Base', '/health');

    // 2. Auth Health
    await checkEndpoint('Auth Health (Demo)', '/auth/health');

    // 3. Corredores NOA
    await checkEndpoint('Corredores & COCEL', '/corredores');

    // 4. Validate
    await checkEndpoint('Motor Validación', '/validate', 'POST', {
      ficha: {
        contacto: {},
        operacion: 'exportacion',
        origen: { ciudad: 'Salta' },
        destino: { pais: 'China' },
        carga: { tipo: 'sal', pesoKg: 20000, contenedor: '40ST', cantidad: 2 },
        operativa: {}
      }
    });

    // 5. Parse
    await checkEndpoint('NLP Parsing', '/parse', 'POST', {
      texto: 'necesito mandar 2 containers de 40 de sal a china desde salta'
    });

    // 6. RFQ Generator
    await checkEndpoint('Generador RFQ', '/rfq', 'POST', {
      ficha: {
        contacto: {},
        operacion: 'exportacion',
        origen: { ciudad: 'Salta' },
        destino: { pais: 'China' },
        carga: { tipo: 'sal', pesoKg: 20000, contenedor: '40ST', cantidad: 2 },
        operativa: { depositoFiscalVacios: 'COCEL Salta' }
      },
      corredorId: 'pacifico'
    });

    // 7. RFQ PDF
    await checkEndpoint('Exportador PDF', '/rfq/pdf', 'POST', {
      asunto: 'RFQ Demo',
      texto: 'Estimados navieros...'
    });

    // 8. Consultas (Historial)
    await checkEndpoint('Historial Consultas', '/consultas', 'GET');

    // Tabla de resultados
    console.table(
      results.map(r => ({
        Estado: r.ok ? '✅ OK' : '❌ FALLO',
        Servicio: r.name,
        Método: r.method,
        Ruta: `/api${r.path}`,
        HTTP: r.status,
        'Tiempo (ms)': `${r.latency}ms`,
        Detalles: r.extra
      }))
    );

    const allOk = results.every(r => r.ok);

    console.log('\n------------------------------------------------------');
    if (allOk) {
      console.log('🟢 ¡BACKEND LISTO PARA PRESENTAR! Todos los servicios en verde.');
    } else {
      console.log('🔴 ADVERTENCIA: Hay endpoints con errores.');
    }
    console.log('------------------------------------------------------\n');

    server.close();
    process.exit(allOk ? 0 : 1);
  } catch (err) {
    console.error('Error general en healthcheck:', err);
    server.close();
    process.exit(1);
  }
}

runHealthCheck();
