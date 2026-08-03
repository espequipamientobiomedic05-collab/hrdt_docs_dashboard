// /api/dashboard
// Este endpoint corre en el servidor de Vercel. El navegador del usuario
// nunca ve la URL del Apps Script ni el secreto: solo llama a /api/dashboard.

export default async function handler(req, res) {
  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!scriptUrl || !secret) {
    return res.status(500).json({
      ok: false,
      error: "Faltan las variables de entorno APPS_SCRIPT_URL o APPS_SCRIPT_SECRET en Vercel.",
    });
  }

  try {
    const body = new URLSearchParams();
    body.set("action", "dashboard");
    body.set("secret", secret);

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      // Apps Script suele responder con un 302 antes del contenido final;
      // fetch en Node sigue redirecciones automáticamente.
    });

    const data = await response.json();

    // Cacheamos un poco en el borde de Vercel para no saturar Apps Script
    // si varias personas abren el dashboard al mismo tiempo.
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "No se pudo contactar al Apps Script: " + error.message,
    });
  }
}
