import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser, isAdmin } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const admin = await getSessionUser(req);
        if (!admin || !isAdmin(admin.uid)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('keys')
            .select('code, duration_days, used_by, used_at, created_at')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            return NextResponse.json({ success: false, message: 'Query error' }, { status: 500 });
        }

        return NextResponse.json({ success: true, keys: data || [] });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
