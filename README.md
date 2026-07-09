# CCB · Agendamiento de citas

App web (React + Vite) para **solicitar una cita** de trámites de la **Cámara de Comercio de Bogotá** (renovación de matrícula, certificados, constitución de empresa, etc.). Sin login: un único formulario → confirmación con código. Backend serverless que persiste en **Supabase**.

> Demo no oficial. Los trámites reales se hacen en https://agendamiento.ccb.org.co

## Funcionalidad

- **Formulario de agendamiento** (una sola pantalla): datos de contacto + tipo de trámite + fecha (días hábiles, no pasadas) + hora (franjas 8:00–17:00).
- **Backend** `POST /api/citas` (Vercel serverless) — valida y guarda la cita en Postgres/Supabase con la `service_role` key (solo servidor). Devuelve código `CCB-XXXXXX`.
- Seguridad: RLS activada sin políticas públicas (solo el backend accede), validación de longitud, saneo anti-XSS (`<>` + control chars), reintento ante colisión de código.

Datos de trámites en `src/data.js`. Esquema de la tabla en `scripts/migrate.mjs`.

## Arquitectura

```
Frontend (React/Vite)  ──POST /api/citas──▶  Serverless (api/citas.js)
                                                    │ service_role
                                                    ▼
                                            Supabase Postgres (tabla citas, RLS)
```

## Desarrollo

```bash
npm install
npm run dev              # http://localhost:5173
node scripts/migrate.mjs # crea la tabla citas (lee .env.local)
npm run build            # dist/
```

Variables de entorno (inyectadas por la integración Supabase de Vercel, en `.env.local`):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_URL_NON_POOLING`.

## Deploy

```bash
vercel deploy --prod
```

**Live:** https://agendamientoccb.vercel.app

## Stack

React 19 · Vite 8 · Vercel Functions · Supabase (Postgres) · CSS plano (cero deps UI).
