import { useEffect, useMemo, useState } from "react";
import Head from "next/head";

const SOURCE_LABELS = {
  "Revisión avances": "Informes PROYECTA",
  "Informes semanales RUHA": "Informes semanales RUHA",
  Reuniones_supervisión: "Reuniones supervisión",
  CARTAS: "Enviado PROYECTA",
  "Informes SDD": "Informes SDD",
  "Informes RANF_RANT": "Informes RAN",
  "Cartas recibidas": "Recibido PROYECTA",
};

const TABS = [
  {
    key: "avances",
    label: "Informes PROYECTA",
    source: "Revisión avances",
    tone: "amber",
    filters: [{ key: "cutoffDate", label: "Fecha emisión", type: "date" }],
    addFields: [
      { key: "code", label: "Código", required: true },
      { key: "cutoffDate", label: "Fecha emisión", type: "date", required: true },
      { key: "annexTitle", label: "Nombre de la carpeta de anexos (opcional)" },
    ],
    columns: [
      { header: "Código", render: (item) => item.code },
      { header: "Fecha emisión", render: (item) => item.cutoffDate },
      { header: "Documento", render: (item) => item.title },
      {
        header: "Anexos",
        render: (item, ctx) =>
          item.annexId ? (
            <button className="link-btn" onClick={() => ctx.openAnnexes(item)}>
              Ver anexos
            </button>
          ) : (
            "—"
          ),
      },
    ],
  },
  {
    key: "ruha",
    label: "Informes semanales RUHA",
    source: "Informes semanales RUHA",
    tone: "teal",
    filters: [{ key: "cutoffDate", label: "Corte", type: "date" }],
    addFields: [
      { key: "code", label: "Código", required: true },
      { key: "cutoffDate", label: "Corte", type: "date", required: true },
      { key: "week", label: "Semana" },
    ],
    columns: [
      { header: "Código", render: (item) => item.code },
      { header: "Corte", render: (item) => item.cutoffDate },
      { header: "Semana", render: (item) => item.week },
      { header: "Documento", render: (item) => item.title },
    ],
  },
  {
    key: "reuniones",
    label: "Reuniones supervisión",
    source: "Reuniones_supervisión",
    tone: "violet",
    filters: [{ key: "date", label: "Fecha reunión", type: "date" }],
    addFields: [
      { key: "code", label: "Código", required: true },
      { key: "date", label: "Fecha reunión", type: "date", required: true },
      { key: "subject", label: "Asunto" },
      { key: "client", label: "Cliente" },
      { key: "contractor", label: "Contratista" },
      { key: "supervision", label: "Supervisión" },
      { key: "projectState", label: "Estado proyecto" },
      { key: "reviewed", label: "Revisado" },
    ],
    columns: [
      { header: "Código", render: (item) => item.code },
      { header: "Fecha reunión", render: (item) => item.date },
      { header: "Asunto", render: (item) => item.subject },
      { header: "Estado proyecto", render: (item) => item.projectState },
      { header: "Revisado", render: (item) => item.reviewed },
    ],
  },
  {
    key: "cartas",
    label: "Enviado PROYECTA",
    source: "CARTAS",
    tone: "coral",
    filters: [
      { key: "number", label: "Nro Avance", type: "select" },
      { key: "date", label: "Fecha", type: "date" },
    ],
    addFields: [
      { key: "code", label: "Código" },
      { key: "date", label: "Fecha", type: "date", required: true },
      { key: "number", label: "Nro Avance", required: true },
      { key: "client", label: "Destinatario" },
    ],
    columns: [
      { header: "Código", render: (item) => item.code },
      { header: "Fecha", render: (item) => item.date },
      { header: "Nro Avance", render: (item) => item.number },
    ],
  },
  {
    key: "cartasRecibidas",
    label: "Recibido PROYECTA",
    source: "Cartas recibidas",
    tone: "lime",
    filters: [
      { key: "number", label: "Avance", type: "select" },
      { key: "date", label: "Fecha", type: "date" },
    ],
    addFields: [
      { key: "code", label: "Código" },
      { key: "date", label: "Fecha", type: "date", required: true },
      { key: "client", label: "Remite" },
      { key: "number", label: "Avance", required: true },
    ],
    columns: [
      { header: "Código", render: (item) => item.code },
      { header: "Fecha", render: (item) => item.date },
      { header: "Remite", render: (item) => item.client },
      { header: "Avance", render: (item) => item.number },
    ],
  },
  {
    key: "sdd",
    label: "Informes SDD",
    source: "Informes SDD",
    tone: "indigo",
    filters: [{ key: "cutoffDate", label: "Corte", type: "date" }],
    addFields: [
      { key: "code", label: "Código", required: true },
      { key: "week", label: "Semana" },
      { key: "cutoffDate", label: "Corte", type: "date", required: true },
    ],
    columns: [
      { header: "Código", render: (item) => item.code },
      { header: "Semana", render: (item) => item.week },
      { header: "Corte", render: (item) => item.cutoffDate },
      { header: "Documento", render: (item) => item.title },
    ],
  },
  {
    key: "ran",
    label: "Informes RAN",
    source: "Informes RANF_RANT",
    tone: "rose",
    filters: [
      { key: "docType", label: "Tipo", type: "select" },
      { key: "number", label: "Informe", type: "select" },
    ],
    addFields: [
      { key: "code", label: "Código", required: true },
      { key: "docType", label: "Tipo", required: true },
      { key: "number", label: "Informe", required: true },
      { key: "date", label: "Fecha", type: "date", required: true },
      { key: "annexTitle", label: "Nombre de la carpeta de anexos (opcional)" },
    ],
    columns: [
      { header: "Código", render: (item) => item.code },
      { header: "Tipo", render: (item) => item.docType },
      { header: "Informe", render: (item) => item.number },
      { header: "Fecha", render: (item) => item.date },
      {
        header: "Anexos",
        render: (item, ctx) =>
          item.annexId ? (
            <button className="link-btn" onClick={() => ctx.openAnnexes(item)}>
              Ver anexos
            </button>
          ) : (
            "—"
          ),
      },
    ],
  },
  {
    key: "hilos",
    label: "Hilos de documentos",
    tone: "sky",
    isThreadView: true,
  },
];

