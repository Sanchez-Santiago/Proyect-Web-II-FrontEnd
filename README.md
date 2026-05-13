# MotorMarket - Estado Actual y Plan de Integración Backend

## Estado del Proyecto (13/05/2026)

### Backend — ✅ Funcional
**Ubicación:** `../Proyect-Web-II-BackEnd/`

| Aspecto | Detalle |
|---|---|
| Framework | NestJS 11 + TypeScript |
| ORM | Prisma 6 + PostgreSQL (Supabase) |
| Endpoints | 73 REST endpoints + WebSocket (Socket.io) |
| Autenticación | JWT + Refresh Token Rotation + bcryptjs |
| Puertos | 3000 (por defecto) |
| Estado | Compila sin errores, todos los módulos implementados |

### Frontend — 🚫 Solo Mock / Sin conexión real
**Ubicación:** `./Proyect-Web-II-FrontEnd/`

| Aspecto | Detalle |
|---|---|
| Stack | HTML5 + CSS3 + JavaScript Vanilla (ES Modules) |
| UI | Bootstrap 5.3 + Bootstrap Icons |
| Servidor | http-server (puerto 8000) |
| Estado | SPA funcional con datos 100% mock (Inspector Mode) |
| Backend real | **NUNCA** se llama |

---

## Bugs Encontrados

### 🔴 B1 — `ROLE_SELECTION_URL` undefined (runtime crash)
- **Archivo:** `src/views/auth/register.js:115`
- **Problema:** La variable `ROLE_SELECTION_URL` se usa pero nunca se define ni importa.
- **Impacto:** Al registrarse exitosamente, lanza `ReferenceError` y no redirige.
- **Solución:** Reemplazar `ROLE_SELECTION_URL` con `'auth/role'`.

### 🔴 B2 — `INSPECTOR_MODE` hardcodeado en 2 archivos
- **Archivos:** `src/hooks/useApi.js:2` y `src/js/router.js:12`
- **Problema:** Ambos tienen `const INSPECTOR_MODE = true;`. El frontend NUNCA hace peticiones reales.
- **Impacto:** El backend nunca recibe tráfico del frontend.
- **Solución:** Unificar en un solo archivo de configuración (`src/config.js`) que se pueda cambiar manualmente.

### 🟡 B3 — `API_BASE_URL` tenía `/api` que el backend no usa (FIXED)
- **Archivo:** `src/config.js`
- **Problema:** `API_BASE_URL: 'http://localhost:3000/api'` — el backend NestJS no tiene global prefix `/api`.
- **Impacto:** Peticiones iban a `http://localhost:3000/api/upload/image` → backend espera en `http://localhost:3000/upload/image` → 404.
- **Solución:** Cambiado a `http://localhost:3000` (sin `/api`).

### 🔴 B13 — `config.js` no existía (FIXED)
- **Archivo:** `src/config.js`
- **Problema:** Solo existía `config.example.js`. `router.js` y `useApi.js` importan de `'../config.js'` → crash al cargar la app.
- **Impacto:** Frontend nunca cargaba.
- **Solución:** Creado `src/config.js` con `API_BASE_URL: 'http://localhost:3000'` e `INSPECTOR_MODE: false`.

### 🟡 B4 — Inconsistencia en `isLoggedIn()` vs `isAuthenticated()`
- **Archivos:** `src/js/state.js:39` vs `src/hooks/useAuth.js:72`
- **Problema:** `state.isLoggedIn()` solo chequea `email`, mientras `useAuth.isAuthenticated()` chequea `token`. `state.isLoggedIn()` puede devolver `true` sin token válido.
- **Solución:** Unificar ambos para verificar `token`.

### 🟡 B5 — Login modal bypass total de autenticación
- **Archivo:** `src/views/home/modal/login-modal.js`
- **Problema:** No llama a ningún endpoint. Resuelve el rol revisando si el email contiene "admin". Guarda sesión falsa en localStorage.
- **Impacto:** Cualquier email funciona como login.
- **Solución:** Reemplazar con llamada real a `/auth/login`.

### 🟡 B6 — Admin views sin JS controller (parcial)
- **Archivos:** `admin/*`
- **Problema:** El router define `script: null` para las rutas admin. Solo `publications-admin` tiene controller real.
- **Solución:** `publications-admin.js` implementado con `GET /publications/filters?status=PENDING`. Las demás (analytics, engine, alerts, users) no tienen endpoint en backend.

