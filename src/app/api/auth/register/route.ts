import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { createSessionToken } from '@/lib/auth';
import { getClientIp } from '@/lib/request';
import { promises as dns } from 'dns';

function generateHWID() {
    return 'HWID-' + Math.random().toString(36).substring(2, 15).toUpperCase();
}

export async function POST(req: Request) {
    try {
        const { email, password, username, captchaToken } = await req.json();

        if (!email || !password || !username) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        if (!captchaToken) {
            return NextResponse.json({ success: false, message: 'Captcha required' }, { status: 400 });
        }

        const secret = process.env.RECAPTCHA_SECRET_KEY;
        if (!secret) {
            return NextResponse.json({ success: false, message: 'Captcha not configured' }, { status: 500 });
        }

        const captchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret, response: captchaToken }),
        });
        const captchaData = await captchaRes.json();

        if (!captchaData.success) {
            return NextResponse.json({ success: false, message: 'Captcha failed' }, { status: 400 });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        // Validate email format + MX records (basic real-world check)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
        }

        const domain = normalizedEmail.split('@')[1];
        try {
            const mx = await dns.resolveMx(domain);
            if (!mx || mx.length === 0) {
                return NextResponse.json({ success: false, message: 'Email domain is not valid' }, { status: 400 });
            }
        } catch {
            return NextResponse.json({ success: false, message: 'Email domain is not valid' }, { status: 400 });
        }

        const ip = getClientIp(req);

        const { data: ipBan } = await supabaseAdmin
            .from('ip_bans')
            .select('id')
            .eq('ip', ip)
            .maybeSingle();

        if (ipBan) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('uid')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const { data: createdUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
                username,
                email: normalizedEmail,
                password_hash: passwordHash,
                hwid: generateHWID(),
                subscription_status: 'inactive',
                subscription_expires: null,
                last_ip: ip,
            })
            .select('uid, email, username, subscription_status, subscription_expires, avatar_url, hwid')
            .single();

        if (createError || !createdUser) {
            return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 });
        }

        const token = createSessionToken();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
        await supabaseAdmin
            .from('sessions')
            .insert({
                user_uid: createdUser.uid,
                token,
                expires_at: expiresAt,
            });

        return NextResponse.json({
            success: true,
            user: createdUser,
            sessionToken: token,
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
