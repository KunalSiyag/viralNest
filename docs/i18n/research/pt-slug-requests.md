# pt: requests for infra (slugs, titles, checks)

Writer: writer-pt (agent), 2026-10-16. No slug changes requested.

## 1. Full HD page: the fixed title and H1 fail `i18n:check` (blocking)

**Page:** `pinterest-4k-downloader` at `/pt/baixar-video-pinterest-full-hd` (status `gated-4k`, gate open).

**Status:** the page is written but **not in the tree**. With it in `src/content/i18n/pt/`, `npm run i18n:check -- pt` reports 2 errors and `npm test` fails for every writer (seo-invariants "i18n content files"). The ready file is at the end of this note: save it as `src/content/i18n/pt/pinterest-4k-downloader.json` once the check is fixed.

**What happens:** both errors are on the fixed values from the plan matrix:

```
ERROR meta.title: unconditional 1080p/Full HD: say "usually 720p, 1080p when the pin has it"
ERROR hero.h1: unconditional 1080p/Full HD: say "usually 720p, 1080p when the pin has it"
```

- Title (plan §3, changed by the planner for honesty): `Vídeo do Pinterest em Full HD ou 4K? A Qualidade Real`
- H1 (plan §3): `Full HD ou 4K? A qualidade real`

Both are questions; the plan rewrote them from the research's "Baixar Vídeo do Pinterest em Full HD" precisely so they ask instead of promising. The rule in `src/i18n/content-rules.ts` (`/1080p|Full ?HD/` without a word from `CONDITIONAL_1080`) does not know that, while the 4K rule on the same page requires the H1 to ask.

**Request (preferred): adjust the check, keep the plan's title and H1.** In `checkPageFile`, treat a headline on the 4K explainer page that asks a question as conditional, the same way the 4K rule does. For example:

```ts
const asks = isFourK && /[?？]/.test(value);
if (/1080p|Full ?HD/i.test(value) && !CONDITIONAL_1080.test(value) && !asks) …
```

The planner's own validator accepted these strings: `docs/i18n/tools/build_plan.py` line 297 treats `ou 4K` and `quando existe` as conditional context, but `CONDITIONAL_1080` in `content-rules.ts` dropped those markers. Adding `ou 4K` (or the question rule above) restores what the plan validated.

Evidence that "Full HD" must stay in the headline: the primary keyword is `baixar vídeo do pinterest em full hd`; Brazilian autocomplete returns "baixar video pinterest full hd → full hd 4k | sem marca d'água | 1080p" (research `pt.json`, page `pinterest-4k-downloader`). The body says "geralmente 720p, e 1080p quando o pin tem essa versão" everywhere it mentions 1080p or Full HD.

**Fallback if the check must stay as is:** change the matrix row to

- title `Vídeo do Pinterest em HD ou 4K? A Qualidade Real` (48 code points)
- H1 `HD ou 4K? A qualidade real`

This loses the exact "full hd" match in the title, so I recommend the check change instead. The content file currently carries the plan's values; whichever option infra picks, the writer will follow.

## 2. Note for the reviewer: one pt-PT board label

`pinterest-board-downloader.json`, FAQ 6, quotes the Portugal screen label once: “álbum” (older UI “painel”), as plan §1 allows ("pt-PT UI labels in parentheses only where the screen differs"; source help.pinterest.com/pt-pt "Criar um álbum"). The glossary ban `\bálbum\b` in `content-rules.ts` does not fire on it because JavaScript `\b` treats “á” as a non-word character, so the rule only matches "álbum" glued to a preceding letter. If infra means the ban to cover every use, it should switch to a Unicode-aware boundary (for example `/(?<![\p{L}])álbum(?![\p{L}])/iu`), and this FAQ should then be allow-listed or reworded.

## Ready content: `src/content/i18n/pt/pinterest-4k-downloader.json`

Passes the schema, links and every other rule; only the two errors above remain. Body copy never promises 1080p or 4K: "geralmente 720p, e 1080p quando o pin tem essa versão".

