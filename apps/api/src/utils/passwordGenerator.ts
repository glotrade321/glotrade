import crypto from 'crypto';

/**
 * Generate a secure random password
 * @param length Password length (default: 12)
 * @returns Secure random password
 */
export function generateSecurePassword(length = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';

    // Ensure at least one of each type
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += symbols[crypto.randomInt(symbols.length)];

    // Fill remaining length with random characters
    for (let i = 4; i < length; i++) {
        password += allChars[crypto.randomInt(allChars.length)];
    }

    // Shuffle password to randomize position of required characters
    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
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
