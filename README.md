# DriveRoom - Plataforma de Compra y Venta de Autos Usados

## Descripción General

Plataforma web SPA (Single Page Application) desarrollada para la compra y venta de autos usados, asistida por inteligencia artificial para recomendaciones, precios y análisis de mercado.

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica de las páginas
- **CSS3** - Estilos personalizados (sin frameworks de estilado)
- **JavaScript Vanilla (ES6+)** - Lógica de aplicación sin módulos ES
- **Bootstrap 5.3** - Framework CSS para componentes base y grid
- **Bootstrap Icons** - Sistema de iconografía

## Características Principales

### Home Público

- Listado de vehículos destacados con imágenes, precios y puntuación IA
- Sistema de búsqueda por marca, precio y año
- Cards interactivos con información clave de cada vehículo

### Detalle de Vehículo

- Información completa del auto (año, km, transmisión, combustible)
- Datos del vendedor con verificación
- Análisis IA del vehículo
- Botones de acción (contactar, favorito, ofertar, comparar)

### Sistema de Autenticación

- Login bajo demanda (solo al interactuar)
- Modal de login/register integrado
- Persistencia de sesión con localStorage
- Detección automática de rol de administrador

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
│       ├── login.css      # Estilos del login standalone
│       ├── login-modal.css# Estilos del modal
│       ├── role.css       # Estilos de selección de rol
│       ├── menu.css      # Estilos de menus
│       └── profile.css    # Estilos de perfiles
├── js/
│   └── app.js            # Toda la lógica JavaScript
└── views/                # Plantillas HTML
    ├── home.html         # Template del home
    ├── car-detail.html  # Template de detalle
    ├── login-modal.html # Template del modal
    ├── role.html        # Template de selección de rol
    ├── menu-buyer.html  # Dashboard comprador
    ├── menu-seller.html # Dashboard vendedor
    ├── menu-admin.html  # Dashboard administrador
    ├── profile-buyer.html  # Perfil comprador
    └── profile-seller.html # Perfil vendedor
```

## Cómo Ejecutar el Proyecto

### Prerrequisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor HTTP local (ver opciones abajo)

### Opción 1: Python (recomendado)

Si tienes Python instalado:

```bash
cd "C:\Users\sanch\OneDrive\Documentos\DEV\Proyect-Web-II-FrontEnd"
python -m http.server 8000
```

Luego abrir en el navegador: `http://localhost:8000/src/index.html`

### Opción 2: Node.js

Si tienes Node.js instalado:

```bash
cd "C:\Users\sanch\OneDrive\Documentos\DEV\Proyect-Web-II-FrontEnd"
npx http-server -p 8000
```

Luego abrir en el navegador: `http://localhost:8000/src/index.html`

### Opción 3: Live Server (VS Code)

1. Instalar extensión "Live Server" en VS Code
2. Abrir el archivo `src/index.html`
3. Click derecho y seleccionar "Open with Live Server"

## Cómo Usar la Aplicación

### Flujo Básico

**1. Explorar vehículos (sin login)**

Al abrir la app, verás el Home con vehículos destacados. Puedes:
- Ver todos los autos en el listado
- Usar los filtros de búsqueda (marca, precio, año)
- Click en "Ver detalle" para ver información completa de cada vehículo

**2. Ver detalle de un vehículo**

La página de detalle es pública y muestra:
- Fotos del vehículo
- Precio y puntuación IA
- Características técnicas (año, km, transmisión, combustible)
- Datos del vendedor (nombre, tipo, verificación)
- Análisis IA con recomendaciones

**3. Interactuar (requiere login)**

Las siguientes acciones piden autenticación:
- Guardar en favoritos (❤️)
- Comparar vehículos (↔)
- Contactar vendedor (💬)
- Hacer oferta (💰)

Al intentar cualquier acción, se abre el modal de login/register.

**4. Crear cuenta / Ingresar**

En el modal de login:
- Ingresar tu email
- Click en "Continuar"
- Para acceso de administrador, usar email: `admin@driveroom.com` o cualquier email que contenga "admin"

El sistema detecta automáticamente si el usuario es administrador.

