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

La presentación pública del proyecto está en `docs/`. GitHub Pages publica
`main` desde la carpeta `/docs`, por lo que cada actualización de esos archivos
en `main` se refleja automáticamente en el sitio.

URL: https://miguelangel45.github.io/jack-crm/

GitHub Pages solo sirve contenido estático. El inicio de sesión, las rutas API,
los webhooks y las integraciones de `crm-operativo/` requieren un servidor para
funcionar y no forman parte de esta publicación.

## Arquitectura

La UI vive en `src/app`, los tipos de dominio en `src/domain` y los datos de ejemplo en `src/lib`.

## Próximos puntos de integración

- `src/lib/auth`: sesión, usuarios y control de acceso.
- `src/lib/db`: cliente PostgreSQL/Supabase y repositorios.
- `src/domain`: contratos compartidos para clientes, contactos, tickets y métricas.
