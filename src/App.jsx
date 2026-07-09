import { useState, useEffect } from "react";
import { TRAMITES, SEDES, TIPOS_DOC, HORAS } from "./data";
import "./App.css";

const LS_USER = "ccb_user";
const LS_CITAS = "ccb_citas";

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function codigoCita() {
  return "CCB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [user, setUser] = useState(() => load(LS_USER, null));
  const [citas, setCitas] = useState(() => load(LS_CITAS, []));
  const [vista, setVista] = useState("agendar");

  useEffect(() => {
    localStorage.setItem(LS_USER, JSON.stringify(user));
  }, [user]);
  useEffect(() => {
    localStorage.setItem(LS_CITAS, JSON.stringify(citas));
  }, [citas]);

  if (!user) return <Registro onRegistro={setUser} />;

  const misCitas = citas.filter((c) => c.usuario === user.correo);

  return (
    <div className="app">
      <Header user={user} onSalir={() => setUser(null)} />
      <nav className="tabs">
        <button className={vista === "agendar" ? "on" : ""} onClick={() => setVista("agendar")}>
          Agendar cita
        </button>
        <button className={vista === "mis" ? "on" : ""} onClick={() => setVista("mis")}>
          Mis citas {misCitas.length > 0 && <span className="badge">{misCitas.length}</span>}
        </button>
      </nav>
      <main>
        {vista === "agendar" ? (
          <Agendar
            user={user}
            onAgendada={(cita) => {
              setCitas((cs) => [cita, ...cs]);
              setVista("mis");
            }}
          />
        ) : (
          <MisCitas
            citas={misCitas}
            onCancelar={(id) => setCitas((cs) => cs.filter((c) => c.id !== id))}
          />
        )}
      </main>
      <footer>
        Demo no oficial · Trámites reales en{" "}
        <a href="https://agendamiento.ccb.org.co" target="_blank" rel="noreferrer">
          agendamiento.ccb.org.co
        </a>
      </footer>
    </div>
  );
}

function Header({ user, onSalir }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo">CCB</div>
        <div>
          <h1>Cámara de Comercio de Bogotá</h1>
          <p>Agendamiento de citas y trámites</p>
        </div>
      </div>
      <div className="userbox">
        <span>{user.nombre.split(" ")[0]}</span>
        <button className="link" onClick={onSalir}>
          Salir
        </button>
      </div>
    </header>
  );
}

function Registro({ onRegistro }) {
  const [f, setF] = useState({
    nombre: "",
    tipoDoc: TIPOS_DOC[0],
    numDoc: "",
    correo: "",
    telefono: "",
  });
  const [err, setErr] = useState("");

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    if (!f.nombre.trim() || !f.numDoc.trim()) return setErr("Nombre y documento son obligatorios.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.correo)) return setErr("Correo electrónico inválido.");
    if (!/^\d{7,10}$/.test(f.telefono)) return setErr("Teléfono inválido (7 a 10 dígitos).");
    onRegistro(f);
  }

  return (
    <div className="auth">
      <div className="card">
        <div className="logo big">CCB</div>
        <h1>Regístrate</h1>
        <p className="sub">Crea tu perfil para solicitar una cita en la Cámara de Comercio de Bogotá.</p>
        <form onSubmit={submit}>
          <label>
            Nombre completo
            <input value={f.nombre} onChange={set("nombre")} placeholder="Ej. Ana María Rodríguez" />
          </label>
          <div className="row">
            <label>
              Tipo de documento
              <select value={f.tipoDoc} onChange={set("tipoDoc")}>
                {TIPOS_DOC.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Número de documento
              <input value={f.numDoc} onChange={set("numDoc")} placeholder="1234567890" />
            </label>
          </div>
          <label>
            Correo electrónico
            <input value={f.correo} onChange={set("correo")} placeholder="tucorreo@ejemplo.com" />
          </label>
          <label>
            Teléfono / celular
            <input value={f.telefono} onChange={set("telefono")} placeholder="3001234567" />
          </label>
          {err && <p className="error">{err}</p>}
          <button className="primary" type="submit">
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}

function Agendar({ user, onAgendada }) {
  const [f, setF] = useState({
    tramite: TRAMITES[0],
    sede: SEDES[0].id,
    fecha: "",
    hora: HORAS[0],
    notas: "",
  });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    if (!f.fecha) return setErr("Selecciona una fecha.");
    if (f.fecha < hoyISO()) return setErr("La fecha no puede ser en el pasado.");
    const d = new Date(f.fecha + "T00:00");
    if (d.getDay() === 0 || d.getDay() === 6) return setErr("Solo hay atención de lunes a viernes.");
    setErr("");
    const sede = SEDES.find((s) => s.id === f.sede);
    onAgendada({
      id: codigoCita(),
      usuario: user.correo,
      ...f,
      sedeNombre: sede.nombre,
      sedeDir: sede.dir,
      creada: new Date().toISOString(),
    });
  }

  return (
    <div className="card wide">
      <h2>Solicitar cita</h2>
      <p className="sub">
        {user.nombre} · {user.tipoDoc} {user.numDoc}
      </p>
      <form onSubmit={submit}>
        <label>
          Tipo de trámite
          <select value={f.tramite} onChange={set("tramite")}>
            {TRAMITES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Sede
          <select value={f.sede} onChange={set("sede")}>
            {SEDES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} — {s.dir}
              </option>
            ))}
          </select>
        </label>
        <div className="row">
          <label>
            Fecha preferida
            <input type="date" min={hoyISO()} value={f.fecha} onChange={set("fecha")} />
          </label>
          <label>
            Hora preferida
            <select value={f.hora} onChange={set("hora")}>
              {HORAS.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Notas (opcional)
          <textarea value={f.notas} onChange={set("notas")} rows={3} placeholder="Detalles del trámite…" />
        </label>
        {err && <p className="error">{err}</p>}
        <button className="primary" type="submit">
          Confirmar cita
        </button>
      </form>
    </div>
  );
}

function MisCitas({ citas, onCancelar }) {
  if (citas.length === 0)
    return (
      <div className="card">
        <h2>Mis citas</h2>
        <p className="empty">No tienes citas agendadas todavía.</p>
      </div>
    );

  return (
    <div className="lista">
      {citas.map((c) => (
        <div className="cita" key={c.id}>
          <div className="cita-head">
            <span className="codigo">{c.id}</span>
            <button className="link danger" onClick={() => onCancelar(c.id)}>
              Cancelar
            </button>
          </div>
          <h3>{c.tramite}</h3>
          <dl>
            <div>
              <dt>Sede</dt>
              <dd>{c.sedeNombre}</dd>
            </div>
            <div>
              <dt>Dirección</dt>
              <dd>{c.sedeDir}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>
                {c.fecha} · {c.hora}
              </dd>
            </div>
            {c.notas && (
              <div>
                <dt>Notas</dt>
                <dd>{c.notas}</dd>
              </div>
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}
