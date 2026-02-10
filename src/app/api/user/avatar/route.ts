import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const EXT_MAP: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

export async function POST(req: Request) {
    try {
        const user = await getSessionUser(req);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ success: false, message: 'Storage not configured' }, { status: 500 });
        }

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const { avatarUrl } = await req.json();
            if (!avatarUrl || typeof avatarUrl !== 'string') {
                return NextResponse.json({ success: false, message: 'Missing avatar' }, { status: 400 });
            }

            try {
                const url = new URL(avatarUrl);
                if (!['http:', 'https:'].includes(url.protocol)) {
                    return NextResponse.json({ success: false, message: 'Invalid URL' }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ success: false, message: 'Invalid URL' }, { status: 400 });
            }

            await supabaseAdmin
                .from('users')
                .update({ avatar_url: avatarUrl })
                .eq('uid', user.uid);

            return NextResponse.json({ success: true, avatarUrl });
        }

        const form = await req.formData();
        const file = form.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ success: false, message: 'Missing file' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ success: false, message: 'Invalid file type' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, message: 'File too large' }, { status: 400 });
        }

        const ext = EXT_MAP[file.type] || 'jpg';
        const fileId = crypto.randomBytes(8).toString('hex');
        const filePath = `avatars/${user.uid}/${Date.now()}-${fileId}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('avatars')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
        }

        const { data: publicData } = supabaseAdmin.storage.from('avatars').getPublicUrl(filePath);
        const publicUrl = publicData.publicUrl;

        await supabaseAdmin
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('uid', user.uid);

        return NextResponse.json({ success: true, avatarUrl: publicUrl });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
