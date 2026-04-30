"use strict";
// ==================== MAIN PLUGIN FILE ====================
Object.defineProperty(exports, "__esModule", { value: true });
const license_1 = require("./license");
const storage_1 = require("./storage");
const text_processing_1 = require("./text-processing");
const config_1 = require("./config");
const version_1 = require("./version");
// Main plugin logic
async function main() {
    try {
        // 1️⃣ Get Pro always opens license UI
        if (figma.command === "myplan") {
            await showAccountUI();
            return;
        }
        // 3️⃣ Usage gate (THIS is the only gate)
        if (config_1.ENABLE_MONETIZATION) {
            const usage = await (0, license_1.canUsePlugin)();
            if (!usage.allowed) {
                await showAccountUI();
                return;
            }
        }
        // 4️⃣ Run command
        await processTextCommand();
        figma.closePlugin();
    }
    catch (error) {
        console.error("Plugin error:", error);
        figma.notify("Something went wrong.");
        figma.closePlugin();
    }
}
// Process text transformation commands
async function processTextCommand() {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
        figma.notify('Please select at least one text layer.');
        figma.closePlugin();
        return;
    }
    const textNodes = (0, text_processing_1.collectTextNodes)(selection);
    if (textNodes.length === 0) {
        figma.notify('No text layers found in selection.');
        figma.closePlugin();
        return;
    }
    // Process nodes and detect whether any actual text change happened
    const didChange = await (0, text_processing_1.processAllTextNodes)(textNodes);
    // Track usage for all users (free AND pro)
    if (config_1.ENABLE_MONETIZATION && didChange) {
        await (0, storage_1.incrementUsage)();
    }
}
// Handle UI messages
figma.ui.onmessage = async (msg) => {
    try {
        switch (msg.type) {
            case 'save-defaults':
                // msg.defaults = { prefix, between, suffix, dateFormat, timeFormat }
                if (msg.defaults) {
                    if (msg.defaults.prefix !== undefined)
                        await (0, storage_1.saveDefaultValue)('default_prefix', msg.defaults.prefix || '');
                    if (msg.defaults.between !== undefined)
                        await (0, storage_1.saveDefaultValue)('default_between', msg.defaults.between || '');
                    if (msg.defaults.suffix !== undefined)
                        await (0, storage_1.saveDefaultValue)('default_suffix', msg.defaults.suffix || '');
                    if (msg.defaults.dateFormat !== undefined)
                        await (0, storage_1.setDateFormat)(msg.defaults.dateFormat);
                    if (msg.defaults.timeFormat !== undefined)
                        await (0, storage_1.setTimeFormat)(msg.defaults.timeFormat);
                }
                figma.ui.postMessage({ type: 'defaults-saved', success: true });
                break;
            case 'request-defaults':
                {
                    // Use effective defaults which fall back to config defaults when not set in storage
                    const prefix = await (0, storage_1.getEffectiveDefault)('prefix');
                    const between = await (0, storage_1.getEffectiveDefault)('between');
                    const suffix = await (0, storage_1.getEffectiveDefault)('suffix');
                    const dateFormat = await (0, storage_1.getDateFormat)();
                    const timeFormat = await (0, storage_1.getTimeFormat)();
                    figma.ui.postMessage({ type: 'current-defaults', defaults: { prefix, between, suffix } });
                    figma.ui.postMessage({ type: 'date-format', value: dateFormat });
                    figma.ui.postMessage({ type: 'time-format', value: timeFormat });
                }
                break;
            case 'verify-license':
                const result = await (0, license_1.verifyLicenseKey)(msg.licenseKey);
                figma.ui.postMessage({
                    type: 'license-verified',
                    success: (result === null || result === void 0 ? void 0 : result.valid) || false,
                    message: (result === null || result === void 0 ? void 0 : result.error) || ((result === null || result === void 0 ? void 0 : result.valid) ? 'License is valid' : 'License verification failed')
                });
                if (result === null || result === void 0 ? void 0 : result.valid) {
                    figma.notify('✅ License activated!');
                    // Close UI and run the original command
                    figma.ui.close();
                    await processTextCommand();
                    figma.closePlugin(); // Close plugin after processing
                }
                break;
            case 'activate-license': {
                const success = await (0, license_1.activateLicense)(msg.licenseKey);
                figma.ui.postMessage({
                    type: success ? 'license-activated' : 'license-error',
                    message: success ? 'License activated successfully' : 'Invalid license key'
                });
                if (success) {
                    figma.notify('✅ License activated!');
                    await showAccountUI(); // 🔁 re-render UI as Pro
                }
                break;
            }
            case 'close-ui':
                figma.ui.close();
                figma.closePlugin(); // Close plugin when user cancels
                break;
            case 'logout':
                await (0, storage_1.clearLicenseData)();
                await (0, storage_1.clearUsageStats)();
                figma.notify('Logged out');
                await showAccountUI();
                break;
        }
    }
    catch (error) {
        console.error('UI message error:', error);
        figma.ui.postMessage({
            type: 'error',
            message: 'An error occurred processing your request.'
        });
        figma.closePlugin(); // Close plugin on error
    }
};
async function showAccountUI() {
    // Ensure we sync with the server once per day when UI is opened
    await (0, storage_1.ensureDailySync)();
    const displayTotal = await (0, storage_1.getDisplayTotal)();
    const used = displayTotal;
    const limit = config_1.FREE_USAGE_LIMIT;
    const remaining = Math.max(0, limit - used);
    const licenseData = await (0, storage_1.getLicenseData)();
    const isPro = Boolean(licenseData);
    figma.showUI(__html__, {
        width: 300,
        height: isPro ? 420 : 520
    });
    figma.ui.postMessage({
        type: 'show-license',
        isPro,
        licenseData: licenseData !== null && licenseData !== void 0 ? licenseData : null,
        remaining,
        used,
        limit,
        price: config_1.LICENSE_PRICE,
        displayTotal,
        version: version_1.PLUGIN_VERSION
    });
}
// Run the plugin
main();