### 🟡 B7 — `validateForm()` referencia `lastServiceDate`/`lastOilChange` inexistentes en backend
- **Archivo:** `src/views/vehicles/add.js`
- **Problema:** Los campos `lastServiceDate` y `lastOilChange` se enviaban al backend pero no existen en el DTO `CreateVehicleDto`.
- **Solución:** `add.js` reescrito: solo envía campos válidos (`brand, model, year, vehicleType, fuelType, transmission, color, mileage, accidents`). Crea vehículo + publicación en 2 pasos.

### 🟡 B10 — Selector de tabs en seller messages
- **Archivo:** `messages/seller/list.js`
- **Problema:** El selector `.seller-tab` no coincide con la clase HTML `.messages-tab`.
- **Impacto:** Los tabs de conversaciones/leads en vista vendedor no funcionan.
- **Solución:** Cambiado selector a `.messages-tab`.

### 🟢 B9 — Backend: EADDRINUSE en puerto 3000
- **Archivo:** `server.log` (backend, línea 122)
- **Problema:** Al iniciar el backend, el puerto 3000 ya estaba ocupado por una instancia previa.
- **Solución:** `kill $(lsof -t -i:3000)` antes de reiniciar, o usar `npx kill-port 3000`.

---

## Mismatches: Frontend vs Backend

### Autenticación — `/auth`

| Frontend llama | Backend espera | Coincide |
|---|---|---|
| `POST /auth/login` con `{ email, password }` | `POST /auth/login` con `{ email, password }` | ✅ |
| `POST /auth/register` con `{ name, email, password, role, province, city }` | `POST /auth/register` con `{ name, email, password, role, province, city }` | ✅ |
| `GET /auth/me` | `GET /auth/me` | ✅ |
| `POST /auth/logout` | `POST /auth/logout` | ✅ |

### Vehículos — `/vehicles`

| Frontend llama | Backend espera | Coincide |
|---|---|---|
| `GET /vehicles/filters` | `GET /vehicles/filters` | ✅ |
| `GET /vehicles/filters/{id}` | `GET /vehicles/filters/{id}` | ✅ |
| `GET /vehicles/{id}` | `GET /vehicles/{id}` | ✅ |
| `POST /vehicles` | `POST /vehicles` | ⚠️ Body difiere (ver DTO) |
| `PUT /vehicles/{id}` | `PUT /vehicles/{id}` | ✅ |
| `DELETE /vehicles/{id}` | `DELETE /vehicles/{id}` | ✅ |

### Mensajería — `/messages` → `/chats` ✅

| Frontend llama (antes) | Frontend llama (ahora) | Backend espera | Coincide |
|---|---|---|---|
| `POST /messages` | `POST /chats/:id/messages` | `POST /chats/:id/messages` | ✅ |
| `GET /messages/conversations` | `GET /chats` | `GET /chats` | ✅ |
| `GET /messages/vehicle/{id}` | `GET /chats/{id}/messages` | `GET /chats/{id}/messages` | ✅ |
| `GET /messages/{id}` | `GET /chats/{id}` | `GET /chats/{id}` | ✅ |
| `GET /messages/filters` | — (eliminado) | No existe | ✅ |

**Nota:** Se migraron las 4 vistas de chat (`messages/buyer/list.js`, `messages/buyer/chat.js`, `messages/seller/list.js`, `messages/seller/chat.js`) de `useMessages.js` a `useChats.js`. WebSocket (Socket.IO) pendiente: requiere cargar cliente Socket.IO desde CDN en `index.html`.

### Favoritos — `/favorites` ✅

| Frontend llama | Backend espera | Coincide |
|---|---|---|
| `POST /favorites` con `{ publicationId }` | `POST /favorites` con `{ publicationId }` | ✅ |
| `DELETE /favorites/{publicationId}` | `DELETE /favorites/:publicationId` | ✅ |
| `GET /favorites` | `GET /favorites` | ✅ |
| `GET /favorites/check/{publicationId}` | `GET /favorites/check/:vehicleId` (param es publicationId en service) | ✅ |

**Nota:** El controlador del backend llama al param `:vehicleId` pero en el service se usa como `publicationId`. El hook `useFavorites.js` usa `publicationId` consistentemente.

### Módulos que el frontend NO USA pero el backend tiene

