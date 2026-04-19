# MotorMarket - Plataforma de Compra y Venta de Autos Usados

## Descripción General

Plataforma web SPA (Single Page Application) desarrollada para la compra y venta de autos usados, asistida por inteligencia artificial para recomendaciones, precios y análisis de mercado.

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica de las páginas
- **CSS3** - Estilos personalizados (sin frameworks de estilado)
- **JavaScript Vanilla (ES6+)** - Lógica de aplicación con módulos ES
- **Bootstrap 5.3** - Framework CSS para componentes base y grid
- **Bootstrap Icons** - Sistema de iconografía

## Características Principales

### Home Público

- Listado de vehículos destacados con imágenes, precios y puntuación IA
- Sistema de búsqueda por marca, precio y año
- Cards interactivos con información clave de cada vehículo
- Barra de progreso para el score de IA (en lugar de estrellas)

### Sistema de Autenticación

- Login/register con email y contraseña
- Persistencia de sesión con localStorage
- Modal de login/register integrado
- Inspector Mode para desarrollo

###Inspector Mode

Permite probar la interfaz sin necesidad de un backend:

- Sesión automática iniciada como "Inspector User"
- 6 vehículos hardcodeados disponibles
- 3 favoritos guardados
- 2 conversaciones de mensajes
- 3 notificaciones
- Switch de rol (comprador/vendedor)

Para activar/desactivar, editar `.env`:
```
VITE_INSPECTOR_MODE=true
```

### Roles de Usuario

- **Comprador**: Dashboard con recomendaciones IA, búsqueda, favoritos, comparador
- **Vendedor**: Dashboard con gestión de publicaciones, leads, optimización IA
- **Administrador**: Panel de control con métricas, alertas y moderación

## Estructura del Proyecto

```
src/
├── index.html              # Punto de entrada de la aplicación
├── css/
│   ├── styles.css         # CSS unificado (importa componentes)
│   └── components/        # Estilos por sección
│       ├── base.css       # Variables y reset
│       ├── home.css       # Estilos del home
│       ├── car-detail.css # Estilos del detalle
│       ├── login.css      # Estilos del login
│       ├── messages.css  # Estilos del chat
│       └── menu.css     # Estilos de menus
├── js/
│   ├── router.js         # Sistema de routing SPA
│   ├── state.js          # Estado global de la aplicación
│   └── app.js           # Lógica principal legacy
├── hooks/               # Hooks de API
│   ├── useApi.js
│   ├── useAuth.js
│   ├── useVehicles.js
│   ├── useFavorites.js
│   ├── useMessages.js
│   └── useUpload.js
├── data/
│   └── cars.js          # Datos de vehículos
└── views/               # Plantillas HTML organizadas
    ├── home/            # Página principal
    ├── auth/            # Login, register, role
    ├── vehicles/         # Detail, add
    ├── user/
    │   ├── buyer/       # Menu, profile, favorites
    │   └── seller/      # Menu, profile
    ├── messages/
    │   ├── buyer/      # List, chat
    │   └── seller/      # List, chat
    └── admin/           # Menu admin
```

## Cómo Ejecutar el Proyecto

### Prerrequisitos

- Node.js instalado
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

###Instalación

```bash
npm install
```

###Ejecución

```bash
npm run dev
```

Luego abrir en el navegador: `http://127.0.0.1:8000`

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_INSPECTOR_MODE=false
```

## Cómo Usar la Aplicación

###Inspector Mode (Desarrollo)

Con `VITE_INSPECTOR_MODE=true`:

1. La sesión se inicia automáticamente
2. Header muestra "Inspector User" con badge de notificaciones
3. Botón de campana para ver notificaciones
4. Botón de corazón para favoritos
5. Click en notificaciónabre el chat

###Flujo Básico (Sin Inspector Mode)

**1. Explorar vehículos (sin login)**

Al abrir la app, verás el Home con vehículos destacados. Puedes:
- Ver todos los autos en el listado
- Usar los filtros de búsqueda (marca, precio, año)
- Click en "Ver detalle" para ver información completa

**2. Crear cuenta / Ingresar**

- Click en "Iniciar sesión" o "Crear cuenta"
- Completar formulario de registro/login
- Elegir rol (comprador/vendedor)

**3. Perfil y Dashboard**

- Completar el perfil correspondiente
- Acceder al dashboard con herramientas específicas del rol

## Rutas Disponibles

| Ruta | Descripción | Requiere Login |
|------|-------------|----------------|
| `#home` | Home público con vehículos | No |
| `#auth/login` | Login | No |
| `#auth/register` | Registro | No |
| `#vehicles/detail/{id}` | Detalle de vehículo | No |
| `#vehicles/add` | Publicar vehículo | Sí (vendedor) |
| `#user/buyer/menu` | Dashboard comprador | Sí |
| `#user/buyer/favorites` | Favoritos comprador | Sí |
| `#messages/buyer` | Mensajes comprador | Sí |
| `#user/seller/menu` | Dashboard vendedor | Sí |
| `#admin/menu` | Dashboard admin | Sí (admin) |

## Agregar Más Vehículos

Los vehículos están definidos en `src/data/cars.js`.

Para agregar un nuevo vehículo:

```javascript
{
  id: 7,
  brand: 'Ford',
  model: 'Ranger',
  year: 2023,
  price: 28000000,
  priceFormatted: '$28.000.000',
  mileage: 15000,
  mileageFormatted: '15.000 km',
  transmission: 'Automática',
  fuel: 'Diiesel',
  location: 'Córdoba',
  image: 'URL_DE_LA_IMAGEN',
  score: 94,
  interiorCondition: 4,
  paintCondition: 4,
  tiresCondition: 4,
  dashboardCondition: 4,
  seller: {
    name: 'Nombre del vendedor',
    type: 'particular',
    verified: true,
    phone: '+54 9 351 ...'
  }
}
```

## Personalizar Estilos

### Colores Principales

Los colores están definidos en `src/css/components/base.css`:

```css
:root {
  --bg: #090909;           /* Fondo principal */
  --panel: #111111;        /* Paneles */
  --text: #f8fafc;         /* Texto principal */
  --muted: rgba(248, 250, 252, 0.68); /* Texto secundario */
  --orange: #f97316;      /* Color principal (naranja) */
  --white: #ffffff;
  --dark-text: #111111;
}
```

### Tipografías

- **Manrope**: Texto general
- **Space Grotesk**: Títulos y headings

## Troubleshooting

### La página aparece en blanco

1. Verificar que el servidor HTTP esté ejecutándose
2. Usar Ctrl+Shift+R para hard refresh
3. Verificar la consola del navegador (F12) para errores

### Inspector Mode no funciona

1. Verificar que `.env` tenga `VITE_INSPECTOR_MODE=true`
2. Verificar la consola para errores de JavaScript

### Error "CORS" al cargar vistas

Este proyecto funciona mejor con un servidor HTTP local.

## Notas Técnicas

### Diseño Responsive

- Mobile first
- Breakpoints: 480px, 600px, 768px, 900px, 1200px

### Persistencia de Datos

- Sesión de usuario en localStorage (`driveroom_session`)
- Inspector session en localStorage (`driveroom_inspector_session`)
- Datos de vehículos en `src/data/cars.js`

### Navegación

- SPA con hash routing
- Sin recarga de página
- Transiciones suaves entre vistas

## Autores y Créditos

- **Desarrollo**: Universidad - Proyecto Web II
- **Imágenes**: Unsplash (vehículos)
- **Iconos**: Bootstrap Icons
- **Tipografías**: Google Fonts (Manrope, Space Grotesk)

## Licencia

Proyecto académico - Universidad