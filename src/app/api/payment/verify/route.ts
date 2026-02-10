import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { orderId, email, planId } = await req.json();

        if (!orderId || !email) {
            return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
        }

        // Simulate banking verification delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        const db = getDb();

        // 1. Find User
        const userIndex = db.users.findIndex((u: any) => u.email === email);
        if (userIndex === -1) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // 2. Record Order
        const newOrder = {
            id: orderId,
            email,
            planId,
            date: new Date().toISOString(),
            status: 'completed',
            amount: 'PAID' // Simplified
        };
        db.orders.push(newOrder);

        // 3. Activate Subscription (Simulated logic: 30 days for everyone for demo)
        const now = new Date();
        const currentExpiry = new Date(db.users[userIndex].subscriptionExpires || now);
        const baseDate = currentExpiry > now ? currentExpiry : now;

        // Determine duration based on planId (simplified)
        let days = 30;
        if (planId === '3_months') days = 90;
        if (planId === 'forever') days = 3650; // 10 years

        const newExpiry = new Date(baseDate.getTime() + (days * 24 * 60 * 60 * 1000));

        db.users[userIndex].subscriptionExpires = newExpiry.toISOString();
        db.users[userIndex].subscriptionStatus = 'active';

        saveDb(db);

        return NextResponse.json({
            success: true,
            message: 'Payment verified!',
            expiry: newExpiry.toISOString()
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
