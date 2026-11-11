
Fecha: 2026-08-22
Autor: Equipo de desarrollo
Propósito: Especificar el diseño, arquitectura, contratos y plan de implementación para un CRM que integre canales (Facebook, Instagram y MercadoLibre), soporte métricas de servicio, gestión de reclamaciones y optimización usando un enfoque SDD (Specification-Driven Development).

1. Resumen ejecutivo
- Objetivo: Construir un CRM omnicanal que centralice conversaciones, pedidos y reclamaciones provenientes de Facebook/Instagram (Meta) y MercadoLibre, permita métricas operacionales y automatizaciones, y soporte optimización basada en especificaciones (SDD): contratos API, pruebas de contrato, mock servers y pipelines automatizados.
- Alcance inicial (MVP): ingest y envío de mensajes/ordenes básicos desde Facebook/Instagram y MercadoLibre; tablero de métricas clave; gestión de tickets/reclamaciones; autenticación de usuarios; almacenamiento en Postgres; background jobs para sincronización y retries.
- Decisión de alcance: la integración con Temu queda descartada en esta fase y no forma parte del proyecto activo. Si se reintroduce más adelante, se evaluará como una extensión independiente.

2. Stakeholders
- Equipo de Soporte al Cliente
- Equipo de Operaciones / Fulfillment
- Producto y Dirección
- Equipo de Desarrollo e Infraestructura

3. Requerimientos
3.1 Funcionales
- Conectar y sincronizar mensajes/ordenes/comentarios desde Facebook (Pages/Inbox) y Instagram (Direct/Comentarios) via Meta Graph API.
- Conectar MercadoLibre: órdenes, preguntas, mensajes de compradores y notificaciones de cambios de estado.
- Centralizar conversaciones en un modelo de Conversation/Message vinculado a Contact y Order.
- Crear tickets de reclamaciones con flujo de estados (Nuevo, En Proceso, Pendiente Cliente, Resuelto, Cerrado).
- Asignación automática de tickets mediante reglas basadas en palabra clave, prioridad de canal y SLA.
- Dashboard de métricas: CSAT, Tiempo medio de primera respuesta (FRT), Tiempo medio de resolución (MTTR), Volumen por canal, SLA breaches, Tasa de Reapertura.
- Panel de administración para configurar integraciones, tokens OAuth, reglas de enrutamiento y SLAs.

3.2 No funcionales
- Seguridad: OAuth2 para integraciones externas, encriptación en reposo y tránsito, roles y permisos en la UI.
- Escalabilidad: diseño por microservicios ligeros o modular monolito, colas para procesamiento (RabbitMQ/Redis Streams/Kafka), horizontalmente escalable.
- Observabilidad: logs estructurados, métricas (Prometheus), tracing (OpenTelemetry).
- Disponibilidad: SLA objetivo 99.9% para API interna; tolerancia a fallo de un conector mediante reintentos y fallback.

4. Enfoque SDD (Specification-Driven Development)
- Definición de contratos API antes de la implementación utilizando OpenAPI (REST) y AsyncAPI (webhooks/eventos).
- Pact o similar para pruebas de contrato entre servicios y con terceros cuando sea aplicable.
- Generación de mocks y servidores fake a partir de contratos para permitir desarrollo paralelo frontend/backend y pruebas end-to-end.
- CI pipelines que validen esquemas, ejecuten tests de contrato, integraciones simuladas y despliegues automáticos en staging.

5. Arquitectura propuesta (alta nivel)
- Frontend: React + TypeScript (Vite) con componentes para Inbox, Tickets, Dashboard.
- Backend API: Node.js + TypeScript con NestJS o Fastify (modular, inyección de dependencias) o alternativamente Django/DRF.
- Base de datos relacional: PostgreSQL.
- Cache & pub/sub: Redis (caching, rate limiting, task queue via BullMQ) o RabbitMQ para colas si se prefieren garantías avanzadas.
- Worker(s): Procesamiento de webhooks, polling de APIs, sincronización y tareas asíncronas.
- Storage de archivos: S3-compatible (minio o AWS S3).
- Observability: Prometheus + Grafana, Loki (logs) y Jaeger (tracing).
- CI/CD: GitHub Actions / GitLab CI con etapas: lint, openapi validation, contract tests, unit tests, build, deploy.

