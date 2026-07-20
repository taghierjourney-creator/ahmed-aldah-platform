import speakeasy from "speakeasy";
import QRCode from "qrcode";

const APP_NAME = "Ahmed Al-Dah Platform";

/**
 * Generate a new TOTP secret and return otpauth URI for QR code.
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy, etc.
 *
 * @param email - User email for label in authenticator apps
 * @returns Object with secret and otpauth URI
 */
export function generateTotpSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `${APP_NAME} (${email})`,
    issuer: APP_NAME,
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error("Failed to generate TOTP secret");
  }

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
}

/**
 * Verify a TOTP code against the secret.
 * Uses RFC 6238 with 30-second window and ±1 window tolerance.
 *
 * @param secret - Base32 encoded TOTP secret
 * @param token - 6-digit TOTP code to verify
 * @returns True if token is valid, false otherwise
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  try {
    // Verify with ±1 window (30 second window = 60 second tolerance)
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    return verified === true;
  } catch {
    return false;
  }
}

/**
 * Generate QR code data URL from otpauth URI.
 * Returns data URL safe to display in <img src={url} />.
 *
 * @param otpauth_url - URI from generateTotpSecret
 * @returns Data URL string
 */
export async function generateQrCodeDataUrl(otpauth_url: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(otpauth_url, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
    });
    return dataUrl;
  } catch {
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Validate TOTP token format (must be 6 digits).
 *
 * @param token - Token to validate
 * @returns True if format is valid
 */
export function isValidTokenFormat(token: string): boolean {
  return /^\d{6}$/.test(token);
}
