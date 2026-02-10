import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ success: false, message: 'Captcha required' }, { status: 400 });
        }

        const secret = process.env.RECAPTCHA_SECRET_KEY;
        if (!secret) {
            return NextResponse.json({ success: false, message: 'Captcha not configured' }, { status: 500 });
        }

        const captchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret, response: token }),
        });
        const captchaData = await captchaRes.json();

        if (!captchaData.success) {
            return NextResponse.json({ success: false, message: 'Captcha failed' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
