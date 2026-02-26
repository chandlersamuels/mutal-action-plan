import crypto from "crypto";

export function generateShareToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}
