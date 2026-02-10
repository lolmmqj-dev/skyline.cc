import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser, isAdmin } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const admin = await getSessionUser(req);
        if (!admin || !isAdmin(admin.uid)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { oldUid, newUid } = await req.json();
        const oldId = Number(oldUid);
        const newId = Number(newUid);

        if (!oldId || !newId || Number.isNaN(oldId) || Number.isNaN(newId)) {
            return NextResponse.json({ success: false, message: 'Invalid uid' }, { status: 400 });
        }

        const { error } = await supabaseAdmin.rpc('admin_change_uid', {
            old_uid: oldId,
            new_uid: newId,
        });

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
