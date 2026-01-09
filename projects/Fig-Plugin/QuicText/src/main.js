// ==================== MAIN PLUGIN FILE ====================
import { verifyLicenseKey, activateLicense } from './license';
import { getDeviceId, getUsageData, incrementUsage, saveDefaultValue, getDefaultValue, getLicenseData, clearLicenseData } from './storage';
import { collectTextNodes, processAllTextNodes, applyQuickCommand } from './text-processing';
import { ENABLE_MONETIZATION, LICENSE_PRICE } from './config';
// Main plugin logic
async function main() {
    try {
        // 1️⃣ Get Pro always opens license UI
        if (figma.command === "myplan") {
            await showAccountUI();
            return;
        }
        // 2️⃣ Quick commands (no monetization check)
        const dynamicCommands = ['addprefix', 'addsuffix', 'addbetween'];
        if (dynamicCommands.includes(figma.command || '')) {
            await applyQuickCommand(figma.command);
            figma.notify('Applied successfully!');
            figma.closePlugin();
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
    const licenseData = await getLicenseData();
    await processAllTextNodes(textNodes);
    // Increment only after success
    if (ENABLE_MONETIZATION) {
        const licenseData = await getLicenseData();
        if (!licenseData) {
            await incrementUsage();
        }
    }
}
// Handle UI messages
figma.ui.onmessage = async (msg) => {
    try {
        switch (msg.type) {
            case 'save-defaults':
                // msg.defaults = { prefix, between, suffix }
                if (msg.defaults) {
                    if (msg.defaults.prefix !== undefined)
                        await saveDefaultValue('default_prefix', msg.defaults.prefix || '');
                    if (msg.defaults.between !== undefined)
                        await saveDefaultValue('default_between', msg.defaults.between || '');
                    if (msg.defaults.suffix !== undefined)
                        await saveDefaultValue('default_suffix', msg.defaults.suffix || '');
                }
                figma.ui.postMessage({ type: 'defaults-saved', success: true });
                break;
            case 'request-defaults':
                {
                    const prefix = await getDefaultValue('default_prefix');
                    const between = await getDefaultValue('default_between');
                    const suffix = await getDefaultValue('default_suffix');
                    figma.ui.postMessage({ type: 'current-defaults', defaults: { prefix, between, suffix } });
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
    const deviceId = await getDeviceId();
    const usage = await getUsageData();
    const used = usage.count;
    const limit = 10;
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
        deviceId
    });
}
// Run the plugin
main();
