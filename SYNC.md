# FORJA — sincronização do histórico entre aparelhos

O histórico fica num JSON **privado** no Vercel Blob, acessado só pela função `api/sync.js`
com a sua chave pessoal. Cada aparelho sincroniza ao abrir o app e depois de cada treino salvo.

## Regras de mesclagem (merge.js)
- **Treinos**: união por id. Nenhum se perde nem duplica, mesmo com dois aparelhos offline.
- **Exclusão**: vira uma "lápide" (`apagados`); o treino excluído não volta da nuvem.
- **Cargas, ciclo, semana, ajustes**: vêm do aparelho com a alteração **mais recente**
  (`mod` só sobe quando algo muda de fato, não ao abrir o app).
- **Aparelho novo e vazio** nunca sobrescreve a nuvem.
- **"Apagar tudo"** limpa só o aparelho; com a sincronização ligada, tudo volta da nuvem.
- `cfg.notificar` (permissão de notificação) não sincroniza: é por aparelho.
- Não sincroniza durante um treino em andamento.
- A cada gravação a nuvem também guarda `backup-AAAA-MM-DD.json` (um por dia).
  O app guarda localmente o estado anterior em `forja.pre-sync` antes de aplicar a nuvem.

## Instalar (uma vez)
1. Extraia o zip **por cima** da pasta do projeto. Ele substitui `index.html`, `sw.js`,
   `vercel.json`, `package.json`, `.gitignore` e adiciona `merge.js`, `api/sync.js`.
   Não mexe em `api/descanso.js`, `manifest.json`, ícones nem `vapid-keys.txt`.
2. No Vercel: *Project → Storage → Create → Blob*, acesso **Private**, conectado ao projeto
   (Production e Preview).
3. No Vercel: *Settings → Environment Variables*: `FORJA_SYNC_KEY` = valor de `sync-key.txt`.
4. `git add -A` (o `.gitignore` já exclui `sync-key.txt` e `vapid-keys.txt`), commit e push.
   Confira antes com `git status` que nenhum dos dois arquivos de chave aparece.
5. **No aparelho que já tem os treinos**, abra o app atualizado, *Ajustes → Sincronização*,
   digite a chave, *Conectar e sincronizar*. Só depois instale/abra em outros aparelhos.
6. No aparelho novo: *Ajustes → Sincronização → Conectar*. O histórico e as cargas chegam sozinhos.

Se quiser garantir: mantenha o `forja-backup-*.json`. *Ajustes → Importar* restaura por cima.

## Limites
- Chave única, uso de uma pessoa. Quem tiver a chave lê e grava o histórico.
- Dois aparelhos alterando cargas/ciclo offline ao mesmo tempo: os **treinos** se unem,
  mas cargas e contadores ficam com o aparelho mais recente.
- Treino em andamento não é sincronizado; se o app for fechado no meio, ele só entra na
  nuvem depois de salvo.
- Exige internet para sincronizar; sem internet o app funciona e sincroniza depois.
