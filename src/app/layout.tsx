import type { Metadata } from 'next'
import { Unbounded } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { LanguageProvider } from '@/components/i18n/LanguageProvider'
import EntryGate from '@/components/captcha/EntryGate'

const unbounded = Unbounded({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-unbounded',
})

export const metadata: Metadata = {
    title: 'Skyline.cc — Лучший клиент для Minecraft',
    description: 'Приватный клиент для Hypixel Skyblock и не только.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" className={`dark scroll-smooth ${unbounded.variable}`}>
            <body>
                <LanguageProvider>
                    <div className="bg-gradient-1" />
                    <div className="bg-gradient-2" />
                    <EntryGate>
                        <Navbar />
                        <main className="min-h-screen pt-20">
                            {children}
                        </main>
                        <Footer />
                    </EntryGate>
                </LanguageProvider>
            </body>
        </html>
    )
}
