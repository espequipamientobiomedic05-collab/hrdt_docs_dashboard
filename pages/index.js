import { useEffect, useMemo, useState } from "react";
import Head from "next/head";

const SOURCE_LABELS = {
  "Revisión avances": "Informes avances",
  "Informes semanales RUHA": "Informes semanales RUHA",
  Reuniones_supervisión: "Reuniones supervisión",
  CARTAS: "Cartas",
};

const TABS = [
  {
    key: "avances",
    label: "Informes avances",
    source: "Revisión avances",
    columns: [
      { header: "Código", render: (item) => item.code },
      { header: "Fecha corte talleres", render: (item) => item.cutoffDate },
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
    columns: [
      { header: "Corte", render: (item) => item.cutoffDate },
      { header: "Fecha emisión", render: (item) => item.date },
      { header: "Documento", render: (item) => item.title },
    ],
  },
  {
    key: "reuniones",
    label: "Reuniones supervisión",
    source: "Reuniones_supervisión",
    columns: [
      { header: "Fecha", render: (item) => item.date },
      { header: "Acta", render: (item) => item.code },
      { header: "Asunto", render: (item) => item.subject },
      { header: "Cliente", render: (item) => item.client },
      { header: "Contratista", render: (item) => item.contractor },
      { header: "Supervisión", render: (item) => item.supervision },
      { header: "Estado proyecto", render: (item) => item.projectState },
      { header: "Revisado", render: (item) => item.reviewed },
    ],
  },
  {
    key: "cartas",
    label: "Cartas",
    source: "CARTAS",
    columns: [
      { header: "Fecha", render: (item) => item.date },
      { header: "Nro Avance", render: (item) => item.code },
      { header: "Destinatario", render: (item) => item.client },
    ],
  },
];

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

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("avances");
  const [query, setQuery] = useState("");
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

  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.items.filter((item) => {
      const matchesSource = item.source === activeTab.source;
      const matchesQuery = !q || (item.searchText || "").includes(q);
      return matchesSource && matchesQuery;
    });
  }, [data, query, activeTab]);

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
              <Stat label="Pendientes de análisis" value={data.stats.pendingAnalysis} />
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

            <section>
              <div className="filters">
                <input
                  placeholder="Buscar por título, código, asunto…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {activeTab.columns.map((col) => (
                        <th key={col.header}>{col.header}</th>
                      ))}
                      <th>Archivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id}>
                        {activeTab.columns.map((col) => (
                          <td key={col.header}>{col.render(item, { openAnnexes })}</td>
                        ))}
                        <td className="archivo-cell">
                          {item.previewUrl ? (
                            <a
                              href={item.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="eye-link"
                              title="Ver documento"
                            >
                              <EyeIcon />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredItems.length === 0 && (
                  <p className="muted" style={{ padding: "12px 4px" }}>
                    No hay documentos que coincidan con el filtro.
                  </p>
                )}
              </div>
            </section>
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
        :root {
          --bg: #0b1a33;
          --surface: #132a4d;
          --surface-2: #1a3660;
          --border: #24406b;
          --accent: #5ec8f2;
          --accent-strong: #38b6f0;
          --accent-ink: #04283d;
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
        .wrap { max-width: 1100px; margin: 0 auto; padding: 32px 20px 80px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
        h1 { margin: 0; font-size: 24px; color: var(--text); letter-spacing: 0.2px; }
        .muted { color: var(--text-muted); font-size: 13px; }
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
        tbody tr:hover { background: #bcd2ec; }
        tbody td { color: #0b1a33; }
        tbody td a { color: #175a8c; font-weight: 600; }
        tbody td a:hover { color: #0b3d61; }
        .link-btn { border: none; background: none; color: #175a8c; font-weight: 600; font-size: 13px; cursor: pointer; padding: 0; }
        .link-btn:hover { color: #0b3d61; }
        .archivo-cell { text-align: center; }
        .eye-link { display: inline-flex; align-items: center; justify-content: center; color: #175a8c; }
        .eye-link:hover { color: #0b3d61; }
        tr:last-child td { border-bottom: none; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(3, 10, 22, 0.6); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; max-width: 480px; width: 100%; max-height: 80vh; overflow: auto; padding: 20px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { color: var(--text); font-size: 16px; }
        .modal-header button { border: none; background: none; font-size: 16px; cursor: pointer; color: var(--text-muted); }
        .annex-list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 8px; }
        .annex-list a { color: var(--accent); text-decoration: none; font-size: 13px; }
        .annex-list a:hover { color: var(--accent-strong); }
      `}</style>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "#132a4d",
        border: "1px solid #24406b",
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: "#5ec8f2" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#8ea3c4" }}>{label}</div>
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
