const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  PageNumber,
  HeadingLevel,
  ImageRun
} = require('docx');

// Configuración general de estilo APA 7
const FONT_FAMILY = 'Times New Roman';
const COLOR_BLACK = '000000';
const SIZE_TITLE = 28;     // 14 pt
const SIZE_H1 = 26;        // 13 pt
const SIZE_H2 = 24;        // 12 pt
const SIZE_BODY = 24;      // 12 pt
const SIZE_SMALL = 20;     // 10 pt
const LINE_SPACING = 300;  // 1.25 - 1.5 interlineado

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 180, line: LINE_SPACING },
    children: [
      new TextRun({
        text,
        bold: true,
        font: FONT_FAMILY,
        size: SIZE_H1,
        color: COLOR_BLACK
      })
    ]
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: { before: 280, after: 120, line: LINE_SPACING },
    children: [
      new TextRun({
        text,
        bold: true,
        font: FONT_FAMILY,
        size: SIZE_H2,
        color: COLOR_BLACK
      })
    ]
  });
}

function createParagraph(text, options = {}) {
  const { bold = false, italics = false, indent = true, align = AlignmentType.JUSTIFIED } = options;
  return new Paragraph({
    alignment: align,
    indent: indent ? { firstLine: 720 } : undefined, // 0.5 in indent APA
    spacing: { before: 80, after: 80, line: LINE_SPACING },
    children: [
      new TextRun({
        text,
        bold,
        italics,
        font: FONT_FAMILY,
        size: SIZE_BODY,
        color: COLOR_BLACK
      })
    ]
  });
}

function createBullet(text, boldPrefix = '') {
  const runs = [];
  if (boldPrefix) {
    runs.push(new TextRun({
      text: boldPrefix + ' ',
      bold: true,
      font: FONT_FAMILY,
      size: SIZE_BODY,
      color: COLOR_BLACK
    }));
  }
  runs.push(new TextRun({
    text,
    font: FONT_FAMILY,
    size: SIZE_BODY,
    color: COLOR_BLACK
  }));

  return new Paragraph({
    bullet: { level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 60, after: 60, line: LINE_SPACING },
    children: runs
  });
}

function createEmbeddedFigure(figureNumber, caption, imagePath, width, height, note) {
  const elements = [
    new Paragraph({
      spacing: { before: 280, after: 60, line: LINE_SPACING },
      children: [
        new TextRun({
          text: `Figura ${figureNumber}. `,
          bold: true,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          color: COLOR_BLACK
        }),
        new TextRun({
          text: caption,
          italics: true,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          color: COLOR_BLACK
        })
      ]
    })
  ];

  if (fs.existsSync(imagePath)) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [
          new ImageRun({
            data: fs.readFileSync(imagePath),
            transformation: { width, height }
          })
        ]
      })
    );
  }

  elements.push(
    new Paragraph({
      spacing: { before: 60, after: 200, line: LINE_SPACING },
      children: [
        new TextRun({
          text: `Nota. ${note}`,
          font: FONT_FAMILY,
          size: SIZE_SMALL,
          italics: true,
          color: COLOR_BLACK
        })
      ]
    })
  );

  return elements;
}

function createFigureBox(figureNumber, caption, instructions) {
  return [
    new Paragraph({
      spacing: { before: 240, after: 60, line: LINE_SPACING },
      children: [
        new TextRun({
          text: `Figura ${figureNumber}. `,
          bold: true,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          color: COLOR_BLACK
        }),
        new TextRun({
          text: caption,
          italics: true,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          color: COLOR_BLACK
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.DASHED, size: 4, color: '666666' },
                bottom: { style: BorderStyle.DASHED, size: 4, color: '666666' },
                left: { style: BorderStyle.DASHED, size: 4, color: '666666' },
                right: { style: BorderStyle.DASHED, size: 4, color: '666666' }
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 300, after: 300 },
                  children: [
                    new TextRun({
                      text: `[ ESPACIO PARA CAPTURA DE PANTALLA: ${caption.toUpperCase()} ]`,
                      font: FONT_FAMILY,
                      size: SIZE_SMALL,
                      bold: true,
                      color: '333333'
                    }),
                    new TextRun({
                      text: `\n${instructions}`,
                      font: FONT_FAMILY,
                      size: SIZE_SMALL,
                      italics: true,
                      color: '555555'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 60, after: 200, line: LINE_SPACING },
      children: [
        new TextRun({
          text: `Nota. Evidencia capturada en entorno real de producción (https://uajs-smart-campus.vercel.app). Fuente: Elaboración propia.`,
          font: FONT_FAMILY,
          size: SIZE_SMALL,
          italics: true,
          color: COLOR_BLACK
        })
      ]
    })
  ];
}

function createTableAPA(tableTitle, tableNumber, headers, dataRows, widths = []) {
  const elements = [
    new Paragraph({
      spacing: { before: 240, after: 40, line: LINE_SPACING },
      children: [
        new TextRun({
          text: `Tabla ${tableNumber}`,
          bold: true,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          color: COLOR_BLACK
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 0, after: 120, line: LINE_SPACING },
      children: [
        new TextRun({
          text: tableTitle,
          italics: true,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          color: COLOR_BLACK
        })
      ]
    })
  ];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: widths[i] ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 12, color: COLOR_BLACK },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BLACK },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: h,
              bold: true,
              font: FONT_FAMILY,
              size: SIZE_SMALL,
              color: COLOR_BLACK
            })
          ]
        })
      ]
    }))
  });

  const contentRows = dataRows.map((row, rIndex) => {
    const isLast = rIndex === dataRows.length - 1;
    return new TableRow({
      children: row.map((cellText, i) => new TableCell({
        width: widths[i] ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: isLast
            ? { style: BorderStyle.SINGLE, size: 12, color: COLOR_BLACK }
            : { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: String(cellText),
                font: FONT_FAMILY,
                size: SIZE_SMALL,
                color: COLOR_BLACK
              })
            ]
          })
        ]
      }))
    });
  });

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...contentRows]
    })
  );

  elements.push(
    new Paragraph({
      spacing: { before: 60, after: 200, line: LINE_SPACING },
      children: [
        new TextRun({
          text: `Nota. Datos y especificaciones del sistema distribuido UAJS Smart Campus.`,
          font: FONT_FAMILY,
          size: SIZE_SMALL,
          italics: true,
          color: COLOR_BLACK
        })
      ]
    })
  );

  return elements;
}