**5. Elegir rol**

Después del login, se muestra la página de selección de rol:
- **Comprador**: Para quienes buscan comprar un auto
- **Vendedor**: Para quienes desean publicar y vender
- **Administrador**: Solo visible si el email contiene "admin"

**6. Perfil y Dashboard**

Según el rol elegido:
- Completar el perfil correspondiente
- Acceder al dashboard con herramientas específicas del rol

### Funcionalidades por Rol

#### Comprador

- Recomendaciones personalizadas de la IA
- Búsqueda avanzada con lenguaje natural
- Guardar favoritos
- Comparar vehículos
- Simulador de costo mensual
- Alertas de nuevas publicaciones

#### Vendedor

- Publicar vehículos con asistencia IA
- Gestión de leads y consultas
- Optimización de publicaciones (fotos, precio)
- Análisis de mercado y competencia
- Respuestas automáticas con IA

#### Administrador

- Panel de control ejecutivo
- Gestión de usuarios y publicaciones
- Moderación de contenido
- Métricas y analytics
- Configuración del motor IA
- Alertas de fraude y anomalías

## Rutas Disponibles

| Ruta | Descripción | Requiere Login |
|------|-------------|----------------|
| `#home` | Home público con vehículos | No |
| `#car-detail/{id}` | Detalle de vehículo | No |
| `#role` | Selección de rol | Sí |
| `#menu-buyer` | Dashboard comprador | Sí |
| `#menu-seller` | Dashboard vendedor | Sí |
| `#menu-admin` | Dashboard admin | Sí (admin) |
| `#profile-buyer` | Perfil comprador | Sí |
| `#profile-seller` | Perfil vendedor | Sí |

## Agregar Más Vehículos

Los vehículos están definidos en el archivo `src/js/app.js`, en la constante `CARS_DATA`.

Para agregar un nuevo vehículo, agregar un objeto al array:

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
  seller: {
    name: 'Nombre del vendedor',
    type: 'particular' o 'agencia',
    verified: true o false,
    phone: '+54 9 351 ...'
  }
}
```

**Nota**: El `id` debe ser único y creciente.

## Personalizar Estilos

### Colores Principales

Los colores están definidos en `src/css/components/base.css`:

```css
:root {
  --bg: #090909;           /* Fondo principal */
  --panel: #111111;        /* Paneles */
  --text: #f8fafc;        /* Texto principal */
  --muted: rgba(248, 250, 252, 0.68); /* Texto secundario */
  --orange: #f97316;      /* Color principal (naranja) */
  --white: #ffffff;
  --dark-text: #111111;
}
```

### Tipografías

Las fuentes utilizadas son:
- **Manrope**: Texto general
- **Space Grotesk**: Títulos y headings

Se cargan desde Google Fonts automáticamente en `styles.css`.

## Troubleshooting (Problemas Comunes)

### La página aparece en blanco

1. Verificar que el servidor HTTP esté ejecutándose
2. Usar Ctrl+Shift+R para hard refresh
3. Verificar la consola del navegador (F12) para errores

### No se cargan los estilos

1. Verificar que exista el archivo `src/css/styles.css`
2. Verificar la consola para errores 404

### Los vehículos no aparecen

1. Verificar que el archivo `src/js/app.js` esté cargando correctamente
2. Revisar la consola del navegador para errores JavaScript

### El login no funciona

1. Verificar que localStorage esté habilitado en el navegador
2. Probar con email de prueba: cualquier email funciona
3. Para admin: usar email con "admin" (ej: admin@test.com)

### Error "CORS" al cargar vistas

Este proyecto funciona mejor con un servidor HTTP local (python o http-server). No funcionará abriendo el archivo directamente con doble click.

## Notas Técnicas

### Diseño Responsive

- Mobile first
- Breakpoints: 480px, 600px, 768px, 900px, 1200px
- Grid adaptable para listados de vehículos

### Persistencia de Datos

- Sesión de usuario en localStorage (`driveroom_session`)
- Datos de vehículos hardcodeados en `CARS_DATA`
- No requiere backend - todo funciona en el cliente

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
