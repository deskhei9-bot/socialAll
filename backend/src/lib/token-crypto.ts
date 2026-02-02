import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer | null {
  const secret = process.env.ENCRYPTION_KEY || '';
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY is required in production');
    }
    return null;
  }
  return crypto.scryptSync(secret, 'salt', 32);
}

export function encryptToken(plainText: string): string {
  const key = getEncryptionKey();
  if (!key) return plainText;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(value: string): string {
  if (!value) return value;
  const key = getEncryptionKey();
  if (!key) return value;

  if (value.startsWith('v1:')) {
    const parts = value.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted token format');
    }
    const [, ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  // Legacy AES-256-CBC (backward compatibility)
  try {
    const legacyKey = process.env.ENCRYPTION_KEY || '';
    const decipher = crypto.createDecipher('aes-256-cbc', legacyKey);
    let decrypted = decipher.update(value, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    // If legacy decryption fails, assume plaintext
    return value;
  }
}
