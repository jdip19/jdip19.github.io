// ==================== MAIN PLUGIN FILE ====================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { verifyLicenseKey, activateLicense } from './license';
import { getDeviceId, getUsageData, incrementUsage, saveDefaultValue, getDefaultValue, getLicenseData, clearLicenseData } from './storage';
import { collectTextNodes, processAllTextNodes, applyQuickCommand } from './text-processing';
import { ENABLE_MONETIZATION, LICENSE_PRICE } from './config';
// Main plugin logic
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1️⃣ Get Pro always opens license UI
            if (figma.command === "myplan") {
                yield showAccountUI();
                return;
            }
            // 2️⃣ Quick commands (no monetization check)
            const dynamicCommands = ['addprefix', 'addsuffix', 'addbetween'];
            if (dynamicCommands.includes(figma.command || '')) {
                yield applyQuickCommand(figma.command);
                figma.notify('Applied successfully!');
                figma.closePlugin();
                return;
            }
            // 3️⃣ Usage gate (THIS is the only gate)
            if (ENABLE_MONETIZATION) {
                const usage = yield canUsePlugin();
                if (!usage.allowed) {
                    yield showAccountUI();
                    return;
                }
            }
            // 4️⃣ Run command
            yield processTextCommand();
            figma.closePlugin();
        }
        catch (error) {
            console.error("Plugin error:", error);
            figma.notify("Something went wrong.");
            figma.closePlugin();
        }
    });
}
// Process text transformation commands
function processTextCommand() {
    return __awaiter(this, void 0, void 0, function* () {
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
        const licenseData = yield getLicenseData();
        if (ENABLE_MONETIZATION && !licenseData) {
            yield incrementUsage();
        }
        yield processAllTextNodes(textNodes);
    });
}
// Handle UI messages
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (msg.type) {
            case 'save-defaults':
                // msg.defaults = { prefix, between, suffix }
                if (msg.defaults) {
                    if (msg.defaults.prefix !== undefined)
                        yield saveDefaultValue('default_prefix', msg.defaults.prefix || '');
                    if (msg.defaults.between !== undefined)
                        yield saveDefaultValue('default_between', msg.defaults.between || '');
                    if (msg.defaults.suffix !== undefined)
                        yield saveDefaultValue('default_suffix', msg.defaults.suffix || '');
                }
                figma.ui.postMessage({ type: 'defaults-saved', success: true });
                break;
            case 'request-defaults':
                {
                    const prefix = yield getDefaultValue('default_prefix');
                    const between = yield getDefaultValue('default_between');
                    const suffix = yield getDefaultValue('default_suffix');
                    figma.ui.postMessage({ type: 'current-defaults', defaults: { prefix, between, suffix } });
                }
                break;
            case 'verify-license':
                const result = yield verifyLicenseKey(msg.licenseKey);
                figma.ui.postMessage({
                    type: 'license-verified',
                    success: (result === null || result === void 0 ? void 0 : result.valid) || false,
                    message: (result === null || result === void 0 ? void 0 : result.error) || ((result === null || result === void 0 ? void 0 : result.valid) ? 'License is valid' : 'License verification failed')
                });
                if (result === null || result === void 0 ? void 0 : result.valid) {
                    figma.notify('✅ License activated!');
                    // Close UI and run the original command
                    figma.ui.close();
                    yield processTextCommand();
                    figma.closePlugin(); // Close plugin after processing
                }
                break;
            case 'activate-license': {
                const success = yield activateLicense(msg.licenseKey);
                figma.ui.postMessage({
                    type: success ? 'license-activated' : 'license-error',
                    message: success ? 'License activated successfully' : 'Invalid license key'
                });
                if (success) {
                    figma.notify('✅ License activated!');
                    yield showAccountUI(); // 🔁 re-render UI as Pro
                }
                break;
            }
            case 'close-ui':
                figma.ui.close();
                figma.closePlugin(); // Close plugin when user cancels
                break;
            case 'logout':
                yield clearLicenseData();
                figma.notify('Logged out');
                yield showAccountUI();
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
});
function showAccountUI() {
    return __awaiter(this, void 0, void 0, function* () {
        const deviceId = yield getDeviceId();
        const usage = yield getUsageData();
        const used = usage.count;
        const limit = 10;
        const remaining = Math.max(0, limit - used);
        const licenseData = yield getLicenseData();
        const isPro = Boolean(licenseData);
        figma.showUI(__html__, {
            width: 500,
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
    });
}
// Run the plugin
main();
