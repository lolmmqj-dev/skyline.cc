import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

function generateHWID() {
    return 'HWID-' + Math.random().toString(36).substring(2, 15).toUpperCase();
}

export async function POST(req: Request) {
    try {
        const { email, password, username } = await req.json();

        if (!email || !password || !username) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        const db = getDb();

        if (db.users.find((u: any) => u.email === email)) {
            return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password, // In a real app, hash this!
            hwid: generateHWID(),
            subscriptionStatus: 'inactive',
            subscriptionExpires: null,
            joinDate: new Date().toISOString()
        };

        db.users.push(newUser);
        saveDb(db);

        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
