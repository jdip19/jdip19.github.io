// ==================== STORAGE UTILITIES ====================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getTodayDate, generateUUID } from './utils';
import { DEFAULT_VALUES } from './config';
/**
 * Get current usage data
 */
export function getUsageData() {
    return __awaiter(this, void 0, void 0, function* () {
        const stored = yield figma.clientStorage.getAsync('usageData');
        const today = getTodayDate();
        if (!stored) {
            return { count: 0, date: today };
        }
        const usage = stored;
        // Reset if it's a new day
        if (usage.date !== today) {
            return { count: 0, date: today };
        }
        return usage;
    });
}
/**
 * Increment usage count
 */
export function incrementUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        const usage = yield getUsageData();
        usage.count++;
        yield figma.clientStorage.setAsync('usageData', usage);
    });
}
/**
 * Get device ID (creates one if it doesn't exist)
 */
export function getDeviceId() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Getting device ID from storage...");
            const deviceId = yield figma.clientStorage.getAsync("deviceId");
            console.log("Device ID from storage:", deviceId ? "exists" : "null");
            if (deviceId) {
                console.log("Returning existing device ID");
                return deviceId;
            }
            console.log("Generating new device ID...");
            const newId = generateUUID();
            console.log("Generated new ID:", newId.substring(0, 8) + "...");
            console.log("Saving new device ID to storage...");
            yield figma.clientStorage.setAsync("deviceId", newId);
            console.log("Device ID saved successfully");
            return newId;
        }
        catch (err) {
            console.error("Error in getDeviceId:", err);
            // Return a fallback ID if storage fails
            const fallbackId = "fallback-" + Date.now();
            console.log("Using fallback device ID:", fallbackId);
            return fallbackId;
        }
    });
}
/**
 * Get stored index for cycling text
 */
export function getStoredIndex(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const stored = yield figma.clientStorage.getAsync(key);
        return stored !== undefined ? stored : 0;
    });
}
/**
 * Save index for cycling text
 */
export function saveStoredIndex(key, index) {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.clientStorage.setAsync(key, index);
    });
}
/**
 * Save license data to storage
 */
export function saveLicenseData(licenseData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Saving consolidated license data...");
        yield figma.clientStorage.setAsync("licenseData", licenseData);
        console.log("License data saved successfully");
        // Save individual keys sequentially for backward compatibility
        console.log("Saving individual license keys...");
        try {
            yield figma.clientStorage.setAsync("licenseKey", licenseData.key);
            console.log("licenseKey saved");
        }
        catch (err) {
            console.warn("Failed to save licenseKey:", err);
        }
        try {
            yield figma.clientStorage.setAsync("unlimited", licenseData.unlimited);
            console.log("unlimited flag saved");
        }
        catch (err) {
            console.warn("Failed to save unlimited:", err);
        }
        try {
            yield figma.clientStorage.setAsync("licenseEmail", licenseData.email);
            console.log("licenseEmail saved");
        }
        catch (err) {
            console.warn("Failed to save email:", err);
        }
        try {
            yield figma.clientStorage.setAsync("licensePlan", licenseData.plan);
            console.log("licensePlan saved");
        }
        catch (err) {
            console.warn("Failed to save plan:", err);
        }
        try {
            yield figma.clientStorage.setAsync("licenseVersion", licenseData.version);
            console.log("licenseVersion saved");
        }
        catch (err) {
            console.warn("Failed to save version:", err);
        }
        console.log("All individual keys saved successfully");
    });
}
export function getEffectiveDefault(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const storageKey = `default_${key}`;
        const stored = yield getDefaultValue(storageKey);
        if (stored !== null && stored !== undefined && stored !== '') {
            return stored;
        }
        return DEFAULT_VALUES[key];
    });
}
/**
 * Get a stored default value for dynamic commands (prefix/suffix/between)
 */
export function getDefaultValue(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const v = yield figma.clientStorage.getAsync(key);
            return v !== undefined ? v : null;
        }
        catch (err) {
            console.warn('Error reading default value:', key, err);
            return null;
        }
    });
}
/**
 * Save a default value for dynamic commands
 */
export function saveDefaultValue(key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield figma.clientStorage.setAsync(key, value);
        }
        catch (err) {
            console.warn('Error saving default value:', key, err);
        }
    });
}
/**
 * Read consolidated license data (if stored)
 */
export function getLicenseData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stored = yield figma.clientStorage.getAsync('licenseData');
            if (stored)
                return stored;
            // Fallback to older individual keys
            const key = yield figma.clientStorage.getAsync('licenseKey');
            if (!key)
                return null;
            const unlimited = Boolean(yield figma.clientStorage.getAsync('unlimited'));
            const email = (yield figma.clientStorage.getAsync('licenseEmail')) || '';
            const plan = (yield figma.clientStorage.getAsync('licensePlan')) || '';
            const version = (yield figma.clientStorage.getAsync('licenseVersion')) || '';
            const activatedAt = (yield figma.clientStorage.getAsync('licenseActivatedAt')) || '';
            return {
                key: key,
                unlimited,
                email: email,
                plan: plan,
                version: version,
                activatedAt: activatedAt
            };
        }
        catch (err) {
            console.warn('Error reading license data:', err);
            return null;
        }
    });
}
/**
 * Clear stored license information
 */
export function clearLicenseData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield figma.clientStorage.deleteAsync('licenseData');
            yield figma.clientStorage.deleteAsync('licenseKey');
            yield figma.clientStorage.deleteAsync('unlimited');
            yield figma.clientStorage.deleteAsync('licenseEmail');
            yield figma.clientStorage.deleteAsync('licensePlan');
            yield figma.clientStorage.deleteAsync('licenseVersion');
            yield figma.clientStorage.deleteAsync('licenseActivatedAt');
            console.log('Cleared license data from storage');
        }
        catch (err) {
            console.warn('Error clearing license data:', err);
        }
    });
}
