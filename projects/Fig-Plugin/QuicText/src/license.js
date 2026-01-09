// ==================== LICENSE MANAGEMENT ====================
import { VERIFY_LICENSE_URL, ENABLE_MONETIZATION, FREE_DAILY_LIMIT, } from "./config";
import { getDeviceId, getUsageData } from "./storage";
import { PLUGIN_VERSION } from "./version";
/**
 * Read consolidated license data
 */
async function getStoredLicense() {
    const data = await figma.clientStorage.getAsync("licenseData");
    return data && typeof data === "object" ? data : null;
}
/**
 * Clear all license-related storage
 */
async function clearLicenseStorage() {
    await figma.clientStorage.deleteAsync("licenseData").catch(() => { });
    await figma.clientStorage.deleteAsync("licenseKey").catch(() => { });
    await figma.clientStorage.deleteAsync("unlimited").catch(() => { });
}
/**
 * Check if user has a valid license
 */
export async function hasLicense() {
    try {
        const license = await getStoredLicense();
        if (license === null || license === void 0 ? void 0 : license.key) {
            const result = await verifyLicenseKey(license.key);
            if (result === null || result === void 0 ? void 0 : result.valid)
                return true;
            // Invalid or revoked
            await clearLicenseStorage();
            return false;
        }
        // Legacy fallback (one-time)
        const legacyKey = await figma.clientStorage.getAsync("licenseKey");
        if (typeof legacyKey === "string" && legacyKey.length > 0) {
            const result = await verifyLicenseKey(legacyKey);
            if (result === null || result === void 0 ? void 0 : result.valid)
                return true;
            await clearLicenseStorage();
        }
        return false;
    }
    catch (err) {
        console.error("License check failed:", err);
        return false;
    }
}
/**
 * Verify license key with Supabase
 */
export async function verifyLicenseKey(licenseKey) {
    if (!(licenseKey === null || licenseKey === void 0 ? void 0 : licenseKey.trim()))
        return null;
    try {
        const deviceId = await getDeviceId();
        if (!deviceId) {
            return { valid: false, error: "Device ID unavailable" };
        }
        const res = await fetch(VERIFY_LICENSE_URL, {
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
            const text = await res.text().catch(() => "");
            return { valid: false, error: `HTTP ${res.status}: ${text}` };
        }
        const data = (await res.json());
        return data;
    }
    catch (err) {
        console.error("License verification error:", err);
        return { valid: false, error: "Network error" };
    }
}
/**
 * Check if user can use the plugin (license or free quota)
 */
export async function canUsePlugin() {
    if (!ENABLE_MONETIZATION)
        return { allowed: true };
    try {
        // Paid user
        const license = await getStoredLicense();
        if (license === null || license === void 0 ? void 0 : license.unlimited) {
            return { allowed: true };
        }
        // Free quota user
        const usage = await getUsageData();
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
}
/**
 * Activate license (called from UI)
 */
export async function activateLicense(licenseKey) {
    var _a, _b, _c, _d;
    if (!(licenseKey === null || licenseKey === void 0 ? void 0 : licenseKey.trim()))
        return false;
    try {
        const result = await verifyLicenseKey(licenseKey);
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
        await figma.clientStorage.setAsync("licenseData", licenseData);
        // Legacy compatibility (optional)
        await figma.clientStorage.setAsync("licenseKey", licenseKey.trim()).catch(() => { });
        await figma.clientStorage.setAsync("unlimited", licenseData.unlimited).catch(() => { });
        console.log("License activated successfully");
        return true;
    }
    catch (err) {
        console.error("License activation failed:", err);
        return false;
    }
}
