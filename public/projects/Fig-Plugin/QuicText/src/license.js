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
import { VERIFY_LICENSE_URL, DEMO_MODE, ENABLE_MONETIZATION, FREE_DAILY_LIMIT } from './config';
import { getDeviceId, getUsageData } from './storage';
/**
 * Check if user has valid license
 */
export function hasLicense() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // First try the new consolidated storage format
            const licenseData = yield figma.clientStorage.getAsync("licenseData");
            if (licenseData && typeof licenseData === 'object') {
                console.log("Found license data in consolidated format");
                return true;
            }
            // Fallback to individual keys
            const savedKey = yield figma.clientStorage.getAsync("licenseKey");
            if (!savedKey)
                return false;
            if (typeof savedKey !== 'string' || savedKey.length === 0) {
                return false;
            }
            const result = yield verifyLicenseKey(savedKey);
            if (result && result.valid) {
                // Cache valid license info
                yield figma.clientStorage.setAsync("unlimited", (_a = result.unlimited) !== null && _a !== void 0 ? _a : false).catch(() => { });
                return true;
            }
            else {
                // Invalid license - clear it
                yield figma.clientStorage.deleteAsync("licenseKey").catch(() => { });
                return false;
            }
        }
        catch (err) {
            console.error("License check error:", err);
            return false;
        }
    });
}
/**
 * Verify license key with Supabase
 */
export function verifyLicenseKey(licenseKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.trim().length === 0) {
            console.warn("Invalid license key format");
            return null;
        }
        const trimmedKey = licenseKey.trim();
        // Demo mode for testing
        if (DEMO_MODE) {
            console.log("🔧 DEMO MODE: Accepting all test keys starting with QT-TEST-");
            if (trimmedKey.startsWith("QT-TEST-")) {
                console.log("✅ Demo license accepted");
                return {
                    valid: true,
                    unlimited: true,
                    email: "demo@example.com",
                    plan: "pro",
                    version: "1.0"
                };
            }
            else {
                console.log("❌ Demo license rejected - key doesn't start with QT-TEST-");
                return {
                    valid: false,
                    error: "Demo mode: only accepts keys starting with QT-TEST-"
                };
            }
        }
        console.log("🌐 Making real Supabase API call...");
        console.log("📡 URL:", VERIFY_LICENSE_URL);
        console.log("🔑 License key:", trimmedKey.substring(0, 8) + "...");
        try {
            const deviceId = yield getDeviceId();
            if (!deviceId) {
                console.warn("❌ Could not get device ID");
                return { valid: false, error: "Could not get device ID" };
            }
            console.log("📱 Device ID:", deviceId.substring(0, 8) + "...");
            const requestBody = {
                key: trimmedKey,
                device_id: deviceId
            };
            console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));
            // Simplified fetch without AbortController to avoid WebAssembly conflicts
            let response;
            try {
                console.log("⏳ Sending fetch request...");
                console.log("🌐 Full request details:");
                console.log("  URL:", VERIFY_LICENSE_URL);
                console.log("  Method: POST");
                console.log("  Headers:", {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                });
                console.log("  Body:", requestBody);
                response = yield fetch(VERIFY_LICENSE_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(requestBody)
                });
                console.log("📥 Response received");
                // Check if response object exists (Figma WebAssembly compatibility issue)
                if (!response) {
                    console.error("❌ Response object is null/undefined - this is a Figma WebAssembly environment issue");
                    return { valid: false, error: "No response received from server (WebAssembly compatibility issue)" };
                }
            }
            catch (fetchErr) {
                console.error("❌ Fetch error details:");
                const error = fetchErr;
                console.error("  Error type:", ((_a = error.constructor) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown');
                console.error("  Error message:", error.message || String(fetchErr));
                console.error("  Error stack:", error.stack || 'No stack trace');
                // Try to determine the specific error type
                if (error.message && error.message.includes('Failed to fetch')) {
                    console.error("🚫 This is likely a network/CORS/CSP issue");
                    console.error("💡 Possible causes:");
                    console.error("   - Plugin not reloaded after manifest.json changes");
                    console.error("   - CORS not configured on Supabase");
                    console.error("   - Supabase function not deployed");
                    console.error("   - Network connectivity issues");
                }
                return { valid: false, error: "Network error: " + String(fetchErr) };
            }
            console.log("📊 Response status:", response.status);
            console.log("📊 Response headers available:", response.headers ? "headers available" : "headers not available");
            if (!response.ok) {
                let errorText = "";
                try {
                    errorText = yield response.text();
                    console.log("❌ Error response body:", errorText);
                }
                catch (textErr) {
                    errorText = "Could not read response body";
                    console.error("❌ Could not read error response:", textErr);
                }
                console.error(`❌ License verification failed with status: ${response.status}`);
                return { valid: false, error: `HTTP ${response.status}: ${errorText}` };
            }
            const contentType = ((_b = response.headers) === null || _b === void 0 ? void 0 : _b.get) ? response.headers.get("content-type") : "unknown";
            console.log("📄 Content-Type:", contentType);
            // Be more lenient with content-type check - try to parse JSON regardless
            let data;
            try {
                console.log("🔄 Parsing JSON response...");
                data = yield response.json();
                console.log("✅ JSON parsed successfully");
                console.log("📦 Full Supabase response:", JSON.stringify(data, null, 2));
            }
            catch (jsonErr) {
                console.error("❌ Error parsing JSON response:", jsonErr);
                // If JSON parsing fails, that's when we return the invalid format error
                let text = "";
                try {
                    text = yield response.text();
                    console.log("📄 Raw response text:", text);
                }
                catch (textErr) {
                    text = "Could not read response";
                    console.error("❌ Could not read response:", textErr);
                }
                return { valid: false, error: "Invalid response format: " + text };
            }
            if (!data || typeof data !== 'object') {
                console.warn("⚠️ Invalid response object");
                return { valid: false, error: "Invalid response object" };
            }
            console.log("🎯 License verification result:", {
                valid: data.valid,
                unlimited: data.unlimited,
                hasEmail: !!data.email,
                hasPlan: !!data.plan,
                hasVersion: !!data.version,
                error: data.error
            });
            return data;
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    console.error("⏰ License verification timeout");
                    return { valid: false, error: "Request timeout" };
                }
                console.error("❌ Error verifying license:", err.message);
                return { valid: false, error: err.message };
            }
            else {
                console.error("❌ Error verifying license:", err);
            }
            return { valid: false, error: String(err) };
        }
    });
}
/**
 * Check if user can use the plugin (has license or under daily limit)
 */
