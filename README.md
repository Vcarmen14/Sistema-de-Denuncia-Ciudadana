# Sistema de Denuncia Ciudadana - Municipio de Manta

## Descripción

Este proyecto es un sistema de denuncia ciudadana desarrollado con Next.js (App Router) que permite a los usuarios reportar incidencias urbanas en el Municipio de Manta. Incluye un frontend SPA en vanilla JS y un backend con Route Handlers en `app/api/*` que actúa como Backend-for-Frontend (BFF). La base de datos es Neon/Postgres.

---

## Arquitectura y Tecnologías

- **Framework:** Next.js con App Router y Route Handlers.
- **Backend:** API REST serverless en `app/api/*`.
- **Base de datos:** Neon/Postgres con cliente singleton `getSql()` y helpers `rows()`.
- **Frontend:** SPA en vanilla JavaScript, HTML y CSS.
- **Mapas:** Leaflet para visualización geográfica.
- **Internacionalización:** i18n para ES/EN.
- **Accesibilidad:** Web Speech API, atajos de teclado y mejoras ARIA.

---

## Endpoints Principales

- `/api/incidencias`
  - `GET`: Lista incidencias con filtros (tipo, estado, prioridad, ubicación).
  - `POST`: Crea una incidencia, guarda fotos y deriva lat/lng si faltan.
- `/api/incidencias/mine`
  - `GET`: Incidencias del usuario autenticado.
- `/api/stats`
  - `GET`: Estadísticas y recientes para la página principal.
- `/api/notificaciones` y `/api/notificaciones/[id]`
  - `GET`: Notificaciones por usuario.
  - `PATCH`: Marca notificación como leída.
- `/api/feedback`
  - `POST`: Envía feedback.
- `/api/auth/*`, `/api/profile`
  - Manejo de sesión y perfil de usuario.

---

## Base de Datos

- **incidencias:** id, título, tipo, ubicación, descripción, usuario_id, fecha, estado, prioridad, latitud, longitud, fotos (text[]).
- **notificaciones:** id, usuario_id, título, mensaje, leída, fecha.
- **feedback:** id, tipo, mensaje, nombre, email, teléfono, fecha.
- **usuarios:** id, email, nombre, teléfono, password_hash, fecha_creacion (opcional para demo).

---

## Variables de Entorno

- `POSTGRES_URL` o `DATABASE_URL`: Cadena de conexión a Neon/Postgres (no usar prefijo `NEXT_PUBLIC`).
- Configurar en entorno de despliegue (ej. Vercel).

---

## Despliegue

Se recomienda desplegar en [Vercel](https://vercel.com) para soporte nativo de Next.js y backend serverless.

Pasos básicos:

1. Subir el proyecto a un repositorio Git (GitHub, GitLab, Bitbucket).
2. Conectar el repositorio a Vercel.
3. Configurar variables de entorno en Vercel.
4. Desplegar y verificar.

---

## Funcionalidades Clave

- Reporte y visualización de incidencias con fotos.
- Filtros por tipo, estado, prioridad y ubicación.
- Visualización geográfica con Leaflet.
- Gestión de perfil y autenticación.
- Notificaciones y feedback.
- Accesibilidad y soporte multilenguaje.

---

## Estructura del Proyecto

- `app/api/`: Endpoints backend.
- `frontend/js/`: Código frontend (app.js, api.js, supabase-client.js).
- `frontend/css/`: Estilos CSS.
- `public/`: Recursos estáticos.
- `.env`: Variables de entorno (no versionar).
- `.gitignore`: Archivos ignorados por Git.

---

## Cómo Ejecutar Localmente

1. Instalar dependencias con `npm install` o `pnpm install`.
2. Configurar variables de entorno en `.env.local`.
3. Ejecutar el servidor de desarrollo con `npm run dev` o `pnpm dev`.
4. Acceder a `http://localhost:3000`.

---

## Contacto

Para soporte o preguntas, contactar al equipo de desarrollo del Municipio de Manta.

---

## Licencia

Este proyecto es propiedad del Municipio de Manta y está sujeto a sus términos y condiciones.
