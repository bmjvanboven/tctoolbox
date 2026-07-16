const CACHE = "tc-toolbox-v2";
const OFFLINE_FALLBACK = "/login";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.add(OFFLINE_FALLBACK)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  // Paginanavigaties zijn altijd dynamisch en vaak persoonlijk (sessiedata).
  // Nooit cachen en nooit tee'n van de streaming SSR-response: dat brak
  // eerder de React-hydratie ("Connection closed") en zou persoonlijke
  // dashboarddata in de gedeelde cache kunnen laten belanden. Alleen bij
  // een echte netwerkstoring vallen we terug op de (niet-persoonlijke)
  // inlogpagina.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(OFFLINE_FALLBACK))
    );
    return;
  }

  // Overige GET's (statische assets zoals JS/CSS/afbeeldingen) mogen wel
  // opgeslagen worden voor offline gebruik.
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notificaties
self.addEventListener("push", e => {
  if (!e.data) return;
  let data;
  try { data = e.data.json(); } catch { data = { titel: "Telecombinatie Toolbox", tekst: e.data.text() }; }

  e.waitUntil(
    self.registration.showNotification(data.titel || "Telecombinatie Toolbox", {
      body: data.tekst || "",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      data: { url: data.url || "/" },
      vibrate: [100, 50, 100],
    })
  );
});

// Klik op notificatie → open app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
      const existing = cs.find(c => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(url); }
      else clients.openWindow(url);
    })
  );
});
