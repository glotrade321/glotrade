import crypto from 'crypto';

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const NUMBERS = '23456789';

function pickRandomChar(chars: string): string {
    return chars[crypto.randomInt(chars.length)];
}

function shuffleChars(chars: string[]): string[] {
    for (let i = chars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars;
}

/**
 * Generate a secure random password
 * @param length Password length (default: 12)
 * @returns Secure random password with copy-safe characters only
 */
export function generateSecurePassword(length = 12): string {
    const safeLength = Math.max(length, 12);
    const allChars = UPPERCASE + LOWERCASE + NUMBERS;
    const passwordChars: string[] = [];

    // Ensure at least one of each type
    passwordChars.push(pickRandomChar(UPPERCASE));
    passwordChars.push(pickRandomChar(LOWERCASE));
    passwordChars.push(pickRandomChar(NUMBERS));

    // Fill remaining length with random characters
    for (let i = passwordChars.length; i < safeLength; i++) {
        passwordChars.push(pickRandomChar(allChars));
    }

    return shuffleChars(passwordChars).join('').replace(/\s+/g, '');
}

/**
 * Generate a username from email address
 * @param email Email address
 * @returns Generated username
 */
export function generateUsername(email: string): string {
    const [localPart] = email.split('@');
    const baseUsername = localPart.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const suffix = crypto.randomInt(1000).toString().padStart(3, '0');
    return `${baseUsername}_${suffix}`;
}