| Endpoint | Uso potencial |
|---|---|
| `GET /publications/filters` | Listar publicaciones con datos de vehículo |
| `GET /publications/{id}` | Detalle de publicación |
| `POST /publications` | Crear publicación (vendedor) |
| `PUT /publications/{id}/status` | Cambiar estado (activo/pausado/vendido) |
| `GET /notifications` | Notificaciones del usuario |
| `POST /notifications/{id}/read` | Marcar notificación leída |
| `POST /notifications/read-all` | Marcar todas leídas |
| `POST /reports` | Reportar publicación |
| `POST /vehicle-views/publication/{id}` | Registrar vista |
| `POST /saved-searches` | Guardar búsqueda |
| `POST /vehicles/{id}/images` | Subir imágenes |
| `POST /documents/vehicle/{vehicleId}` | Subir documentos |
| `POST /auth/change-password` | Cambiar contraseña |
| `POST /auth/refresh` | Refrescar token |
| `POST /upload/image` | Subir imagen a Cloudinary |
| `POST /ai-analysis` | Análisis de IA |
| `GET /vehicle-features` | Listar características disponibles |

---

## Checklist de Integración Frontend ↔ Backend

### Fase 0: Configuración Inicial
- [x] Crear `src/config.js` con `API_BASE_URL = 'http://localhost:3000'` e `INSPECTOR_MODE = false`
- [x] Eliminar `INSPECTOR_MODE` hardcodeado de `useApi.js` y `router.js`, importar desde `config.js`
- [x] Corregir `API_BASE_URL`: el backend NO tiene global prefix `/api`, usar `http://localhost:3000`
- [x] Agregar `http://localhost:8000` a `CORS_ORIGINS` en backend (`.env` + `main.ts`)
- [ ] Matar proceso en puerto 3000 si existe: `kill $(lsof -t -i:3000)`
- [ ] Verificar que backend responde: `curl http://localhost:3000/`

### Fase 1: Autenticación
- [x] **Login**: Conectar `POST /auth/login`. Mapear respuesta JWT al formato de sesión
- [x] **Register**: Conectar `POST /auth/register`. Arreglar bug B1 (`ROLE_SELECTION_URL`)
- [x] **Logout**: Conectar `POST /auth/logout`
- [x] **Me**: Conectar `GET /auth/me` para validar sesión
- [x] **Login modal**: Conectar `POST /auth/login` real
- [x] **Refresh Token**: Implementar renovación silenciosa con `POST /auth/refresh`

### Fase 2: Catálogo de Vehículos
- [x] **Listado**: Conectar `GET /publications/filters` con filtros (marca, precio, año)
- [x] **Detalle**: Conectar `GET /publications/{id}` para vista detail
- [x] **Imágenes**: Conectar imágenes desde la publicación

### Fase 3: Favoritos
- [x] Arreglar `useFavorites.js` para enviar `publicationId` en lugar de `vehicleId`
- [x] **Listar**: `GET /favorites` (view usa HTML estático)
- [x] **Agregar**: `POST /favorites` con `{ publicationId }`
- [x] **Eliminar**: `DELETE /favorites/{publicationId}`
- [x] **Check**: `GET /favorites/check/{publicationId}`

### Fase 4: Mensajería (Chat)
- [x] **Re-mapear** `useChats.js` de `/messages/*` a `/chats/*`
- [x] **Crear/Obtener chat**: `POST /chats` (body: `{ publicationId }`)
- [x] **Listar chats**: `GET /chats`
- [x] **Ver mensajes**: `GET /chats/{id}/messages`
- [x] **Enviar mensaje**: `POST /chats/{id}/messages`
- [x] **Marcar leído**: `POST /chats/{id}/read`
- [x] **WebSocket**: Conectar Socket.IO cliente para mensajes en tiempo real

### Fase 5: Módulo Vendedor
- [x] **Publicar vehículo**: `POST /vehicles` (crear vehículo)
- [x] **Crear publicación**: `POST /publications`
- [x] **Subir imágenes desde URL**: `POST /upload/image` (Cloudinary via base64 data URL)
- [x] **Mis publicaciones**: `GET /publications/filters` con filtro por sellerId
- [x] **Editar/Eliminar**: `PUT /vehicles/{id}`, `DELETE /vehicles/{id}`
- [x] **Cambiar estado**: `PUT /publications/{id}/status`
- [ ] **Preferencias de usuario**: `GET /user-preferences`, `PUT /user-preferences`
- [x] **Perfil vendedor**: `GET /auth/me` para carga de datos
- [x] **Perfil comprador**: `GET /auth/me` para carga de datos

