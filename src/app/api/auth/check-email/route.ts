import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { promises as dns } from 'dns';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        const normalizedEmail = String(email || '').trim().toLowerCase();

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json({ ok: false, reason: 'invalid' });
        }

        const domain = normalizedEmail.split('@')[1];
        try {
            const mx = await dns.resolveMx(domain);
            if (!mx || mx.length === 0) {
                return NextResponse.json({ ok: false, reason: 'domain' });
            }
        } catch {
            return NextResponse.json({ ok: false, reason: 'domain' });
        }

        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('uid')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ ok: false, reason: 'taken' });
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false, reason: 'error' }, { status: 500 });
    }
}
