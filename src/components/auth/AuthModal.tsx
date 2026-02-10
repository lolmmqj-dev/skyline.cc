'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import ReCAPTCHA from 'react-google-recaptcha';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const copy = {
    ru: {
        titles: {
            login: 'Вход',
            register: 'Регистрация',
        },
        placeholders: {
            username: 'Имя пользователя',
            email: 'Email',
            password: 'Пароль',
        },
        validation: {
            invalidEmail: 'Некорректный email',
        },
        captcha: {
            label: 'Я не робот',
        },
        actions: {
            login: 'Войти',
            register: 'Создать аккаунт',
        },
        footer: {
            noAccount: 'Нет аккаунта?',
            signUp: 'Зарегистрироваться',
            haveAccount: 'Есть аккаунт?',
            signIn: 'Войти',
        },
        errors: {
            login: 'Ошибка входа',
            register: 'Ошибка регистрации',
            captcha: 'Пожалуйста, подтвердите капчу',
            captchaConfig: 'Капча не настроена. Добавьте ключи в настройках.',
            network: 'Ошибка сети',
        },
    },
    en: {
        titles: {
            login: 'Sign In',
            register: 'Register',
        },
        placeholders: {
            username: 'Username',
            email: 'Email',
            password: 'Password',
        },
        validation: {
            invalidEmail: 'Invalid email',
        },
        captcha: {
            label: "I'm not a robot",
        },
        actions: {
            login: 'Sign In',
            register: 'Create account',
        },
        footer: {
            noAccount: "Don't have an account?",
            signUp: 'Sign up',
            haveAccount: 'Already have an account?',
            signIn: 'Sign in',
        },
        errors: {
            login: 'Login failed',
            register: 'Registration failed',
            captcha: 'Please verify the captcha',
            captchaConfig: 'Captcha is not configured. Add keys in settings.',
            network: 'Network error',
        },
    },
} as const;

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { lang } = useLanguage();
    const t = copy[lang];
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA | null>(null);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    useEffect(() => {
        router.prefetch('/dashboard');
    }, [router]);

    useEffect(() => {
        if (isLogin) {
            setCaptchaToken(null);
            captchaRef.current?.reset();
        }
    }, [isLogin]);

    const validateEmail = (value: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmail(val);
        if (val.length > 0) {
            setIsValidEmail(validateEmail(val));
        } else {
            setIsValidEmail(null);
        }
    };

    const handleCaptchaChange = (token: string | null) => {
        setCaptchaToken(token);
        if (token) {
            setErrorMessage('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();

                if (data.success) {
                    localStorage.setItem('skyline_user', JSON.stringify(data.user));
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('skyline-auth'));
                    }
                    onClose();
                    router.replace('/dashboard');
                    router.refresh();
                } else {
                    setErrorMessage(data.message || t.errors.login);
                }
            } else {
                if (!siteKey) {
                    setErrorMessage(t.errors.captchaConfig);
                    setLoading(false);
                    return;
                }
                if (!captchaToken) {
                    setErrorMessage(t.errors.captcha);
                    setLoading(false);
                    return;
                }

                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, username, captchaToken }),
                });
                const data = await res.json();

                if (data.success) {
                    localStorage.setItem('skyline_user', JSON.stringify(data.user));
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('skyline-auth'));
                    }
                    onClose();
                    router.replace('/dashboard');
                    router.refresh();
                } else {
                    setErrorMessage(data.message || t.errors.register);
                    captchaRef.current?.reset();
                    setCaptchaToken(null);
                }
            }
        } catch (err) {
            setErrorMessage(t.errors.network);
            captchaRef.current?.reset();
            setCaptchaToken(null);
        } finally {
            setLoading(false);
        }
    };

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
                        transition={{ duration: 0.2 }}
                        className="modal"
                    >
                        <button className="modal-close" onClick={onClose}>
                            <X size={18} />
                        </button>

                        <h2 className="text-white font-bold text-2xl text-center mb-6">
                            {isLogin ? t.titles.login : t.titles.register}
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {!isLogin && (
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder={t.placeholders.username}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="form-input with-icon"
                                        required
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <Mail
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                                        isValidEmail === true
                                            ? 'text-green-500'
                                            : isValidEmail === false
                                                ? 'text-red-500'
                                                : 'text-gray-500'
                                    }`}
                                    size={18}
                                />
                                <input
                                    type="email"
                                    placeholder={t.placeholders.email}
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`form-input with-icon ${
                                        isValidEmail === true ? 'success' : isValidEmail === false ? 'error' : ''
                                    }`}
                                    required
                                />
                                {isValidEmail === false && (
                                    <span className="text-red-500 text-xs absolute -bottom-5 left-2">
                                        {t.validation.invalidEmail}
                                    </span>
                                )}
                            </div>

                            <div className="relative mt-2">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    placeholder={t.placeholders.password}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input with-icon"
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <div className="mt-2 flex justify-center">
                                    {siteKey ? (
                                        <ReCAPTCHA
                                            ref={captchaRef}
                                            sitekey={siteKey}
                                            onChange={handleCaptchaChange}
                                            onExpired={() => setCaptchaToken(null)}
                                            theme="dark"
                                        />
                                    ) : (
                                        <div className="text-sm text-red-400 text-center">
                                            {t.errors.captchaConfig}
                                        </div>
                                    )}
                                </div>
                            )}

                            {errorMessage && (
                                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                                    {errorMessage}
                                </div>
                            )}

                            <button className="btn-primary mt-2 group" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        {isLogin ? t.actions.login : t.actions.register}
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="modal-footer">
                            {isLogin ? (
                                <p>
                                    {t.footer.noAccount}{' '}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsLogin(false);
                                            setErrorMessage('');
                                        }}
                                    >
                                        {t.footer.signUp}
                                    </a>
                                </p>
                            ) : (
                                <p>
                                    {t.footer.haveAccount}{' '}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsLogin(true);
                                            setErrorMessage('');
                                        }}
                                    >
                                        {t.footer.signIn}
                                    </a>
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
