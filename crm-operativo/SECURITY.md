# Seguridad y estado de preparación

## Protecciones incorporadas

- Las API del CRM validan una cookie de sesión firmada con HMAC; la cookie es `HttpOnly`, `SameSite=Strict`, de corta duración y `Secure` en producción. Cambiar un rol en `localStorage` no cambia el rol firmado que autorizan las API.
- El login rechaza solicitudes de origen cruzado, JSON inesperado y cuerpos grandes; incorpora un límite de intentos en memoria como defensa complementaria.
- Las cabeceras HTTP incluyen protección frente a MIME sniffing, clickjacking y filtrado excesivo del referrer; HSTS se agrega en producción.
- Las tablas Supabase quedan con RLS activo y sin permisos para `anon` ni `authenticated`. El servidor consulta usando `SUPABASE_SERVICE_ROLE_KEY`, que nunca debe exponerse en código cliente.
- Se eliminaron usuarios demo con contraseñas en claro del SQL inicial. El webhook de Meta verifica HMAC antes de encolar eventos.

## Bloqueos antes de clientes o producción

1. **Bloqueo urgente de dependencia:** el proyecto usa Next.js `14.2.15`, afectado por la vulnerabilidad de denegación de servicio de App Router CVE-2025-55184/CVE-2025-67779. Next.js indica que la rama 14 requiere al menos `14.2.35`; actualizar y volver a auditar dependencias antes de exponer el servicio. [Aviso oficial](https://nextjs.org/blog/security-update-2025-12-11).
2. **No hay proveedor de identidad de producción implementado.** Las cuentas demo solo autentican en desarrollo; en producción el login falla de forma cerrada. Integra Supabase Auth/SSO o un proveedor OIDC antes de invitar clientes, implementando alta, recuperación, MFA, revocación y asignación de roles desde metadatos confiables del servidor.
3. **No hay aislamiento por organización.** El esquema aún no vincula registros a un tenant; el cliente service role puede acceder a todas las filas. Si será un SaaS multiempresa, añade tenant_id, políticas RLS específicas y valida el tenant en cada operación antes de alojar datos de distintos clientes juntos.
4. Configura `CRM_SESSION_SECRET` con al menos 32 bytes aleatorios mediante el gestor de secretos del host. No uses el ejemplo ni lo guardes en Git. Rotarlo invalida todas las sesiones.
5. Aplica y revisa `supabase/schema.sql` en staging antes de producción. El script elimina las cuentas demo iniciales conocidas. Verifica también que la clave service role solo exista en el entorno servidor y rota claves si alguna vez fueron compartidas.
6. El límite de login en memoria no es suficiente para múltiples instancias. Configura rate limiting en WAF/proxy y asegúrate de que el proxy sobrescriba `x-real-ip` (no confíes en cabeceras reenviadas arbitrarias).
7. Mercado Libre no documenta una firma criptográfica en su callback estándar: `application_id` es público y se puede falsificar. Protege el endpoint con WAF/rate limits; el worker debe consultar el recurso usando OAuth del vendedor y validar que pertenece a la cuenta esperada antes de modificar datos.
8. Implementa auditoría, alertas, backups, recuperación, política de retención y pruebas de seguridad antes del uso real. Los datos y métricas actuales del dashboard siguen siendo de demostración; aún falta una CSP endurecida.

No se debe considerar este CRM listo para producción por tener las protecciones listadas; la identidad de clientes, el procesamiento completo de integraciones y la operación segura aún requieren implementación y configuración.
