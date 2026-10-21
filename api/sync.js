/* FORJA — sincronização do histórico entre aparelhos.
   POST /api/sync  { estado }  ->  { estado }   (envia o estado local e recebe o estado mesclado)
   Armazena um JSON único e privado no Vercel Blob. Mesclagem: ../merge.js (união de treinos por id).
   Variáveis de ambiente: FORJA_SYNC_KEY (chave pessoal) + Blob store conectado ao projeto. */
const { put, get, BlobPreconditionFailedError } = require('@vercel/blob');
const { createHash, timingSafeEqual } = require('crypto');
const M = require('../merge.js');

const norm = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = s => createHash('sha256').update(s).digest();

async function lerAtual(path) {
  const r = await get(path, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return { atual: null, etag: null };
  return { atual: JSON.parse(await new Response(r.stream).text()), etag: r.blob.etag };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ erro: 'método' });

  const origem = req.headers.origin;
  if (origem) {
    let ok = false;
    try { ok = new URL(origem).host === req.headers.host; } catch (_) { }
    if (!ok) return res.status(403).json({ erro: 'origem' });
  }

  const esperada = norm(process.env.FORJA_SYNC_KEY);
  if (esperada.length < 16) return res.status(500).json({ erro: 'FORJA_SYNC_KEY não configurada' });
  const recebida = norm(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
  if (!timingSafeEqual(sha(recebida), sha(esperada))) return res.status(401).json({ erro: 'chave' });

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch (_) { b = null; }
  const local = b && b.estado;
  if (!local || typeof local !== 'object' || !local.cargas || !Array.isArray(local.hist)) return res.status(400).json({ erro: 'estado' });

  const dir = 'forja/' + sha(esperada).toString('hex').slice(0, 32);
  const path = dir + '/estado.json';

  try {
    for (let t = 0; t < 4; t++) {
      const { atual, etag } = await lerAtual(path);
      const mesclado = atual ? M.mesclarEstados(local, atual) : M.mesclarEstados(local, {});
      if (atual && M.chave(mesclado) === M.chave(atual)) return res.status(200).json({ estado: atual });   // nada novo
      const corpo = JSON.stringify(mesclado);
      try {
        await put(path, corpo, { access: 'private', allowOverwrite: true, addRandomSuffix: false,
          contentType: 'application/json', ...(etag ? { ifMatch: etag } : {}) });
        /* cópia diária: rede de segurança contra qualquer erro de lógica */
        await put(dir + '/backup-' + new Date().toISOString().slice(0, 10) + '.json', corpo,
          { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });
        return res.status(200).json({ estado: mesclado });
      } catch (e) {
        if (e instanceof BlobPreconditionFailedError) continue;   // outro aparelho gravou no meio: lê de novo e mescla
        throw e;
      }
    }
    return res.status(409).json({ erro: 'conflito' });
  } catch (e) {
    console.error('sync falhou', e && e.message);
    return res.status(500).json({ erro: 'armazenamento' });
  }
};
