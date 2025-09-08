import speakeasy from "speakeasy";
import QRCode from "qrcode";
import logger from "./logger.js";

class TwoFactorService {
  generateSecret(email) {
    return speakeasy.generateSecret({
      name: `Ecommerce Admin (${email})`,
      issuer: "Ecommerce Admin Panel",
      length: 20,
    });
  }

  async generateQRCode(secret) {
    try {
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      return qrCodeUrl;
    } catch (error) {
      logger.error("QR Code generation failed:", error);
      throw error;
    }
  }

  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 2,
    });
  }

  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10));
    }
    return codes;
  }
}

export default new TwoFactorService();
