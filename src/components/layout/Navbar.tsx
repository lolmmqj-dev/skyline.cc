'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, User, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
    ru: {
        navLinks: [
            { name: 'Главная', href: '#' },
            { name: 'Магазин', href: '#store' },
            { name: 'О нас', href: '#about' },
            { name: 'Поддержка', href: 'https://discord.gg/sZeTVxJd3f' },
        ],
        login: 'Войти',
        loginRegister: 'Войти / Регистрация',
        account: 'Личный кабинет',
        langLabel: 'RU',
        langAria: 'Сменить язык',
    },
    en: {
        navLinks: [
            { name: 'Home', href: '#' },
            { name: 'Store', href: '#store' },
            { name: 'About', href: '#about' },
            { name: 'Support', href: 'https://discord.gg/sZeTVxJd3f' },
        ],
        login: 'Sign In',
        loginRegister: 'Sign In / Register',
        account: 'Dashboard',
        langLabel: 'EN',
        langAria: 'Switch language',
    },
} as const;

export default function Navbar() {
    const { lang, toggle } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [hasAccount, setHasAccount] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkAccount = () => {
            try {
                const storedUser = localStorage.getItem('skyline_user');
                if (!storedUser) {
                    setHasAccount(false);
                    return;
                }
                const parsed = JSON.parse(storedUser);
                setHasAccount(Boolean(parsed && parsed.email));
            } catch {
                setHasAccount(false);
            }
        };

        const handleVisibility = (_event: Event) => {
            if (document.visibilityState === 'visible') {
                checkAccount();
            }
        };

        const handleStorage = (_event: StorageEvent) => {
            checkAccount();
        };

        checkAccount();
        window.addEventListener('skyline-auth', checkAccount as EventListener);
        window.addEventListener('storage', handleStorage);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('skyline-auth', checkAccount as EventListener);
            window.removeEventListener('storage', handleStorage);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    const t = copy[lang];
    const navLinks = t.navLinks;

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
                    isScrolled ? 'bg-black/50 backdrop-blur-md border-white/5 py-4' : 'bg-transparent py-6'
                }`}
            >
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="logo flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-black font-bold text-lg group-hover:rotate-12 transition-transform">
                            S
                        </div>
                        <span className="font-bold text-xl tracking-wide">SKYLINE</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <div className="nav-links">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-400 hover:text-white hover:scale-105 transition-all text-sm font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggle}
                                aria-label={t.langAria}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
                            >
                                <Globe size={16} className="text-gray-400" />
                                <span className="text-xs text-gray-300">{t.langLabel}</span>
                            </button>

                            {hasAccount ? (
                                <Link
                                    href="/dashboard"
                                    className="btn-ghost px-5 py-2 rounded-lg text-sm font-bold border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-2"
                                >
                                    <LayoutDashboard size={16} />
                                    <span>{t.account}</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="btn-ghost px-5 py-2 rounded-lg text-sm font-bold border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-2"
                                >
                                    <User size={16} />
                                    <span>{t.login}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                        >
                            <div className="px-4 py-8 flex flex-col gap-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-bold text-gray-300 hover:text-cyan-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <hr className="border-white/10" />
                                <button
                                    onClick={() => {
                                        toggle();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    <Globe size={18} />
                                    <span>{t.langLabel}</span>
                                </button>
                                {hasAccount ? (
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="btn-primary py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2"
                                    >
                                        <LayoutDashboard size={18} />
                                        {t.account}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsAuthModalOpen(true);
                                        }}
                                        className="btn-primary py-3 rounded-xl font-bold text-center"
                                    >
                                        {t.loginRegister}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}
