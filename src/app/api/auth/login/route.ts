import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { createSessionToken } from '@/lib/auth';
import { getClientIp } from '@/lib/request';

export async function POST(req: Request) {
    try {
        const { email, password, hwid } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const ip = getClientIp(req);

        const { data: ipBan } = await supabaseAdmin
            .from('ip_bans')
            .select('id')
            .eq('ip', ip)
            .maybeSingle();

        if (ipBan) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('uid, email, username, password_hash, subscription_status, subscription_expires, is_banned, avatar_url, hwid')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        if (user.is_banned) {
            return NextResponse.json({ success: false, message: 'Account banned' }, { status: 403 });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        const token = createSessionToken();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

        await supabaseAdmin
            .from('sessions')
            .insert({
                user_uid: user.uid,
                token,
                expires_at: expiresAt,
            });

        const updates: { last_ip: string; hwid?: string } = { last_ip: ip };
        if (typeof hwid === 'string') {
            const trimmed = hwid.trim();
            if (trimmed.length > 0) {
                updates.hwid = trimmed.slice(0, 128);
            }
        }

        await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('uid', user.uid);

        const { password_hash: _pw, ...safeUser } = user;

        return NextResponse.json({ success: true, user: safeUser, sessionToken: token });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
