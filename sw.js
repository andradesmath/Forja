/* FORJA — service worker: cache com atualização em segundo plano + aviso de fim de descanso */
const CACHE = "forja-v5";
const ARQUIVOS = ['./', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable.png'];

/* respostas redirecionadas (ex.: /index.html -> /, por causa do cleanUrls) não podem ser servidas a navegações */
async function limpa(res) {
  if (!res || !res.redirected) return res;
  const b = await res.blob();
  return new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const a of ARQUIVOS) {
      try { const r = await fetch(a, { cache: 'reload' }); if (r.ok) await c.put(a, await limpa(r)); } catch (_) { }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* qualquer navegação (/, /index.html, start_url) abre o mesmo app em cache */
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match('./');
      const rede = fetch(req).then(async res => {
        if (res && res.ok) await c.put('./', await limpa(res.clone()));
        return res;
      }).catch(() => hit);
      e.waitUntil(rede.catch(() => { }));
      return hit || rede;
    }));
    return;
  }

  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req);
    const rede = fetch(req).then(async res => {
      if (res && res.status === 200) await c.put(req, await limpa(res.clone()));
      return res;
    }).catch(() => hit);
    e.waitUntil(rede.catch(() => { }));
    return hit || rede;
  }));
});

/* ---- aviso de fim de descanso (reserva, melhor esforço) ---- */
let tAviso = null, fimAviso = null;
function cancelaAviso() { clearTimeout(tAviso); tAviso = null; if (fimAviso) { fimAviso(); fimAviso = null; } }

self.addEventListener('message', e => {
  const m = e.data || {};
  if (m.tipo === 'cancelar') cancelaAviso();
  if (m.tipo === 'agendar') {
    cancelaAviso();
    const espera = Math.max(0, m.fim - Date.now()) + 3000;   // folga: a página tem a chance de avisar primeiro
    e.waitUntil(new Promise(res => {
      fimAviso = res;
      tAviso = setTimeout(async () => {
        try {
          const ja = await self.registration.getNotifications({ tag: 'forja-descanso' });
          if (!ja.length) await self.registration.showNotification('FORJA · descanso acabou', {
            body: 'Hora da próxima série.', tag: 'forja-descanso', renotify: true, requireInteraction: true,
            vibrate: [300, 150, 300, 150, 300], icon: 'icon-192.png', badge: 'icon-192.png'
          });
        } catch (_) { }
        cancelaAviso();
      }, espera);
    }));
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs =>
    cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
