import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser, isAdmin } from '@/lib/auth';
import { generateLicenseKey } from '@/lib/keys';

export async function POST(req: Request) {
    try {
        const admin = await getSessionUser(req);
        if (!admin || !isAdmin(admin.uid)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { durationDays, count } = await req.json();
        const qty = Math.max(1, Math.min(Number(count) || 1, 50));
        const days = typeof durationDays === 'number' ? durationDays : 30;

        const rows = Array.from({ length: qty }).map(() => ({
            code: generateLicenseKey(),
            duration_days: days,
        }));

        const { data, error } = await supabaseAdmin
            .from('keys')
            .insert(rows)
            .select('code, duration_days');

        if (error) {
            return NextResponse.json({ success: false, message: 'Failed to generate keys' }, { status: 500 });
        }

        return NextResponse.json({ success: true, keys: data || [] });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
