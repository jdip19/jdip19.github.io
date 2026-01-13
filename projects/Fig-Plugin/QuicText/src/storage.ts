// ==================== STORAGE UTILITIES ====================

import { UsageData, LicenseData } from "./types";
import { getTodayDate, generateUUID } from "./utils";
import { DEFAULT_VALUES } from "./config";

/**
 * Get current usage data
 */
export async function getUsageData(): Promise<UsageData> {
  const stored = await figma.clientStorage.getAsync("usageData");
  const today = getTodayDate();

  if (!stored) {
    return { count: 0, date: today };
  }

  const usage = stored as UsageData;

  // Reset if it's a new day
  if (usage.date !== today) {
    return { count: 0, date: today };
  }

  return usage;
}

/**
 * Increment usage count
 */
export async function incrementUsage(): Promise<void> {
  const usage = await getUsageData();
  usage.count++;
  await figma.clientStorage.setAsync("usageData", usage);
}

/**
 * Get device ID (creates one if it doesn't exist)
 */
export async function getDeviceId(): Promise<string> {
  try {
    console.log("Getting device ID from storage...");
    const deviceId = await figma.clientStorage.getAsync("deviceId");
    console.log("Device ID from storage:", deviceId ? "exists" : "null");

    if (deviceId) {
      console.log("Returning existing device ID");
      return deviceId as string;
    }

    console.log("Generating new device ID...");
    const newId = generateUUID();
    console.log("Generated new ID:", newId.substring(0, 8) + "...");

    console.log("Saving new device ID to storage...");
    await figma.clientStorage.setAsync("deviceId", newId);
    console.log("Device ID saved successfully");

    return newId;
  } catch (err) {
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
export async function getStoredIndex(key: string): Promise<number> {
  const stored = await figma.clientStorage.getAsync(key);
  return stored !== undefined ? stored : 0;
}

/**
 * Save index for cycling text
 */
export async function saveStoredIndex(
  key: string,
  index: number
): Promise<void> {
  await figma.clientStorage.setAsync(key, index);
}

/**
 * Save license data to storage
 */
export async function saveLicenseData(licenseData: LicenseData): Promise<void> {
  console.log("Saving consolidated license data...");
  await figma.clientStorage.setAsync("licenseData", licenseData);
  console.log("License data saved successfully");

  // Save individual keys sequentially for backward compatibility
  console.log("Saving individual license keys...");
  try {
    await figma.clientStorage.setAsync("licenseKey", licenseData.key);
    console.log("licenseKey saved");
  } catch (err) {
    console.warn("Failed to save licenseKey:", err);
  }

  try {
    await figma.clientStorage.setAsync("unlimited", licenseData.unlimited);
    console.log("unlimited flag saved");
  } catch (err) {
    console.warn("Failed to save unlimited:", err);
  }

  try {
    await figma.clientStorage.setAsync("licenseEmail", licenseData.email);
    console.log("licenseEmail saved");
  } catch (err) {
    console.warn("Failed to save email:", err);
  }

  try {
    await figma.clientStorage.setAsync("licensePlan", licenseData.plan);
    console.log("licensePlan saved");
  } catch (err) {
    console.warn("Failed to save plan:", err);
  }

  try {
    await figma.clientStorage.setAsync("licenseVersion", licenseData.version);
    console.log("licenseVersion saved");
  } catch (err) {
    console.warn("Failed to save version:", err);
  }

  console.log("All individual keys saved successfully");
}

export async function getEffectiveDefault(
  key: "prefix" | "between" | "suffix"
): Promise<string> {
  const storageKey = `default_${key}`;
  const stored = await getDefaultValue(storageKey);

  if (stored !== null && stored !== undefined && stored !== "") {
    return stored;
  }

  return DEFAULT_VALUES[key];
}

/**
 * Get a stored default value for dynamic commands (prefix/suffix/between)
 */
export async function getDefaultValue(key: string): Promise<string | null> {
  try {
    const v = await figma.clientStorage.getAsync(key);
    return v !== undefined ? (v as string) : null;
  } catch (err) {
    console.warn("Error reading default value:", key, err);
    return null;
  }
}

/**
 * Save a default value for dynamic commands
 */
export async function saveDefaultValue(
  key: string,
  value: string
): Promise<void> {
  try {
    await figma.clientStorage.setAsync(key, value);
  } catch (err) {
    console.warn("Error saving default value:", key, err);
  }
}

/**
 * Read consolidated license data (if stored)
 */
export async function getLicenseData(): Promise<LicenseData | null> {
  try {
    const stored = await figma.clientStorage.getAsync("licenseData");
    if (stored) return stored as LicenseData;

    // Fallback to older individual keys
    const key = await figma.clientStorage.getAsync("licenseKey");
    if (!key) return null;
    const unlimited = Boolean(await figma.clientStorage.getAsync("unlimited"));
    const email = (await figma.clientStorage.getAsync("licenseEmail")) || "";
    const plan = (await figma.clientStorage.getAsync("licensePlan")) || "";
    const version =
      (await figma.clientStorage.getAsync("licenseVersion")) || "";
    const activatedAt =
      (await figma.clientStorage.getAsync("licenseActivatedAt")) || "";

    return {
      key: key as string,
      unlimited,
      email: email as string,
      plan: plan as string,
      version: version as string,
      activatedAt: activatedAt as string,
    } as LicenseData;
  } catch (err) {
    console.warn("Error reading license data:", err);
    return null;
  }
}

/**
 * Clear stored license information
 */
export async function clearLicenseData(): Promise<void> {
  try {
    await figma.clientStorage.deleteAsync("licenseData");
    await figma.clientStorage.deleteAsync("licenseKey");
    await figma.clientStorage.deleteAsync("unlimited");
    await figma.clientStorage.deleteAsync("licenseEmail");
    await figma.clientStorage.deleteAsync("licensePlan");
    await figma.clientStorage.deleteAsync("licenseVersion");
    await figma.clientStorage.deleteAsync("licenseActivatedAt");
    console.log("Cleared license data from storage");
  } catch (err) {
    console.warn("Error clearing license data:", err);
  }
}

export async function getDateFormat(): Promise<string> {
  return (await figma.clientStorage.getAsync("dateFormat")) || "mm-dd-yyyy";
}

export async function setDateFormat(value: string) {
  await figma.clientStorage.setAsync("dateFormat", value);
}
