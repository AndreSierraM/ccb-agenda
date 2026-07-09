import { useState } from "react";
import { TRAMITES, TIPOS_DOC, HORAS } from "./data";
import "./App.css";

const logo = "/logo-ccb.svg";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

const VACIO = {
  nombre: "",
  tipo_doc: TIPOS_DOC[0],
  num_doc: "",
  correo: "",
  telefono: "",
  tramite: TRAMITES[0],
  fecha: "",
  hora: HORAS[0],
  notas: "",
};

export default function App() {
  const [f, setF] = useState(VACIO);
  const [estado, setEstado] = useState("idle"); // idle | enviando | ok
  const [err, setErr] = useState("");
  const [cita, setCita] = useState(null);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.correo)) return setErr("Correo electrónico inválido.");
    if (!/^\d{7,10}$/.test(f.telefono)) return setErr("Teléfono inválido (7 a 10 dígitos).");
    if (!f.fecha) return setErr("Selecciona una fecha.");
    const dow = new Date(f.fecha + "T00:00").getDay();
    if (dow === 0 || dow === 6) return setErr("Solo hay atención de lunes a viernes.");

    setEstado("enviando");
    try {
      const r = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await r.json();
      if (!r.ok) {
        setEstado("idle");
        return setErr(data.error || "No se pudo agendar. Intenta de nuevo.");
      }
      setCita(data.cita);
      setEstado("ok");
    } catch {
      setEstado("idle");
      setErr("Error de conexión. Intenta de nuevo.");
    }
  }

  function nueva() {
    setF(VACIO);
    setCita(null);
    setErr("");
    setEstado("idle");
  }

  return (
    <div className="page">
      <header className="topbar">
        <img src={logo} alt="Cámara de Comercio de Bogotá" className="logo" />
        <span className="topbar-sub">Agendamiento de citas</span>
      </header>

      <main className="wrap">
        {estado === "ok" ? (
          <Confirmacion cita={cita} onNueva={nueva} />
        ) : (
          <>
            <div className="intro">
              <h1>Agenda tu cita</h1>
              <p>
                Solicita tu cita para trámites en la Cámara de Comercio de Bogotá.
                Atención de lunes a viernes, 8:00 a. m. a 5:00 p. m.
              </p>
            </div>

            <form className="card" onSubmit={submit}>
              <fieldset disabled={estado === "enviando"}>
                <div className="seccion">
                  <span className="seccion-tit">Tus datos</span>

                  <label className="field">
                    <span>Nombre completo</span>
                    <input value={f.nombre} onChange={set("nombre")} required maxLength={120}
                      placeholder="Ej. Ana María Rodríguez" />
                  </label>

                  <div className="row">
                    <label className="field">
                      <span>Tipo de documento</span>
                      <div className="select">
                        <select value={f.tipo_doc} onChange={set("tipo_doc")}>
                          {TIPOS_DOC.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </label>
                    <label className="field">
                      <span>Número de documento</span>
                      <input value={f.num_doc} onChange={set("num_doc")} required maxLength={20}
                        inputMode="numeric" placeholder="1234567890" />
                    </label>
                  </div>

                  <div className="row">
                    <label className="field">
                      <span>Correo electrónico</span>
                      <input type="email" value={f.correo} onChange={set("correo")} required maxLength={120}
                        placeholder="tucorreo@ejemplo.com" />
                    </label>
                    <label className="field">
                      <span>Teléfono / celular</span>
                      <input value={f.telefono} onChange={set("telefono")} required maxLength={15}
                        inputMode="tel" placeholder="3001234567" />
                    </label>
                  </div>
                </div>

                <div className="seccion">
                  <span className="seccion-tit">Detalles de la cita</span>

                  <label className="field">
                    <span>Tipo de trámite</span>
                    <div className="select">
                      <select value={f.tramite} onChange={set("tramite")}>
                        {TRAMITES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <div className="row">
                    <label className="field">
                      <span>Fecha preferida</span>
                      <input type="date" min={hoyISO()} value={f.fecha} onChange={set("fecha")} required />
                    </label>
                    <label className="field">
                      <span>Hora preferida</span>
                      <div className="select">
                        <select value={f.hora} onChange={set("hora")}>
                          {HORAS.map((h) => (
                            <option key={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </label>
                  </div>

                  <label className="field">
                    <span>Notas (opcional)</span>
                    <textarea value={f.notas} onChange={set("notas")} rows={2} maxLength={500}
                      placeholder="Detalles del trámite…" />
                  </label>
                </div>

                {err && <p className="error">{err}</p>}
                <button className="primary" type="submit">
                  {estado === "enviando" ? "Agendando…" : "Solicitar cita"}
                </button>
              </fieldset>
            </form>
          </>
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

function Confirmacion({ cita, onNueva }) {
  return (
    <div className="card conf">
      <div className="check">✓</div>
      <h1>¡Cita solicitada!</h1>
      <p>Guarda tu código de confirmación. Recibirás la confirmación final en tu correo.</p>
      <div className="codigo-box">{cita.codigo}</div>
      <dl>
        <div>
          <dt>Trámite</dt>
          <dd>{cita.tramite}</dd>
        </div>
        <div>
          <dt>Fecha y hora</dt>
          <dd>
            {cita.fecha} · {cita.hora}
          </dd>
        </div>
      </dl>
      <button className="primary" onClick={onNueva}>
        Agendar otra cita
      </button>
    </div>
  );
}
