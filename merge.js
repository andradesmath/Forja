/* FORJA — regras de mesclagem do histórico entre aparelhos.
   Usado no navegador (window.ForjaMerge) e na função api/sync.js (require). Uma única fonte da verdade.

   Princípios:
   - Treinos (hist) são imutáveis: a mesclagem é a UNIÃO por id. Nunca perde nem duplica.
   - Exclusões viajam como "lápides" (apagados), senão o treino excluído voltaria da nuvem.
   - Demais campos (cargas, ciclo, cfg...) vêm do estado com `mod` (última alteração real) mais recente.
   - cfg.notificar vale só no aparelho (permissão de notificação é por aparelho); o cliente preserva o local. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ForjaMerge = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  function ordena(v) {   // JSON estável (chaves ordenadas) para comparar estados
    if (Array.isArray(v)) return v.map(ordena);
    if (v && typeof v === 'object') return Object.keys(v).sort().reduce((o, k) => { o[k] = ordena(v[k]); return o; }, {});
    return v;
  }
  function chave(o) { return JSON.stringify(ordena(o)); }

  function mesclarEstados(a, b) {
    a = a || {}; b = b || {};
    const mod = x => Number(x.mod) || 0;
    const n = x => (x.hist || []).length;
    /* mais recente vence; empate: quem tem mais treinos (aparelho novo e vazio nunca sobrescreve); depois o local */
    const novo = (mod(b) > mod(a) || (mod(b) === mod(a) && n(b) > n(a))) ? b : a;
    const velho = novo === a ? b : a;

    const apagados = Array.from(new Set([].concat(a.apagados || [], b.apagados || [])));
    const apagado = new Set(apagados);

    const mapa = new Map();
    [].concat(velho.hist || [], novo.hist || []).forEach(h => {
      if (h && h.id && !apagado.has(h.id)) mapa.set(h.id, h);
    });
    const hist = Array.from(mapa.values()).sort((x, y) => (x.data < y.data) - (x.data > y.data));   // mais novo primeiro

    return Object.assign({}, velho, novo, { hist: hist, apagados: apagados, mod: Math.max(mod(a), mod(b)) });
  }

  return { mesclarEstados: mesclarEstados, chave: chave };
});
