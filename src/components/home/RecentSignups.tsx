'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { useLanguage } from '@/components/i18n/LanguageProvider';

type PublicUser = {
    uid: number;
    username: string;
    created_at: string;
};

const copy = {
    ru: {
        title: 'Новые регистрации',
        subtitle: 'Обновляется в реальном времени',
        empty: 'Пока нет новых пользователей',
    },
    en: {
        title: 'Recent Signups',
        subtitle: 'Updates in real time',
        empty: 'No recent users yet',
    },
} as const;

export default function RecentSignups() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const [items, setItems] = useState<PublicUser[]>([]);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (!supabaseBrowser) return;
            const { data } = await supabaseBrowser
                .from('public_users')
                .select('uid, username, created_at')
                .order('created_at', { ascending: false })
                .limit(6);
            if (isMounted) {
                setItems(data || []);
            }
        };

        load();

        if (!supabaseBrowser) return;

        const channel = supabaseBrowser
            .channel('public:public_users')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'public_users' },
                (payload) => {
                    const next = payload.new as PublicUser;
                    setItems((prev) => [next, ...prev].slice(0, 6));
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            if (supabaseBrowser) {
                supabaseBrowser.removeChannel(channel);
            }
        };
    }, []);

    return (
        <section className="container mx-auto px-4">

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.length === 0 && (
                    <div className="text-center text-gray-500 col-span-full">{t.empty}</div>
                )}
                {items.map((u, i) => (
                    <motion.div
                        key={`${u.uid}-${u.created_at}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="glass-card p-4 rounded-xl flex items-center justify-between"
                    >
                        <div>
                            <div className="text-white font-semibold">{u.username}</div>
                            <div className="text-xs text-gray-500">UID {u.uid}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(u.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
