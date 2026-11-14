const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../docs/assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Diagrama de Arquitectura Distribuida
const architectureCode = `flowchart TD
    subgraph Cliente ["Capa de Presentacion (Frontend)"]
        Browser["Navegador Web (Usuario Final)"]
        Vercel["Vercel Cloud Hosting\\nReact 18 + Vite SPA\\nTailwind CSS"]
        Browser <-->|HTTPS| Vercel
    end

    subgraph GatewayLayer ["Punto Unico de Entrada (API Gateway)"]
        Gateway["Express API Gateway (Puerto 10000 / Render)\\n- Proxy Reverso Express\\n- Middleware JWT Centralizado\\n- Inyeccion Contexto (x-user-id, x-user-rol)"]
    end

    subgraph Microservicios ["Capa de Microservicios Distribuidos (Node.js / Express)"]
        MS_User["ms-usuarios (:3001)\\nAuth, Perfil, RBAC"]
        MS_Serv["ms-servicios (:3002)\\nCatalogo & Categorias"]
        MS_Soli["ms-solicitudes (:3003)\\nCiclo Vida Tramites"]
        MS_Pqrs["ms-pqrs (:3004)\\nTickets & Radicados"]
        MS_Recu["ms-recursos (:3005)\\nAulas, Labs & Equipos"]
        MS_Rese["ms-reservas (:3006)\\nAgenda Anti-solapamiento"]
        MS_Noti["ms-notificaciones (:3007)\\nAlertas & Mensajeria"]
        MS_Even["ms-eventos (:3008)\\nAgenda & Inscripciones"]
    end

    subgraph Datos ["Capa de Persistencia Relacional"]
        DB[("PostgreSQL 15 Gestionado (Render)\\ndb_smartcampus (16 Tablas Normalizadas)")]
    end

    Vercel <-->|HTTP REST / JSON Bearer JWT| Gateway
    Gateway <-->|127.0.0.1:3001| MS_User
    Gateway <-->|127.0.0.1:3002| MS_Serv
    Gateway <-->|127.0.0.1:3003| MS_Soli
    Gateway <-->|127.0.0.1:3004| MS_Pqrs
    Gateway <-->|127.0.0.1:3005| MS_Recu
    Gateway <-->|127.0.0.1:3006| MS_Rese
    Gateway <-->|127.0.0.1:3007| MS_Noti
    Gateway <-->|127.0.0.1:3008| MS_Even

    MS_Soli -.->|Notificar cambio| MS_Noti
    MS_Rese -.->|Notificar aprobacion| MS_Noti

    MS_User <-->|pg pool SSL| DB
    MS_Serv <-->|pg pool SSL| DB
    MS_Soli <-->|pg pool SSL| DB
    MS_Pqrs <-->|pg pool SSL| DB
    MS_Recu <-->|pg pool SSL| DB
    MS_Rese <-->|pg pool SSL| DB
    MS_Noti <-->|pg pool SSL| DB
    MS_Even <-->|pg pool SSL| DB
`;

// 2. Diagrama de Máquina de Estados (Ciclo de Vida de Solicitudes)
const stateMachineCode = `stateDiagram-v2
    [*] --> REGISTRADA: Radicacion por el Estudiante/Docente
    REGISTRADA --> EN_REVISION: Asignacion a Dependencia
    EN_REVISION --> ASIGNADA: Designacion de Funcionario Responsable
    ASIGNADA --> EN_PROCESO: Verificacion Tecnica y Documental
    EN_PROCESO --> RESUELTA: Emision de Respuesta / Certificado Digital
    RESUELTA --> CERRADA: Notificacion y Conformidad del Usuario
    CERRADA --> [*]
`;

// 3. Diagrama Entidad-Relación (ERD)
const erdCode = `erDiagram
    ROLES ||--o{ USUARIOS : "asigna rol"
    PERMISOS ||--o{ ROLES_PERMISOS : "contiene"
    ROLES ||--o{ ROLES_PERMISOS : "agrupa"
    CATEGORIAS_SERVICIOS ||--o{ SERVICIOS : "clasifica"
    USUARIOS ||--o{ SOLICITUDES : "radica"
    SOLICITUDES ||--o{ HISTORIAL_ESTADOS_SOLICITUD : "traza"
    USUARIOS ||--o{ PQRS : "formula"
    PQRS ||--o{ RESPUESTAS_PQRS : "recibe"
    RECURSOS ||--o{ MANTENIMIENTOS_RECURSO : "registra"
    USUARIOS ||--o{ RESERVAS : "solicita"
    RECURSOS ||--o{ RESERVAS : "es reservado"
    USUARIOS ||--o{ NOTIFICACIONES : "recibe"
    USUARIOS ||--o{ EVENTOS : "organiza"
    EVENTOS ||--o{ INSCRIPCIONES_EVENTO : "inscribe"
    USUARIOS ||--o{ INSCRIPCIONES_EVENTO : "asiste"

    ROLES {
        int id PK
        string nombre
        string descripcion
    }
    USUARIOS {
        int id PK
        string nombre
        string email UK
        string password_hash
        int rol_id FK
        string codigo_estudiantil
    }
    SOLICITUDES {
        int id PK
        int usuario_id FK
        string tipo
        string asunto
        string estado
        timestamp fecha_registro
    }
    RESERVAS {
        int id PK
        int recurso_id FK
        int usuario_id FK
        date fecha_reserva
        time hora_inicio
        time hora_fin
        string estado_reserva
    }
    RECURSOS {
        int id PK
        string codigo UK
        string nombre
        string tipo
        string estado
        boolean disponibilidad
    }
`;

async function fetchDiagram(code, filename) {
  const jsonStr = JSON.stringify({
    code,
    mermaid: {
      theme: 'neutral',
      fontFamily: 'Times New Roman'
    }
  });
  const b64 = Buffer.from(jsonStr).toString('base64');
  const url = 'https://mermaid.ink/img/' + b64;
  console.log(`Descargando diagrama ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fallo descargando ${filename}: ${res.status} ${res.statusText}`);
  }
  const ab = await res.arrayBuffer();
  const dest = path.join(outputDir, filename);
  fs.writeFileSync(dest, Buffer.from(ab));
  console.log(`✅ Guardado: ${dest} (${ab.byteLength} bytes)`);
}

async function run() {
  await fetchDiagram(architectureCode, 'diagrama_arquitectura.png');
  await fetchDiagram(stateMachineCode, 'diagrama_ciclo_vida.png');
  await fetchDiagram(erdCode, 'diagrama_entidad_relacion.png');
  console.log('Todos los diagramas fueron generados con éxito.');
}

run().catch(err => {
  console.error('Error generando diagramas:', err);
  process.exit(1);
});
