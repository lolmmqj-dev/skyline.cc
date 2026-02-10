import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser, isAdmin } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const admin = await getSessionUser(req);
        if (!admin || !isAdmin(admin.uid)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { ip, reason } = await req.json();
        if (!ip) {
            return NextResponse.json({ success: false, message: 'Missing ip' }, { status: 400 });
        }

        await supabaseAdmin.from('ip_bans').upsert({ ip, reason: reason || null });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await getSessionUser(req);
        if (!admin || !isAdmin(admin.uid)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { ip } = await req.json();
        if (!ip) {
            return NextResponse.json({ success: false, message: 'Missing ip' }, { status: 400 });
        }

        await supabaseAdmin.from('ip_bans').delete().eq('ip', ip);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
