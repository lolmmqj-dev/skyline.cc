import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
        }

        const db = getDb();
        const user = db.users.find((u: any) => u.email === email && u.password === password);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        // In a real app, we would set a session cookie here.
        // For this demo, we'll return the user object to be stored in localStorage.
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
