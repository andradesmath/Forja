# FORJA — treino de força com autorregulação

App offline-first (PWA) para rotina full-body A/B, 4x por semana, com progressão de carga
guiada por feedback e cálculo automático de anilhas dentro do seu estoque real.

---

## 1. Ponto de atenção: peso da barra

As cargas totais que você passou assumem barra de 20 kg, mas o inventário declara barra
longa de 10 kg. Com barra de 10 kg, os totais reais ficam assim:

| Exercício | Por lado | Total com barra de 10 kg | Total que você citou |
|---|---|---|---|
| Agachamento | 10 kg | **30 kg** | 40 kg |
| Supino reto | 15 kg | **40 kg** | 50 kg |
| Remada no banco inclinado | 10 kg | **30 kg** | 40 kg |
| Levantamento terra | 20 kg | **50 kg** | 60 kg |
| Desenvolvimento militar | 5 kg | **20 kg** | 30 kg |
| Afundo com halteres | 3 kg | **8 kg por halter** | 8 kg por halter |

O app trata **carga por lado como fonte da verdade** (é o que você monta na barra) e calcula
o total a partir do peso da barra configurado.

**Se sua barra for mesmo de 20 kg**, vá em *Ajustes → Barras e halteres* e mude o valor.
Todos os totais, 1RM e tonelagem se corrigem sozinhos, sem mexer nas cargas por lado.

Se as cargas iniciais estiverem leves demais na primeira sessão, não force: registre
"Baixa" e o app sobe sozinho a cada série. Em duas sessões você chega no ponto certo.

---

## 2. Estoque e o que é montável

Anilhas: 4×10 kg, 8×5 kg, 4×3 kg, 4×2 kg (100 kg no total).

- **Na barra** (2 pontas): até 50 kg por lado → 110 kg com barra de 10 kg.
- **Nos halteres** (2 halteres = 4 pontas): até 25 kg por ponta → 52 kg por halter.

Cargas por lado montáveis na barra: 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13… Nem todo
valor existe — o app sempre arredonda para a combinação real mais próxima e, no empate,
escolhe a mais leve e com menos anilhas.

**Caso concreto do afundo:** subir de 3 para 6 kg por ponta exigiria 8 anilhas de 3 kg
(você tem 4). O app pula direto para 5 kg por ponta → **12 kg por halter**. Isso aparece
como "Estoque de anilhas não permite" quando você tenta um passo impossível.

---

## 3. Como a autorregulação funciona

Depois da **primeira série** de cada exercício, o app pergunta como foi:

| Resposta | Significado | Séries 2 e 3 | Próxima sessão | RPE gravado |
|---|---|---|---|---|
| **Baixa** | sobraram 3+ reps | +2 kg/lado (superiores) · +3 kg/lado (inferiores) | grava a carga já aumentada | 7 |
| **Boa** | sobraram 1–2 reps | mantém | +2 ou +3 kg/lado *se* fechar as 3 séries no alvo | 8,5 |
| **Pesada** | falha ou 0 reps | −2 ou −3 kg/lado | grava a carga reduzida | 10 |

Superiores: supino, remada, desenvolvimento. Inferiores: agachamento, terra, afundo.

Nas séries 2 e 3 o feedback é opcional. Se você marcar "Pesada" na última série, o app
**não sugere aumento** para a próxima sessão, mesmo que a primeira tenha sido "Boa".

Toda sugestão de carga aparece na tela de resumo com botões − e + antes de salvar.
Você tem a última palavra.

---

## 4. Periodização — ciclo de 3 meses

12 semanas = 3 blocos de 4 semanas, 4 sessões por semana (48 sessões).

| Semana | O que acontece |
|---|---|
| 1 | Adaptação com as cargas iniciais |
| 2–3, 5–7, 9–11 | Progressão linear conforme o feedback |
| 4, 8, 12 | Deload a 65% (ajustável em Ajustes) |
| Ciclo novo | Reinicia com as cargas da semana 11 |

A semana avança a cada 4 sessões registradas. A tela inicial mostra o bloco atual, a data
prevista de término (início + 3 meses) e o ritmo em relação a 4 sessões por semana. O ciclo
só fecha ao completar as 48 sessões; se você treinar menos, ele passa de 3 meses.
Para treinar fora do ritmo, force a semana em *Ajustes → Ciclo*.

**Durante o deload a carga de trabalho gravada não muda.** A autorregulação continua
ativa para ajustar as séries do dia, mas o próximo bloco parte das cargas gravadas.

---

## 5. Aquecimento

Dois níveis, como você definiu: carga baixa e alongamento máximo.

