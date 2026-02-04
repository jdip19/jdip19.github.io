// ==================== STORAGE UTILITIES ====================
import { getTodayDate, generateUUID } from "./utils";
import { DEFAULT_VALUES } from "./config";
/**
 * Get current usage data
 */
export async function getUsageData() {
    const stored = await figma.clientStorage.getAsync("usageData");
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
}
/**
 * Increment usage count
 */
export async function incrementUsage() {
    const usage = await getUsageData();
    usage.count++;
    await figma.clientStorage.setAsync("usageData", usage);
}
/**
 * Get device ID (creates one if it doesn't exist)
 */
export async function getDeviceId() {
    try {
        console.log("Getting device ID from storage...");
        const deviceId = await figma.clientStorage.getAsync("deviceId");
        console.log("Device ID from storage:", deviceId ? "exists" : "null");
        if (deviceId) {
            console.log("Returning existing device ID");
            return deviceId;
        }
        console.log("Generating new device ID...");
        const newId = generateUUID();
        console.log("Generated new ID:", newId.substring(0, 8) + "...");
        console.log("Saving new device ID to storage...");
        await figma.clientStorage.setAsync("deviceId", newId);
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
}
/**
 * Get stored index for cycling text
 */
export async function getStoredIndex(key) {
    const stored = await figma.clientStorage.getAsync(key);
    return stored !== undefined ? stored : 0;
}
/**
 * Save index for cycling text
 */
export async function saveStoredIndex(key, index) {
    await figma.clientStorage.setAsync(key, index);
}
/**
 * Save license data to storage
 */
export async function saveLicenseData(licenseData) {
    console.log("Saving consolidated license data...");
    await figma.clientStorage.setAsync("licenseData", licenseData);
    console.log("License data saved successfully");
    // Save individual keys sequentially for backward compatibility
    console.log("Saving individual license keys...");
    try {
        await figma.clientStorage.setAsync("licenseKey", licenseData.key);
        console.log("licenseKey saved");
    }
    catch (err) {
        console.warn("Failed to save licenseKey:", err);
    }
    try {
        await figma.clientStorage.setAsync("unlimited", licenseData.unlimited);
        console.log("unlimited flag saved");
    }
    catch (err) {
        console.warn("Failed to save unlimited:", err);
    }
    try {
        await figma.clientStorage.setAsync("licenseEmail", licenseData.email);
        console.log("licenseEmail saved");
    }
    catch (err) {
        console.warn("Failed to save email:", err);
    }
    try {
        await figma.clientStorage.setAsync("licensePlan", licenseData.plan);
        console.log("licensePlan saved");
    }
    catch (err) {
        console.warn("Failed to save plan:", err);
    }
    try {
        await figma.clientStorage.setAsync("licenseVersion", licenseData.version);
        console.log("licenseVersion saved");
    }
    catch (err) {
        console.warn("Failed to save version:", err);
    }
    console.log("All individual keys saved successfully");
}
export async function getEffectiveDefault(key) {
    const storageKey = `default_${key}`;
    const stored = await getDefaultValue(storageKey);
    if (stored !== null && stored !== undefined && stored !== "") {
        return stored;
    }
    return DEFAULT_VALUES[key];
}
/**
 * Get a stored default value for prefix/between/suffix commands
 */
export async function getDefaultValue(key) {
    try {
        const v = await figma.clientStorage.getAsync(key);
        return v !== undefined ? v : null;
    }
    catch (err) {
        console.warn("Error reading default value:", key, err);
        return null;
    }
}
/**
 * Save a default value for prefix/between/suffix commands
 */
export async function saveDefaultValue(key, value) {
    try {
        await figma.clientStorage.setAsync(key, value);
    }
    catch (err) {
        console.warn("Error saving default value:", key, err);
    }
}
/**
 * Read consolidated license data (if stored)
 */
export async function getLicenseData() {
    try {
        const stored = await figma.clientStorage.getAsync("licenseData");
        if (stored)
            return stored;
        // Fallback to older individual keys
        const key = await figma.clientStorage.getAsync("licenseKey");
        if (!key)
            return null;
        const unlimited = Boolean(await figma.clientStorage.getAsync("unlimited"));
        const email = (await figma.clientStorage.getAsync("licenseEmail")) || "";
        const plan = (await figma.clientStorage.getAsync("licensePlan")) || "";
        const version = (await figma.clientStorage.getAsync("licenseVersion")) || "";
        const activatedAt = (await figma.clientStorage.getAsync("licenseActivatedAt")) || "";
        return {
            key: key,
            unlimited,
            email: email,
            plan: plan,
            version: version,
            activatedAt: activatedAt,
        };
    }
    catch (err) {
        console.warn("Error reading license data:", err);
        return null;
    }
}
/**
 * Clear stored license information
 */
export async function clearLicenseData() {
    try {
        await figma.clientStorage.deleteAsync("licenseData");
        await figma.clientStorage.deleteAsync("licenseKey");
        await figma.clientStorage.deleteAsync("unlimited");
        await figma.clientStorage.deleteAsync("licenseEmail");
        await figma.clientStorage.deleteAsync("licensePlan");
        await figma.clientStorage.deleteAsync("licenseVersion");
        await figma.clientStorage.deleteAsync("licenseActivatedAt");
        console.log("Cleared license data from storage");
    }
    catch (err) {
        console.warn("Error clearing license data:", err);
    }
}
export async function getDateFormat() {
    return (await figma.clientStorage.getAsync("dateFormat")) || "mm-dd-yyyy";
}
export async function setDateFormat(value) {
    await figma.clientStorage.setAsync("dateFormat", value);
}
