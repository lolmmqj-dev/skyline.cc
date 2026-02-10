'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'ru' | 'en';

interface LanguageContextValue {
    lang: Language;
    setLang: (lang: Language) => void;
    toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'skyline_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>('ru');

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'ru' || stored === 'en') {
            setLang(stored);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const value = useMemo(
        () => ({
            lang,
            setLang,
            toggle: () => setLang((prev) => (prev === 'ru' ? 'en' : 'ru')),
        }),
        [lang]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