// Convierte "31/07/2026" (formato de Google Sheets) a "2026-07-31" (formato
// de <input type="date">) para poder comparar rangos.
function toIsoDate(value) {
  const match = String(value || "").match(/^([0-3]?\d)\/([01]?\d)\/(\d{4})$/);
  if (!match) return "";
  const [, d, m, y] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// Extrae el número de avance de un documento. Prioriza el campo "number"
// (ya viene directo de la hoja para cartas enviadas/recibidas) y, si no
// existe, busca el patrón "AV_<número>" en el código o el título (usado por
// los informes PROYECTA). Normaliza ceros a la izquierda para que "AV_001"
// y "AV_1" se agrupen en el mismo hilo.
function extractAvanceNumber(item) {
  if (item.number) {
    const digits = String(item.number).match(/\d+/);
    if (digits) return String(parseInt(digits[0], 10));
  }
  const source = `${item.code || ""} ${item.title || ""}`;
  const match = source.match(/AV[_\s-]?(\d+)/i);
  if (match) return String(parseInt(match[1], 10));
  return null;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

// Una etapa del hilo (carta enviada, informe o carta recibida). Puede tener
// más de un documento si hay varios informes para el mismo avance.
function ThreadStage({ title, items, emptyLabel, openAnnexes, setPreview }) {
  return (
    <div className="thread-stage">
      <div className="thread-stage-title">{title}</div>
      {items.length === 0 && <div className="thread-empty">{emptyLabel}</div>}
      {items.map((item) => (
        <div className="thread-doc" key={item.id}>
          <div className="thread-doc-title">{item.title || item.code}</div>
          <div className="thread-doc-date">
            {item.date || item.cutoffDate || "Sin fecha"}
          </div>
          <div className="thread-doc-actions">
            {item.previewUrl && (
              <button
                type="button"
                className="eye-link"
                title="Ver documento"
                onClick={() =>
                  setPreview({ title: item.title || item.code, url: item.previewUrl })
                }
              >
                <EyeIcon />
              </button>
            )}
            {item.annexId && (
              <button
                type="button"
                className="link-btn"
                onClick={() => openAnnexes(item)}
              >
                Ver anexos
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("avances");
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [dateRanges, setDateRanges] = useState({});
  const [annexModal, setAnnexModal] = useState(null); // {title, files, loading, error}
  const [preview, setPreview] = useState(null); // {title, url}
  const [selectedThread, setSelectedThread] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    setFilterValues({});
    setDateRanges({});
  }, [tab]);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error desconocido");
      setData(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openAnnexes(item) {
    setAnnexModal({ title: item.annexTitle || item.title, files: [], loading: true, error: "" });
    try {
      const res = await fetch(`/api/annexes?id=${encodeURIComponent(item.annexId)}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error desconocido");
      setAnnexModal({ title: json.data.title, files: json.data.files, loading: false, error: "" });
    } catch (e) {
      setAnnexModal((prev) => ({ ...prev, loading: false, error: e.message }));
    }
  }

  const sourceCounts = useMemo(() => {
    const counts = {};
    TABS.forEach((t) => {
      counts[t.key] = data ? data.items.filter((item) => item.source === t.source).length : 0;
    });
    return counts;
  }, [data]);

  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];

  const sourceItems = useMemo(() => {
    if (!data) return [];
    return data.items.filter((item) => item.source === activeTab.source);
  }, [data, activeTab]);

  const filterOptions = useMemo(() => {
    const options = {};
    (activeTab.filters || []).forEach((f) => {
      if (f.type !== "select") return;
      const values = sourceItems
        .map((item) => item[f.key])
        .filter((v) => v !== undefined && v !== null && v !== "");
      options[f.key] = Array.from(new Set(values)).sort((a, b) =>
        String(a).localeCompare(String(b), "es", { numeric: true })
      );
    });
    return options;
  }, [sourceItems, activeTab]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sourceItems.filter((item) => {
      const matchesQuery = !q || (item.searchText || "").includes(q);
      const matchesFilters = (activeTab.filters || []).every((f) => {
        if (f.type === "date") {
          const range = dateRanges[f.key] || {};
          if (!range.from && !range.to) return true;
          const iso = toIsoDate(item[f.key]);
          if (!iso) return false;
          if (range.from && iso < range.from) return false;
          if (range.to && iso > range.to) return false;
          return true;
        }
        const selected = filterValues[f.key];
        return !selected || selected === "todas" || String(item[f.key]) === selected;
      });
      return matchesQuery && matchesFilters;
    });
  }, [sourceItems, query, filterValues, dateRanges, activeTab]);

  // Agrupa cartas enviadas, informes PROYECTA y cartas recibidas que
  // comparten el mismo número de avance, para armar el hilo de seguimiento.
  const THREAD_ROLE_BY_SOURCE = {
    "CARTAS": "enviada",
    "Revisión avances": "informe",
    "Cartas recibidas": "recibida",
  };
  const threads = useMemo(() => {
    if (!data) return [];
    const byAvance = {};
    data.items.forEach((item) => {
      const role = THREAD_ROLE_BY_SOURCE[item.source];
      if (!role) return;
      const avance = extractAvanceNumber(item);
      if (!avance) return;
      if (!byAvance[avance]) {
        byAvance[avance] = { avance, enviada: [], informe: [], recibida: [] };
      }
      byAvance[avance][role].push(item);
    });
    return Object.values(byAvance)
      .filter((t) => t.enviada.length || t.informe.length || t.recibida.length)
      .sort((a, b) => Number(b.avance) - Number(a.avance));
  }, [data]);

  useEffect(() => {
    if (threads.length && !threads.some((t) => t.avance === selectedThread)) {
      setSelectedThread(threads[0].avance);
    }
  }, [threads, selectedThread]);

  const currentThread = threads.find((t) => t.avance === selectedThread) || null;

  return (
    <>
      <Head>
        <title>Dashboard Documental HRDT</title>
      </Head>
      <div className={preview ? "app-shell split" : "app-shell"}>
      <main className="wrap">
        <header className="header">
          <div>
            <h1>Dashboard Documental HRDT</h1>
            {data && <p className="muted-onlight">Actualizado: {data.generatedAt}</p>}
          </div>
          <div className="actions">
            <a className="ghost-btn" href={data?.sheetUrl} target="_blank" rel="noreferrer">
              Abrir Google Sheet
            </a>
            <button className="ghost-btn" onClick={loadDashboard} disabled={loading}>
              {loading ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
        </header>

        {error && <div className="banner error">{error}</div>}

        {data && (
          <>
            <section className="stats">
              <Stat label="Documentos" value={data.stats.total} tone="celeste" />
              {TABS.map((t) => (
                <Stat
                  key={t.key}
                  label={t.label}
                  value={t.isThreadView ? threads.length : sourceCounts[t.key] || 0}
                  tone={t.tone}
                />
              ))}
            </section>

            <nav className="tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={tab === t.key ? "tab active" : "tab"}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {tab === "hilos" ? (
              <section>
                <div className="filters">
                  <select
                    value={selectedThread}
                    onChange={(e) => setSelectedThread(e.target.value)}
                  >
                    {threads.map((t) => (
                      <option key={t.avance} value={t.avance}>
                        Avance {t.avance}
                      </option>
                    ))}
                  </select>
                </div>
                {threads.length === 0 && (
                  <p className="muted-onlight" style={{ padding: "12px 4px" }}>
                    No se encontraron hilos de documentos. Revisa que las cartas
                    e informes tengan un número de avance (por ejemplo
                    "AV_001" en el código) o el campo Nro Avance en la hoja.
                  </p>
                )}
                {currentThread && (
                  <div className="thread-flow">
                    <ThreadStage
                      title="Carta enviada"
                      items={currentThread.enviada}
                      emptyLabel="Sin carta enviada registrada"
                      openAnnexes={openAnnexes}
                      setPreview={setPreview}
                    />
                    <div className="thread-arrow">→</div>
                    <ThreadStage
                      title="Informe PROYECTA"
                      items={currentThread.informe}
                      emptyLabel="Sin informe registrado"
                      openAnnexes={openAnnexes}
                      setPreview={setPreview}
                    />
                    <div className="thread-arrow">→</div>
                    <ThreadStage
                      title="Carta recibida"
                      items={currentThread.recibida}
                      emptyLabel="Sin carta recibida registrada"
                      openAnnexes={openAnnexes}
                      setPreview={setPreview}
                    />
                  </div>
                )}
              </section>
            ) : (
              <section>
                <div className="filters">
                  <input
                    placeholder="Buscar por título, código, asunto…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {(activeTab.filters || []).map((f) =>
                    f.type === "date" ? (
                      <div className="date-range" key={f.key}>
                        <span className="date-range-label">{f.label}</span>
                        <input
                          type="date"
                          value={(dateRanges[f.key] && dateRanges[f.key].from) || ""}
                          onChange={(e) =>
                            setDateRanges((prev) => ({
                              ...prev,
                              [f.key]: { ...prev[f.key], from: e.target.value },
                            }))
                          }
                        />
                        <span className="date-range-sep">→</span>
                        <input
                          type="date"
                          value={(dateRanges[f.key] && dateRanges[f.key].to) || ""}
                          onChange={(e) =>
                            setDateRanges((prev) => ({
                              ...prev,
                              [f.key]: { ...prev[f.key], to: e.target.value },
                            }))
                          }
                        />
                        {(dateRanges[f.key]?.from || dateRanges[f.key]?.to) && (
                          <button
                            type="button"
                            className="date-range-clear"
                            onClick={() =>
                              setDateRanges((prev) => ({ ...prev, [f.key]: { from: "", to: "" } }))
                            }
                            title="Limpiar fechas"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <select
                        key={f.key}
                        value={filterValues[f.key] || "todas"}
                        onChange={(e) =>
                          setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                      >
                        <option value="todas">{f.label}: todas</option>
                        {(filterOptions[f.key] || []).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    )
                  )}
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {activeTab.columns.map((col) => (
                          <th key={col.header}>{col.header}</th>
                        ))}
                        {tab === "reuniones" && <th>Temas</th>}
                        <th>Archivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id}>
                          {activeTab.columns.map((col) => (
                            <td key={col.header}>{col.render(item, { openAnnexes })}</td>
                          ))}
                          {tab === "reuniones" && (
                            <td className="topics-cell">
                              {item.topics && item.topics.length ? (
                                item.topics.map((topic) => (
                                  <span key={topic} className="topic-chip">
                                    {topic}
                                  </span>
                                ))
                              ) : (
                                "—"
                              )}
                            </td>
                          )}
                          <td className="archivo-cell">
                            {item.previewUrl ? (
                              <button
                                type="button"
                                className="eye-link"
                                title="Ver documento"
                                onClick={() =>
                                  setPreview({ title: item.title || item.code, url: item.previewUrl })
                                }
                              >
                                <EyeIcon />
                              </button>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredItems.length === 0 && (
                    <p className="muted-onlight" style={{ padding: "12px 4px" }}>
                      No hay documentos que coincidan con el filtro.
                    </p>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {loading && !data && <p className="muted-onlight">Cargando dashboard…</p>}

        {annexModal && (
          <div className="modal-backdrop" onClick={() => setAnnexModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{annexModal.title}</h2>
                <button onClick={() => setAnnexModal(null)}>✕</button>
              </div>
              {annexModal.loading && <p className="muted">Cargando anexos…</p>}
              {annexModal.error && <p className="banner error">{annexModal.error}</p>}
              <ul className="annex-list">
                {annexModal.files.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      className="annex-link-btn"
                      onClick={() => {
                        setPreview({ title: f.name, url: f.previewUrl });
                        setAnnexModal(null);
                      }}
                    >
                      {f.path ? `${f.path} / ${f.name}` : f.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </main>
      {preview && (
        <aside className="preview-pane">
          <div className="preview-header">
            <span className="preview-title">{preview.title}</span>
            <button
              type="button"
              className="preview-close"
              onClick={() => setPreview(null)}
            >
              ✕ Cerrar
            </button>
          </div>
          <iframe
            key={preview.url}
            src={preview.url}
            title={preview.title}
            className="preview-frame"
          />
        </aside>
      )}
      </div>
      <style jsx global>{`
        :root {
          --bg: #0b1a33;
          --surface: #132a4d;
          --surface-2: #1a3660;
          --border: #24406b;
          --accent: #5ec8f2;
          --accent-strong: #38b6f0;
          --accent-ink: #04283d;
          --accent-2: #f2b134;
          --accent-2-strong: #d99a1f;
          --text: #eef3fa;
          --text-muted: #8ea3c4;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: var(--bg);
          color: var(--text);
        }
      `}</style>
      <style jsx>{`
        .app-shell {
          min-height: 100vh;
        }
        .app-shell.split {
          display: flex;
          align-items: stretch;
          height: 100vh;
          overflow: hidden;
        }
        .app-shell.split .wrap {
          flex: 1 1 55%;
          height: 100vh;
          overflow-y: auto;
          margin: 0;
          border-radius: 0;
          max-width: none;
        }
        .preview-pane {
          flex: 1 1 45%;
          min-width: 320px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-left: 3px solid var(--accent);
        }
        .preview-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 10px 14px; background: var(--surface-2);
        }
        .preview-title {
          color: var(--text); font-size: 13px; font-weight: 600;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .preview-close {
          border: none; background: var(--accent); color: var(--accent-ink);
          font-weight: 700; font-size: 12px; padding: 6px 12px; border-radius: 6px;
          cursor: pointer; white-space: nowrap;
        }
        .preview-close:hover { background: var(--accent-strong); }
        .preview-frame { flex: 1; width: 100%; border: none; }
        .wrap {
          max-width: 1100px;
          margin: 32px auto 60px;
          padding: 32px 32px 48px;
          background: #f5f7fa;
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(2, 10, 24, 0.35);
        }
        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
        h1 { margin: 0; font-size: 24px; color: #10233d; letter-spacing: 0.2px; }
        .muted { color: var(--text-muted); font-size: 13px; }
        .muted-onlight { color: #55708c; font-size: 13px; }
        .actions { display: flex; gap: 8px; }
        .ghost-btn {
          border: 1px solid var(--accent);
          background: var(--accent);
          color: var(--accent-ink);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .ghost-btn:hover { background: var(--accent-strong); }
        .ghost-btn:active { transform: translateY(1px); }
        .ghost-btn:disabled { opacity: 0.6; cursor: default; }
        .banner.error { background: #4a1e2a; border: 1px solid #7a3244; color: #ffc9d4; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px; }
        .tabs { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
        .tab {
          border: 1px solid transparent;
          background: #ffffff;
          color: var(--accent-ink);
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        .tab.active {
          background: #ffffff;
          color: var(--accent-ink);
          border: 2px solid var(--accent);
          font-weight: 700;
        }
        .filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .filters input {
          flex: 1; min-width: 220px; padding: 9px 12px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--surface); color: var(--text);
        }
        .filters input::placeholder { color: var(--text-muted); }
        .filters select { padding: 9px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text); }
        .date-range {
          display: flex; align-items: center; gap: 6px; padding: 6px 10px;
          border-radius: 8px; border: 1px solid var(--border); background: var(--surface);
        }
        .date-range-label { font-size: 12px; color: var(--text-muted); margin-right: 4px; white-space: nowrap; }
        .date-range input[type="date"] {
          background: var(--surface-2); color: var(--text); border: 1px solid var(--border);
          border-radius: 6px; padding: 5px 6px; font-size: 13px; color-scheme: dark;
        }
        .date-range-sep { color: var(--text-muted); font-size: 12px; }
        .date-range-clear {
          border: none; background: none; color: var(--text-muted); cursor: pointer;
          font-size: 13px; padding: 0 2px;
        }
        .date-range-clear:hover { color: var(--accent); }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          padding: 16px; display: flex; flex-direction: column; gap: 6px;
          transition: border-color 0.15s ease;
        }
        .card:hover { border-color: var(--accent); }
        .card h3 { margin: 4px 0; font-size: 15px; color: var(--text); }
        .card .code { font-size: 12px; color: var(--accent); font-weight: 600; }
        .card .summary { font-size: 13px; color: var(--text-muted); }
        .card-actions { margin-top: auto; display: flex; gap: 10px; padding-top: 8px; }
        .card-actions a, .card-actions button { font-size: 13px; border: none; background: none; color: var(--accent); cursor: pointer; padding: 0; }
        .card-actions a:hover, .card-actions button:hover { color: var(--accent-strong); }
        .badge {
          align-self: flex-start; background: rgba(94, 200, 242, 0.14); color: var(--accent);
          font-size: 11px; padding: 3px 9px; border-radius: 999px; font-weight: 600;
        }
        .milestone.próximo, .milestone.proximo { border-color: #e0a740; }
        .milestone.fecha-pasada { border-color: #e2596b; }
        table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: 12px; overflow: hidden; }
        th, td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid var(--border); }
        th { background: var(--surface-2); color: var(--text-muted); font-weight: 600; }
        tbody tr { background: #e7edf5; }
        tbody tr:nth-child(even) { background: #d3dceb; }
        tbody tr:hover { background: #fbead0; }
        tbody td { color: #0b1a33; }
        tbody td a { color: #175a8c; font-weight: 600; }
        tbody td a:hover { color: var(--accent-2-strong); }
        .link-btn { border: none; background: none; color: #175a8c; font-weight: 600; font-size: 13px; cursor: pointer; padding: 0; }
        .link-btn:hover { color: var(--accent-2-strong); }
        .archivo-cell { text-align: center; }
        .topics-cell { max-width: 320px; }
        .topic-chip {
          display: block; background: rgba(94, 200, 242, 0.14); color: #175a8c;
          font-size: 11px; padding: 2px 8px; border-radius: 999px; margin: 0 0 4px 0;
          white-space: normal; width: fit-content;
        }
        .eye-link { display: inline-flex; align-items: center; justify-content: center; color: #175a8c; }
        .eye-link:hover { color: var(--accent-2-strong); }
        .thread-flow {
          display: flex; align-items: stretch; gap: 10px; flex-wrap: wrap;
          margin-top: 8px;
        }
        .thread-stage {
          flex: 1 1 220px; min-width: 220px; background: var(--surface);
          border: 1px solid var(--border); border-radius: 12px; padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .thread-stage-title {
          font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
          text-transform: uppercase; color: var(--accent);
        }
        .thread-doc {
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px;
        }
        .thread-doc-title { font-size: 13px; color: var(--text); font-weight: 600; }
        .thread-doc-date { font-size: 12px; color: var(--text-muted); }
        .thread-doc-actions { display: flex; align-items: center; gap: 10px; }
        .thread-empty { font-size: 12px; color: var(--text-muted); font-style: italic; }
        .thread-arrow {
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: var(--accent); flex: 0 0 auto; padding: 0 2px;
        }
        @media (max-width: 720px) {
          .thread-arrow { transform: rotate(90deg); }
        }
        tr:last-child td { border-bottom: none; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(3, 10, 22, 0.6); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; max-width: 480px; width: 100%; max-height: 80vh; overflow: auto; padding: 20px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { color: var(--text); font-size: 16px; }
        .modal-header button { border: none; background: none; font-size: 16px; cursor: pointer; color: var(--text-muted); }
        .annex-list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 8px; }
        .annex-link-btn {
          background: none; border: none; color: var(--accent); text-decoration: none;
          font-size: 13px; cursor: pointer; padding: 0; text-align: left;
        }
        .annex-link-btn:hover { color: var(--accent-strong); }
      `}</style>
    </>
  );
}

const STAT_TONES = {
  celeste: { bg: "#e3f4fd", border: "#a9dcf5", text: "#0b6fa1" },
  amber: { bg: "#fdf1dd", border: "#f3cd8a", text: "#b45309" },
  teal: { bg: "#e1f7f0", border: "#9fe3cd", text: "#0f7a5c" },
  violet: { bg: "#efe9fb", border: "#c9b6f2", text: "#6b3fc4" },
  coral: { bg: "#fdece9", border: "#f5b8ac", text: "#c1442a" },
  indigo: { bg: "#e8eafd", border: "#c3c9f7", text: "#4338ca" },
  rose: { bg: "#fde8f1", border: "#f5b8d4", text: "#be185d" },
  lime: { bg: "#f7fee7", border: "#d9f99d", text: "#4d7c0f" },
  sky: { bg: "#e6f4ff", border: "#a8d8ff", text: "#0b5fa5" },
};

function Stat({ label, value, tone = "celeste" }) {
  const colors = STAT_TONES[tone] || STAT_TONES.celeste;
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: colors.text }}>{value}</div>
      <div style={{ fontSize: 12, color: "#3a5570" }}>{label}</div>
    </div>
  );
}

function statusClass(status) {
  return String(status || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}
