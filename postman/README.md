# 📮 Guía de Pruebas Postman y Evidencias — UAJS Smart Campus

Este directorio contiene todo lo necesario para ejecutar pruebas manuales y automatizadas sobre el API Gateway (`http://localhost:8080`) y los 8 microservicios del proyecto, así como generar evidencias para sustentación y entregas académicas.

---

## 📁 Archivos Disponibles

| Archivo | Descripción |
|---|---|
| [`UAJS_Smart_Campus_API.postman_collection.json`](file:///c:/Users/Lenovo/Downloads/UAJS_Smart_Campus/postman/UAJS_Smart_Campus_API.postman_collection.json) | **Colección oficial de Postman (v2.1.0)** con 26 peticiones organizadas en 9 carpetas, con scripts de tests y extracción automática del token JWT. |
| [`UAJS_Smart_Campus_Environment.postman_environment.json`](file:///c:/Users/Lenovo/Downloads/UAJS_Smart_Campus/postman/UAJS_Smart_Campus_Environment.postman_environment.json) | **Variables de entorno de Postman** (`baseUrl: http://localhost:8080`, credenciales de prueba, variables dinámicas). |
| [`ejecutar_pruebas_evidencia.js`](file:///c:/Users/Lenovo/Downloads/UAJS_Smart_Campus/postman/ejecutar_pruebas_evidencia.js) | **Runner automatizado en Node.js** (sin dependencias adicionales). Ejecuta las 26 pruebas en vivo contra los contenedores y genera el reporte. |
| [`EVIDENCIA_PRUEBAS_API.md`](file:///c:/Users/Lenovo/Downloads/UAJS_Smart_Campus/postman/EVIDENCIA_PRUEBAS_API.md) | **Reporte Markdown de evidencia** generado en tiempo real con matriz de pruebas, códigos de estado, latencias y payloads. |

---

## 🚀 Opción 1: Ejecución en Postman Desktop (Interfaz Gráfica)

### Paso 1: Importar los archivos
1. Abre **Postman**.
2. En la esquina superior izquierda, haz clic en **Import**.
3. Arrastra o selecciona los dos archivos:
   - `UAJS_Smart_Campus_API.postman_collection.json`
   - `UAJS_Smart_Campus_Environment.postman_environment.json`

### Paso 2: Activar el Entorno
1. En la esquina superior derecha de Postman, abre el menú desplegable de entornos.
2. Selecciona **UAJS Smart Campus - Local Environment**.

### Paso 3: Ejecutar una petición individual
1. Abre la carpeta `01. Autenticación & Usuarios` y haz clic en `1.1 Login - Estudiante`.
2. Haz clic en **Send**.
3. El test script **extraerá automáticamente el token JWT** y lo asignará a la variable `{{jwtToken}}`. A partir de ese momento, todas las peticiones protegidas funcionarán sin que tengas que copiar y pegar tokens manualmente.

### Paso 4: Ejecución Masiva y Evidencia (Collection Runner)
1. Haz clic derecho sobre la colección `UAJS Smart Campus — Suite de Pruebas de API y Evidencia`.
2. Selecciona **Run collection**.
3. Asegúrate de que estén seleccionadas todas las peticiones y haz clic en el botón azul **Run UAJS Smart Campus**.
4. Verás los 26 tests en verde (`200 OK`, `201 Created`). Puedes hacer clic en **Export Results** o tomar una captura de pantalla como evidencia gráfica.

---

## ⚡ Opción 2: Ejecución Rápida por Consola (1 Clic)

Si quieres verificar el estado de todos los microservicios y actualizar el reporte de evidencias al instante desde la terminal:

```bash
node postman/ejecutar_pruebas_evidencia.js
```

### Salida esperada:
```
╔════════════════════════════════════════════════════════════════════╗
║       UAJS SMART CAMPUS — SUITE DE PRUEBAS DE EVIDENCIA API        ║
╚════════════════════════════════════════════════════════════════════╝
🌐 Base URL: http://localhost:8080

▶ Ejecutando pruebas del Módulo 01: Autenticación & Usuarios...
✅ [Autenticación] POST /api/auth/login ➔ 200 (280ms)
   🔑 Token JWT obtenido para: Juan David Rivas (Estudiante)
✅ [Autenticación] POST /api/auth/login ➔ 200 (84ms)
✅ [Autenticación] GET /api/auth/profile ➔ 200 (21ms)
✅ [Usuarios] GET /api/usuarios/profile ➔ 200 (23ms)
...
====================================================================
📊 RESUMEN FINAL: 26/26 pruebas superadas (100.0%) en 1776ms
====================================================================
```

---

## 🔑 Credenciales Seed del Sistema

| Rol | Correo Institucional | Contraseña |
|---|---|---|
| **Estudiante** | `estudiante@uajs.edu.co` | `Password123!` |
| **Docente** | `docente@uajs.edu.co` | `Password123!` |
| **Administrativo** | `administrativo@uajs.edu.co` | `Password123!` |
| **Administrador** | `admin@uajs.edu.co` | `Password123!` |
