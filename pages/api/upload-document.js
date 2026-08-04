// /api/upload-document
// Sube un documento nuevo: envía el archivo (en base64) y los datos del
// formulario a Apps Script, que lo guarda en Drive y agrega la fila al Sheet.
//
// Apps Script redirige (302) toda respuesta hacia script.googleusercontent.com,
// y ahí es donde realmente corre la función. Si dejáramos que fetch siguiera
// esa redirección de forma automática, el método baja a GET y el archivo
// (que va en el cuerpo del POST) se pierde en el camino. Por eso acá seguimos
// la redirección a mano, manteniendo el método POST y el cuerpo intactos.

export const config = {
  api: {
    bodyParser: { sizeLimit: "12mb" },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido." });
  }

  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!scriptUrl || !secret) {
    return res.status(500).json({
      ok: false,
      error: "Faltan las variables de entorno APPS_SCRIPT_URL o APPS_SCRIPT_SECRET en Vercel.",
    });
  }

  const payload = { ...req.body, action: "uploadFile", secret };
  const bodyText = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };

  try {
    let response = await fetch(scriptUrl, {
      method: "POST",
      headers,
      body: bodyText,
      redirect: "manual",
    });

    let hops = 0;
    while ([301, 302, 303, 307, 308].includes(response.status) && hops < 5) {
      const location = response.headers.get("location");
      if (!location) break;
      response = await fetch(location, {
        method: "POST",
        headers,
        body: bodyText,
        redirect: "manual",
      });
      hops++;
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return res.status(502).json({
        ok: false,
        error:
          "Respuesta inesperada del Apps Script (no es JSON). Estado HTTP: " +
          response.status +
          ", saltos de redirección: " +
          hops +
          ". Primeros 300 caracteres: " +
          text.slice(0, 300),
      });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "No se pudo contactar al Apps Script: " + error.message,
    });
  }
}
