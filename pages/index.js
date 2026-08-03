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
