'use client';

import { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const STORAGE_KEY = 'skyline_captcha_passed_at';
const TTL_MS = 24 * 60 * 60 * 1000;

const copy = {
    ru: {
        title: 'Проверка безопасности',
        subtitle: 'Подтвердите, что вы не робот, чтобы продолжить.',
        verifying: 'Проверяем...',
        error: 'Не удалось пройти проверку. Попробуйте еще раз.',
        config: 'Капча не настроена. Добавьте ключи в настройках.',
    },
    en: {
        title: 'Security Check',
        subtitle: 'Please verify that you are not a robot to continue.',
        verifying: 'Verifying...',
        error: 'Verification failed. Please try again.',
        config: 'Captcha is not configured. Add keys in settings.',
    },
} as const;

export default function EntryGate({ children }: { children: React.ReactNode }) {
    const { lang } = useLanguage();
    const t = copy[lang];
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const captchaRef = useRef<ReCAPTCHA | null>(null);

    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const ts = Number(raw);
        if (Number.isFinite(ts) && Date.now() - ts < TTL_MS) {
            setVerified(true);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const handleCaptcha = async (token: string | null) => {
        if (!token) return;
        setVerifying(true);
        setError('');
        try {
            const res = await fetch('/api/captcha/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem(STORAGE_KEY, Date.now().toString());
                setVerified(true);
            } else {
                setError(data.message || t.error);
                captchaRef.current?.reset();
            }
        } catch {
            setError(t.error);
            captchaRef.current?.reset();
        } finally {
            setVerifying(false);
        }
    };

    if (verified) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b10] p-6 text-center shadow-2xl">
                <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                <p className="mt-2 text-sm text-gray-400">{t.subtitle}</p>

                <div className="mt-6 flex justify-center">
                    {siteKey ? (
                        <ReCAPTCHA
                            ref={captchaRef}
                            sitekey={siteKey}
                            onChange={handleCaptcha}
                            onExpired={() => captchaRef.current?.reset()}
                            theme="dark"
                        />
                    ) : (
                        <div className="text-sm text-red-400">{t.config}</div>
                    )}
                </div>

                {verifying && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-300">
                        <Loader2 className="animate-spin" size={16} />
                        {t.verifying}
                    </div>
                )}

                {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
            </div>
        </div>
    );
}
