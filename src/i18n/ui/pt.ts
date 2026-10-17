/**
 * Chrome strings, Portuguese (Brazilian, você, "celular", "baixar", "pasta").
 * Same keys and {tokens} as en.ts. Vocabulary from docs/i18n/research/pt.json
 * glossary: Compartilhar › Copiar link, pasta (board), Favoritos / barra de
 * favoritos (Chrome pt-BR), Galeria/Fotos, Downloads, "vale um" (ticket).
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'Pular para o conteúdo',
  homeAria: 'Página inicial do PintDownload',
  logoAlt: 'Logo do PintDownload',
  header: {
    mainNavAria: 'Navegação principal',
    mobileNavAria: 'Ferramentas',
    guides: 'Guias',
    themeToggle: 'Alternar entre modo claro e escuro',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
  },
  languageMenu: {
    label: 'Idioma',
    buttonAria: 'Idioma: {current}',
    homeFallbackHint: 'página inicial',
  },
  footer: {
    blurb: 'Baixe vídeos, fotos, pastas e perfis públicos do Pinterest. Grátis, sem login e sem marca d’água nossa.',
    tools: 'Ferramentas',
    learn: 'Guias',
    company: 'Institucional',
    blog: 'Blog',
    about: 'Quem somos',
    contact: 'Contato',
    privacy: 'Privacidade',
    terms: 'Termos de uso',
    englishMarker: '(em inglês)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Dê crédito a quem criou o conteúdo quando reutilizar. Ferramenta independente: o PintDownload não é afiliado ao Pinterest, Inc.',
  },
  matrix: {
    heading: 'Todas as ferramentas e guias do PintDownload',
    devices: 'Celular, PC e navegador',
    formats: 'Formatos e qualidade',
    batch: 'Pastas, perfis e pins',
    guides: 'Guias',
  },
  howTo: {
    exampleLabel: 'Link de exemplo',
    stepPrefix: 'Passo {n}: ',
  },
  faq: {
    title: 'Perguntas frequentes',
  },
  related: {
    title: 'Outras ferramentas para o Pinterest',
    intro: 'Cada ferramenta aceita um tipo de link. Escolha a que combina com o seu e você chega ao baixador certo de primeira.',
  },
  compare: {
    title: 'Pin, pasta ou perfil: qual ferramenta usar?',
    intro: 'Use a ferramenta que corresponde ao seu link. Colar o tipo de link errado é o motivo mais comum de um download não dar certo.',
    feature: 'O que muda',
    pin: 'Pin',
    board: 'Pasta ZIP',
    profile: 'Perfil ZIP',
    rows: {
      url: { feature: 'Exemplo de link', pin: 'pinterest.com/pin/123…', board: 'pinterest.com/usuario/pasta/', profile: 'pinterest.com/usuario/' },
      what: { feature: 'O que você recebe', pin: '1 arquivo ou o carrossel inteiro', board: 'Vários pins em um ZIP', profile: 'Pins visíveis em um ZIP' },
      best: { feature: 'Ideal para', pin: 'Guardar uma ideia ou um vídeo', board: 'Moodboards e coleções', profile: 'Backup de uma conta' },
      carousel: { feature: 'Imagens do carrossel', pin: 'Sim, todas', board: 'A capa de cada pin*', profile: 'A capa de cada pin*' },
      private: { feature: 'Conteúdo privado ou secreto', pin: 'Não funciona', board: 'Não funciona', profile: 'Não funciona' },
    },
    footnoteBefore: '* Para ter todas as imagens do carrossel de um pin que está em uma pasta ou perfil, abra esse pin no',
    footnoteLink: 'baixador de pin',
    footnoteAfter: '.',
  },
  bookmarklet: {
    title: 'Favorito de 1 clique',
    body: 'Baixe vídeos, fotos e pastas do Pinterest enquanto navega no computador. Clique no favorito em qualquer pin e o PintDownload abre com o link pronto.',
    button: 'Arraste para a barra de favoritos',
    dragAlert: 'Arraste este botão para a barra de favoritos do navegador para instalar.',
    dragTitle: 'Arraste para a barra de favoritos',
    notPinterest: 'Abra uma página do Pinterest primeiro.',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'Aperte `Ctrl+Shift+B` (Cmd+Shift+B no Mac) para mostrar a barra de favoritos e arraste o botão até ela.',
    safariTitle: 'Safari',
    safariBody: 'Arraste para os Favoritos. No iPhone ou iPad, adicione qualquer página aos favoritos, edite o endereço e cole o código do bookmarklet.',
    useTitle: 'Como usar',
    useBodyHtml: 'Em um pin ou uma pasta, clique no favorito **PintDownload**. Ele abre com o link já colado.',
    imageAlt:
      'Como salvar o PintDownload nos favoritos do Chrome: abra o menu, entre em Favoritos, adicione a guia aos favoritos e escolha a barra de favoritos',
  },
  ad: {
    label: 'Publicidade',
  },
  notFound: {
    title: 'Página não encontrada — {brand}',
    description: 'Esta página não existe em {domain}. Volte para o início ou use um baixador do Pinterest.',
    h1: 'Este pin não está na pasta.',
    lede: 'O link pode ser antigo, ter um erro de digitação ou ter sido removido. Use o baixador, leia um guia ou escolha uma ferramenta abaixo.',
    ticketLabel: 'Vale um · link público',
    stamp: 'Página não encontrada',
    home: 'Ir para o início',
    blog: 'Blog',
    contact: 'Contato',
    toolsAria: 'Baixadores do Pinterest',
    bug: 'Acha que é um erro?',
    videoBlurb: 'Salve pins de vídeo públicos',
    pinBlurb: 'Imagens, GIFs e carrosséis',
    boardBlurb: 'Pastas públicas em um ZIP',
    guideBlurb: 'Passo a passo no celular e no PC',
    guideBadge: 'Guia',
  },
};
