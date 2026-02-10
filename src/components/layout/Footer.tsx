'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
    ru: {
        tagline: 'Лучший опыт для вашей игры.',
        links: [
            { label: 'Условия использования', href: '#' },
            { label: 'Политика конфиденциальности', href: '#' },
            { label: 'Поддержка', href: '#' },
        ],
        rights: 'Все права защищены.',
    },
    en: {
        tagline: 'The ultimate experience for your game.',
        links: [
            { label: 'Terms of Service', href: '#' },
            { label: 'Privacy Policy', href: '#' },
            { label: 'Support', href: '#' },
        ],
        rights: 'All rights reserved.',
    },
} as const;

export default function Footer() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <footer className="border-t border-white/5 bg-black py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-white">
                            SKYLINE<span className="text-primary">.CC</span>
                        </h3>
                        <p className="text-gray-500 text-sm">{t.tagline}</p>
                    </div>

                    <div className="flex gap-8 text-sm text-gray-400">
                        {t.links.map((link) => (
                            <a key={link.label} href={link.href} className="hover:text-primary transition-colors">
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="text-gray-600 text-sm">
                        &copy; {new Date().getFullYear()} Skyline.cc. {t.rights}
                    </div>
                </div>
            </div>
        </footer>
    );
}
