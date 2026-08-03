// /api/annexes?id=<annexId>
// Devuelve la lista de archivos dentro de la carpeta de anexos indicada.

export default async function handler(req, res) {
  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  const { id } = req.query;

  if (!scriptUrl || !secret) {
    return res.status(500).json({
      ok: false,
      error: "Faltan las variables de entorno APPS_SCRIPT_URL o APPS_SCRIPT_SECRET en Vercel.",
    });
  }

  if (!id) {
    return res.status(400).json({ ok: false, error: "Falta el parámetro 'id'." });
  }

  try {
    const body = new URLSearchParams();
    body.set("action", "annexes");
    body.set("secret", secret);
    body.set("id", id);

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "No se pudo contactar al Apps Script: " + error.message,
    });
  }
}