### Fase 6: Notificaciones
- [x] **Listar**: `GET /notifications`
- [x] **Marcar leída**: `POST /notifications/{id}/read`
- [x] **Marcar todas leídas**: `POST /notifications/read-all`
- [x] **Eliminar**: `DELETE /notifications/{id}`

### Fase 7: Funcionalidades Extra
- [x] **Vistas**: Reportar vista `POST /vehicle-views/publication/{id}`
- [x] **Búsquedas guardadas**: CRUD `POST /saved-searches`
- [x] **Reportes**: Crear reporte `POST /reports`
- [ ] **Características**: `GET /vehicle-features` para filtros
- [ ] **Documentos**: Subir/ver documentos del vehículo
- [x] **AI Analysis**: Generación automática al ver detalle + display de condition bars y resumen IA
- [x] **Descripción IA (Gemini)**: Botón "Generar descripción con IA" en formulario de publicación
- [x] **Change Password UI**: `POST /auth/change-password` desde perfil comprador y vendedor
- [x] **Comparación de vehículos**: Tabla comparativa con localStorage (`compare.html` + `compare.js`)

### Fase 8: Limpieza y Calidad
- [x] Reemplazar datos mock de vistas admin con llamadas API reales (publications-admin.js)
- [x] Agregar manejo global de errores (toast/snackbar)
- [x] Implementar interceptor de 401 → refresh token
- [ ] Eliminar archivos mock gradualmente (`inspector-data.js`, `cars.js`)
- [x] Sincronizar formulario `add.js` con DTOs del backend (2-step vehicle + publication)
- [x] Unificar `state.isLoggedIn()` y `useAuth.isAuthenticated()`

---

## Mejoras Recomendadas

### Arquitectura
1. **Unificar configuración** — Crear `src/config.js` como única fuente de verdad para `API_BASE_URL` e `INSPECTOR_MODE`
2. **Interceptor HTTP global** — En `useApi.js`, capturar 401 y hacer refresh token automático antes de reintentar
3. **Manejo de errores unificado** — Función global `showError(message)` y `showSuccess(message)` para toda la app

### Experiencia de Desarrollo
4. **Agregar CORS al backend para puerto 8000** — Sin esto, ninguna petición real funciona
5. **Script de inicio conjunto** — Script que levanta backend y frontend simultáneamente
6. **Hot reload con watch** — `http-server -c-1` ya está configurado, solo falta editar y refrescar

### Frontend
7. **Reemplazar URLs hardcodeadas de Unsplash** — Usar imágenes reales desde Cloudinary vía backend
8. **Implementar paginación** — Backend soporta paginación, frontend no la usa
9. **Agregar estados de carga/error** — Muchas vistas asumen que los datos llegan siempre
10. **Progresivo: quitar mock** — Ir migrando vista por vista, no todo de una vez

### UI/UX
11. **Mensajes de error amigables** — Reemplazar logs de consola con notificaciones visuales
12. **Confirmación en acciones destructivas** — Eliminar publicación, salir de chat, etc.

---

## Glosario de Endpoints del Backend

### Auth (`/auth`)
| Método | Ruta | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | No | `{ name, email, password, role, province, city }` |
| POST | `/auth/login` | No | `{ email, password }` |
| POST | `/auth/refresh` | No | Header `x-refresh-token` |
| POST | `/auth/logout` | JWT | — |
| POST | `/auth/change-password` | JWT | `{ currentPassword, newPassword }` |
| GET | `/auth/me` | JWT | — |

### Vehicles (`/vehicles`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/vehicles` | JWT |
| GET | `/vehicles/filters` | No |
| GET | `/vehicles/filters/:id` | No |
| GET | `/vehicles/:id` | No |
| PUT | `/vehicles/:id` | JWT |
| DELETE | `/vehicles/:id` | JWT |
| POST | `/vehicles/:id/images` | JWT |
| POST | `/vehicles/:id/images/bulk` | JWT |
| GET | `/vehicles/:id/images` | No |
| DELETE | `/vehicles/:id/images/:imageId` | JWT |

### Publications (`/publications`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/publications` | JWT |
| GET | `/publications/filters` | No |
| GET | `/publications/:id` | No |
| GET | `/publications/vehicle/:vehicleId` | No |
| PUT | `/publications/:id` | JWT |
| PUT | `/publications/:id/status` | JWT |
| DELETE | `/publications/:id` | JWT |
| POST | `/publications/:id/features` | JWT |
| DELETE | `/publications/:id/features/:featureId` | JWT |
| GET | `/publications/:id/features` | No |