export function canUsePlugin() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ENABLE_MONETIZATION)
            return { allowed: true };
        try {
            // Check for consolidated license data first
            const licenseData = yield figma.clientStorage.getAsync("licenseData");
            if (licenseData && typeof licenseData === 'object' && licenseData.unlimited) {
                return { allowed: true };
            }
            // Fallback to individual unlimited flag
            const unlimited = Boolean(yield figma.clientStorage.getAsync("unlimited"));
            if (unlimited)
                return { allowed: true };
            const licensed = yield hasLicense();
            if (licensed)
                return { allowed: true };
            const usage = yield getUsageData();
            const remaining = FREE_DAILY_LIMIT - usage.count;
            return {
                allowed: remaining > 0,
                remaining: Math.max(0, remaining)
            };
        }
        catch (err) {
            console.error("Error in canUsePlugin:", err);
            // On error, allow usage to prevent blocking users
            return { allowed: true };
        }
    });
}
/**
 * Activate license (called from UI after payment)
 */
export function activateLicense(licenseKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.trim().length === 0) {
            console.error("Invalid license key format");
            return false;
        }
        try {
            console.log("Attempting to activate license:", licenseKey.substring(0, 8) + "...");
            console.log("Getting device ID...");
            const device_id = yield getDeviceId();
            console.log("Device ID obtained:", device_id ? "yes" : "no");
            if (!device_id) {
                console.error("Failed to get device ID");
                return false;
            }
            console.log("Verifying license key...");
            const result = yield verifyLicenseKey(licenseKey.trim());
            console.log("License verification completed");
            if (!result) {
                console.error("No response from license verification");
                return false;
            }
            console.log("License verification result:", { valid: result.valid, error: result.error });
            if (result && result.valid === true) {
                console.log("License is valid, saving to storage...");
                // Save data sequentially to avoid WebAssembly memory issues
                try {
                    const licenseData = {
                        key: licenseKey.trim(),
                        unlimited: (_a = result.unlimited) !== null && _a !== void 0 ? _a : false,
                        email: (_b = result.email) !== null && _b !== void 0 ? _b : "",
                        plan: (_c = result.plan) !== null && _c !== void 0 ? _c : "",
                        version: (_d = result.version) !== null && _d !== void 0 ? _d : "",
                        activatedAt: new Date().toISOString()
                    };
                    console.log("Saving consolidated license data...");
                    yield figma.clientStorage.setAsync("licenseData", licenseData);
                    console.log("License data saved successfully");
                    // Save individual keys sequentially for backward compatibility
                    console.log("Saving individual license keys...");
                    try {
                        yield figma.clientStorage.setAsync("licenseKey", licenseKey.trim());
                        console.log("licenseKey saved");
                    }
                    catch (err) {
                        console.warn("Failed to save licenseKey:", err);
                    }
                    try {
                        yield figma.clientStorage.setAsync("unlimited", (_e = result.unlimited) !== null && _e !== void 0 ? _e : false);
                        console.log("unlimited flag saved");
                    }
                    catch (err) {
                        console.warn("Failed to save unlimited:", err);
                    }
                    try {
                        yield figma.clientStorage.setAsync("licenseEmail", (_f = result.email) !== null && _f !== void 0 ? _f : "");
                        console.log("licenseEmail saved");
                    }
                    catch (err) {
                        console.warn("Failed to save email:", err);
                    }
                    try {
                        yield figma.clientStorage.setAsync("licensePlan", (_g = result.plan) !== null && _g !== void 0 ? _g : "");
                        console.log("licensePlan saved");
                    }
                    catch (err) {
                        console.warn("Failed to save plan:", err);
                    }
                    try {
                        yield figma.clientStorage.setAsync("licenseVersion", (_h = result.version) !== null && _h !== void 0 ? _h : "");
                        console.log("licenseVersion saved");
                    }
                    catch (err) {
                        console.warn("Failed to save version:", err);
                    }
                    console.log("All individual keys saved successfully");
                    console.log("License activated successfully");
                    return true;
                }
                catch (storageErr) {
                    console.error("Error saving license to storage:", storageErr);
                    // Even if storage fails, consider the license valid for this session
                    console.log("License valid for this session despite storage error");
                    return true;
                }
            }
            else {
                console.warn("License verification returned invalid:", (result === null || result === void 0 ? void 0 : result.error) || "Unknown error");
                return false;
            }
        }
        catch (err) {
            console.error("License activation error:", err);
            return false;
        }
    });
}
