# CCB · Agendamiento de citas

App web (React + Vite) donde una persona **se registra** y **solicita una cita** para trámites de la **Cámara de Comercio de Bogotá** (renovación de matrícula, certificados, constitución de empresa, etc.).

> Demo no oficial. Los trámites reales se hacen en https://agendamiento.ccb.org.co

## Funcionalidad

- **Registro** de usuario (nombre, tipo/número de documento, correo, teléfono) con validación.
- **Solicitud de cita**: tipo de trámite, sede, fecha (solo días hábiles, no pasadas) y hora (franjas 8:00–17:00).
- **Mis citas**: lista con código de confirmación y opción de cancelar.
- Persistencia local (`localStorage`) — sin backend, MVP desplegable al instante.

Datos de trámites y sedes en `src/data.js`.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

## Deploy

Desplegado en Vercel (framework Vite autodetectado):

```bash
vercel deploy --prod
```

**Live:** https://ccb-agenda-b9z4dsmqg-cabalastechhub.vercel.app

## Stack

React 19 · Vite 8 · CSS plano (cero dependencias UI) · Vercel.
