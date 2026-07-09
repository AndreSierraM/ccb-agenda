import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const TIPOS_DOC = ["Cédula de Ciudadanía", "Cédula de Extranjería", "NIT", "Pasaporte"];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TEL = /^\d{7,10}$/;

function codigoCita() {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += s[Math.floor(Math.random() * s.length)];
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
  const clean = (v) => (typeof v === "string" ? v.trim() : "");

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

  // Validación
  if (!nombre || !num_doc || !tramite || !sede || !fecha || !hora)
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  if (!TIPOS_DOC.includes(tipo_doc))
    return res.status(400).json({ error: "Tipo de documento inválido." });
  if (!EMAIL.test(correo)) return res.status(400).json({ error: "Correo inválido." });
  if (!TEL.test(telefono)) return res.status(400).json({ error: "Teléfono inválido." });
  if (fecha < hoyISO()) return res.status(400).json({ error: "La fecha no puede ser pasada." });
  const dow = new Date(fecha + "T00:00").getDay();
  if (dow === 0 || dow === 6)
    return res.status(400).json({ error: "Solo hay atención de lunes a viernes." });

  const codigo = codigoCita();
  const { data, error } = await supabase
    .from("citas")
    .insert({
      codigo,
      nombre,
      tipo_doc,
      num_doc,
      correo,
      telefono,
      tramite,
      sede,
      sede_nombre,
      fecha,
      hora,
      notas: notas || null,
    })
    .select("codigo, tramite, sede_nombre, fecha, hora")
    .single();

  if (error) {
    console.error("insert citas:", error.message);
    return res.status(500).json({ error: "No se pudo guardar la cita. Intenta de nuevo." });
  }

  return res.status(201).json({ ok: true, cita: data });
}
