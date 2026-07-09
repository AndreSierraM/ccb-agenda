import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const TIPOS_DOC = ["Cédula de Ciudadanía", "Cédula de Extranjería", "NIT", "Pasaporte"];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TEL = /^\d{7,10}$/;

// Límites de longitud por campo (anti-DoS / bloat)
const MAX = { nombre: 120, num_doc: 20, correo: 120, telefono: 15, tramite: 140, sede_nombre: 120, notas: 500 };

// Limpia: fuerza string, elimina control chars y < > (anti stored-XSS), recorta.
function clean(v) {
  if (typeof v !== "string") return "";
  return v.replace(/[\p{Cc}<>]/gu, "").trim();
}

const ALFA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function codigoCita() {
  let c = "";
  for (let i = 0; i < 6; i++) c += ALFA[Math.floor(Math.random() * ALFA.length)];
  return "CCB-" + c;
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  const b = req.body || {};
  const nombre = clean(b.nombre);
  const tipo_doc = clean(b.tipo_doc);
  const num_doc = clean(b.num_doc);
  const correo = clean(b.correo).toLowerCase();
  const telefono = clean(b.telefono);
  const tramite = clean(b.tramite);
  const sede = clean(b.sede);
  const sede_nombre = clean(b.sede_nombre);
  const fecha = clean(b.fecha);
  const hora = clean(b.hora);
  const notas = clean(b.notas);

  // Presencia
  if (!nombre || !num_doc || !tramite || !fecha || !hora)
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  // Longitud
  for (const [k, v] of Object.entries({ nombre, num_doc, correo, telefono, tramite, sede_nombre, notas }))
    if (v.length > MAX[k]) return res.status(400).json({ error: `El campo ${k} es demasiado largo.` });
  // Formato
  if (!TIPOS_DOC.includes(tipo_doc)) return res.status(400).json({ error: "Tipo de documento inválido." });
  if (!EMAIL.test(correo)) return res.status(400).json({ error: "Correo inválido." });
  if (!TEL.test(telefono)) return res.status(400).json({ error: "Teléfono inválido." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha < hoyISO())
    return res.status(400).json({ error: "La fecha no puede ser pasada." });
  const dow = new Date(fecha + "T00:00").getDay();
  if (dow === 0 || dow === 6)
    return res.status(400).json({ error: "Solo hay atención de lunes a viernes." });

  const fila = {
    nombre, tipo_doc, num_doc, correo, telefono, tramite,
    sede: sede || null, sede_nombre: sede_nombre || null,
    fecha, hora, notas: notas || null,
  };

  // Inserta con reintento ante colisión de código (unique_violation 23505)
  for (let intento = 0; intento < 5; intento++) {
    const codigo = codigoCita();
    const { data, error } = await supabase
      .from("citas")
      .insert({ ...fila, codigo })
      .select("codigo, tramite, sede_nombre, fecha, hora")
      .single();

    if (!error) return res.status(201).json({ ok: true, cita: data });
    if (error.code !== "23505") {
      console.error("insert citas:", error.message);
      return res.status(500).json({ error: "No se pudo guardar la cita. Intenta de nuevo." });
    }
  }
  return res.status(500).json({ error: "No se pudo generar la cita. Intenta de nuevo." });
}
