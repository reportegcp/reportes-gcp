// Service worker de Reportes GCP.
// Solo cachea los archivos propios del sitio (HTML, JS, CSS, íconos) para que la app
// abra rápido y sea instalable. Siempre intenta primero la red, así nunca queda una
// versión vieja; la copia guardada se usa únicamente si no hay conexión.
// Los datos (Supabase) y las librerías externas no pasan por acá.
const CACHE = "reportes-gcp-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || (req.mode === "navigate" ? caches.match("./") : undefined)))
  );
});