async function buildDocument() {
  console.log('Construyendo documento Word formal bajo normas APA 7 con diagramas integrados...');

  const assetsDir = path.join(__dirname, '../docs/assets');
  const pathArch = path.join(assetsDir, 'diagrama_arquitectura.png');
  const pathState = path.join(assetsDir, 'diagrama_ciclo_vida.png');
  const pathErd = path.join(assetsDir, 'diagrama_entidad_relacion.png');

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            color: COLOR_BLACK,
            size: SIZE_BODY
          },
          paragraph: {
            spacing: { line: LINE_SPACING }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                    color: COLOR_BLACK
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Portada APA
          new Paragraph({ spacing: { before: 1800, after: 200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 200, line: 360 },
            children: [
              new TextRun({
                text: "UAJS SMART CAMPUS: PLATAFORMA WEB DISTRIBUIDA PARA LA INTEGRACIÓN Y GESTIÓN DE SERVICIOS UNIVERSITARIOS",
                bold: true,
                font: FONT_FAMILY,
                size: SIZE_TITLE,
                color: COLOR_BLACK
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 800, line: 360 },
            children: [
              new TextRun({
                text: "Documento Técnico Consolidado de Arquitectura, Implementación y Despliegue en la Nube",
                italics: true,
                font: FONT_FAMILY,
                size: SIZE_H2,
                color: COLOR_BLACK
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80, line: 300 },
            children: [
              new TextRun({ text: "Wadith Rivas", font: FONT_FAMILY, size: SIZE_BODY, color: COLOR_BLACK })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 80, line: 300 },
            children: [
              new TextRun({ text: "Edimer Paternina", font: FONT_FAMILY, size: SIZE_BODY, color: COLOR_BLACK })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 80, line: 300 },
            children: [
              new TextRun({ text: "Job David Pérez Guzmán", font: FONT_FAMILY, size: SIZE_BODY, color: COLOR_BLACK })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 800, line: 300 },
            children: [
              new TextRun({ text: "Flor Florez", font: FONT_FAMILY, size: SIZE_BODY, color: COLOR_BLACK })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60, line: 300 },
            children: [
              new TextRun({
                text: "Facultad de Ingenierías, Programa de Ingeniería de Sistemas",
                font: FONT_FAMILY,
                size: SIZE_BODY,
                color: COLOR_BLACK
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60, line: 300 },
            children: [
              new TextRun({
                text: "Corporación Universitaria Antonio José de Sucre (UNIAJS)",
                font: FONT_FAMILY,
                size: SIZE_BODY,
                color: COLOR_BLACK
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60, line: 300 },
            children: [
              new TextRun({
                text: "Asignatura: Sistemas Distribuidos",
                font: FONT_FAMILY,
                size: SIZE_BODY,
                color: COLOR_BLACK
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60, line: 300 },
            children: [
              new TextRun({
                text: "Docente: Mag. Laura Patricia Paternina Álvarez",
                font: FONT_FAMILY,
                size: SIZE_BODY,
                color: COLOR_BLACK
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 400, line: 300 },
            children: [
              new TextRun({
                text: "Sincelejo, Sucre — Noviembre de 2026",
                font: FONT_FAMILY,
                size: SIZE_BODY,
                color: COLOR_BLACK
              })
            ]
          }),

          new Paragraph({ pageBreakBefore: true }),

          // 1. Resumen Ejecutivo
          createHeading1("1. Resumen Ejecutivo y Contexto Institucional"),
          createParagraph("La Corporación Universitaria Antonio José de Sucre (UNIAJS) cuenta con diferentes servicios digitales orientados a facilitar los procesos académicos y administrativos de estudiantes, docentes y demás miembros de la comunidad universitaria. A partir de este contexto, se propone y consolida el desarrollo de UAJS Smart Campus, una plataforma web concebida como un sistema distribuido de servicios universitarios, cuyo propósito es integrar y facilitar el acceso a diferentes funcionalidades institucionales desde una interfaz web moderna, intuitiva y unificada."),
          createParagraph("El proyecto experimentó una evolución técnica natural guiada por las competencias de la asignatura de Sistemas Distribuidos. En su etapa inicial, la solución se estructuró bajo el patrón arquitectónico Modelo-Vista-Controlador (MVC). Posteriormente, la solución evolucionó hacia una arquitectura basada en microservicios independientes, desacoplados y coordinados a través de un API Gateway centralizado, implementando interfaces de comunicación REST mediante el protocolo HTTP/HTTPS y formato de intercambio de datos JSON."),
          createParagraph("Es fundamental destacar que la propuesta no pretende sustituir los sistemas institucionales existentes (ERP financiero, sistemas centrales de admisiones o registros históricos oficiales). Su propósito estrictamente académico y técnico consiste en desarrollar un prototipo funcional avanzado de integración y gestión de servicios universitarios, plenamente preparado para conectarse posteriormente con sistemas institucionales mediante APIs abiertas o mecanismos de interoperabilidad autorizados."),

          ...createTableAPA(
            "Enlaces oficiales de acceso y despliegue del sistema en producción",
            1,
            ["Componente", "Plataforma de Despliegue", "URL / Identificador Oficial", "Estado Operativo"],
            [
              ["Frontend Web (SPA React)", "Vercel Cloud Platform", "https://uajs-smart-campus.vercel.app", "Activo / Producción"],
              ["Backend (Gateway + Microservicios)", "Render Web Service", "https://uajs-smart-campus-backend.onrender.com", "Activo / Producción"],
              ["Base de Datos Relacional", "Render PostgreSQL 15 Managed", "uajs-smart-campus-db (db_smartcampus)", "Activo / Conectado"],
              ["Repositorio de Código Fuente", "GitHub", "https://github.com/WRivxs/UAJS-Smart-Campus", "Público / Sincronizado"]
            ],
            [25, 25, 35, 15]
          ),

          // 2. Situación Problemática
          createHeading1("2. Situación Problemática, Problema y Justificación"),
          createHeading2("2.1 Situación Problemática"),
          createParagraph("En una institución de educación superior convergen diariamente diferentes procesos y actores con requerimientos sumamente disímiles: estudiantes de diversos semestres, docentes de cátedra y tiempo completo, coordinadores de programa, personal administrativo de registro y control, directivos y dependencias de soporte. Cada uno de estos actores requiere consultar información o realizar trámites con alta periodicidad."),
          createParagraph("En el entorno universitario tradicional, la existencia de múltiples sistemas digitales aislados o canales manuales genera dispersión, demoras en la atención y dificultades para que los usuarios identifiquen el canal apropiado para radicar sus requerimientos. Por ejemplo, un estudiante puede necesitar consultar información académica, solicitar un recurso físico, realizar la reserva de un laboratorio, registrar una petición o queja, consultar una notificación oficial o monitorear el estado evolutivo de un trámite. Desde una perspectiva tecnológica, esta problemática representa una valiosa oportunidad formativa para diseñar y evaluar cómo diferentes servicios pueden comunicarse entre sí mediante APIs, servicios web y arquitecturas distribuidas."),

          createHeading2("2.2 Formulación del Problema"),
          createParagraph("Con base en lo anterior, el proyecto resuelve la siguiente pregunta central de ingeniería: ¿Cómo diseñar e implementar una plataforma web que permita articular diferentes servicios universitarios mediante una arquitectura modular y distribuida, facilitando la gestión de solicitudes, recursos, comunicaciones y consultas de la comunidad académica de la Corporación Universitaria Antonio José de Sucre?"),

          createHeading2("2.3 Justificación Académica y Técnica"),
          createParagraph("El desarrollo de UAJS Smart Campus responde a una problemática sentida del contexto universitario regional en el departamento de Sucre. Desde la perspectiva formativa en la asignatura de Sistemas Distribuidos, la solución permite a los estudiantes aplicar de manera directa los principios fundamentales de la disciplina: transparencia de acceso y ubicación, concurrencia, independencia de procesos, tolerancia a fallos, comunicación síncrona mediante APIs REST, persistencia relacional con control transaccional estricto y despliegue modular en plataformas en la nube."),

          // 3. Objetivos
          createHeading1("3. Objetivos del Proyecto"),
          createHeading2("3.1 Objetivo General"),
          createParagraph("Desarrollar un prototipo de plataforma web distribuida para la articulación y gestión de servicios universitarios de la Corporación Universitaria Antonio José de Sucre, utilizando una arquitectura desacoplada, tecnologías web modernas (HTML5, CSS3, JavaScript ES6+, React, Node.js y Express), APIs REST y servicios independientes que permitan demostrar principios de comunicación, escalabilidad y distribución de componentes."),

          createHeading2("3.2 Objetivos Específicos"),
          createBullet("Analizar las necesidades de interacción de los diferentes actores de la comunidad universitaria.", "1."),
          createBullet("Identificar los principales servicios que podrían ser articulados dentro de una plataforma universitaria integrada.", "2."),
          createBullet("Diseñar la arquitectura general de UAJS Smart Campus aplicando principios de sistemas distribuidos.", "3."),
          createBullet("Desarrollar el frontend interactivo utilizando HTML5, CSS3, JavaScript ES6+ y React.", "4."),
          createBullet("Implementar el patrón arquitectónico estructurado y modular en los componentes de cliente y servidor.", "5."),
          createBullet("Desarrollar el backend distribuido mediante Node.js y Express.", "6."),
          createBullet("Implementar APIs REST robustas para la comunicación síncrona entre los diferentes componentes.", "7."),
          createBullet("Diseñar y normalizar una base de datos relacional para gestionar usuarios, solicitudes, reservas, recursos, notificaciones, pqrs y eventos.", "8."),
          createBullet("Implementar mecanismos rigurosos de autenticación y autorización basados en JSON Web Tokens (JWT) y Control de Acceso Basado en Roles (RBAC).", "9."),
          createBullet("Diseñar una arquitectura que permita separar las distintas funcionalidades en microservicios independientes.", "10."),
          createBullet("Analizar y aplicar mecanismos para garantizar disponibilidad, escalabilidad y tolerancia a fallos tanto en local como en la nube.", "11."),
          createBullet("Proponer mecanismos de integración futura con sistemas institucionales existentes mediante APIs estandarizadas.", "12."),

          // 4. Arquitectura
          createHeading1("4. Arquitectura del Sistema Distribuido"),
          createHeading2("4.1 Topología del Sistema y Componentes Distribuidos"),
          createParagraph("La solución implementa una arquitectura desacoplada organizada en cuatro capas: Capa de Presentación en Vercel, Capa de Entrada y Seguridad (API Gateway en Render en el puerto 10000), Capa de Dominio Distribuido (8 Microservicios en puertos 3001 a 3008) y Capa de Persistencia Relacional gestionada en PostgreSQL 15. En la Figura 1 se ilustra la topología completa con las relaciones de comunicación entre cada componente."),

          ...createEmbeddedFigure(
            1,
            "Arquitectura física y lógica del sistema distribuido UAJS Smart Campus.",
            pathArch,
            470,
            640,
            "Esquema de comunicación entre cliente web, API Gateway perimetral, microservicios autónomos y base de datos relacional. Fuente: Elaboración propia."
          ),

          createHeading2("4.2 Principios Distribuidos Evidenciados"),
          createBullet("Transparencia de Ubicación: El cliente desconoce la dirección IP física y el puerto en el que reside cada microservicio; todas las solicitudes se formulan al Gateway.", "1."),
          createBullet("Tolerancia Parcial a Fallos: Si el microservicio de Eventos o el de PQRS experimenta una caída temporal, los módulos críticos de Autenticación, Catálogo de Servicios y Solicitudes continúan operando con total normalidad.", "2."),
          createBullet("Desacoplamiento Operacional: Cada microservicio puede modificarse, actualizarse o reiniciarse sin requerir la recompilación del resto de la plataforma.", "3."),
          createBullet("Comunicación Asíncrona Interna: Eventos como el cambio de estado de una solicitud o la confirmación de una reserva disparan notificaciones internas hacia ms-notificaciones de forma no bloqueante.", "4."),

          // 5. Frontend
          createHeading1("5. Especificación del Frontend en React"),
          createHeading2("5.1 Cumplimiento de la Rúbrica Técnica"),
          createParagraph("El frontend fue construido íntegramente con React 18 utilizando el compilador Vite. Cumple a cabalidad con todos los criterios de evaluación exigidos en la guía integradora:"),
          createBullet("Más de 20 componentes funcionales modulares utilizando JSX.", "a)"),
          createBullet("Uso extensivo de los hooks fundamentales useState, useEffect y useContext.", "b)"),
          createBullet("Desarrollo de un conjunto de Custom Hooks propios para desacoplar la lógica de consumo de APIs de la interfaz gráfica.", "c)"),
          createBullet("Implementación de navegación declarativa basada en React Router V6 con soporte de Single Page Application (SPA).", "d)"),
          createBullet("Aplicación de hojas de estilo modernas con Tailwind CSS estructurado bajo la metodología BEM (Block, Element, Modifier).", "e)"),

          ...createTableAPA(
            "Catálogo de componentes funcionales desarrollados en el Frontend",
            2,
            ["Componente", "Tipo / Ruta", "Responsabilidad Principal en la Aplicación"],
            [
              ["LandingAuth.jsx", "Vista Pública", "Landing institucional con temporizador de redirección a 5s y autenticación rápida."],
              ["Navbar.jsx", "Componente Global", "Cabecera con avatar institucional, menú de perfil, notificaciones y cierre de sesión."],
              ["Sidebar.jsx", "Componente Global", "Navegación lateral adaptativa y colapsable con accesos según el rol institucional."],
              ["DashboardEstudiante.jsx", "Vista Protegida", "Panel principal del estudiante con métricas de trámites, reservas y alertas."],
              ["DashboardDocente.jsx", "Vista Protegida", "Panel del docente con gestión de reservas de laboratorios e insumos de investigación."],
              ["DashboardAdmin.jsx", "Vista Protegida", "Tablero de mando directivo con indicadores globales y supervisión de dependencias."],
              ["CatalogoServicios.jsx", "Módulo", "Catálogo unificado de trámites clasificados por categorías con buscador predictivo."],
              ["ModuloSolicitudes.jsx", "Módulo", "Bandeja de radicación, filtrado y seguimiento del ciclo de vida de solicitudes."],
              ["CrearSolicitudModal.jsx", "Componente Modal", "Formulario modal para radicar nuevos trámites con validación en tiempo real."],
              ["DetalleSolicitudModal.jsx", "Componente Modal", "Línea de tiempo cronológica del historial de estados y cambio de responsable."],
              ["ModuloReservas.jsx", "Módulo", "Grilla y calendario de reservas con verificación visual de horarios libres y ocupados."],
              ["CrearReservaModal.jsx", "Componente Modal", "Formulario de apartado con validación previa para evitar solapamientos."],
              ["ModuloRecursos.jsx", "Módulo", "Inventario físico de aulas, laboratorios y equipos tecnológicos con estado técnico."],
              ["AgendaEventos.jsx", "Módulo", "Calendario de actividades y congresos con aforo dinámico y pase digital institucional."],
              ["ModuloPqrs.jsx", "Módulo", "Radicación y seguimiento de peticiones, quejas y reclamos con número de radicado."],
              ["CrearPqrsModal.jsx", "Componente Modal", "Formulario de tickets con soporte de confidencialidad y radicación anónima."],
              ["CentroNotificaciones.jsx", "Módulo", "Bandeja de mensajes con lectura individual y botón de marcado masivo."],
              ["MiPerfil.jsx", "Módulo", "Expediente digital del usuario con datos personales, académicos y rol institucional."],
              ["StatCard.jsx", "Componente Atómico", "Tarjeta reutilizable para presentación de indicadores numéricos y métricas."],
              ["BadgeEstado.jsx", "Componente Atómico", "Etiqueta cromática institucional para estados (Registrada, En Revisión, etc.)."]
            ],
            [25, 20, 55]
          ),

          createHeading2("5.2 Custom Hooks Implementados"),
          createParagraph("Para garantizar una separación estricta entre la lógica de estado y la interfaz de usuario, se construyeron los siguientes Hooks personalizados:"),
          createBullet("useAuth: Centraliza la sesión del usuario, gestiona el almacenamiento seguro del token JWT en localStorage, decodifica los claims del usuario y provee la función de cierre de sesión.", "1. "),
          createBullet("useProfile: Encapsula la consulta del expediente institucional del usuario y la mutación de datos personales hacia ms-usuarios.", "2. "),
          createBullet("useSolicitudes: Maneja la consulta reactiva de solicitudes personales o institucionales, la radicación de nuevos trámites y la transición de estados.", "3. "),
          createBullet("useReservas: Administra la consulta de recursos disponibles, el filtrado por fecha y la radicación de reservas con validación de conflictos.", "4. "),
          createBullet("useRecursos: Provee la lista de aulas y equipos con su respectivo estado de disponibilidad operativa.", "5. "),
          createBullet("useEventos: Permite listar eventos programados, realizar inscripciones en línea y gestionar la cancelación o asistencia.", "6. "),
          createBullet("usePqrs: Administra la radicación de solicitudes formales de PQRS y la consulta de réplicas gubernamentales internas.", "7. "),
          createBullet("useNotificaciones: Implementa el sondeo periódico de alertas y el marcado de lectura síncrono.", "8. "),

          // 6. Backend y Microservicios
          createHeading1("6. Especificación del Backend y Microservicios"),
          createHeading2("6.1 Arquitectura del API Gateway y Catálogo de Endpoints"),
          createParagraph("El API Gateway se diseñó como el componente neurálgico del clúster backend. Utiliza el módulo express-http-proxy para redirigir dinámicamente las solicitudes hacia los microservicios de destino. Su pipeline centraliza la validación de JWT, inyecta las cabeceras x-user-id y x-user-rol y expone el estado de salud en /health."),

          ...createTableAPA(
            "Catálogo técnico de los 8 microservicios del sistema distribuido",
            3,
            ["Microservicio", "Puerto", "Responsabilidad Funcional", "Endpoints Principales"],
            [
              ["ms-usuarios", "3001", "Autenticación, emisión de JWT, perfiles RBAC.", "POST /api/auth/login, GET /api/users/me, PUT /api/users/me"],
              ["ms-servicios", "3002", "Catálogo unificado de trámites y dependencias.", "GET /api/servicios, GET /api/categorias, POST /api/servicios"],
              ["ms-solicitudes", "3003", "Trámites académicos y ciclo de vida de solicitudes.", "GET /api/solicitudes/mias, POST /api/solicitudes, PATCH /:id/estado"],
              ["ms-pqrs", "3004", "Peticiones, quejas y reclamos con tickets oficiales.", "GET /api/pqrs/mias, POST /api/pqrs, POST /:id/respuestas"],
              ["ms-recursos", "3005", "Inventario físico de aulas, laboratorios y equipos.", "GET /api/recursos, GET /:id, PUT /:id/estado"],
              ["ms-reservas", "3006", "Agenda y reservas con algoritmo anti-solapamiento.", "GET /api/reservas/mias, POST /api/reservas, PATCH /:id/estado"],
              ["ms-notificaciones", "3007", "Motor de comunicaciones y alertas en tiempo real.", "GET /api/notificaciones, POST /api/notificaciones, PATCH /:id/leida"],
              ["ms-eventos", "3008", "Agenda académica, aforo e inscripciones digitales.", "GET /api/eventos, POST /api/eventos, POST /:id/inscribirme"]
            ],
            [18, 10, 37, 35]
          ),

          createHeading2("6.2 Reglas de Negocio en Backend y Ciclo de Vida"),
          createParagraph("El sistema garantiza la integridad institucional mediante dos reglas de negocio centrales validadas en el servidor:"),
          createParagraph("1. Máquina de Estados de Solicitudes: Las solicitudes nunca saltan de manera arbitraria. Toda solicitud se crea obligatoriamente en estado REGISTRADA y progresa secuencialmente a través de los estados EN_REVISION, ASIGNADA, EN_PROCESO, RESUELTA y CERRADA, como se ilustra en la Figura 2. Cada transición almacena automáticamente un registro inmutable en la tabla historial_estados_solicitud que documenta el identificador del funcionario, la fecha exacta y la observación motivada."),

          ...createEmbeddedFigure(
            2,
            "Máquina de estados y ciclo de vida secuencial de las solicitudes universitarias.",
            pathState,
            500,
            50,
            "Secuencia obligatoria de estados transitados en ms-solicitudes. Fuente: Elaboración propia."
          ),

          createParagraph("2. Algoritmo de Prevención de Solapamiento Horario en Reservas: En el microservicio ms-reservas, antes de formalizar la inserción de una reserva se ejecuta una consulta de intersección temporal en el motor de base de datos. Si existe una reserva aprobada o pendiente en la misma fecha y cuyo intervalo horario intercepte el horario solicitado, la transacción se revoca inmediatamente arrojando un código HTTP 409 Conflict con un mensaje explicativo, imposibilitando la duplicidad de apartados sobre un mismo espacio."),

          // 7. Base de Datos
          createHeading1("7. Modelo de Datos y Persistencia en PostgreSQL"),
          createHeading2("7.1 Justificación Técnica del Gestor Relacional"),
          createParagraph("Aunque las pautas iniciales sugerían MySQL o tecnologías afines, el equipo justificó técnicamente la elección de PostgreSQL 15 debido a su robustez transaccional (ACID), soporte nativo avanzado para concurrencia mediante el mecanismo MVCC (Multi-Version Concurrency Control), rigor en tipos de datos temporales (DATE, TIME, TIMESTAMP) y su adopción estándar en arquitecturas en la nube de nivel empresarial como Render PostgreSQL Managed Service."),

          createHeading2("7.2 Modelo Entidad-Relación y Diccionario de Datos"),
          createParagraph("La base de datos db_smartcampus integra 16 tablas normalizadas en tercera forma normal (3FN). En la Figura 3 se ilustra el diagrama entidad-relación con las llaves foráneas y cardinalidades del modelo."),

          ...createEmbeddedFigure(
            3,
            "Modelo entidad-relación (ERD) de la base de datos relacional db_smartcampus.",
            pathErd,
            500,
            396,
            "Estructura relacional de las 16 tablas con claves primarias, foráneas y cardinalidad. Fuente: Elaboración propia."
          ),

          createParagraph("A continuación se describen las entidades que conforman el esquema:"),
          createBullet("roles: Catálogo institucional de roles con identificadores inmutables (1: Administrador, 2: Docente, 3: Administrativo, 4: Estudiante).", "1."),
          createBullet("permisos: Catálogo de operaciones atómicas autorizables en la plataforma.", "2."),
          createBullet("roles_permisos: Tabla de asociación n:m para asignación de privilegios según el rol.", "3."),
          createBullet("usuarios: Entidad central que almacena el expediente digital, identificación civil, credenciales cifradas con hash bcrypt y programa o facultad.", "4."),
          createBullet("categorias_servicios: Clasificación temática del portafolio institucional.", "5."),
          createBullet("servicios: Servicios universitarios con tiempo de respuesta estimado y requisitos.", "6."),
          createBullet("solicitudes: Registro de trámites radicados por la comunidad universitaria.", "7."),
          createBullet("historial_estados_solicitud: Bitácora inmutable de trazabilidad de solicitudes.", "8."),
          createBullet("pqrs: Peticiones, quejas y reclamos con código de ticket autogenerado.", "9."),
          createBullet("respuestas_pqrs: Trazabilidad de contestaciones emitidas por funcionarios.", "10."),
          createBullet("recursos: Inventario físico universitario (aulas, laboratorios, equipos 4K).", "11."),
          createBullet("mantenimientos_recurso: Historial técnico preventivo y correctivo de recursos.", "12."),
          createBullet("reservas: Apartados de espacios físicos con fecha, hora inicio y fin.", "13."),
          createBullet("notificaciones: Alertas dirigidas a los usuarios por cambios de estado o avisos.", "14."),
          createBullet("eventos: Actividades académicas con fecha, organizador, lugar y aforo máximo.", "15."),
          createBullet("inscripciones_evento: Control de asistencia y generación de pase digital.", "16."),

          createHeading2("7.3 Política de Datos de Prueba"),
          createParagraph("En estricto cumplimiento de la Ley Estatutaria 1581 de 2012 de Protección de Datos Personales de Colombia y las normas éticas institucionales, el 100% de los datos insertados en el script seed.sql corresponden a datos simulados y ficticios. No se utilizaron datos reales de funcionarios ni estudiantes."),

          // 8. Seguridad
          createHeading1("8. Seguridad y Control de Acceso Basado en Roles (RBAC)"),
          createHeading2("8.1 Matriz de Roles y Privilegios"),
          createParagraph("El control de acceso sigue el principio de mínimo privilegio:"),

          ...createTableAPA(
            "Matriz de control de acceso basado en roles (RBAC)",
            4,
            ["Funcionalidad / Módulo", "Estudiante", "Docente", "Administrativo", "Administrador"],
            [
              ["Autenticación y Perfil Personal", "Permitido", "Permitido", "Permitido", "Permitido"],
              ["Crear Solicitudes Académicas", "Permitido", "Permitido", "Restringido", "Permitido"],
              ["Consultar Solicitudes Propias", "Permitido", "Permitido", "Permitido", "Permitido"],
              ["Gestionar y Resolver Solicitudes", "Restringido", "Restringido", "Permitido", "Permitido"],
              ["Solicitar Reserva de Espacios", "Permitido", "Permitido", "Restringido", "Permitido"],
              ["Aprobar o Denegar Reservas", "Restringido", "Restringido", "Permitido", "Permitido"],
              ["Formular Tickets de PQRS", "Permitido", "Permitido", "Restringido", "Permitido"],
              ["Contestar y Cerrar PQRS", "Restringido", "Restringido", "Permitido", "Permitido"],
              ["Inscripción a Eventos Académicos", "Permitido", "Permitido", "Permitido", "Permitido"],
              ["Creación y Publicación de Eventos", "Restringido", "Restringido", "Permitido", "Permitido"],
              ["Gestión Global de Usuarios y Roles", "Restringido", "Restringido", "Restringido", "Permitido"]
            ],
            [35, 16, 16, 16, 17]
          ),

          createHeading2("8.2 Criptografía y Protección de Credenciales"),
          createParagraph("Las credenciales de los usuarios se resguardan mediante el algoritmo bcrypt aplicando un factor de costo (salt rounds) de 10. Las sesiones son totalmente desacopladas (stateless) mediante JSON Web Tokens firmados criptográficamente, garantizando que el servidor no mantenga sesiones en memoria y permitiendo la escalabilidad horizontal de los servicios."),

          // 9. Despliegue
          createHeading1("9. Despliegue e Infraestructura"),
          createHeading2("9.1 Despliegue en la Nube Pública"),
          createParagraph("La arquitectura se encuentra operativa y accesible públicamente a través de proveedores cloud de primer nivel:"),
          createBullet("Vercel (Frontend): Aloja la aplicación compilada de React bajo un entorno CDN global optimizado. Enruta todas las solicitudes hacia la raíz mediante la regla de reescritura configurada en vercel.json.", "1."),
          createBullet("Render (Backend Orquestado): Aloja el servicio web que ejecuta el script orquestador start-backend.js. Dicho script levanta de forma coordinada los 8 microservicios en puertos privados internos (3001 a 3008) y posteriormente inicia el API Gateway en el puerto público 10000 asignado por la infraestructura.", "2."),
          createBullet("Render Managed PostgreSQL (Base de Datos): Provee la instancia gestionada con copias de seguridad automáticas, soporte TLS y alta disponibilidad.", "3."),

          createHeading2("9.2 Procedimiento de Arranque Local con Docker"),
          createParagraph("Para propósitos de auditoría local o sustentación presencial sin conexión a internet, la plataforma puede desplegarse en su totalidad mediante Docker Compose:"),
          createParagraph("Paso 1: Clonar el repositorio desde GitHub: git clone https://github.com/WRivxs/UAJS-Smart-Campus.git", { indent: false }),
          createParagraph("Paso 2: Acceder al directorio e iniciar los contenedores de base de datos y microservicios mediante: docker-compose up -d", { indent: false }),
          createParagraph("Paso 3: Iniciar el entorno de desarrollo del cliente: cd frontend && npm install && npm run dev", { indent: false }),
          createParagraph("Paso 4: Abrir el navegador en http://localhost:5173 para interactuar con la aplicación local.", { indent: false }),

          // 10. Pruebas
          createHeading1("10. Matriz de Pruebas y Evidencias de Ejecución"),
          createParagraph("Se ejecutó un plan de pruebas funcional exhaustivo para validar la estabilidad de los flujos de negocio:"),

          ...createTableAPA(
            "Matriz de pruebas funcionales y validación del sistema",
            5,
            ["ID Caso", "Módulo", "Descripción de la Prueba", "Entrada de Prueba", "Resultado Obtenido", "Dictamen"],
            [
              ["CP-01", "Autenticación", "Login exitoso con credenciales válidas", "estudiante@uajs.edu.co / Admin2026*", "Retorno de JWT y carga de perfil", "Aprobado"],
              ["CP-02", "Autenticación", "Rechazo de credenciales incorrectas", "admin@uajs.edu.co / claveInvalida", "Código HTTP 401 Credenciales inválidas", "Aprobado"],
              ["CP-03", "Solicitudes", "Radicación de certificado académico", "Tipo: Certificado, Asunto: Notas", "Registro creado con estado REGISTRADA", "Aprobado"],
              ["CP-04", "Solicitudes", "Transición de estado por directivo", "Cambio a EN_REVISION con observación", "Historial actualizado y notificación emitida", "Aprobado"],
              ["CP-05", "Reservas", "Reserva de recurso en horario disponible", "Lab IA, Fecha libre, 08:00 a 10:00", "Reserva creada con estado PENDIENTE", "Aprobado"],
              ["CP-06", "Reservas", "Prevención de solapamiento horario", "Mismo recurso en franja ocupada", "Código HTTP 409 Conflicto de horario", "Aprobado"],
              ["CP-07", "PQRS", "Generación de número de radicado", "Petición sobre salas de cómputo", "Ticket autogenerado PQRS-2026-XXXX", "Aprobado"],
              ["CP-08", "Notificaciones", "Notificación automática tras cambio", "Transición de solicitud ID 1", "Alerta visible en campana de avisos", "Aprobado"],
              ["CP-09", "Eventos", "Inscripción a congreso universitario", "Usuario estudiante en evento de IA", "Cupo decrementado y registro creado", "Aprobado"],
              ["CP-10", "Seguridad RBAC", "Intento de acceso a endpoint protegido", "Token Estudiante hacia /api/users", "Código HTTP 403 Acceso Denegado", "Aprobado"]
            ],
            [10, 15, 25, 20, 20, 10]
          ),

          // 11. Galería de Capturas de Pantalla
          createHeading1("11. Galería de Evidencias y Capturas de Pantalla"),
          createParagraph("A continuación se presentan los espacios formalmente catalogados para adjuntar las capturas de pantalla de la aplicación en producción:"),

          ...createFigureBox(
            4,
            "Vista de acceso y landing institucional de UAJS Smart Campus",
            "Pegar aquí la captura de la página inicial en https://uajs-smart-campus.vercel.app mostrando el logo institucional, la descripción de servicios y los botones de autenticación rápida."
          ),

          ...createFigureBox(
            5,
            "Tableros de mando (Dashboards) adaptados según el rol institucional",
            "Pegar aquí la captura del Dashboard del Estudiante con sus contadores en tiempo real (solicitudes, reservas, eventos y notificaciones activas)."
          ),

          ...createFigureBox(
            6,
            "Módulo de solicitudes universitarias y seguimiento a la trazabilidad",
            "Pegar aquí la captura de la vista de solicitudes mostrando la lista filtrada y la ventana modal con la línea de tiempo del ciclo de vida."
          ),

          ...createFigureBox(
            7,
            "Módulo de reservas de espacios académicos y verificación de disponibilidad",
            "Pegar aquí la captura de la grilla de reservas de laboratorios y aulas demostrando el estado de los recursos físicos."
          ),

          ...createFigureBox(
            8,
            "Paneles de administración y monitoreo en la nube (Vercel y Render)",
            "Pegar aquí las capturas de los paneles de control de Vercel (estado Ready del Frontend) y Render (estado Live del Web Service y la Base de Datos PostgreSQL)."
          ),

          // 12. Conclusiones
          createHeading1("12. Conclusiones y Trabajo Futuro"),
          createHeading2("12.1 Conclusiones"),
          createParagraph("El proyecto integrador UAJS Smart Campus demostró exitosamente la viabilidad técnica y pedagógica de estructurar un sistema universitario bajo una arquitectura distribuida basada en microservicios y API Gateway. Se alcanzaron satisfactoriamente todos los requerimientos planteados en la guía de la asignatura, reemplazando completamente los datos simulados por una base de datos relacional PostgreSQL con persistencia real, validaciones transaccionales estrictas y despliegue operativo en la nube pública."),
          createParagraph("La solución evidencia cómo la separación de responsabilidades y el desacoplamiento de componentes mejoran la tolerancia a fallos, facilitan la evolución técnica individual de cada servicio y garantizan una experiencia de usuario ágil, centralizada y moderna para toda la comunidad de la Corporación Universitaria Antonio José de Sucre."),

          createHeading2("12.2 Líneas de Trabajo Futuro"),
          createBullet("Interoperabilidad con Sistemas Legados: Implementar adaptadores y conectores seguros para consumir APIs de sistemas institucionales de notas y matrículas preexistentes.", "1."),
          createBullet("Mensajería Asíncrona Robusta: Integrar un bus de mensajería empresarial como RabbitMQ para la gestión de colas de auditoría y correos electrónicos masivos.", "2."),
          createBullet("Motor de Búsqueda Avanzada: Desplegar Elasticsearch para indexación semántica sobre reglamentos y catálogos de servicios académicos.", "3.")
        ]
      }
    ]
  });

  const outputPath = path.join(__dirname, '../docs/DOCUMENTACION_FINAL_UAJS_SMART_CAMPUS.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Documento Word con diagramas integrados generado exitosamente en: ${outputPath}`);
}

buildDocument().catch(err => {
  console.error('Error generando documento Word:', err);
  process.exit(1);
});
