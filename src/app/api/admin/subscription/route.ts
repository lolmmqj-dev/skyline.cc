import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser, isAdmin } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const admin = await getSessionUser(req);
        if (!admin || !isAdmin(admin.uid)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { uid, days } = await req.json();
        if (!uid || typeof days !== 'number') {
            return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
        }

        if (days === -1) {
            await supabaseAdmin
                .from('users')
                .update({ subscription_status: 'inactive', subscription_expires: null })
                .eq('uid', uid);
            return NextResponse.json({ success: true, expiry: null });
        }

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('subscription_expires')
            .eq('uid', uid)
            .maybeSingle();

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const currentExpiry = user.subscription_expires ? new Date(user.subscription_expires) : now;
        const baseDate = currentExpiry > now ? currentExpiry : now;
        const addDays = days === 0 ? 3650 : days;
        const newExpiry = new Date(baseDate.getTime() + addDays * 24 * 60 * 60 * 1000);

        await supabaseAdmin
            .from('users')
            .update({
                subscription_status: 'active',
                subscription_expires: newExpiry.toISOString(),
            })
            .eq('uid', uid);

        return NextResponse.json({ success: true, expiry: newExpiry.toISOString() });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
