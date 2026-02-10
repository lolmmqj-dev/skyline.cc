import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { orderId, planId } = await req.json();

        if (!orderId || !planId) {
            return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
        }

        const user = await getSessionUser(req);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Simulate banking verification delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const now = new Date();
        const currentExpiry = user.subscription_expires ? new Date(user.subscription_expires) : now;
        const baseDate = currentExpiry > now ? currentExpiry : now;

        let days = 30;
        if (planId === '3_months') days = 90;
        if (planId === 'forever') days = 3650;

        const newExpiry = new Date(baseDate.getTime() + (days * 24 * 60 * 60 * 1000));

        await supabaseAdmin
            .from('orders')
            .insert({
                order_id: orderId,
                user_uid: user.uid,
                plan_id: planId,
                status: 'completed',
                amount: 'PAID',
            });

        await supabaseAdmin
            .from('users')
            .update({
                subscription_status: 'active',
                subscription_expires: newExpiry.toISOString(),
            })
            .eq('uid', user.uid);

        return NextResponse.json({
            success: true,
            message: 'Payment verified!',
            expiry: newExpiry.toISOString()
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
