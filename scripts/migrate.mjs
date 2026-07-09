// Crea la tabla `citas` en Supabase Postgres. Uso: node scripts/migrate.mjs
// Lee POSTGRES_URL_NON_POOLING de .env.local
import { readFileSync } from "node:fs";
import pg from "pg";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const conn = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL;
if (!conn) throw new Error("Falta POSTGRES_URL_NON_POOLING en .env.local");

const sql = `
create table if not exists public.citas (
  id           uuid primary key default gen_random_uuid(),
  codigo       text unique not null,
  nombre       text not null,
  tipo_doc     text not null,
  num_doc      text not null,
  correo       text not null,
  telefono     text not null,
  tramite      text not null,
  sede         text not null,
  sede_nombre  text,
  fecha        date not null,
  hora         text not null,
  notas        text,
  estado       text not null default 'solicitada',
  created_at   timestamptz not null default now()
);
alter table public.citas enable row level security;
-- Sin políticas para anon: solo la service_role (backend) puede leer/escribir.
`;

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query(sql);
const { rows } = await client.query("select count(*)::int as n from public.citas");
console.log("OK tabla citas lista. filas =", rows[0].n);
await client.end();
