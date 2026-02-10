const fs = require('fs');
const path = require('path');
const os = require('os');

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'skyline'; // 7 chars
    // Need 15 more to make 22 total
    for (let i = 0; i < 15; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const keys = [];
const keysSet = new Set();

while (keys.length < 1000) {
    const key = generateKey();
    if (!keysSet.has(key)) {
        keysSet.add(key);
        keys.push(key);
    }
}

// 1. Save to Desktop
const desktopPath = path.join(os.homedir(), 'Desktop', 'keys.txt');
fs.writeFileSync(desktopPath, keys.join('\n'));
console.log(`Generated 1000 keys to: ${desktopPath}`);

// 2. Initialize DB with keys
const dbPath = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
}

const dbFile = path.join(dbPath, 'db.json');
const initialDb = {
    users: [],
    keys: keys.map(k => ({ code: k, used: false, usedBy: null }))
};

fs.writeFileSync(dbFile, JSON.stringify(initialDb, null, 2));
console.log(`Initialized database at: ${dbFile}`);
