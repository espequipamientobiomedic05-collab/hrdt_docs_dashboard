import { useEffect, useMemo, useState } from "react";
import Head from "next/head";

const SOURCE_LABELS = {
  "Revisión avances": "Revisión de avances",
  "Informes semanales RUHA": "Informes semanales RUHA",
  Reuniones_supervisión: "Reuniones de supervisión",
};

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("documentos");
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("todas");
  const [annexModal, setAnnexModal] = useState(null); // {title, files, loading, error}

  useEffect(() => {
    loadDashboard();
  }, []);

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

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.items.filter((item) => {
      const matchesSource = sourceFilter === "todas" || item.source === sourceFilter;
      const matchesQuery = !q || (item.searchText || "").includes(q);
      return matchesSource && matchesQuery;
    });
  }, [data, query, sourceFilter]);

  return (
    <>
      <Head>
        <title>Dashboard Documental HRDT</title>
      </Head>
      <main className="wrap">
        <header className="header">
          <div>
            <h1>Dashboard Documental HRDT</h1>
            {data && <p className="muted">Actualizado: {data.generatedAt}</p>}
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
              <Stat label="Documentos" value={data.stats.total} />
              <Stat label="Con archivo vinculado" value={data.stats.linked} />
              <Stat label="Relaciones detectadas" value={data.stats.relations} />
              <Stat label="Hitos / plazos" value={data.stats.deadlines} />
              <Stat label="Pendientes de análisis" value={data.stats.pendingAnalysis} />
            </section>

            <nav className="tabs">
              {["documentos", "reuniones", "hitos", "relaciones"].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "tab active" : "tab"}
                  onClick={() => setTab(t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </nav>

            {tab === "documentos" && (
              <section>
                <div className="filters">
                  <input
                    placeholder="Buscar por título, código, asunto…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                    <option value="todas">Todas las fuentes</option>
                    {data.sourceSheets.map((s) => (
                      <option key={s} value={s}>
                        {SOURCE_LABELS[s] || s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid">
                  {filteredItems.map((item) => (
                    <article key={item.id} className="card">
                      <span className="badge">{SOURCE_LABELS[item.source] || item.source}</span>
                      <h3>{item.title}</h3>
                      {item.code && <p className="code">{item.code}</p>}
                      {item.date && <p className="muted">Fecha: {item.date}</p>}
                      <p className="summary">{item.summary}</p>
                      <div className="card-actions">
                        {item.previewUrl && (
                          <a href={item.previewUrl} target="_blank" rel="noreferrer">
                            Ver documento
                          </a>
                        )}
                        {item.annexId && (
                          <button onClick={() => openAnnexes(item)}>Ver anexos</button>
                        )}
                      </div>
                    </article>
                  ))}
                  {filteredItems.length === 0 && (
                    <p className="muted">No hay documentos que coincidan con el filtro.</p>
                  )}
                </div>
              </section>
            )}

            {tab === "reuniones" && (
              <section className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Acta</th>
                      <th>Asunto</th>
                      <th>Cliente</th>
                      <th>Contratista</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.meetingItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.code}</td>
                        <td>{item.subject}</td>
                        <td>{item.client}</td>
                        <td>{item.contractor}</td>
                        <td>{item.projectState}</td>
                        <td>
                          {item.previewUrl && (
                            <a href={item.previewUrl} target="_blank" rel="noreferrer">
                              Ver
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {tab === "hitos" && (
              <section className="grid">
                {data.milestones.map((m) => (
                  <article key={m.id} className={`card milestone ${statusClass(m.status)}`}>
                    <span className="badge">{m.status}</span>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    {m.date && <p className="muted">Fecha: {m.date}</p>}
                  </article>
                ))}
                {data.milestones.length === 0 && <p className="muted">Sin hitos detectados aún.</p>}
              </section>
            )}

            {tab === "relaciones" && (
              <section className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Menciona a</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.relations.map((r) => (
                      <tr key={r.id}>
                        <td>{r.fromTitle}</td>
                        <td>{r.toTitle}</td>
                        <td>{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.relations.length === 0 && <p className="muted">Sin relaciones detectadas aún.</p>}
              </section>
            )}
          </>
        )}

        {loading && !data && <p className="muted">Cargando dashboard…</p>}

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
                    <a href={f.previewUrl} target="_blank" rel="noreferrer">
                      {f.path ? `${f.path} / ${f.name}` : f.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
      <style jsx global>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f4f5f7;
          color: #1c1e21;
        }
      `}</style>
      <style jsx>{`
        .wrap { max-width: 1100px; margin: 0 auto; padding: 32px 20px 80px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
        h1 { margin: 0; font-size: 24px; }
        .muted { color: #6b7280; font-size: 13px; }
        .actions { display: flex; gap: 8px; }
        .ghost-btn { border: 1px solid #d1d5db; background: white; padding: 8px 14px; border-radius: 8px; cursor: pointer; text-decoration: none; color: #1c1e21; font-size: 13px; }
        .banner.error { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px; }
        .tabs { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
        .tab { border: none; background: #e5e7eb; padding: 8px 16px; border-radius: 999px; cursor: pointer; font-size: 13px; }
        .tab.active { background: #111827; color: white; }
        .filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .filters input { flex: 1; min-width: 220px; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; }
        .filters select { padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 6px; }
        .card h3 { margin: 4px 0; font-size: 15px; }
        .card .code { font-size: 12px; color: #4b5563; font-weight: 600; }
        .card .summary { font-size: 13px; color: #374151; }
        .card-actions { margin-top: auto; display: flex; gap: 10px; padding-top: 8px; }
        .card-actions a, .card-actions button { font-size: 13px; border: none; background: none; color: #2563eb; cursor: pointer; padding: 0; }
        .badge { align-self: flex-start; background: #eef2ff; color: #4338ca; font-size: 11px; padding: 3px 8px; border-radius: 999px; }
        .milestone.próximo, .milestone.proximo { border-color: #f59e0b; }
        .milestone.fecha-pasada { border-color: #ef4444; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; }
        th, td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f1f1; }
        th { background: #f9fafb; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: white; border-radius: 12px; max-width: 480px; width: 100%; max-height: 80vh; overflow: auto; padding: 20px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .modal-header button { border: none; background: none; font-size: 16px; cursor: pointer; }
        .annex-list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 8px; }
        .annex-list a { color: #2563eb; text-decoration: none; font-size: 13px; }
      `}</style>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
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
