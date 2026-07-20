import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Derive encryption key from secret using scrypt.
 * Uses environment secret + salt to generate consistent 32-byte key.
 */
function deriveKey(salt: Buffer): Buffer {
  const secret = process.env.MFA_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("MFA_ENCRYPTION_SECRET must be set and at least 32 characters");
  }

  return scryptSync(secret, salt, 32);
}

/**
 * Encrypt TOTP secret using AES-256-GCM.
 * Format: salt (32 bytes) | iv (12 bytes) | encrypted data | auth tag (16 bytes)
 *
 * @param secret - TOTP secret to encrypt
 * @returns Base64 encoded encrypted secret
 */
export function encryptMfaSecret(secret: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(salt);

  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf-8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  const result = Buffer.concat([salt, iv, encrypted, tag]);
  return result.toString("base64");
}

/**
 * Decrypt TOTP secret using AES-256-GCM.
 * Extracts salt, iv, data, and tag from Base64 input.
 *
 * @param encrypted - Base64 encoded encrypted secret
 * @returns Decrypted TOTP secret
 * @throws Error if decryption fails (corrupted or tampered data)
 */
export function decryptMfaSecret(encrypted: string): string {
  try {
    const buffer = Buffer.from(encrypted, "base64");

    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(buffer.length - TAG_LENGTH);
    const encryptedData = buffer.subarray(
      SALT_LENGTH + IV_LENGTH,
      buffer.length - TAG_LENGTH,
    );

    const key = deriveKey(salt);
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString("utf-8");
  } catch {
    throw new Error("Failed to decrypt MFA secret: decryption failed or data corrupted");
  }
}
