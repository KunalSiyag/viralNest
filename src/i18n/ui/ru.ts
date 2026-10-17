/**
 * Chrome strings, Russian (вы, imperative «Скопируйте / Вставьте», UI labels in
 * «ёлочки»). Same keys and {tokens} as en.ts.
 * Vocabulary from docs/i18n/research/ru.json glossary: пин / доска / ссылка,
 * «Поделиться» › «Скопировать ссылку», «Галерея» / «Фото» / «Загрузки»,
 * букмарклет (кнопка-закладка), «PintDownload не связан с Pinterest Inc.».
 * Brand stays Latin «Pinterest» in chrome; never mention VPNs (plan F6).
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'Перейти к содержимому',
  homeAria: 'PintDownload: главная',
  logoAlt: 'Логотип PintDownload',
  header: {
    mainNavAria: 'Основная навигация',
    mobileNavAria: 'Инструменты',
    guides: 'Инструкции',
    themeToggle: 'Переключить светлую и тёмную тему',
    menuOpen: 'Открыть меню',
    menuClose: 'Закрыть меню',
  },
  languageMenu: {
    label: 'Язык',
    buttonAria: 'Язык: {current}',
    homeFallbackHint: 'главная страница',
  },
  footer: {
    blurb: 'Скачивайте публичные видео, фото, GIF и доски Pinterest по ссылке. Бесплатно и без регистрации, а свой водяной знак мы не добавляем.',
    tools: 'Инструменты',
    learn: 'Инструкции',
    company: 'О сервисе',
    blog: 'Блог',
    about: 'О нас',
    contact: 'Контакты',
    privacy: 'Конфиденциальность',
    terms: 'Условия',
    englishMarker: '(на английском)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Указывайте автора, когда публикуете чужие ролики и фото. PintDownload — независимый сервис, не связанный с Pinterest Inc.',
  },
  matrix: {
    heading: 'Все инструменты и инструкции PintDownload',
    devices: 'Телефон, ПК и браузер',
    formats: 'Форматы',
    batch: 'Доски и пины',
    guides: 'Инструкции',
  },
  howTo: {
    exampleLabel: 'Пример ссылки',
    stepPrefix: 'Шаг {n}: ',
  },
  faq: {
    title: 'Частые вопросы',
  },
  related: {
    title: 'Другие инструменты для Pinterest',
    intro: 'Каждый инструмент принимает свой тип ссылки. Выберите тот, что подходит к вашей, и сразу попадёте куда нужно.',
  },
  compare: {
    title: 'Пин, доска или профиль: какой инструмент выбрать?',
    intro: 'Выбирайте инструмент по типу ссылки. Чаще всего скачивание не работает именно из-за ссылки не того типа.',
    feature: 'Что сравниваем',
    pin: 'Пин',
    board: 'Доска ZIP',
    profile: 'Профиль ZIP',
    rows: {
      url: { feature: 'Пример ссылки', pin: 'pinterest.com/pin/123…', board: 'pinterest.com/имя/доска/', profile: 'pinterest.com/имя/' },
      what: { feature: 'Что вы получите', pin: '1 файл или всю карусель', board: 'Много пинов в ZIP', profile: 'Видимые пины в ZIP' },
      best: { feature: 'Когда нужен', pin: 'Сохранить одну идею или видео', board: 'Мудборды и подборки', profile: 'Архив пинов автора' },
      carousel: { feature: 'Слайды карусели', pin: 'Да, все слайды', board: 'Обложка каждого пина*', profile: 'Обложка каждого пина*' },
      private: { feature: 'Закрытый контент', pin: 'Не поддерживается', board: 'Не поддерживается', profile: 'Не поддерживается' },
    },
    footnoteBefore: '* Чтобы получить все слайды карусели из пина на доске или в профиле, откройте этот пин в инструменте',
    footnoteLink: '«Скачать пин»',
    footnoteAfter: '.',
  },
  bookmarklet: {
    title: 'Букмарклет: скачивание в один клик',
    body: 'Букмарклет — это кнопка-закладка в браузере на компьютере. Нажмите на неё на странице любого пина в Pinterest, и PintDownload откроется с уже вставленной ссылкой.',
    button: 'Перетащите в закладки',
    dragAlert: 'Перетащите эту кнопку на панель закладок браузера, чтобы установить её.',
    dragTitle: 'Перетащите меня на панель закладок',
    notPinterest: 'Сначала откройте страницу Pinterest.',
    chromeTitle: 'Chrome, Edge, Яндекс',
    chromeBodyHtml: 'Нажмите `Ctrl+Shift+B` (на Mac `Cmd+Shift+B`), чтобы показать панель закладок, и перетащите на неё кнопку.',
    safariTitle: 'Safari',
    safariBody: 'Перетащите кнопку в «Избранное». На iPhone или iPad добавьте любую страницу в закладки, измените её адрес и вставьте вместо него код букмарклета.',
    useTitle: 'Как пользоваться',
    useBodyHtml: 'Откройте пин или доску и нажмите закладку **PintDownload**. Сайт откроется, ссылка уже будет в поле.',
    imageAlt:
      'Как добавить PintDownload в закладки Chrome: откройте меню, выберите «Закладки», затем «Добавить вкладку в закладки» и сохраните её на панели закладок',
  },
  ad: {
    label: 'Реклама',
  },
  notFound: {
    title: 'Страница не найдена — {brand}',
    description: 'Такой страницы на {domain} нет. Вернитесь на главную или выберите инструмент для скачивания с Pinterest.',
    h1: 'Этого пина нет на доске.',
    lede: 'Ссылка могла устареть, в ней может быть опечатка, или страницу удалили. Начните с главной, загляните в инструкции или выберите инструмент ниже.',
    ticketLabel: 'Билет · публичная ссылка',
    stamp: 'Страница не найдена',
    home: 'На главную',
    blog: 'Читать блог',
    contact: 'Написать нам',
    toolsAria: 'Инструменты для скачивания с Pinterest',
    bug: 'Думаете, это ошибка?',
    videoBlurb: 'Публичные видеопины в MP4',
    pinBlurb: 'Фото, GIF и карусели',
    boardBlurb: 'Публичные доски в ZIP',
    guideBlurb: 'Шаги для телефона и ПК',
    guideBadge: 'Гайд',
  },
};
