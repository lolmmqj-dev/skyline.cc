'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingCart, Info } from 'lucide-react';
import PaymentModal from '@/components/payment/PaymentModal';
import { useLanguage } from '@/components/i18n/LanguageProvider';

interface ProductProps {
    id: string;
    title: string;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
    delay?: number;
}

const copy = {
    ru: {
        buy: 'Купить',
        details: 'Подробнее',
        bestSeller: 'ХИТ ПРОДАЖ',
    },
    en: {
        buy: 'Buy',
        details: 'More Details',
        bestSeller: 'BEST SELLER',
    },
} as const;

export default function ProductCard({ id, title, price, description, features, popular, delay = 0 }: ProductProps) {
    const { lang } = useLanguage();
    const t = copy[lang];
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const numericPrice = parseInt(price.replace(/\D/g, '')) || 0;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: delay }}
                className={`card-custom flex flex-col h-full ${
                    popular ? 'border-primary/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : ''
                }`}
            >
                {popular && (
                    <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl z-10">
                        {t.bestSeller}
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm h-10">{description}</p>
                </div>

                <div className="mb-8">
                    <span className="text-4xl font-bold text-white">{price}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <button
                        onClick={() => setIsPaymentOpen(true)}
                        className="btn-liquid-primary w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                    >
                        <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {t.buy}
                    </button>
                    <a
                        href="#about"
                        className="btn-liquid w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <Info className="w-4 h-4" />
                        {t.details}
                    </a>
                </div>

                <div className="flex-grow space-y-4">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-cyan-400" />
                            {feature}
                        </div>
                    ))}
                </div>
            </motion.div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                plan={{ id, title, price: numericPrice }}
            />
        </>
    );
}
