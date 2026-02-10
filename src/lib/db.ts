import fs from 'fs';
import path from 'path';
import os from 'os';

const PRIMARY_DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const FALLBACK_DB_PATH = path.join(os.tmpdir(), 'skyline-db.json');

const DEFAULT_PROMOS = [
    { code: 'mind', discount: 10 },
    { code: 'macedov', discount: 10 },
    { code: 'skyline', discount: 10 }
];

function resolveDbPath() {
    if (fs.existsSync(FALLBACK_DB_PATH)) return FALLBACK_DB_PATH;
    return PRIMARY_DB_PATH;
}

export function getDb() {
    const dbPath = resolveDbPath();
    if (!fs.existsSync(dbPath)) {
        return {
            users: [],
            keys: [],
            orders: [],
            promoCodes: DEFAULT_PROMOS
        };
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(data);

    // Ensure new fields exist
    if (!db.orders) db.orders = [];
    if (!db.promoCodes) db.promoCodes = DEFAULT_PROMOS;

    return db;
}

export function saveDb(data: any) {
    const payload = JSON.stringify(data, null, 2);
    try {
        fs.mkdirSync(path.dirname(PRIMARY_DB_PATH), { recursive: true });
        fs.writeFileSync(PRIMARY_DB_PATH, payload);
        return;
    } catch {
        fs.mkdirSync(path.dirname(FALLBACK_DB_PATH), { recursive: true });
        fs.writeFileSync(FALLBACK_DB_PATH, payload);
    }
}