### Chats (`/chats`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/chats` | JWT |
| GET | `/chats` | JWT |
| GET | `/chats/:id` | JWT |
| GET | `/chats/:id/messages` | JWT |
| POST | `/chats/:id/messages` | JWT |
| POST | `/chats/:id/read` | JWT |
| GET | `/chats/:id/unread` | JWT |
| DELETE | `/chats/:id` | JWT |

### Favorites (`/favorites`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/favorites` | JWT (body: `{ publicationId }`) |
| DELETE | `/favorites/:publicationId` | JWT |
| GET | `/favorites` | JWT |
| GET | `/favorites/check/:vehicleId` | JWT |

### Otros
| Método | Ruta | Auth |
|---|---|---|
| GET/PUT/DELETE | `/user-preferences` | JWT |
| POST/GET/PUT/DELETE | `/ai-analysis/*` | JWT |
| POST | `/upload/image` | JWT |
| GET/POST | `/notifications/*` | JWT |
| POST/GET/PUT/DELETE | `/reports/*` | JWT |
| GET/POST/DELETE | `/vehicle-features/*` | Según rol |
| POST/GET | `/vehicle-views/*` | No/JWT |
| POST/GET/PUT/DELETE | `/saved-searches/*` | JWT |
| GET/POST | `/documents/*` | Según rol |

---

---

## Progreso de Integración (13/05/2026)

### ✅ Completado

