import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES, type LanguageCode } from '../lib/i18n';

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('preferred_lang') as LanguageCode;
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setCurrentLang(saved);
      document.documentElement.lang = saved;
      const langConfig = LANGUAGES.find((l) => l.code === saved);
      if (langConfig) {
        document.documentElement.dir = langConfig.dir;
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: LanguageCode, dir: string) => {
    setCurrentLang(code);
    localStorage.setItem('preferred_lang', code);
    document.documentElement.lang = code;
    document.documentElement.dir = dir;
    setIsOpen(false);

    // Dispatch global custom event for reactive UI updates
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang: code } }));
  };

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/90 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800 shadow-sm transition-all cursor-pointer backdrop-blur-md"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <svg
          className="w-3.5 h-3.5 text-[#E11D48]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        <span>{activeLangObj.code.toUpperCase()}</span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl py-2 z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Language / Idioma
          </div>
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code, lang.dir)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  currentLang === lang.code
                    ? 'bg-red-50 dark:bg-red-950/50 text-[#E11D48] font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {currentLang === lang.code && (
                  <span className="text-[#E11D48] font-bold text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
