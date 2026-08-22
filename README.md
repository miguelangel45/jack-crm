# CRM Operativo

MVP de CRM web para gestionar clientes, contactos, oportunidades y tareas.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- ESLint
- npm

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Arquitectura

La UI vive en `src/app` y los tipos/datos iniciales de dominio en `src/domain`. La persistencia está intencionalmente aislada para poder incorporar autenticación y PostgreSQL/Supabase mediante repositorios o servicios sin acoplarlos a los componentes de presentación.

## Próximos puntos de integración

- `src/lib/auth`: sesión, usuarios y control de acceso.
- `src/lib/db`: cliente PostgreSQL/Supabase y repositorios.
- `src/domain`: contratos compartidos para clientes, contactos, oportunidades y tareas.
