'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/i18n/LanguageProvider';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: {
        id: string;
        title: string;
        price: number;
    };
}

const PROMO_CODES = ['mind', 'macedov', 'skyline'];

const METHOD_META = {
    sbp: {
        currency: 'RUB',
        title: { ru: 'СБП', en: 'SBP' },
        requisitesTitle: { ru: 'СБП (Сбербанк)', en: 'SBP (Sberbank)' },
        value: '+7 999 000-00-00',
        icon: Smartphone,
    },
    uah: {
        currency: 'UAH',
        title: { ru: 'Visa', en: 'Visa' },
        requisitesTitle: { ru: 'Visa (UAH)', en: 'Visa (UAH)' },
        value: '4441 1144 2222 3333',
        icon: CreditCard,
    },
    kzt: {
        currency: 'KZT',
        title: { ru: 'Visa', en: 'Visa' },
        requisitesTitle: { ru: 'Visa (KZT, Казахстан)', en: 'Visa (KZT, Kazakhstan)' },
        value: '4400 4303 1941 4469',
        icon: CreditCard,
    },
} as const;

const copy = {
    ru: {
        title: 'Оплата',
        promoPlaceholder: 'Промокод',
        discountApplied: 'Скидка 10% применена!',
        chooseMethod: 'Выберите метод:',
        goToPayment: 'Перейти к оплате',
        amountLabel: 'Сумма:',
        transferInstruction:
            'Переведите точную сумму на указанные реквизиты. После перевода нажмите кнопку ниже.',
        verifying: 'Проверка платежа...',
        paid: 'Я оплатил',
        back: 'Назад',
        errors: {
            invalidPromo: 'Неверный промокод',
            needLogin: 'Пожалуйста, войдите в аккаунт',
            verify: 'Ошибка проверки',
            network: 'Ошибка сети',
        },
    },
    en: {
        title: 'Payment',
        promoPlaceholder: 'Promo code',
        discountApplied: '10% discount applied!',
        chooseMethod: 'Choose a method:',
        goToPayment: 'Proceed to payment',
        amountLabel: 'Amount:',
        transferInstruction:
            'Transfer the exact amount to the requisites above. After the transfer, press the button below.',
        verifying: 'Verifying payment...',
        paid: 'I have paid',
        back: 'Back',
        errors: {
            invalidPromo: 'Invalid promo code',
            needLogin: 'Please sign in to your account',
            verify: 'Verification error',
            network: 'Network error',
        },
    },
} as const;

type Method = keyof typeof METHOD_META;

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
    const { lang } = useLanguage();
    const t = copy[lang];
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState<Method>('sbp');
    const [promo, setPromo] = useState('');
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const finalPriceRub = Math.round(plan.price * (1 - discount));

    const getPrice = (target: Method = method) => {
        if (target === 'uah') return `~${Math.round(finalPriceRub * 0.4)} UAH`;
        if (target === 'kzt') return `~${Math.round(finalPriceRub * 5)} KZT`;
        return `${finalPriceRub} ₽`;
    };

    const handleApplyPromo = () => {
        const normalized = promo.trim().toLowerCase();
        if (PROMO_CODES.includes(normalized)) {
            setDiscount(0.1);
            setError('');
        } else {
            setDiscount(0);
            setError(t.errors.invalidPromo);
            setTimeout(() => setError(''), 2000);
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        const userStr = localStorage.getItem('skyline_user');
        if (!userStr) {
            alert(t.errors.needLogin);
            router.push('/');
            onClose();
            setLoading(false);
            return;
        }
        const user = JSON.parse(userStr);

        try {
            const token = localStorage.getItem('skyline_session');
            const res = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    orderId: `ORD-${Date.now()}`,
                    planId: plan.id,
                }),
            });
            const data = await res.json();

            if (data.success) {
                const updatedUser = { ...user, subscription_status: 'active', subscription_expires: data.expiry };
                localStorage.setItem('skyline_user', JSON.stringify(updatedUser));
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('skyline-auth'));
                }

                alert(lang === 'ru'
                    ? 'Оплата прошла успешно! Подписка активирована.'
                    : 'Payment successful! Your subscription is active.'
                );
                router.push('/dashboard');
                onClose();
            } else {
                setError(data.message || t.errors.verify);
            }
        } catch (err) {
            setError(t.errors.network);
        } finally {
            setLoading(false);
        }
    };

    const activeMethod = METHOD_META[method];

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="modal-overlay active"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="modal max-w-md"
                    >
                        <button className="modal-close" onClick={onClose}>
                            <X size={18} />
                        </button>

                        <h2 className="text-white font-bold text-xl text-center mb-6">
                            {t.title}: {plan.title}
                        </h2>

                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={t.promoPlaceholder}
                                        value={promo}
                                        onChange={(e) => setPromo(e.target.value)}
                                        className="form-input"
                                    />
                                    <button onClick={handleApplyPromo} className="btn-ghost px-4 bg-white/5">
                                        <Check size={18} />
                                    </button>
                                </div>
                                {discount > 0 && <p className="text-green-400 text-sm">{t.discountApplied}</p>}
                                {error && <p className="text-red-400 text-sm">{error}</p>}

                                <div className="space-y-2">
                                    <p className="text-gray-400 text-sm">{t.chooseMethod}</p>
                                    {(Object.keys(METHOD_META) as Method[]).map((key) => {
                                        const meta = METHOD_META[key];
                                        const Icon = meta.icon;
                                        const isActive = method === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setMethod(key)}
                                                className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
                                                    isActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 bg-white/5'
                                                }`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <Icon size={18} />
                                                    <span className="flex flex-col leading-tight text-left">
                                                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                                                            {meta.currency}
                                                        </span>
                                                        <span className="text-sm font-semibold text-white">{meta.title[lang]}</span>
                                                    </span>
                                                </span>
                                                <span className="font-bold">{getPrice(key)}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button onClick={() => setStep(2)} className="btn-primary w-full mt-4">
                                    {t.goToPayment} <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 text-center">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                                        {activeMethod.currency}
                                    </div>
                                    <p className="text-gray-400 text-sm mb-1">{activeMethod.requisitesTitle[lang]}</p>
                                    <p className="text-xl font-mono font-bold text-white select-all cursor-pointer">
                                        {activeMethod.value}
                                    </p>
                                    <p className="text-cyan-400 text-sm mt-2">
                                        {t.amountLabel} {getPrice()}
                                    </p>
                                </div>

                                <p className="text-sm text-gray-500">{t.transferInstruction}</p>

                                <button onClick={handlePayment} className="btn-primary w-full" disabled={loading}>
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin" /> {t.verifying}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <ShieldCheck /> {t.paid}
                                        </div>
                                    )}
                                </button>

                                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-white mt-2">
                                    {t.back}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
