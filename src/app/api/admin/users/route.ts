import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser, isAdmin } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const user = await getSessionUser(req);
        if (!user || !isAdmin(user.uid)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const q = url.searchParams.get('q')?.trim();
        let query = supabaseAdmin
            .from('users')
            .select('uid, email, username, subscription_status, subscription_expires, is_banned, ban_reason, created_at, last_ip, avatar_url');

        if (q) {
            const isNumber = /^\d+$/.test(q);
            if (isNumber) {
                query = query.or(`uid.eq.${q},email.ilike.%${q}%,username.ilike.%${q}%`);
            } else {
                query = query.or(`email.ilike.%${q}%,username.ilike.%${q}%`);
            }
        }

        const { data, error } = await query.order('uid', { ascending: true }).limit(200);

        if (error) {
            return NextResponse.json({ success: false, message: 'Query error' }, { status: 500 });
        }

        return NextResponse.json({ success: true, users: data || [] });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
