import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser, isAdmin } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const admin = await getSessionUser(req);
        if (!admin || !isAdmin(admin.uid)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { uid } = await req.json();
        if (!uid) {
            return NextResponse.json({ success: false, message: 'Missing uid' }, { status: 400 });
        }

        await supabaseAdmin
            .from('users')
            .update({ is_banned: false, ban_reason: null })
            .eq('uid', uid);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
