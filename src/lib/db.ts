import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

const DEFAULT_PROMOS = [
    { code: 'mind', discount: 10 },
    { code: 'macedov', discount: 10 },
    { code: 'skyline', discount: 10 }
];

export function getDb() {
    if (!fs.existsSync(DB_PATH)) {
        return {
            users: [],
            keys: [],
            orders: [],
            promoCodes: DEFAULT_PROMOS
        };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(data);

    // Ensure new fields exist
    if (!db.orders) db.orders = [];
    if (!db.promoCodes) db.promoCodes = DEFAULT_PROMOS;

    return db;
}

export function saveDb(data: any) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
