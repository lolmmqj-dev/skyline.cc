import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, key } = await req.json();

        if (!email || !key) {
            return NextResponse.json({ success: false, message: 'Missing email or key' }, { status: 400 });
        }

        const db = getDb();

        // 1. Find User
        const userIndex = db.users.findIndex((u: any) => u.email === email);
        if (userIndex === -1) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // 2. Validate Key
        const keyIndex = db.keys.findIndex((k: any) => k.code === key);
        if (keyIndex === -1) {
            return NextResponse.json({ success: false, message: 'Invalid key' }, { status: 400 });
        }

        if (db.keys[keyIndex].used) {
            return NextResponse.json({ success: false, message: 'Key already used' }, { status: 400 });
        }

        // 3. Redeem Key
        db.keys[keyIndex].used = true;
        db.keys[keyIndex].usedBy = email;

        // 4. Update User Subscription
        // Add 30 days to current expiry or now
        const now = new Date();
        const currentExpiry = new Date(db.users[userIndex].subscriptionExpires || now);
        // If expired, start from now
        const baseDate = currentExpiry > now ? currentExpiry : now;

        const newExpiry = new Date(baseDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // +30 days

        db.users[userIndex].subscriptionExpires = newExpiry.toISOString();
        db.users[userIndex].subscriptionStatus = 'active';

        saveDb(db);

        return NextResponse.json({
            success: true,
            message: 'Subscription activated!',
            expiry: newExpiry.toISOString()
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
