import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export type SessionUser = {
    uid: number;
    email: string;
    username: string;
    avatar_url: string | null;
    hwid: string | null;
    subscription_status: string;
    subscription_expires: string | null;
    is_banned: boolean;
};

export function createSessionToken() {
    return crypto.randomBytes(24).toString('hex');
}

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) return null;
    const token = auth.slice('Bearer '.length).trim();
    if (!token) return null;

    const { data: session } = await supabaseAdmin
        .from('sessions')
        .select('user_uid, expires_at')
        .eq('token', token)
        .maybeSingle();

    if (!session) return null;
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
        return null;
    }

    const { data: user } = await supabaseAdmin
        .from('users')
        .select('uid, email, username, avatar_url, hwid, subscription_status, subscription_expires, is_banned')
        .eq('uid', session.user_uid)
        .maybeSingle();

    if (!user) return null;
    if (user.is_banned) return null;
    return user as SessionUser;
}

export function isAdmin(uid: number | undefined | null) {
    return uid === 1;
}