| # | Cambio | Archivos |
|---|--------|----------|
| 1 | `src/config.js` — Config centralizada | Nuevo archivo |
| 2 | Backend CORS — Agregado `http://localhost:8000` | `.env`, `main.ts` |
| 3 | `useApi.js` — Reescripto: retorna datos directos, usa config, mock normalizado | `useApi.js` |
| 4 | `router.js` — Usa config, inspector condicional, `state.init()` siempre | `router.js` |
| 5 | Bug `ROLE_SELECTION_URL` arreglado | `register.js:115` |
| 6 | `useAuth.js` — Normaliza respuesta backend (`accessToken`→`token`) | `useAuth.js` |
| 7 | `login.js` — Ya compatible con nuevo `useAuth` | Sin cambios |
| 8 | `register.js` — Validación password backend (8+ chars, mayusc, num) | `register.js`, `register.html` |
| 9 | `login-modal.js` — Login real con email+password | `login-modal.js`, `login-modal.html` |
| 10 | `home/index.js` — Usa `GET /publications/filters`, normaliza datos | `home/index.js` |
| 11 | `vehicles/detail.js` — Usa `GET /publications/{id}`, mapeo completo | `vehicles/detail.js` |
| 12 | `useFavorites.js` — Usa `publicationId` en vez de `vehicleId` | `useFavorites.js` |
| 13 | `useChats.js` — Nuevo hook para `/chats/*` (reemplaza `useMessages.js`) | `useChats.js` (nuevo) |
| 14 | `usePublications.js` — Nuevo hook para `/publications/*` | `usePublications.js` (nuevo) |
| 15 | `useApi.js` — Refresh token automático en 401 | `useApi.js` |
| 16 | `router.js` — Session validation (GET /auth/me) on init | `router.js` |
| 17 | `useAuth.js` — Almacena `refreshToken` de login | `useAuth.js` |
| 18 | `useFavorites.js` — `check()` renamed to `publicationId` | `useFavorites.js` |
| 19 | `useUpload.js` — Fix `imageFromUrl` body a `{ imageUrl }` | `useUpload.js` |
| 20 | `useVehicles.js` — addImage/addImagesBulk/getImages/deleteImage | `useVehicles.js` |
| 21 | `user/seller/publications.js` — Conectado a `usePublications().getAll({sellerId})` | `publications.js` |
| 22 | `user/seller/sales.js` — Conectado a `usePublications().getAll({sellerId})`, filtro SOLD | `sales.js` |
| 23 | `user/seller/insights.js` — Conectado a `usePublications().getAll({sellerId})`, stats client-side | `insights.js` |
| 24 | `user/seller/menu-seller.js` — Conectado a `usePublications().getAll({sellerId})`, dashboard | `menu-seller.js` |
| 25 | `user/buyer/favorites.js` — Conectado a `useFavorites().getAll()`, remove, contact | `favorites.js` |
| 26 | `user/buyer/menu-buyer.js` — Conectado a `usePublications().getAll({status:'ACTIVE'})`, `useFavorites().checkAll()` | `menu-buyer.js` |
| 27 | `user/buyer/profile-buyer.js` — Conectado a `useAuth().me()`, pre-fill form | `profile-buyer.js` |
| 28 | `user/seller/profile-seller.js` — Conectado a `useAuth().me()`, pre-fill form | `profile-seller.js` |
| 29 | `user/buyer/investment-advisor.js` — Refactor a objeto exportable con `init()`, cleanup | `investment-advisor.js` |
| 30 | `src/config.js` — Creado con `API_BASE_URL: 'http://localhost:3000'` (sin `/api`) | `config.js` |
| 31 | `.env` — Cloudinary cloud name corregido: `Santiago` → `dgjtuizmg` | `.env` |
| 32 | `user/buyer/profile-buyer.js` — Change Password UI conectado | `profile-buyer.js` |
| 33 | `user/seller/profile-seller.js` — Change Password UI conectado | `profile-seller.js` |
| 34 | `useAiAnalysis.js` — Nuevo hook para `/ai-analysis/*` | `useAiAnalysis.js` (nuevo) |
| 35 | `vehicles/detail.js` — AI Analysis: condition bars + score badge | `detail.js` |
| 36 | `notifications/list.html` + `list.js` — Vista completa: listar, marcar leída, eliminar, marcar todas | `notifications/list.*` |
| 37 | `vehicles/compare.html` + `compare.js` — Comparación con localStorage | `compare.*` |
| 38 | Menús comprador/vendedor — Enlace "Notificaciones" agregado | 9 archivos HTML |
| 39 | `compare.css` — Estilos tabla comparativa + notificaciones | `components.css` |
| 40 | `useSocket.js` — Nuevo hook para Socket.IO cliente | `useSocket.js` (nuevo) |
| 41 | `index.html` — Socket.IO CDN agregado (`4.7.5`) | `index.html` |
| 42 | `messages/buyer/chat.js` — Socket: join, newMessage, sendMessage, destroy | `buyer/chat.js` |
| 43 | `messages/seller/chat.js` — Socket: join, newMessage, sendMessage, destroy | `seller/chat.js` |
| 44 | `vehicles/detail.js` — Vehicle views tracking (`POST /vehicle-views/publication/{id}`) | `detail.js` |
| 45 | `vehicles/detail.js` + `.html` — Reportes: modal con motivo/descripción, `POST /reports` | `detail.js`, `detail.html` |
| 46 | `admin/analytics-admin.js` — JS controller conectado a reports + publications APIs | `analytics-admin.js` |
| 47 | `admin/engine-admin.js` — JS controller con navegación | `engine-admin.js` |
| 48 | `admin/alerts-admin.js` — JS controller con navegación | `alerts-admin.js` |
| 49 | `admin/users-admin.js` — JS controller con datos de reports | `users-admin.js` |
| 50 | `router.js` — Admin views `script: null` → scripts reales | `router.js` |
| 51 | `user/saved-searches/` — Vista completa: listar, guardar, eliminar, aplicar filtros | `saved-searches/*` |
| 52 | `home/index.html` — Botón "Guardar búsqueda" en filtros | `index.html` |
| 53 | `home/index.js` — Handler guardar búsqueda (`POST /saved-searches`) | `index.js` |
| 54 | Menús comprador (4 archivos) — Enlace "Búsquedas" agregado | 4 buyer HTML files |
| 55 | `state.js` — `isLoggedIn()` unified (usa token), `showMessage()` global toast | `state.js` |
| 56 | **Gemini AI** — Botón "Generar descripción con IA" en add.html + backend module `POST /gemini/generate-description` | `add.html`, `add.js`, backend `gemini/` module |

### 🔄 Pendiente

| # | Cambio | Archivos |
|---|--------|----------|
| — | Documents — Subir/ver documentos del vehículo | vehicle detail/add views |
| — | Vehicle features — `GET /vehicle-features` para filtros dinámicos | home filter dropdowns |
| — | WebSocket heartbeat — Reconexión automática + status indicator | chat views |

### 🚀 Migraciones Completadas

