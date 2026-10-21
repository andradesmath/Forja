/* FORJA — service worker: cache com atualização em segundo plano + push de fim de descanso */
const CACHE = "forja-v7";
const ARQUIVOS = ['./', './merge.js', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable.png'];

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
    caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('forja-v') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

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

/* ---- aviso de fim de descanso (reserva local, melhor esforço) ---- */
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

/* ---- Web Push: fim do descanso com o app fechado ---- */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { }
  e.waitUntil((async () => {
    /* o app grava o id do descanso vigente; id diferente = descanso pulado, ajustado ou cancelado */
    let atual = null;
    try { const r = await (await caches.open('forja-aviso')).match('/__rest'); atual = r ? (await r.json()).id : null; } catch (_) { }
    const vivo = !!atual && atual === d.id;
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (cs.some(c => c.visibilityState === 'visible')) return;   // app à vista: o alarme sonoro da própria página já toca
    const op = vivo
      ? { body: 'Hora da próxima série.', tag: 'forja-descanso', renotify: true, requireInteraction: true,
          vibrate: [300, 150, 300, 150, 300, 150, 300], icon: 'icon-192.png', badge: 'icon-192.png' }
      : { body: '', tag: 'forja-descanso', silent: true, icon: 'icon-192.png' };
    await self.registration.showNotification(vivo ? 'FORJA · descanso acabou' : 'FORJA', op);
    if (!vivo) (await self.registration.getNotifications({ tag: 'forja-descanso' })).forEach(n => n.close());   // push exige exibir algo; fecha na hora
  })());
});
