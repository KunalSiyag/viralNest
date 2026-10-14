import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES, type LanguageCode } from '../lib/i18n';
import { applyDOMTranslations } from '../lib/i18n-client';

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('preferred_lang') as LanguageCode;
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setCurrentLang(saved);
      applyDOMTranslations(saved);
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
    applyDOMTranslations(code);
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
        className="inline-flex items-center gap-1.5 h-11 px-3 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-bold hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors cursor-pointer touch-manipulation"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <svg
          className="w-3.5 h-3.5 text-[#C8281A]"
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
        <div className="absolute right-0 mt-2 w-52 rounded-md bg-white dark:bg-[#1D2026] border-2 border-[#17191E] dark:border-[#393D45] z-50 max-h-80 overflow-y-auto overscroll-contain">
          <div className="px-3 pt-3 pb-2 mx-1 t-label text-[#4E535C] dark:text-[#C2C5CB] border-b-2 border-[#17191E] dark:border-[#F5F6F7]">
            Language / Idioma
          </div>
          <div className="p-1 divide-y-2 divide-dashed divide-[#C2C5CB] dark:divide-[#393D45]">
            {LANGUAGES.map((lang) => {
              const current = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code, lang.dir)}
                  aria-current={current ? 'true' : undefined}
                  className={`w-full min-h-[2.75rem] text-left px-2.5 text-sm flex items-center justify-between gap-2 rounded-[3px] transition-colors touch-manipulation ${
                    current
                      ? 'bg-[#17191E] text-white dark:bg-[#F5F6F7] dark:text-[#17191E] font-bold'
                      : 'text-[#17191E] dark:text-[#F5F6F7] hover:bg-[#F5F6F7] dark:hover:bg-[#24272D]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {current && (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
