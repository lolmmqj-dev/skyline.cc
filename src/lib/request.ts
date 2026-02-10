import { NextRequest } from 'next/server';

export function getClientIp(req: Request | NextRequest) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0]?.trim() || 'unknown';
    }
    // @ts-ignore
    const ip = (req as NextRequest).ip;
    return ip || 'unknown';
}
