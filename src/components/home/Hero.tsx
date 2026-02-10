'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Shield, Zap, Cloud } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
    ru: {
        badge: 'v4.0 уже доступна',
        titleLine: 'Доминируй',
        highlight: 'точно и стильно',
        subtitle:
            'Самый продвинутый клиент для Minecraft. Незаметный, мощный и созданный для победителей. Почувствуй разницу уже сегодня.',
        ctaPurchase: 'Купить',
        ctaDetails: 'Подробнее',
        features: [
            {
                title: 'Незаметно',
                desc: 'Продвинутая система обхода защищает ваш аккаунт.',
                icon: Shield,
            },
            {
                title: 'Высокая производительность',
                desc: 'Оптимизация для максимального FPS и нулевой задержки.',
                icon: Zap,
            },
            {
                title: 'Облачные конфиги',
                desc: 'Синхронизируйте настройки на всех устройствах мгновенно.',
                icon: Cloud,
            },
        ],
    },
    en: {
        badge: 'v4.0 is now available',
        titleLine: 'Dominate with',
        highlight: 'Precision & Style',
        subtitle:
            'The most advanced client for Minecraft. Undetected, powerful, and designed for winners. Experience the difference today.',
        ctaPurchase: 'Purchase',
        ctaDetails: 'More Details',
        features: [
            {
                title: 'Undetected',
                desc: 'Advanced bypass technology keeps your account safe.',
                icon: Shield,
            },
            {
                title: 'High Performance',
                desc: 'Optimized for maximum FPS and zero input lag.',
                icon: Zap,
            },
            {
                title: 'Cloud Configs',
                desc: 'Sync your settings across all your devices instantly.',
                icon: Cloud,
            },
        ],
    },
} as const;

export default function Hero() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />

            <div className="container relative z-10 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6">
                        {t.badge}
                    </span>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        {t.titleLine} <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 text-glow">
                            {t.highlight}
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        {t.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="#store" className="btn-liquid-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2">
                            {t.ctaPurchase} <ChevronRight className="w-5 h-5" />
                        </a>
                        <a href="#about" className="btn-liquid px-8 py-4 rounded-xl font-medium text-white flex items-center gap-2">
                            {t.ctaDetails}
                        </a>
                    </div>
                </motion.div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {t.features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <FeatureCard
                                key={feature.title}
                                icon={<Icon className="w-6 h-6 text-primary" />}
                                title={feature.title}
                                desc={feature.desc}
                                delay={0.2 + index * 0.2}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            className="glass-card p-6 rounded-2xl text-left hover:bg-white/5"
        >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
        </motion.div>
    );
}
