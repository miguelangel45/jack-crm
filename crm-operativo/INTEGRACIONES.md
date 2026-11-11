# Integraciones y webhooks

## Preparación

1. Configura `.env.local` a partir de `.env.example`. No subas secretos a Git ni compartas `SUPABASE_SERVICE_ROLE_KEY`.
2. Aplica `supabase/schema.sql` al proyecto Supabase. La tabla `crm_webhook_events` utiliza RLS y tiene una clave única por proveedor/evento.
3. Publica la aplicación con HTTPS antes de registrar las URL de callback.

## Meta (Facebook e Instagram)

- Callback: `GET/POST https://<dominio>/api/webhooks/meta`.
- La verificación GET comprueba `META_WEBHOOK_VERIFY_TOKEN` y devuelve `hub.challenge`.
- En POST se valida `X-Hub-Signature-256` con HMAC-SHA256 y `META_APP_SECRET`, comparando firmas en tiempo constante.
- Payloads JSON de más de 1 MiB o con firma incorrecta se rechazan.

## Mercado Libre

- Callback: `POST https://<dominio>/api/webhooks/mercadolibre`.
- Se comprueba `application_id` contra `MERCADOLIBRE_APP_ID`, además de validar `topic` y `resource`.
- El callback estándar documentado por Mercado Libre no ofrece un secreto de cabecera configurable ni una firma HMAC para validar el origen. El ID de aplicación no es un secreto y esta comparación no autentica criptográficamente al remitente; protege el endpoint con HTTPS y límites de tasa en el proxy/WAF.
- La respuesta exitosa es HTTP 200, acorde con el requisito de recepción rápida de Mercado Libre.

## Estado del procesamiento

Ambos webhooks guardan los payloads verificados en `crm_webhook_events` con estado `pending`. La restricción única permite ignorar reintentos duplicados; si Supabase no está disponible, se devuelve 503 para que la plataforma reintente.

Esto implementa una bandeja persistente de entrada, no el procesamiento final. Aún hace falta un worker que consuma los eventos, consulte el recurso de Mercado Libre cuando aplique, normalice conversaciones/mensajes/órdenes, registre errores con reintentos y marque el estado como `processed` o `failed`.
