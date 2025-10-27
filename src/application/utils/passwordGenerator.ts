import crypto from 'crypto';

/**
 * Generates a secure temporary password
 * @param length - Length of the password (default: 8)
 * @returns A random alphanumeric password with uppercase, lowercase, and digits
 */
export function generateTemporaryPassword(length: number = 8): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const allChars = uppercase + lowercase + digits;

  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += digits[crypto.randomInt(0, digits.length)];

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Shuffle the password to avoid predictable patterns
  return shuffleString(password);
}

/**
 * Shuffles a string to randomize character order
 * @param str - The string to shuffle
 * @returns The shuffled string
 */
function shuffleString(str: string): string {
  const array = str.split('');
  
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  return array.join('');
}

