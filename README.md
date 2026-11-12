# CRM Operativo

CRM operativo para atender conversaciones y reclamaciones de Facebook, Instagram y Mercado Libre con métricas de servicio, panel de SLA y flujo de soporte.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- ESLint
- npm

## Alcance actual

- Integración de canales: Facebook, Instagram, Mercado Libre
- Dashboard de métricas del servicio
- Gestión de reclamaciones
- Base de dominio y estructura inicial del proyecto
- Enfoque SDD con diseño orientado a especificación y contratos

Temu queda fuera del alcance del proyecto en esta fase y no está activado en la base del repositorio.

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Publicación en GitHub Pages

El workflow `.github/workflows/pages.yml` se ejecuta con cada push a `main` y
publica una exportación estática de `crm-operativo/` en GitHub Pages. La barra
superior muestra el commit publicado. También se puede ejecutar manualmente
desde la pestaña Actions.

URL: https://miguelangel45.github.io/jack-crm/

La exportación usa datos de ejemplo para el dashboard, inbox, tickets e
integraciones. GitHub Pages solo sirve contenido estático: el inicio de sesión,
las rutas API, los webhooks y las integraciones reales requieren un servidor.
Los cambios en la interfaz de `crm-operativo/` aparecen en la siguiente
publicación; otros cambios en el repositorio disparan una nueva compilación y
actualizan el identificador de versión mostrado en la página.

## Arquitectura

La UI vive en `src/app`, los tipos de dominio en `src/domain` y los datos de ejemplo en `src/lib`.

## Próximos puntos de integración

- `src/lib/auth`: sesión, usuarios y control de acceso.
- `src/lib/db`: cliente PostgreSQL/Supabase y repositorios.
- `src/domain`: contratos compartidos para clientes, contactos, tickets y métricas.
