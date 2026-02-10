import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { key } = await req.json();

        if (!key) {
            return NextResponse.json({ success: false, message: 'Missing key' }, { status: 400 });
        }

        const user = await getSessionUser(req);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { data: keyRow } = await supabaseAdmin
            .from('keys')
            .select('id, duration_days, used_by')
            .eq('code', key)
            .maybeSingle();

        if (!keyRow) {
            return NextResponse.json({ success: false, message: 'Invalid key' }, { status: 400 });
        }

        if (keyRow.used_by) {
            return NextResponse.json({ success: false, message: 'Key already used' }, { status: 400 });
        }

        const now = new Date();
        const currentExpiry = user.subscription_expires ? new Date(user.subscription_expires) : now;
        const baseDate = currentExpiry > now ? currentExpiry : now;
        const addedDays = keyRow.duration_days === 0 ? 3650 : keyRow.duration_days;
        const newExpiry = new Date(baseDate.getTime() + addedDays * 24 * 60 * 60 * 1000);

        await supabaseAdmin
            .from('keys')
            .update({ used_by: user.uid, used_at: new Date().toISOString() })
            .eq('id', keyRow.id);

        await supabaseAdmin
            .from('users')
            .update({
                subscription_status: 'active',
                subscription_expires: newExpiry.toISOString(),
            })
            .eq('uid', user.uid);

        return NextResponse.json({
            success: true,
            message: 'Subscription activated!',
            expiry: newExpiry.toISOString(),
            addedDays,
            lifetime: keyRow.duration_days === 0
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