| # | Migración | Antes | Después |
|---|-----------|-------|---------|
| 1 | **Chat views** → `useChats.js` | `useMessages.js` con `/messages/*` | `useChats.js` con `/chats/*` y WebSocket |
| 2 | **add.js** → 2-step create | Solo `POST /vehicles`, imágenes mock | `POST /vehicles` → upload images → `POST /publications` |
| 3 | **Admin publications** → API real | HTML estático, `script: null` | `publications-admin.js` con `GET /publications/filters?status=PENDING` |
| 4 | **Refresh token** → auto-retry | 401 = error directo | Captura 401 → `POST /auth/refresh` → retry original |
| 5 | **Session validation** → on init | Solo `state.init()` | `state.init()` + `useAuth().me()` para validar token |
| 6 | **Router chat params** → `chatId` | `window.chatVehicleId` | `window.chatId` |
| 7 | **Seller views** → `usePublications` | Publicaciones/Sales/Insights/Menu con mock | `usePublications().getAll({sellerId})` con filtro client-side |
| 8 | **Buyer favorites** → `useFavorites` | Favorites/Menu con mock | `useFavorites().getAll()` + `remove()` + `checkAll()` |
| 9 | **Profile views** → `useAuth().me()` | Profile buyer/seller con formulario mock | Carga datos reales desde `GET /auth/me` |
| 10 | **Investment-advisor** → exportable | IIFE con dead code (chat sin HTML) | Objeto exportable con `init()`, solo navegación |
| 11 | **Profile views** → Change Password | Sin UI de cambio de contraseña | `POST /auth/change-password` con validación (8 chars, mayúscula, número) |
| 12 | **Notifications** → full CRUD | Sin vista de notificaciones | Vista completa con listar, marcar leída, eliminar, marcar todas |
| 13 | **Vehicle Compare** → nueva vista | Sin funcionalidad de comparación | `compare.html` + `compare.js` con `localStorage` (key `motormarket_compare`) |
| 14 | **WebSocket** → chat en tiempo real | Solo REST (`POST /chats/{id}/messages`) | Socket.IO: join room, escuchar `newMessage`, emitir `sendMessage` |
| 15 | **Vehicle views** → tracking automático | Sin tracking | `POST /vehicle-views/publication/{id}` al cargar detalle |
| 16 | **Reports** → modal de denuncia | Sin reportes | Modal con motivo + descripción, `POST /reports` |
| 17 | **Admin views** → JS controllers | `script: null` en analytics, engine, alerts, users | Scripts con navegación + datos de APIs disponibles |
| 18 | **Saved searches** → CRUD completo | Sin búsquedas guardadas | Vista list.html + list.js: crear, listar, eliminar, aplicar filtros |
| 19 | **Global toast** → `state.showMessage()` | Sin feedback visual unificado | Toast flotante con tipo/color y auto-dismiss |
| 20 | **isLoggedIn** → unified | `state.isLoggedIn()` solo chequeaba email | Ahora chequea `token`, consistente con `useAuth.isAuthenticated()` |
| 21 | **Gemini integration** → descripción IA | Sin generación de descripciones | `POST /gemini/generate-description` con datos del vehículo → descripción + precio sugerido |

### 📦 Nuevos Hooks

| Hook | Endpoint base | Métodos |
|------|--------------|---------|
| `usePublications.js` | `/publications` | `getAll`, `getById`, `getByVehicleId`, `create`, `update`, `updateStatus`, `delete`, `addFeature`, `removeFeature`, `getFeatures` |
| `useAiAnalysis.js` | `/ai-analysis` | `getByVehicle(vehicleId)`, `create(vehicleId, data)` |
| `useSocket.js` | Socket.IO | `connect`, `disconnect`, `joinChat`, `leaveChat`, `sendMessage`, `markAsRead`, `on`, `off` |

### 🔧 Mejoras Internas

