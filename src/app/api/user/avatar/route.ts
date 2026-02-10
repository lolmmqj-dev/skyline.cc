import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const user = await getSessionUser(req);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { avatarUrl } = await req.json();
        if (!avatarUrl || typeof avatarUrl !== 'string') {
            return NextResponse.json({ success: false, message: 'Missing avatar' }, { status: 400 });
        }

        try {
            const url = new URL(avatarUrl);
            if (!['http:', 'https:'].includes(url.protocol)) {
                return NextResponse.json({ success: false, message: 'Invalid URL' }, { status: 400 });
            }
        } catch {
            return NextResponse.json({ success: false, message: 'Invalid URL' }, { status: 400 });
        }

        await supabaseAdmin
            .from('users')
            .update({ avatar_url: avatarUrl })
            .eq('uid', user.uid);

        return NextResponse.json({ success: true, avatarUrl });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
