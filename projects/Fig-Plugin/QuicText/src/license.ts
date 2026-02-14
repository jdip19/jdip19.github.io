// ==================== LICENSE MANAGEMENT ====================

import { SupabaseResponse } from "./types";
import {
  VERIFY_LICENSE_URL,
  ENABLE_MONETIZATION,
  FREE_DAILY_LIMIT,
} from "./config";
import { getDeviceId, getUsageStats } from "./storage";
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
export async function hasLicense(): Promise<boolean> {
  try {
    const license = await getStoredLicense();

    if (license?.key) {
      const result = await verifyLicenseKey(license.key);
      if (result?.valid) return true;

      // Invalid or revoked
      await clearLicenseStorage();
      return false;
    }

    // Legacy fallback (one-time)
    const legacyKey = await figma.clientStorage.getAsync("licenseKey");
    if (typeof legacyKey === "string" && legacyKey.length > 0) {
      const result = await verifyLicenseKey(legacyKey);
      if (result?.valid) return true;
      await clearLicenseStorage();
    }

    return false;
  } catch (err) {
    console.error("License check failed:", err);
    return false;
  }
}

/**
 * Verify license key with Supabase
 */
export async function verifyLicenseKey(
  licenseKey: string
): Promise<SupabaseResponse | null> {
  if (!licenseKey?.trim()) return null;

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

    const data = (await res.json()) as SupabaseResponse;
    return data;
  } catch (err) {
    console.error("License verification error:", err);
    return { valid: false, error: "Network error" };
  }
}

/**
 * Check if user can use the plugin (license or free quota)
 */
export async function canUsePlugin(): Promise<{
  allowed: boolean;
  remaining?: number;
}> {
  if (!ENABLE_MONETIZATION) return { allowed: true };

  try {
    // Paid user
    const license = await getStoredLicense();
    if (license?.unlimited) {
      return { allowed: true };
    }

    // Free quota user
    const stats = await getUsageStats();
    const displayTotal = stats.lastFetchedTotal + (stats.usageCount - stats.syncedUsageCount);
    const remaining = FREE_DAILY_LIMIT - displayTotal;

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
  } catch (err) {
    console.error("Usage check failed:", err);
    return { allowed: true };
  }
}

/**
 * Activate license (called from UI)
 */
export async function activateLicense(licenseKey: string): Promise<boolean> {
  if (!licenseKey?.trim()) return false;

  try {
    const result = await verifyLicenseKey(licenseKey);
    if (!result?.valid) return false;

    const licenseData = {
      key: licenseKey.trim(),
      unlimited: result.unlimited ?? false,
      email: result.email ?? "",
      plan: result.plan ?? "",
      activatedVersion: result.version ?? "",
      currentVersion: PLUGIN_VERSION,
      activatedAt: new Date().toISOString(),
    };
    console.log("Yo Storing license data:", licenseData);
    await figma.clientStorage.setAsync("licenseData", licenseData);

    // Legacy compatibility (optional)
    await figma.clientStorage.setAsync("licenseKey", licenseKey.trim()).catch(() => { });
    await figma.clientStorage.setAsync(
      "unlimited",
      licenseData.unlimited
    ).catch(() => { });

    console.log("License activated successfully");
    return true;
  } catch (err) {
    console.error("License activation failed:", err);
    return false;
  }
}
