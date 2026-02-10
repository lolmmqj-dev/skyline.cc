import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 120;

const LIMITS: Array<{ prefix: string; max: number }> = [
    { prefix: '/api/auth', max: 20 },
    { prefix: '/api/payment', max: 20 },
    { prefix: '/api/keys', max: 30 },
];

type Bucket = {
    timestamps: number[];
};

const buckets = new Map<string, Bucket>();

function getLimit(pathname: string) {
    const rule = LIMITS.find((item) => pathname.startsWith(item.prefix));
    return rule ? rule.max : DEFAULT_LIMIT;
}

function getClientIp(req: NextRequest) {
    return (
        req.ip ||
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown'
    );
}

function isRateLimited(key: string, max: number) {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const bucket = buckets.get(key) || { timestamps: [] };
    const fresh = bucket.timestamps.filter((ts) => ts > windowStart);
    fresh.push(now);
    buckets.set(key, { timestamps: fresh });
    return fresh.length > max;
}

export function middleware(req: NextRequest) {
    const ip = getClientIp(req);
    const path = req.nextUrl.pathname;
    const limit = getLimit(path);

    const key = `${ip}:${path}`;
    if (isRateLimited(key, limit)) {
        return new NextResponse(
            JSON.stringify({ error: 'Too many requests' }),
            {
                status: 429,
                headers: {
                    'content-type': 'application/json',
                    'retry-after': '60',
                },
            }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};
