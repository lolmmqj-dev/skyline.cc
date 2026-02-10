'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, Calendar, Activity, Lock, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
    ru: {
        loading: 'Загрузка...',
        title: 'Личный кабинет',
        logout: 'Выйти',
        statusLabel: 'Статус',
        statusActive: 'АКТИВЕН',
        statusInactive: 'НЕ АКТИВЕН',
        expiresLabel: 'Истекает',
        hwidLabel: 'HWID',
        hwidNotLinked: 'НЕ ПРИВЯЗАНО',
        activationTitle: 'Активация ключа',
        activationDesc: 'Введите лицензионный ключ для продления подписки.',
        activationPlaceholder: 'skyline...',
        activate: 'Активировать',
        messages: {
            success: 'Подписка успешно активирована! (+30 дней)',
        },
        errors: {
            activation: 'Ошибка активации',
            network: 'Ошибка сети',
        },
        noExpiry: '-',
    },
    en: {
        loading: 'Loading...',
        title: 'Dashboard',
        logout: 'Log out',
        statusLabel: 'Status',
        statusActive: 'ACTIVE',
        statusInactive: 'INACTIVE',
        expiresLabel: 'Expires',
        hwidLabel: 'HWID',
        hwidNotLinked: 'NOT LINKED',
        activationTitle: 'Key Activation',
        activationDesc: 'Enter your license key to extend your subscription.',
        activationPlaceholder: 'skyline...',
        activate: 'Activate',
        messages: {
            success: 'Subscription activated! (+30 days)',
        },
        errors: {
            activation: 'Activation error',
            network: 'Network error',
        },
        noExpiry: '-',
    },
} as const;

export default function Dashboard() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('skyline_user');
        if (!storedUser) {
            router.replace('/');
            return;
        }

        let parsed: any = null;
        try {
            parsed = JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('skyline_user');
            router.replace('/');
            return;
        }

        if (!parsed || !parsed.email) {
            localStorage.removeItem('skyline_user');
            router.replace('/');
            return;
        }

        const normalizedUser = {
            subscriptionStatus: 'inactive',
            subscriptionExpires: null,
            ...parsed,
        };

        setUser(normalizedUser);
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('skyline_user');
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('skyline-auth'));
        }
        router.push('/');
    };

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false);

        try {
            const res = await fetch('/api/keys/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, key }),
            });
            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
                setMessage(t.messages.success);
                const updatedUser = { ...user, subscriptionStatus: 'active', subscriptionExpires: data.expiry };
                setUser(updatedUser);
                localStorage.setItem('skyline_user', JSON.stringify(updatedUser));
                setKey('');
            } else {
                setMessage(data.message || t.errors.activation);
            }
        } catch (err) {
            setMessage(t.errors.network);
        }
    };

    if (loading || !user) {
        return <div className="min-h-screen bg-black flex items-center justify-center">{t.loading}</div>;
    }

    const isActive = user.subscriptionStatus === 'active';
    const expiryDate = user.subscriptionExpires
        ? new Date(user.subscriptionExpires).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')
        : t.noExpiry;

    return (
        <div className="min-h-screen pt-24 px-4 pb-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        {t.title}
                    </h1>
                    <button onClick={handleLogout} className="btn-ghost flex items-center gap-2 text-sm">
                        <LogOut size={16} /> {t.logout}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-custom p-6 border-l-4 border-l-cyan-500"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="text-cyan-400" />
                            <h3 className="text-lg font-bold">{t.statusLabel}</h3>
                        </div>
                        <p className={`text-2xl font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {isActive ? t.statusActive : t.statusInactive}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-custom p-6 border-l-4 border-l-purple-500"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="text-purple-400" />
                            <h3 className="text-lg font-bold">{t.expiresLabel}</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{expiryDate}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-custom p-6 border-l-4 border-l-yellow-500"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-yellow-400" />
                            <h3 className="text-lg font-bold">{t.hwidLabel}</h3>
                        </div>
                        <div className="relative overflow-hidden rounded bg-black/30 p-2">
                            <p className="font-mono text-sm text-gray-400 text-center blur-[2px] hover:blur-none transition-all cursor-pointer select-all">
                                {user.hwid || t.hwidNotLinked}
                            </p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card-custom p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Key className="w-8 h-8 text-cyan-400" />
                        <div>
                            <h2 className="text-2xl font-bold">{t.activationTitle}</h2>
                            <p className="text-gray-400 text-sm">{t.activationDesc}</p>
                        </div>
                    </div>

                    <form onSubmit={handleRedeem} className="max-w-md">
                        <div className="relative mb-4">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder={t.activationPlaceholder}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="form-input with-icon font-mono"
                            />
                        </div>

                        <button className="btn-primary w-full" disabled={!key}>
                            {t.activate}
                        </button>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={`mt-4 p-3 rounded-lg text-sm text-center font-bold ${
                                    isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}
                            >
                                {message}
                            </motion.div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