6. Componentes y responsabilidades
- Conector Meta (Facebook/Instagram): autenticación OAuth2, renovación de tokens, suscripción a webhooks (messages, comments), normalización de payload a Message model.
- Conector MercadoLibre: OAuth2, notificaciones (orders, questions), polling si aplica, mapeo a Order/Conversation.
- Ingest Service: recibe webhooks o procesa pulls y normaliza datos.
- Orchestration / Router: reglas para enrutamiento y asignación de tickets.
- Ticketing Service: CRUD tickets, SLA timers, escalaciones y plantillas de respuesta.
- Metrics Service: calcula KPIs y expone endpoints para frontend y alertas.
- Auth/Zones: gestión de usuarios y roles (admin, agente, supervisor).

7. Modelo de datos (entidades principales)
- Contact {id, external_ids: [{provider, provider_id}], name, email, phone, created_at, metadata}
- Conversation {id, contact_id, channel, external_conversation_id, assignee_id, status, last_message_at}
- Message {id, conversation_id, direction (in/out), provider, provider_message_id, body, attachments[], received_at}
- Ticket {id, conversation_id, type (reclamo/pregunta), priority, status, sla_deadline, created_by, resolved_at}
- Order {id, external_order_id, provider, status, total, items[], buyer_contact_id}
- Integration {id, provider, credentials, config, last_synced_at}
- Metric/Events stored in time-series or precomputed in metrics table

8. Contratos API (resumen)
8.1 OpenAPI (REST) endpoints sugeridos
- POST /api/v1/webhooks/{provider} — receiver genérico (validación por firma)
- GET /api/v1/conversations — lista con filtros (channel, assignee, status)
- GET /api/v1/conversations/{id}
- POST /api/v1/conversations/{id}/messages — enviar respuesta (encola outbound)
- POST /api/v1/tickets — crear ticket
- PATCH /api/v1/tickets/{id} — actualizar estado
- GET /api/v1/metrics — KPIs con parámetros (desde, hasta, bucket)

8.2 AsyncAPI / Events
- events.inbound.message
- events.inbound.order
- events.ticket.created
- events.ticket.resolved
Estos esquemas se definen en AsyncAPI para generar mocks y consumidor/producer clients.

9. Integraciones detalladas
9.1 Facebook / Instagram (Meta Graph API)
- Requerimientos: Cuenta de desarrollador, App en Meta, permisos: pages_messaging, instagram_basic, pages_manage_metadata, pages_read_engagement según casos.
- Flujo: OAuth para obtener Page tokens; subscribir la App a webhooks (messages, comments, messaging_postbacks); normalizar mensajes y adjuntos.
- Rate limits: documentar límites por API y aplicar backoff exponencial.
- Edge cases: mensajes eliminados, comentarios públicos, attachments grandes.

9.2 MercadoLibre
- Autenticación: OAuth2 (app client_id/secret).
- Notificaciones: MercadoLibre ofrece notificaciones (webhooks) y endpoints para orders, questions y messages.
- Mapeo: Order -> Order entity; Questions/Conversations -> Conversation/Message.

9.3 Extensión futura
- Cualquier nuevo canal adicional debe incorporarse como conector desacoplado o módulo independiente, con contratos OpenAPI/AsyncAPI,validación y pruebas de integración por separado.
- En esta fase no se incluye ningún conector adicional fuera de Meta y MercadoLibre.

10. Gestión de reclamaciones (workflow)
- Creación automática al detectar keywords (reclamo, devolución, faltante) o por acción del agente.
- Estados: New -> In Progress -> Pending Customer -> Escalated -> Resolved -> Closed
- SLA: primera respuesta (FRT) objetivo 2 horas; resolución objetivo 72 horas (configurable por prioridad).
- Escalación: timers que elevan prioridad y notificaciones a supervisores.
- Plantillas de respuesta y macros para acelerar gestión.

11. Métricas de servicio (definiciones)
- FRT (First Response Time): tiempo desde creación de conversación/ticket hasta primera respuesta humana/automática.
- MTTR (Mean Time to Resolve): promedio de tiempo desde apertura hasta resolución.
- CSAT (Customer Satisfaction): porcentaje/score recogido post-cierre.
- SLA Breaches: número y % de tickets que exceden SLA.
- Volume by channel: conteo de conversaciones y tickets por canal.
- Reopen rate: % de tickets reabiertos tras resolución.