- **Checklist geral** antes de tudo: elevar FC, mobilidade de tornozelo/quadril, rotação
  torácica, ombro com a barra curta, ativação de glúteo e escápula.
- **Dentro de cada exercício**: barra vazia × alvo+3 reps com pausa de 2 s no ponto de
  maior alongamento, depois 50% da carga × reps do alvo com amplitude máxima. Essas séries
  aparecem no topo do exercício e somem quando você registra a primeira série de trabalho.

Séries de aquecimento não entram na tonelagem nem no cálculo de 1RM.

---

## 6. Segurança

- **Agachamento e supino**: travas do suporte reguladas na altura do ponto mais baixo,
  sempre. Sem travas, pare com 2 repetições na reserva — não vá à falha.
- **Terra e desenvolvimento em pé**: não têm trava. Se travar, devolva a barra ao chão à
  frente dos pés.
- **Afundo**: espaço livre atrás e ao lado; se perder o equilíbrio, solte os halteres para
  fora e para trás.

O aviso específico de cada exercício aparece na tela durante a execução.

---

## 7. Tempo de sessão

Alvo abaixo de 60 min. Somando aquecimento, séries, descansos padrão e troca de anilhas,
os dois treinos ficam na faixa de **35 a 50 min** — o limite superior é o dia em que a
autorregulação manda subir carga e você precisa remontar a barra entre séries. O
cronômetro da sessão fica no topo da tela e, se passar de 1 hora, o resumo avisa.

Descansos padrão (editáveis): agachamento 2:45 · supino 2:45 · remada 2:00 · terra 3:00 ·
desenvolvimento 2:30 · afundo 1:45.

---

## 8. Dados

- **Registro por série**: data, ciclo, semana, exercício, carga por lado, carga por
  implemento, carga total, anilhas usadas, repetições, feedback, RPE, descanso real.
- **Indicadores por exercício** (aba Evolução): volume total e por sessão, maior carga, variação do 1RM, reps por série, % de sessões com alvo cumprido, intensidade média (% do 1RM), RPE médio, descanso médio, frequência semanal e gráfico de volume por sessão. Deload fica fora da variação de 1RM, da taxa de alvo e da intensidade.
- **1RM estimado** pela fórmula de Epley: `1RM = peso × (1 + reps ÷ 30)`.
- **Gráfico** por exercício com carga total (linha cheia) e 1RM estimado (tracejada).
  Pontos em âmbar são sessões de deload.
- **Exportação** em CSV (separador `;`, decimal com vírgula, abre direto no Excel) e JSON.
- **Importação** de JSON restaura tudo — use para trocar de aparelho.

Tudo fica no `localStorage` do aparelho. Exporte o JSON de vez em quando.

---

## 9. Instalar e publicar

### Usar direto
Abra o `index.html` no celular. Funciona, mas sem service worker fora de um servidor.

### Publicar no Vercel (recomendado)
```bash
cd forja
npx vercel --prod
```
Não há build: é um site estático. O `vercel.json` já garante que o `sw.js` não fique
cacheado entre deploys.

### Instalar no celular
- **Android/Chrome**: menu ⋮ → *Instalar app* (ou o botão em Ajustes).
- **iPhone/Safari**: Compartilhar → *Adicionar à Tela de Início*.

Depois de instalado, funciona 100% offline.

---

## 10. Estrutura

```
forja/
├── index.html          app inteiro (HTML + CSS + JS, ~67 KB)
├── manifest.json       metadados do PWA
├── sw.js               service worker, cache-first
├── vercel.json         headers de deploy
├── icon-192.png
├── icon-512.png
└── icon-maskable.png
```

Nenhuma dependência externa, nenhuma requisição de rede em uso normal — só o link
opcional de vídeos de técnica, que abre uma busca no YouTube.

---

## 11. Alarme, notificações e tela ligada

- **Alarme**: ao zerar o descanso o app toca e vibra repetidamente até você tocar na tela
  (máx. ~35 s). Desative em *Ajustes → Timer e avisos*.
- **Notificação**: libere em *Ajustes → Permitir notificações*. Com o app em segundo plano,
  o aviso aparece quando o descanso acaba.
- **Tela ligada**: durante o treino o app pede ao celular para não apagar a tela e religa a
  trava ao voltar para o app.
- **Limite**: sem servidor de push, nenhum PWA garante alarme com o app fechado ou o celular
  bloqueado. No iPhone, notificações só funcionam com o app instalado na tela de início
  (iOS 16.4+). O mais confiável é manter o app aberto e a tela ligada.
