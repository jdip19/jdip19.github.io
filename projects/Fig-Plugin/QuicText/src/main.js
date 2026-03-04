// ==================== MAIN PLUGIN FILE ====================
import { verifyLicenseKey, activateLicense } from './license';
import { incrementUsage, saveDefaultValue, getLicenseData, clearLicenseData, clearUsageStats, getDateFormat, setDateFormat, getTimeFormat, setTimeFormat, getEffectiveDefault, getDisplayTotal, ensureDailySync } from './storage';
import { collectTextNodes, processAllTextNodes } from './text-processing';
import { ENABLE_MONETIZATION, LICENSE_PRICE, FREE_USAGE_LIMIT } from './config';
import { PLUGIN_VERSION } from './version';
// Main plugin logic
async function main() {
    try {
        // 1️⃣ Get Pro always opens license UI
        if (figma.command === "myplan") {
            await showAccountUI();
            return;
        }
        // 3️⃣ Usage gate (THIS is the only gate)
        if (ENABLE_MONETIZATION) {
            const usage = await canUsePlugin();
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
    const textNodes = collectTextNodes(selection);
    if (textNodes.length === 0) {
        figma.notify('No text layers found in selection.');
        figma.closePlugin();
        return;
    }
    // Process nodes and detect whether any actual text change happened
    const didChange = await processAllTextNodes(textNodes);
    // Track usage for all users (free AND pro)
    if (ENABLE_MONETIZATION && didChange) {
        await incrementUsage();
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
                        await saveDefaultValue('default_prefix', msg.defaults.prefix || '');
                    if (msg.defaults.between !== undefined)
                        await saveDefaultValue('default_between', msg.defaults.between || '');
                    if (msg.defaults.suffix !== undefined)
                        await saveDefaultValue('default_suffix', msg.defaults.suffix || '');
                    if (msg.defaults.dateFormat !== undefined)
                        await setDateFormat(msg.defaults.dateFormat);
                    if (msg.defaults.timeFormat !== undefined)
                        await setTimeFormat(msg.defaults.timeFormat);
                }
                figma.ui.postMessage({ type: 'defaults-saved', success: true });
                break;
            case 'request-defaults':
                {
                    // Use effective defaults which fall back to config defaults when not set in storage
                    const prefix = await getEffectiveDefault('prefix');
                    const between = await getEffectiveDefault('between');
                    const suffix = await getEffectiveDefault('suffix');
                    const dateFormat = await getDateFormat();
                    const timeFormat = await getTimeFormat();
                    figma.ui.postMessage({ type: 'current-defaults', defaults: { prefix, between, suffix } });
                    figma.ui.postMessage({ type: 'date-format', value: dateFormat });
                    figma.ui.postMessage({ type: 'time-format', value: timeFormat });
                }
                break;
            case 'verify-license':
                const result = await verifyLicenseKey(msg.licenseKey);
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
                const success = await activateLicense(msg.licenseKey);
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
                await clearLicenseData();
                await clearUsageStats();
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
    await ensureDailySync();
    const displayTotal = await getDisplayTotal();
    const used = displayTotal;
    const limit = FREE_USAGE_LIMIT;
    const remaining = Math.max(0, limit - used);
    const licenseData = await getLicenseData();
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
        price: LICENSE_PRICE,
        displayTotal,
        version: PLUGIN_VERSION
    });
}
// Run the plugin
main();
