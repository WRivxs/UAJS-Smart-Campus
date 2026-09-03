# Matriz de Roles y Accesos (RBAC) 🔐

El sistema define 4 tipos de roles. Para aplicar esto en los microservicios sin volvernos locos, usaremos **JWT (JSON Web Tokens)**. Cuando un usuario haga login, el Microservicio de Usuarios emitirá un token que dice `{"rol": "Estudiante"}`, y el **API Gateway** se encargará de dejarlo pasar o bloquearlo según las rutas.

A nivel de código en el Frontend (React), esto significa que **ocultaremos botones y vistas** dependiendo del rol que esté conectado.

## 📊 Matriz de Permisos por Microservicio y Rol

| Microservicio/Módulo | 🎓 Estudiante | 👨‍🏫 Docente | 🏢 Administrativo | ⚙️ Administrador Sistema |
| :--- | :--- | :--- | :--- | :--- |
| **Usuarios/Auth** | Consultar su perfil. | Consultar su perfil. | N/A | **Full Access:** Administrar todos los usuarios y Roles. |
| **Solicitudes** | Registrar y consultar propias. | Consultar las propias. | **Full Access:** Gestionar y actualizar estados. | Supervisar. |
| **Recursos** | Solicitar recursos. | Solicitar recursos. | **Full Access:** Administrar recursos del almacén. | Supervisar. |
| **Reservas** | Realizar reservas. | Realizar y Gestionar propias. | **Full Access:** Gestionar (Aprobar/rechazar) todas. | Supervisar. |
| **Eventos/Actividades** | Consultar disponibles. | Publicar y consultar. | Generar reportes puntuales. | Supervisar. |
| **Sistema General** | Consultar servicios. | Consultar servicios. | Atender requerimientos (PQRS). | **Full Access:** Configuración, servicios y Estadísticas. |

## 🛠️ ¿Cómo se implementa esto en el código? (Guía de Acción)

1. **Frontend (React):** Tienen que usar un mecanismo llamado *Rutas Protegidas (Protected Routes)*. Si un Estudiante trata de entrar a la URL `/admin/usuarios`, React debe redireccionarlo al Dashboard y mostrar un mensaje de error. Si un administrativo entra a Reservas, debe ver botones de "Aprobar", mientras que el estudiante solo ve "Solicitar".
2. **Backend (Express API Gateway):** No basta con ocular el botón en React. Si un estudiante tramposo usa "Postman" para lanzar una petición a `PUT /solicitudes/aprobar`, el Gateway de Express debe leer su token JWT, decir "Oye, eres Estudiante, no Administrativo", y devolver un error `403 Forbidden`.
