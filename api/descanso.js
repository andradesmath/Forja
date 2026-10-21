/* FORJA — dispara um Web Push no fim do descanso, mesmo com o app fechado.
   O app chama POST /api/descanso no início do descanso; a função espera `delay` segundos e envia o push.
   Variáveis de ambiente (Vercel): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY. */
const webpush = require('web-push');
let waitUntil = null;
try { waitUntil = require('@vercel/functions').waitUntil; } catch (_) { }

const MAX_DELAY = 285;   // s — abaixo do limite de 300 s (plano Hobby com Fluid compute)
const HOSTS = [/(^|\.)googleapis\.com$/, /(^|\.)push\.services\.mozilla\.com$/, /(^|\.)push\.apple\.com$/, /(^|\.)notify\.windows\.com$/];
const dorme = ms => new Promise(r => setTimeout(r, ms));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ erro: 'método' });

  /* só aceita chamadas vindas do próprio site */
  const origem = req.headers.origin;
  if (origem) {
    let ok = false;
    try { ok = new URL(origem).host === req.headers.host; } catch (_) { }
    if (!ok) return res.status(403).json({ erro: 'origem' });
  }

  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return res.status(500).json({ erro: 'VAPID não configurado' });

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch (_) { b = null; }
  if (!b || typeof b !== 'object') return res.status(400).json({ erro: 'corpo' });

  const sub = b.sub, delay = Number(b.delay), id = String(b.id || '');
  let host = '';
  try { const u = new URL(sub.endpoint); if (u.protocol === 'https:') host = u.hostname; } catch (_) { }
  if (!host || !HOSTS.some(rx => rx.test(host))) return res.status(400).json({ erro: 'endpoint' });
  if (!sub.keys || typeof sub.keys.p256dh !== 'string' || typeof sub.keys.auth !== 'string') return res.status(400).json({ erro: 'chaves' });
  if (!Number.isFinite(delay) || delay < 1 || delay > MAX_DELAY) return res.status(400).json({ erro: 'delay', max: MAX_DELAY });
  if (!/^[\w-]{1,40}$/.test(id)) return res.status(400).json({ erro: 'id' });

  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'https://' + req.headers.host, pub, priv);

  const tarefa = (async () => {
    await dorme(Math.round(delay * 1000));
    try {
      /* texto fixo no cliente (SW); o payload leva só o id para o app poder descartar avisos cancelados */
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify({ id }), { TTL: 120, urgency: 'high' });
    } catch (e) { console.error('push falhou', e && e.statusCode, e && e.body); }
  })();

  if (waitUntil) { waitUntil(tarefa); return res.status(202).json({ ok: true }); }
  await tarefa;
  return res.status(200).json({ ok: true });
};
