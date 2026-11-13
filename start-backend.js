/**
 * UAJS Smart Campus — Orquestador de Producción para Despliegue en la Nube (Render / Railway)
 * 
 * Arranca internamente los 8 microservicios en sus puertos asignados (3001 a 3008)
 * y levanta el API Gateway en el puerto público asignado por la plataforma (PORT).
 */

const { spawn } = require('child_process');
const path = require('path');

const sharedDatabaseUrl = process.env.DATABASE_URL || '';
const jwtSecret = process.env.JWT_SECRET || 'uajs_smart_campus_jwt_secret_key_2026';
const gatewayPort = process.env.PORT || 8080;

const services = [
  { name: 'ms-usuarios',       dir: 'microservicios/ms-usuarios',       port: 3001, db: 'db_usuarios' },
  { name: 'ms-servicios',      dir: 'microservicios/ms-servicios',      port: 3002, db: 'db_servicios' },
  { name: 'ms-solicitudes',    dir: 'microservicios/ms-solicitudes',    port: 3003, db: 'db_solicitudes' },
  { name: 'ms-pqrs',           dir: 'microservicios/ms-pqrs',           port: 3004, db: 'db_pqrs' },
  { name: 'ms-recursos',       dir: 'microservicios/ms-recursos',       port: 3005, db: 'db_recursos' },
  { name: 'ms-reservas',       dir: 'microservicios/ms-reservas',       port: 3006, db: 'db_reservas' },
  { name: 'ms-notificaciones', dir: 'microservicios/ms-notificaciones', port: 3007, db: 'db_notificaciones' },
  { name: 'ms-eventos',        dir: 'microservicios/ms-eventos',        port: 3008, db: 'db_eventos' },
];

const processes = [];

console.log('========================================================================');
console.log('🚀 INICIANDO UAJS SMART CAMPUS (MODO CLOUD / PRODUCCIÓN)');
console.log(`📡 Puerto Público Gateway: ${gatewayPort}`);
console.log(`🗄️  Base de Datos: ${sharedDatabaseUrl ? 'Cloud PostgreSQL (DATABASE_URL detectada)' : 'PostgreSQL Local (DB_HOST)'}`);
console.log('========================================================================');

// 1. Iniciar los 8 Microservicios en paralelo
services.forEach((service) => {
  const serviceDir = path.join(__dirname, service.dir);
  const serviceEnv = {
    ...process.env,
    PORT: String(service.port),
    JWT_SECRET: jwtSecret,
    DB_NAME: service.db,
    MS_NOTIFICACIONES_URL: 'http://127.0.0.1:3007',
  };

  if (sharedDatabaseUrl) {
    serviceEnv.DATABASE_URL = sharedDatabaseUrl;
  }

  const child = spawn('node', ['src/index.js'], {
    cwd: serviceDir,
    env: serviceEnv,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error(`❌ [${service.name}] Error iniciando proceso:`, err.message);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`⚠️ [${service.name}] Finalizó con código ${code}`);
    }
  });

  processes.push({ name: service.name, process: child });
});

// 2. Dar 1.5 segundos para que los microservicios inicialicen sus listeners y arrancar el API Gateway
setTimeout(() => {
  const gatewayDir = path.join(__dirname, 'api-gateway');
  const gatewayEnv = {
    ...process.env,
    PORT: String(gatewayPort),
    JWT_SECRET: jwtSecret,
    MS_USUARIOS_URL:       'http://127.0.0.1:3001',
    MS_SERVICIOS_URL:      'http://127.0.0.1:3002',
    MS_SOLICITUDES_URL:    'http://127.0.0.1:3003',
    MS_PQRS_URL:           'http://127.0.0.1:3004',
    MS_RECURSOS_URL:       'http://127.0.0.1:3005',
    MS_RESERVAS_URL:       'http://127.0.0.1:3006',
    MS_NOTIFICACIONES_URL: 'http://127.0.0.1:3007',
    MS_EVENTOS_URL:        'http://127.0.0.1:3008',
  };

  const gatewayChild = spawn('node', ['src/index.js'], {
    cwd: gatewayDir,
    env: gatewayEnv,
    stdio: 'inherit',
  });

  gatewayChild.on('error', (err) => {
    console.error('❌ [api-gateway] Error iniciando Gateway:', err.message);
  });

  processes.push({ name: 'api-gateway', process: gatewayChild });
}, 1500);

// Manejo de apagado limpio
const shutdown = () => {
  console.log('\n🛑 Deteniendo microservicios y Gateway...');
  processes.forEach((p) => {
    try {
      p.process.kill('SIGTERM');
    } catch (_) {}
  });
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
