import crypto from 'crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length: number) {
    const bytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return result;
}

export function generateLicenseKey() {
    return `skyline${randomString(16)}`;
}
