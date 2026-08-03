# Dashboard Documental HRDT — Frontend en Vercel

Este proyecto es el **frontend público** de tu dashboard. Llama a tu Apps Script
por detrás (desde el servidor de Vercel, nunca desde el navegador), así que el
secreto (`APPS_SCRIPT_SECRET`) jamás queda expuesto al público.

```
Navegador  →  Vercel (/api/dashboard, /api/annexes)  →  Apps Script (doPost)  →  Google Sheet / Drive
```

## 1. Preparar el Apps Script

1. Abrí el editor de Apps Script del Sheet `Consolidado_documentos`.
2. Ejecutá **una sola vez** la función `crearClaveApiVercel` (desde el editor,
   seleccionala en el menú desplegable de funciones y dale "Ejecutar").
3. Andá a **Ver → Registros de ejecución** (o `Ctrl+Enter`) y copiá el valor
   que aparece después de `APPS_SCRIPT_SECRET=`. Guardalo, no se vuelve a
   mostrar en texto plano salvo que vuelvas a ejecutar la función.
4. Ejecutá también `configurarDashboard` una vez (para crear el caché y el
   disparador automático cada 6 horas).
5. **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Copiá la URL `.../exec` que te da. Esa es tu `APPS_SCRIPT_URL`.

> Nota: tu script usa `doPost`, así que las peticiones deben ser POST con
> `action` y `secret` como parámetros de formulario. Este proyecto ya está
> armado así.

## 2. Configurar variables de entorno en Vercel

En el panel de tu proyecto en Vercel → **Settings → Environment Variables**,
agregá:

| Nombre | Valor |
|---|---|
| `APPS_SCRIPT_URL` | La URL `.../exec` de tu implementación |
| `APPS_SCRIPT_SECRET` | El secreto que copiaste de los registros |

(Podés poner las mismas en Production, Preview y Development.)

Para probar localmente, creá un archivo `.env.local` en la raíz con:

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec
APPS_SCRIPT_SECRET=tu-secreto-copiado
```

## 3. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Dashboard documental HRDT"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/hrdt-dashboard.git
git push -u origin main
```

## 4. Deploy en Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New → Project**.
2. Importá el repo de GitHub.
3. Confirmá que las variables de entorno del paso 2 estén configuradas.
4. **Deploy**. Vercel te da una URL pública tipo `hrdt-dashboard.vercel.app`.

Esa URL ya es tu dashboard público y funcional.

## 5. Probar en local (opcional, antes de subir)

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`.

## Estructura del proyecto

```
hrdt-dashboard/
├── pages/
│   ├── index.js          → interfaz del dashboard
│   └── api/
│       ├── dashboard.js  → proxy seguro a doPost(action=dashboard)
│       └── annexes.js    → proxy seguro a doPost(action=annexes)
├── package.json
├── next.config.js
└── README.md
```

## Notas importantes

- **El secreto nunca viaja al navegador.** Las llamadas desde `pages/index.js`
  van a `/api/dashboard` (tu propio dominio de Vercel), y es el servidor de
  Vercel el que agrega el secreto antes de llamar a Apps Script.
- Si cambiás el código del Apps Script, recordá crear una **nueva versión**
  de la implementación (`Implementar → Gestionar implementaciones → editar →
  Nueva versión`), si no la URL sigue sirviendo el código viejo.
- Si en el futuro rotás el secreto (volviendo a ejecutar
  `crearClaveApiVercel`), actualizá también la variable de entorno en Vercel.
- El endpoint `/api/dashboard` cachea 60 segundos en el borde de Vercel para
  no saturar Apps Script si varias personas entran a la vez.
