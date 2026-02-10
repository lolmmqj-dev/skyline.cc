'use client';

import Hero from '@/components/home/Hero';
import RecentSignups from '@/components/home/RecentSignups';
import ProductCard from '@/components/store/ProductCard';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
    ru: {
        store: {
            title: 'Выберите свой',
            highlight: 'План',
            subtitle:
                'Выберите тариф, который подходит именно вам. Моментальная активация после покупки.',
        },
        products: [
            {
                id: 'free',
                title: 'Базовая версия',
                price: '1 ₽',
                description: 'Доступ к базовой версии за 1 рубль.',
                features: [
                    'Базовые функции',
                    'Доступ на 30 дней',
                    'Быстрая активация',
                    'Техподдержка',
                ],
                popular: false,
            },
            {
                id: '1_month',
                title: 'Клиент на месяц',
                price: '199 ₽',
                description: 'Доступ к клиенту на месяц.',
                features: ['Legit Aimbot', 'Wallhack / ESP', 'Cloud Configs', '24/7 Поддержка'],
                popular: false,
            },
            {
                id: '3_months',
                title: 'Клиент на 90 дней',
                price: '399 ₽',
                description: 'Доступ к клиенту на 90 дней.',
                features: [
                    'Все функции',
                    'Приоритетная поддержка',
                    'Доступ к бетам',
                    'Скидка 15%',
                ],
                popular: true,
            },
            {
                id: 'forever',
                title: 'Клиент навсегда',
                price: '559 ₽',
                description: 'Доступ к клиенту навсегда.',
                features: ['Вечный доступ', 'Роль в Discord', 'Личный менеджер', 'Early Access'],
                popular: false,
            },
            {
                id: 'hwid_reset',
                title: 'Сброс HWID',
                price: '200 ₽',
                description: 'Сброс привязки к устройству.',
                features: ['Моментальный сброс', 'Без ожидания', 'Автоматически', '24/7'],
                popular: false,
            },
        ],
        about: {
            title: 'О',
            highlight: 'Skyline',
            subtitle:
                'Приватный клиент для Minecraft с упором на стабильность, безопасность и максимальную производительность.',
            cards: [
                {
                    title: 'Стабильность',
                    desc: 'Регулярные обновления и контроль качества на каждом релизе.',
                },
                {
                    title: 'Безопасность',
                    desc: 'Продвинутые обходы и аккуратные настройки под актуальные античиты.',
                },
                {
                    title: 'Поддержка 24/7',
                    desc: 'Быстрые ответы и помощь в Discord в любое время.',
                },
            ],
        },
        cta: {
            title: 'Готовы побеждать?',
            subtitle:
                'Присоединяйтесь к тысячам игроков, которые уже вывели свою игру на новый уровень.',
            button: 'Вступить в Discord',
        },
    },
    en: {
        store: {
            title: 'Choose Your',
            highlight: 'Plan',
            subtitle:
                'Pick the plan that fits you best. Instant activation right after purchase.',
        },
        products: [
            {
                id: 'free',
                title: 'Base Version',
                price: '1 ₽',
                description: 'Access to the base version for 1 ruble.',
                features: [
                    'Core features',
                    '30-day access',
                    'Fast activation',
                    'Tech support',
                ],
                popular: false,
            },
            {
                id: '1_month',
                title: 'Client for 1 Month',
                price: '199 ₽',
                description: 'Access to the client for one month.',
                features: ['Legit Aimbot', 'Wallhack / ESP', 'Cloud Configs', '24/7 Support'],
                popular: false,
            },
            {
                id: '3_months',
                title: 'Client for 90 Days',
                price: '399 ₽',
                description: 'Access to the client for 90 days.',
                features: ['All features', 'Priority support', 'Beta access', '15% discount'],
                popular: true,
            },
            {
                id: 'forever',
                title: 'Lifetime Client',
                price: '559 ₽',
                description: 'Lifetime access to the client.',
                features: ['Lifetime access', 'Discord role', 'Personal manager', 'Early Access'],
                popular: false,
            },
            {
                id: 'hwid_reset',
                title: 'HWID Reset',
                price: '200 ₽',
                description: 'Reset device binding.',
                features: ['Instant reset', 'No waiting', 'Automatic', '24/7'],
                popular: false,
            },
        ],
        about: {
            title: 'About',
            highlight: 'Skyline',
            subtitle:
                'A private Minecraft client focused on stability, security, and top-tier performance.',
            cards: [
                {
                    title: 'Stability',
                    desc: 'Frequent updates and quality checks on every release.',
                },
                {
                    title: 'Security',
                    desc: 'Advanced bypasses and careful tuning for current anti-cheats.',
                },
                {
                    title: '24/7 Support',
                    desc: 'Fast replies and help in Discord whenever you need it.',
                },
            ],
        },
        cta: {
            title: 'Ready to win?',
            subtitle:
                'Join thousands of players who have already taken their game to the next level.',
            button: 'Join Discord',
        },
    },
} as const;

export default function Home() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <div className="flex flex-col gap-20 pb-20">
            <Hero />

            <section id="store" className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        {t.store.title} <span className="text-accent text-glow">{t.store.highlight}</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        {t.store.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-start">
                    {t.products.map((p, i) => (
                        <ProductCard key={p.id} {...p} delay={i * 0.1} />
                    ))}
                </div>
            </section>

            <RecentSignups />

            <section id="about" className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        {t.about.title}{' '}
                        <span className="text-accent text-glow">{t.about.highlight}</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        {t.about.subtitle}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {t.about.cards.map((card) => (
                        <div key={card.title} className="glass-card p-6 rounded-2xl text-left">
                            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                            <p className="text-sm text-gray-400">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container mx-auto px-4 text-center py-20 bg-gradient-radial from-cyan-500/5 to-transparent rounded-3xl border border-white/5">
                <h2 className="text-3xl font-bold mb-6">{t.cta.title}</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                    {t.cta.subtitle}
                </p>
                <a
                    href="https://discord.gg/sZeTVxJd3f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-liquid-primary px-10 py-4 rounded-xl font-bold inline-block"
                >
                    {t.cta.button}
                </a>
            </section>
        </div>
    );
}