12. Optimización (SDD-driven)
- Especificaciones para reglas de enrutamiento y prioridades redactadas como artefactos de SDD (ej. JSON/YAML) que pueden editarse y versionarse.
- Tests automáticos que validan que cambios en reglas no rompan rutas esperadas (contract tests + scenario-based tests).
- Instrumentación para experimentos A/B (p.ej. comparar reglas de asignación automática vs manual) y medir impacto en FRT/MTTR.
- Uso de modelos ML para clasificación de inbound (reclamo vs consulta, priorización) — entrenar con datos históricos anonimizados y exponer como servicio pequeño (predictor).

13. Seguridad y cumplimiento
- Almacenamiento de credenciales seguro (Vault/AWS Secrets Manager).
- Encriptación TLS en tránsito y AES-256 en reposo para datos sensibles.
- Minimizar almacenamiento de datos personales innecesarios (privacy-by-design), soporte para borrado/portabilidad según GDPR/legislaciones aplicables.
- Logs y auditoría para acciones críticas.

14. Observabilidad y Operaciones
- Exponer métricas Prometheus para: queue depths, job failures, webhook latencies, request latencies, error rates.
- Dashboards Grafana para KPIs operacionales.
- Alerting (PagerDuty/opsgenie/Slack) para SLA breaches, worker crashes, error spikes.

15. Estrategia de pruebas
- Unit tests y integration tests.
- Contract tests (Pact) para verificación de integraciones entre servicios y stubs para terceros.
- End-to-end tests en staging contra mock servers generados a partir de OpenAPI/AsyncAPI.

16. CI/CD
- Pipeline: lint -> unit tests -> contract tests -> build -> deploy a staging -> smoke tests -> deploy a producción (manual or automático según políticas).
- Validar cambios en contratos OpenAPI/AsyncAPI: si un cambio rompe compatibilidad, requiere bump de versión y coordinación con consumidores.

17. Infra & despliegue
- Kubernetes (EKS/AKS/GKE) o serverless (Fargate) según preferencia de cliente.
- Terraform para infra como código.

18. Roadmap y entregables (sprint-based)
- Sprint 0 (2 semanas): SDD finalizado, OpenAPI/AsyncAPI inicial, repositorio, scaffolding backend y mocks.
- Sprint 1 (2-3 semanas): Conector Meta: OAuth, webhooks, ingest mensajes; basic Inbox UI.
- Sprint 2 (2-3 semanas): Conector MercadoLibre: ingest orders/messages; mapping orders->tickets.
- Sprint 3 (2 semanas): Ticketing, SLAs, reglas de enrutamiento y dashboard básico de métricas.
- Sprint 4 (2 semanas): contract tests y observabilidad de la capa de integración.
- Sprint 5 (2-3 semanas): Optimización: A/B, predictor ML básico para clasificación, automatizaciones y mejoras UX.

19. Estimación de esfuerzo (grosso modo)
- MVP (Meta + MercadoLibre + ticketing + dashboard): 8-12 semanas con equipo pequeño (PM, 2 devs backend, 1 dev frontend, 1 SRE/DevOps).
- Cualquier extensión de nuevos canales queda fuera del alcance del MVP actual.

20. Riesgos y mitigaciones
- Tokens y permisos: revocación de permisos por parte de plataformas — mitigar con manejo de errores y UX para re-auth.
- Extensiones de nuevos canales: deben tratarse como módulos adicionales con requisitos de seguridad y validación separados.
- Escalabilidad ante picos: diseñar colas y throttling desde inicio.

21. Supuestos
- Se dispone de cuentas de desarrollador y permisos en Meta y MercadoLibre.
- Equipo aceptará enfoque spec-first y participará en validación de contratos.

22. Siguientes pasos (acción inmediata)
- Revisar y aprobar este SDD con stakeholders.
- Crear repositorio y pipeline CI con validación OpenAPI/AsyncAPI.
- Generar mocks y comenzar scaffolding del backend y del conector Meta (prioridad 1).

Apéndice A: Esquemas ejemplo (resumen)
- OpenAPI: definir /conversations, /messages, /tickets, /metrics.
- AsyncAPI: events.inbound.message, events.ticket.created.

Apéndice B: Notas de extensión
- Cualquier nuevo conector de canal debe implementarse como módulo independiente con selector de proveedor, estado de conexión, webhooks y validación de contratos.

Contacto: responder a este documento con comentarios o solicitar que se genere el SDD en formato más formal (PDF) o que se cree el scaffold del backend/frontend.