```json
{
  "pageId": "pinterest-4k-downloader",
  "locale": "pt",
  "meta": {
    "title": "Vídeo do Pinterest em Full HD ou 4K? A Qualidade Real",
    "description": "Baixe o vídeo do Pinterest na maior qualidade que o pin tem, até 1080p quando existe. Sem promessa falsa de 4K: veja a resolução real antes de baixar."
  },
  "keywords": {
    "primary": "baixar vídeo do pinterest em full hd",
    "secondary": [
      "baixar video pinterest full hd 1080p",
      "baixar video pinterest 4k",
      "download vídeo pinterest 4k",
      "baixar imagem pinterest 4k",
      "pinterest downloader 4k"
    ]
  },
  "nav": {
    "label": "Qualidade real do vídeo",
    "short": "Qualidade",
    "card": {
      "title": "4K no Pinterest? A qualidade real",
      "blurb": "O que o Pinterest realmente publica, e como pegar a maior versão.",
      "badge": "HD"
    }
  },
  "hero": {
    "h1": "Full HD ou 4K? A qualidade real",
    "lede": "Cole o pin e baixe o melhor arquivo que o Pinterest **realmente publica**: sem aumentar a resolução e sem selo de 4K num vídeo de 720p."
  },
  "intro": [
    "Muito site promete vídeo do Pinterest em 4K para qualquer pin. Não é assim que funciona: o Pinterest recodifica tudo o que recebe e publica versões menores. Esta página explica o que existe de verdade e como baixar a maior versão de cada pin.",
    "Resumo: vídeo geralmente em 720p, e em 1080p (Full HD) quando o pin tem essa versão; foto com até 1200 px de largura."
  ],
  "features": [
    {
      "h": "Sem 4K inventado",
      "p": "Se o pin só tem 720p, você recebe 720p. Não esticamos o arquivo para parecer 4K."
    },
    {
      "h": "Resolução à vista",
      "p": "O resultado mostra a resolução real de cada arquivo antes de você baixar."
    },
    {
      "h": "Full HD quando existe",
      "p": "Quando o pin tem a versão 1080p, ela aparece na lista e você escolhe."
    }
  ],
  "sections": [
    {
      "h2": "Resposta curta: o Pinterest quase nunca tem 4K",
      "paragraphs": [
        "O Pinterest recodifica cada vídeo enviado. Os arquivos públicos costumam ser 720p, e 1080p quando o pin tem essa versão; as fotos param em 1200 px de largura. Um “baixador 4K de Pinterest” só consegue esticar esses arquivos, e nós não fazemos isso. O PintDownload salva o maior arquivo que o pin realmente tem e mostra o tamanho dele."
      ]
    },
    {
      "h2": "O que você recebe de verdade",
      "paragraphs": [
        "Por tipo de pin:"
      ],
      "list": [
        "**Vídeo (MP4)**: geralmente 720p, e 1080p quando o pin tem. A lista de qualidades mostra todas as versões.",
        "**Foto (JPG ou PNG)**: até 1200 px de largura, o maior tamanho que o Pinterest publica.",
        "**GIF**: o GIF animado que o Pinterest serve, e não a capa parada.",
        "**Som (MP3)**: 192 kbps, gerado no seu navegador a partir do som do vídeo."
      ]
    },
    {
      "h2": "Full HD, quando o pin tem, sem marca d’água",
      "paragraphs": [
        "Quando o pin tem 1080p, o MP4 em Full HD vem do jeito que o Pinterest serve, sem marca d’água colocada por nós. O que o criador escreveu dentro do vídeo continua lá."
      ]
    },
    {
      "h2": "Quando você precisa de mais do que o Pinterest tem",
      "paragraphs": [
        "Para impressão, telão ou trabalho de cliente, a cópia do Pinterest é referência, não matriz. Abra o link de origem do pin ou peça o arquivo ao criador, e licencie se o uso for comercial. Para o dia a dia, o [[pinterest-video-downloader|baixador de vídeo]] e o [[pinterest-image-downloader|baixador de imagem]] entregam os mesmos arquivos, na melhor qualidade disponível."
      ]
    }
  ],
  "steps": {
    "title": "Como pegar a maior qualidade de um pin",
    "intro": "Só pins públicos. O resultado mostra a resolução real antes de você salvar.",
    "exampleLabel": "Link de pin de exemplo",
    "items": [
      {
        "title": "Copie o link do pin",
        "body": "No app: **Compartilhar** › **Copiar link**. No site: copie o endereço com `/pin/`. Links `pin.it` também servem."
      },
      {
        "title": "Cole acima",
        "body": "O PintDownload lê os arquivos que o Pinterest publica para esse pin público."
      },
      {
        "title": "Escolha a maior qualidade da lista",
        "body": "Pins de vídeo mostram 720p, e 1080p quando o pin tem. A resolução real aparece ao lado de cada arquivo."
      },
      {
        "title": "Salve o arquivo",
        "body": "Baixe o MP4 ou a foto como estão. Dê crédito ao criador se compartilhar."
      }
    ]
  },
  "faq": {
    "title": "Perguntas frequentes sobre qualidade e 4K",
    "items": [
      {
        "q": "Existe vídeo em 4K no Pinterest?",
        "a": "Quase nunca. O Pinterest recodifica o que os criadores enviam, e os vídeos públicos costumam ser 720p, ou 1080p quando o pin tem essa versão. Quem oferece 4K para um pin está só aumentando o arquivo: mais pixels, nenhum detalhe a mais."
      },
      {
        "q": "Por que meu vídeo saiu em 720p?",
        "a": "Porque é o tamanho que o Pinterest publica para aquele pin. Muitos pins de vídeo só têm 720p. Quando também existe 1080p, a lista mostra as duas opções."
      },
      {
        "q": "Como escolher a maior qualidade disponível?",
        "a": "Depois de colar o link, olhe a lista de qualidades: a resolução aparece ao lado de cada arquivo. Escolha a maior e baixe."
      },
      {
        "q": "Imagem em 4K: dá?",
        "a": "Não. A maior imagem pública de um pin tem até 1200 px de largura. O Pinterest não deixa público o arquivo enviado pelo criador, então nenhuma ferramenta entrega mais que isso a partir de um pin."
      },
      {
        "q": "Um programa de upscale transforma o vídeo em 4K?",
        "a": "Deixa o arquivo maior, não mais nítido. O upscale adivinha os detalhes que faltam, e o resultado costuma parecer borrado ou artificial. Para um 4K de verdade, peça a fonte ao criador ou licencie o material."
      },
      {
        "q": "O PintDownload comprime o arquivo ou põe marca d’água?",
        "a": "Não. Você recebe o mesmo arquivo que o Pinterest serve, byte por byte, sem marca d’água nossa. O único arquivo feito do seu lado é o MP3, que o navegador gera a partir do som do vídeo."
      },
      {
        "q": "O PintDownload é afiliado ao Pinterest?",
        "a": "Não. É uma ferramenta independente, sem ligação com o Pinterest, Inc., e só funciona com pins públicos."
      }
    ]
  },
  "related": {
    "title": "Outras ferramentas para o Pinterest"
  },
  "schema": {
    "appName": "Qualidade real do vídeo do Pinterest — PintDownload",
    "howToName": "Como baixar a maior qualidade que um pin do Pinterest tem",
    "howToDescription": "Cole o link de um pin público, confira a resolução real de cada arquivo e baixe a maior versão publicada."
  },
  "datePublished": "2026-10-16",
  "dateModified": "2026-10-16",
  "review": {
    "writer": "writer-pt (agent), 2026-10-16. Honest 4K explainer (user decision 2): facts mirror the rewritten English page; no 4K or Full HD promised."
  }
}
```

## Release decisions (release-integrator, 2026-10-16)

1. **Full HD page: applied (preferred option, check change).** In `checkPageFile`, a field on the 4K explainer that asks a question (`?`, `؟`, ไหม/แค่ไหน, هل, var mı, được không) is treated as conditional for the 1080p/Full HD rule, which restores what the planner's validator accepted. The plan title and H1 stay as written. The ready file is saved as `src/content/i18n/pt/pinterest-4k-downloader.json`; `/pt/baixar-video-pinterest-full-hd` is live (screenshot `release/pt-4k-1440.png`).
2. **"álbum" ban: applied.** The rule is now Unicode-aware (`(?<![\p{L}“"«])álbum(?![\p{L}])`, flag `u`), so it catches normal uses; a quoted Portugal screen label (“álbum”) stays allowed, as plan §1 permits. The board FAQ passes unchanged.
