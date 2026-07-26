import { TRANSLATIONS, LANGUAGES, type LanguageCode } from './i18n';

export function applyDOMTranslations(langCode: LanguageCode) {
  if (typeof window === 'undefined') return;

  const t = TRANSLATIONS[langCode] || TRANSLATIONS.en;
  const langObj = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];

  document.documentElement.lang = langCode;
  document.documentElement.dir = langObj.dir;

  // Translate Hero H1 Title (e.g. "Pinterest Video Downloader")
  const heroHeading = document.getElementById('hero-heading');
  if (heroHeading) {
    if (langCode === 'en') {
      // Revert to English default HTML
    } else {
      heroHeading.innerHTML = `${t.heroTitlePrefix} <span class="text-[#E11D48]">${t.heroTitleHighlight}</span>`;
    }
  }

  // Translate Navigation Item Links if matched
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('nav[aria-label="Main"] a, nav[aria-label="Tools"] a');
  navLinks.forEach((link) => {
    const text = link.innerText.trim();
    if (text.includes('Video') || text.includes('Vídeo') || text.includes('فيديو')) {
      link.innerText = t.videoTool;
    } else if (text.includes('Photo') || text.includes('Image') || text.includes('Foto') || text.includes('صورة')) {
      link.innerText = t.imageTool;
    } else if (text.includes('Board') || text.includes('Pasto') || text.includes('لوحة')) {
      link.innerText = t.boardTool;
    } else if (text.includes('Profile') || text.includes('Perfil') || text.includes('ملف')) {
      link.innerText = t.profileTool;
    }
  });

  console.log(`🌐 Page DOM translated to [${langCode}]`);
}
