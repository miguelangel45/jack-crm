# CRM Operativo

- Use TypeScript and the Next.js App Router.
- Keep CRM domain types and data access separate from presentation components.
- Prefer server components by default; add client components only for interactive state.
- Keep future authentication and PostgreSQL/Supabase integrations behind `src/lib` services.
- Run `npm run lint` and `npm run build` before shipping changes.
