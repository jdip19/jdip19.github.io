// ==================== LICENSE MANAGEMENT ====================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { VERIFY_LICENSE_URL, ENABLE_MONETIZATION, FREE_DAILY_LIMIT, } from "./config";
import { getDeviceId, getUsageData } from "./storage";
import { PLUGIN_VERSION } from "./version";
/**
 * Read consolidated license data
 */
function getStoredLicense() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield figma.clientStorage.getAsync("licenseData");
        return data && typeof data === "object" ? data : null;
    });
}
/**
 * Clear all license-related storage
 */
function clearLicenseStorage() {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.clientStorage.deleteAsync("licenseData").catch(() => { });
        yield figma.clientStorage.deleteAsync("licenseKey").catch(() => { });
        yield figma.clientStorage.deleteAsync("unlimited").catch(() => { });
    });
}
/**
 * Check if user has a valid license
 */
export function hasLicense() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const license = yield getStoredLicense();
            if (license === null || license === void 0 ? void 0 : license.key) {
                const result = yield verifyLicenseKey(license.key);
                if (result === null || result === void 0 ? void 0 : result.valid)
                    return true;
                // Invalid or revoked
                yield clearLicenseStorage();
                return false;
            }
            // Legacy fallback (one-time)
            const legacyKey = yield figma.clientStorage.getAsync("licenseKey");
            if (typeof legacyKey === "string" && legacyKey.length > 0) {
                const result = yield verifyLicenseKey(legacyKey);
                if (result === null || result === void 0 ? void 0 : result.valid)
                    return true;
                yield clearLicenseStorage();
            }
            return false;
        }
        catch (err) {
            console.error("License check failed:", err);
            return false;
        }
    });
}
/**
 * Verify license key with Supabase
 */
export function verifyLicenseKey(licenseKey) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(licenseKey === null || licenseKey === void 0 ? void 0 : licenseKey.trim()))
            return null;
        try {
            const deviceId = yield getDeviceId();
            if (!deviceId) {
                return { valid: false, error: "Device ID unavailable" };
            }
            const res = yield fetch(VERIFY_LICENSE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    key: licenseKey.trim(),
                    device_id: deviceId,
                    version: PLUGIN_VERSION
                }),
            });
            if (!res.ok) {
                const text = yield res.text().catch(() => "");
                return { valid: false, error: `HTTP ${res.status}: ${text}` };
            }
            const data = (yield res.json());
            return data;
        }
        catch (err) {
            console.error("License verification error:", err);
            return { valid: false, error: "Network error" };
        }
    });
}
/**
 * Check if user can use the plugin (license or free quota)
 */
export function canUsePlugin() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ENABLE_MONETIZATION)
            return { allowed: true };
        try {
            // Paid user
            const license = yield getStoredLicense();
            if (license === null || license === void 0 ? void 0 : license.unlimited) {
                return { allowed: true };
            }
            // Free quota user
            const usage = yield getUsageData();
            const remaining = FREE_DAILY_LIMIT - usage.count;
            if (remaining > 0) {
                return {
                    allowed: true,
                    remaining,
                };
            }
            // Free quota exhausted → show license UI
            return {
                allowed: false,
                remaining: 0,
            };
        }
        catch (err) {
            console.error("Usage check failed:", err);
            return { allowed: true };
        }
    });
}
/**
 * Activate license (called from UI)
 */
export function activateLicense(licenseKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!(licenseKey === null || licenseKey === void 0 ? void 0 : licenseKey.trim()))
            return false;
        try {
            const result = yield verifyLicenseKey(licenseKey);
            if (!(result === null || result === void 0 ? void 0 : result.valid))
                return false;
            const licenseData = {
                key: licenseKey.trim(),
                unlimited: (_a = result.unlimited) !== null && _a !== void 0 ? _a : false,
                email: (_b = result.email) !== null && _b !== void 0 ? _b : "",
                plan: (_c = result.plan) !== null && _c !== void 0 ? _c : "",
                activatedVersion: (_d = result.version) !== null && _d !== void 0 ? _d : "",
                currentVersion: PLUGIN_VERSION,
                activatedAt: new Date().toISOString(),
            };
            console.log("Yo Storing license data:", licenseData);
            yield figma.clientStorage.setAsync("licenseData", licenseData);
            // Legacy compatibility (optional)
            yield figma.clientStorage.setAsync("licenseKey", licenseKey.trim()).catch(() => { });
            yield figma.clientStorage.setAsync("unlimited", licenseData.unlimited).catch(() => { });
            console.log("License activated successfully");
            return true;
        }
        catch (err) {
            console.error("License activation failed:", err);
            return false;
        }
    });
}