| Archivo | Cambio |
|---------|--------|
| `useApi.js` | Auto-refresh token on 401, `handleResponse()` helper, `getSession()`/`saveSession()` helpers |
| `useAuth.js` | Guarda `refreshToken` en sesión, login mapea ambos tokens |
| `useUpload.js` | `imageFromUrl` envía `{ imageUrl }` en vez de `{ url }` |
| `useVehicles.js` | Nuevos métodos: `addImage`, `addImagesBulk`, `getImages`, `deleteImage` |
| `router.js` | Session validation on load, `chatVehicleId`→`chatId`; rutas `vehicles/compare` y `notifications` agregadas |
| `messages/seller/list.js` | Fix tab selector `.seller-tab`→`.messages-tab` |
| `user/buyer/profile-buyer.js` | Change Password + pre-fill desde `useAuth().me()` |
| `user/seller/profile-seller.js` | Change Password + pre-fill desde `useAuth().me()` |
| `vehicles/detail.js` | AI Analysis con condition bars + score badge + botón Comparar |
| `notifications/list.js` | Nueva vista: GET, POST read, DELETE, read-all |
| `vehicles/compare.js` | Nueva vista: tabla comparativa con localStorage |
| `useSocket.js` | Nuevo hook: conexión Socket.IO con auth JWT, join/leave rooms, eventos newMessage/messagesRead |
| `index.html` | Socket.IO CDN v4.7.5 agregado |
| `messages/buyer/chat.js` | Socket: joinChat en init, newMessage listener, sendMessage vía socket, destroy cleanup |
| `messages/seller/chat.js` | Socket: joinChat en init, newMessage listener, sendMessage vía socket, destroy cleanup |
| `vehicles/detail.js` | Vehicle views tracking + Reportes (modal con motivo/descripción) |
| `vehicles/detail.html` | Botón "Reportar" en header actions |
| `admin/analytics-admin.js` | Nuevo: stats de reports + publications activas |
| `admin/engine-admin.js` | Nuevo: navegación + placeholder IA engine |
| `admin/alerts-admin.js` | Nuevo: navegación + placeholder alertas |
| `admin/users-admin.js` | Nuevo: tabla de reportes desde API |
| `router.js` | Admin views `script: null` → scripts reales; ruta `user/saved-searches` |
| `user/saved-searches/list.js` + `.html` | Nueva vista: CRUD de búsquedas guardadas |
| `home/index.html` | Botón "Guardar búsqueda" en barra de filtros |
| `home/index.js` | Handler `POST /saved-searches` con feedback visual |
| `state.js` | `isLoggedIn()` unified (usa token); `showMessage(msg, type)` global toast |
| 4 buyer HTML files | Enlace "Búsquedas" agregado en sidebar nav |

### 🐛 Bugs Arreglados en esta Sesión

| Bug | Archivo | Problema | Solución |
|-----|---------|----------|----------|
| B10 | `messages/seller/list.js` | Selector de tabs `.seller-tab` no coincide con HTML `.messages-tab` | Cambiado a `.messages-tab` |
| B11 | `useUpload.js` | `imageFromUrl` enviaba `{ url }` pero backend espera `{ imageUrl }` | Cambiado a `{ imageUrl }` |
| B12 | `router.js` | `window.chatVehicleId` no coincide con `chats` API (usa chatId, no vehicleId) | Renombrado a `window.chatId` |
| B13 | `src/config.js` | Archivo no existía, solo `config.example.js`. App crasheaba al importar. | Creado con `API_BASE_URL: 'http://localhost:3000'` |
| B14 | `.env` | `CLOUDINARY_CLOUD_NAME=Santiago` no es el cloud name real | Corregido a `dgjtuizmg` |
| B15 | `config.example.js` | `API_BASE_URL` tenía `/api` que el backend no usa | Cambiado a `http://localhost:3000` |

### Cambios de Formato entre Mock y Backend Real

**Mock (cars.js) → Backend (Publication + Vehicle)**

| Campo Mock | Origen Backend | Notas |
|---|---|---|
| `id` | `publication.id` | Ahora es UUID |
| `brand`, `model`, `year` | `publication.vehicle.*` | Igual |
| `price`, `priceFormatted` | `publication.price` | Formatear en frontend |
| `mileage`, `mileageFormatted` | `publication.vehicle.mileage` | Formatear en frontend |
| `transmission` | `pub.vehicle.transmission` (enum) | Traducir: AUTOMATIC→Automática |
| `fuel` | `pub.vehicle.fuelType` (enum) | Traducir: GASOLINE→Nafta |
| `image`, `images` | `pub.vehicle.images[].imageUrl` | Array de objetos |
| `score`, `condition` | `pub.vehicle.analytics.*` | Puede ser null |
| `location` | `pub.province + pub.city` | Combinar |
| `description` | `pub.description` | Igual |
| `seller.name` | `pub.seller.fullName` | Igual |
| `seller.type` | No disponible | Default 'particular' |
| `seller.verified` | No disponible | Default false |

## Cómo Ejecutar (después de la integración)

### 1. Backend
```bash
cd ../Proyect-Web-II-BackEnd
# Asegurar puerto libre
kill $(lsof -t -i:3000) 2>/dev/null; true
# Iniciar
npm run start:dev
```

### 2. Frontend
```bash
cd Proyect-Web-II-FrontEnd
npx http-server -p 8000 -c-1
# Abrir: http://localhost:8000
```

### 3. Verificar conexión
```bash
curl http://localhost:3000/           # Debe responder HTML
curl http://localhost:3000/vehicles/filters  # Debe responder JSON
```
