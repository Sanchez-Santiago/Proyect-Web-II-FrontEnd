# MotorMarket - Estado Actual y Plan de Integración Backend

## Estado del Proyecto (12/05/2026)

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

### 🟡 B3 — `API_BASE_URL` hardcodeado como `/api`
- **Archivo:** `src/hooks/useApi.js:1`
- **Problema:** `const API_BASE_URL = '/api'` apunta al mismo origen (puerto 8000), no al backend (puerto 3000).
- **Impacto:** Las peticiones reales irían a `http://localhost:8000/api/*` → 404.
- **Solución:** Cambiar a `http://localhost:3000/api` en `src/config.js`.

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
- [x] Crear `src/config.js` con `API_BASE_URL = 'http://localhost:3000/api'` e `INSPECTOR_MODE = false`
- [x] Eliminar `INSPECTOR_MODE` hardcodeado de `useApi.js` y `router.js`, importar desde `config.js`
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
- [ ] **Listar**: `GET /favorites` (view usa HTML estático)
- [ ] **Agregar**: `POST /favorites` con `{ publicationId }`
- [ ] **Eliminar**: `DELETE /favorites/{publicationId}`
- [ ] **Check**: `GET /favorites/check/{publicationId}`

### Fase 4: Mensajería (Chat)
- [x] **Re-mapear** `useChats.js` de `/messages/*` a `/chats/*`
- [x] **Crear/Obtener chat**: `POST /chats` (body: `{ publicationId }`)
- [x] **Listar chats**: `GET /chats`
- [x] **Ver mensajes**: `GET /chats/{id}/messages`
- [x] **Enviar mensaje**: `POST /chats/{id}/messages`
- [x] **Marcar leído**: `POST /chats/{id}/read`
- [x] **WebSocket**: Conectar WebSocket para mensajes en tiempo real

### Fase 5: Módulo Vendedor
- [x] **Publicar vehículo**: `POST /vehicles` (crear vehículo)
- [x] **Crear publicación**: `POST /publications`
- [x] **Subir imágenes desde URL**: `POST /upload/image` (Cloudinary via base64 data URL)
- [ ] **Mis publicaciones**: `GET /publications/filters` con filtro por sellerId
- [ ] **Editar/Eliminar**: `PUT /vehicles/{id}`, `DELETE /vehicles/{id}`
- [ ] **Cambiar estado**: `PUT /publications/{id}/status`
- [ ] **Preferencias de usuario**: `GET /user-preferences`, `PUT /user-preferences`

### Fase 6: Notificaciones
- [ ] **Listar**: `GET /notifications`
- [ ] **Marcar leída**: `POST /notifications/{id}/read`
- [ ] **Marcar todas leídas**: `POST /notifications/read-all`
- [ ] **Eliminar**: `DELETE /notifications/{id}`

### Fase 7: Funcionalidades Extra
- [ ] **Vistas**: Reportar vista `POST /vehicle-views/publication/{id}`
- [ ] **Búsquedas guardadas**: CRUD `POST /saved-searches`
- [ ] **Reportes**: Crear reporte `POST /reports`
- [ ] **Características**: `GET /vehicle-features` para filtros
- [ ] **Documentos**: Subir/ver documentos del vehículo
- [ ] **AI Analysis**: Conectar análisis de IA
- [ ] **Change Password**: `POST /auth/change-password`

### Fase 8: Limpieza y Calidad
- [x] Reemplazar datos mock de vistas admin con llamadas API reales (publications-admin.js)
- [ ] Agregar manejo global de errores (toast/snackbar)
- [x] Implementar interceptor de 401 → refresh token
- [ ] Eliminar archivos mock gradualmente (`inspector-data.js`, `cars.js`)
- [x] Sincronizar formulario `add.js` con DTOs del backend (2-step vehicle + publication)
- [ ] Unificar `state.isLoggedIn()` y `useAuth.isAuthenticated()`

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

## Progreso de Integración (12/05/2026)

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

### 🔄 Pendiente

| # | Cambio | Archivos |
|---|--------|----------|
| — | Profile views — Conectar APIs reales | `profile-buyer.js`, `profile-seller.js` |
| — | Notifications — Conectar `GET /notifications` | `notifications/*` |
| — | Reports — Conectar `POST /reports` | reports en detail view |
| — | Vehicle views — Track `POST /vehicle-views/publication/{id}` | detail.js |
| — | Saved searches — CRUD `POST /saved-searches` | search view |
| — | AI Analysis — Conectar análisis IA | `investment-advisor.js` |
| — | Change Password — `POST /auth/change-password` | profile views |

### 🚀 Migraciones Completadas

| # | Migración | Antes | Después |
|---|-----------|-------|---------|
| 1 | **Chat views** → `useChats.js` | `useMessages.js` con `/messages/*` | `useChats.js` con `/chats/*` y WebSocket |
| 2 | **add.js** → 2-step create | Solo `POST /vehicles`, imágenes mock | `POST /vehicles` → upload images → `POST /publications` |
| 3 | **Admin publications** → API real | HTML estático, `script: null` | `publications-admin.js` con `GET /publications/filters?status=PENDING` |
| 4 | **Refresh token** → auto-retry | 401 = error directo | Captura 401 → `POST /auth/refresh` → retry original |
| 5 | **Session validation** → on init | Solo `state.init()` | `state.init()` + `useAuth().me()` para validar token |
| 6 | **Router chat params** → `chatId` | `window.chatVehicleId` | `window.chatId` |

### 📦 Nuevos Hooks

| Hook | Endpoint base | Métodos |
|------|--------------|---------|
| `usePublications.js` | `/publications` | `getAll`, `getById`, `getByVehicleId`, `create`, `update`, `updateStatus`, `delete`, `addFeature`, `removeFeature`, `getFeatures` |

### 🔧 Mejoras Internas

| Archivo | Cambio |
|---------|--------|
| `useApi.js` | Auto-refresh token on 401, `handleResponse()` helper, `getSession()`/`saveSession()` helpers |
| `useAuth.js` | Guarda `refreshToken` en sesión, login mapea ambos tokens |
| `useUpload.js` | `imageFromUrl` envía `{ imageUrl }` en vez de `{ url }` |
| `useVehicles.js` | Nuevos métodos: `addImage`, `addImagesBulk`, `getImages`, `deleteImage` |
| `router.js` | Session validation on load, `chatVehicleId`→`chatId` |
| `messages/seller/list.js` | Fix tab selector `.seller-tab`→`.messages-tab` |

### 🐛 Bugs Arreglados en esta Sesión

| Bug | Archivo | Problema | Solución |
|-----|---------|----------|----------|
| B10 | `messages/seller/list.js` | Selector de tabs `.seller-tab` no coincide con HTML `.messages-tab` | Cambiado a `.messages-tab` |
| B11 | `useUpload.js` | `imageFromUrl` enviaba `{ url }` pero backend espera `{ imageUrl }` | Cambiado a `{ imageUrl }` |
| B12 | `router.js` | `window.chatVehicleId` no coincide con `chats` API (usa chatId, no vehicleId) | Renombrado a `window.chatId` |

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
