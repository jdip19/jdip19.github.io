"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// ==================== MONETIZATION SETTINGS ====================
// Set to false to disable usage limits for testing
const ENABLE_MONETIZATION = true;
const VERIFY_LICENSE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/verify-license";
// Utility to get all font ranges in a text node
function loadAllFontsForNode(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const fontPromises = [];
        let failed = false;
        for (let i = 0; i < node.characters.length;) {
            const font = node.getRangeFontName(i, i + 1);
            let j = i + 1;
            // Find the next range where the font changes
            while (j < node.characters.length) {
                const nextFont = node.getRangeFontName(j, j + 1);
                if (!fontsEqual(nextFont, font)) {
                    break;
                }
                j++;
            }
            if (font !== figma.mixed) {
                fontPromises.push(figma.loadFontAsync(font).catch(err => {
                    console.error('Error loading font:', font, err);
                    failed = true;
                }));
            }
            i = j;
        }
        yield Promise.all(fontPromises);
        return !failed;
    });
}
// Utility to get all unique fonts from all text nodes
function getAllUniqueFonts(textNodes) {
    const fontSet = new Set();
    const fonts = [];
    for (const node of textNodes) {
        for (let i = 0; i < node.characters.length;) {
            const font = node.getRangeFontName(i, i + 1);
            let j = i + 1;
            while (j < node.characters.length) {
                const nextFont = node.getRangeFontName(j, j + 1);
                if (!fontsEqual(nextFont, font)) {
                    break;
                }
                j++;
            }
            const fontKey = createFontKey(font);
            if (font !== figma.mixed && !fontSet.has(fontKey)) {
                fontSet.add(fontKey);
                fonts.push(font);
            }
            i = j;
        }
    }
    return fonts;
}
function loadAllFonts(fonts) {
    return __awaiter(this, void 0, void 0, function* () {
        const loadResults = yield Promise.all(fonts.map((font) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Loading font:', font);
                yield figma.loadFontAsync(font);
                return true;
            }
            catch (err) {
                console.error('Error loading font:', font, err);
                return false;
            }
        })));
        return loadResults.every(Boolean);
    });
}
function fontsEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a === figma.mixed || b === figma.mixed) {
        return false;
    }
    return a.family === b.family && a.style === b.style;
}
function createFontKey(font) {
    if (font === figma.mixed) {
        return 'mixed';
    }
    return `${font.family}::${font.style}`;
}
const getAllTextNodes = () => {
    return figma.root.findAll(n => n.type === "TEXT");
};
function getKeywordList(keywords) {
    return keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
}
function applyFormattingToKeywords(keywords, applyRange) {
    return __awaiter(this, void 0, void 0, function* () {
        const keywordList = getKeywordList(keywords);
        if (keywordList.length === 0) {
            return;
        }
        const textNodes = getAllTextNodes();
        for (const node of textNodes) {
            yield figma.loadFontAsync(node.fontName);
            const text = node.characters;
            keywordList.forEach((word) => {
                let index = text.indexOf(word);
                while (index !== -1) {
                    applyRange(node, index, index + word.length);
                    index = text.indexOf(word, index + word.length);
                }
            });
        }
    });
}
function processAllTextNodes(textNodes) {
    return __awaiter(this, void 0, void 0, function* () {
        let skippedCount = 0;
        for (const node of textNodes) {
            // Warn if the node has mixed fills
            if (node.fills === figma.mixed) {
                figma.notify('Warning: Some text nodes have mixed color styles. These may be lost after processing.');
            }
            try {
                yield handleTextCase(node);
            }
            catch (err) {
                skippedCount++;
                console.error('Error processing node:', node, err);
            }
        }
        if (skippedCount > 0) {
            figma.notify(`Skipped ${skippedCount} text node(s) due to processing errors.`);
        }
    });
}
function collectTextNodes(nodes) {
    const result = [];
    const visited = new Set();
    const traverse = (node) => {
        if (node.type === 'TEXT') {
            if (!visited.has(node.id)) {
                result.push(node);
                visited.add(node.id);
            }
        }
        if ('children' in node) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    };
    nodes.forEach(traverse);
    return result;
}
const dynamicCommandModes = {
    addprefix: 'prefix',
    addsuffix: 'suffix',
    addbetween: 'between',
};
function handleDynamicCommand(command) {
    const mode = dynamicCommandModes[command];
    figma.showUI(__html__, { width: 300, height: 160 });
    figma.ui.postMessage({ type: 'show-dynamic-box', mode });
}
const selection = figma.currentPage.selection;
const textNodes = collectTextNodes(selection);
// Skip selection requirement for some commands
const commandsNotRequiringSelection = ["myplan"];
if (textNodes.length === 0 && figma.command !== "myplan") {
    figma.notify("Please select at least one text layer. 😕");
    figma.closePlugin();
}
if (textNodes.length !== selection.length) {
    figma.currentPage.selection = textNodes;
}
// Check usage before executing commands
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (figma.command === "myplan") {
        showAccountUI()(0);
        return; // VALID because inside a function
    }
    const usageCheck = yield canUsePlugin();
    if (!usageCheck.allowed) {
        showAccountUI()(0);
        return;
    }
    // Show remaining count if free user (only when monetization is enabled)
    if (ENABLE_MONETIZATION && usageCheck.remaining !== undefined && usageCheck.remaining <= 3) {
        figma.notify(`⚠️ ${usageCheck.remaining} free commands remaining today`);
    }
    const isDynamicCommand = figma.command && figma.command in dynamicCommandModes;
    if (isDynamicCommand) {
        yield handleDynamicCommand(figma.command);
        // Dynamic commands wait for UI input and manage plugin closing themselves.
    }
    else {
        const allFonts = getAllUniqueFonts(textNodes);
        loadAllFonts(allFonts)
            .then(success => {
            if (!success) {
                figma.notify('Some fonts could not be loaded. Some nodes may be skipped.');
            }
            return processAllTextNodes(textNodes);
        })
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            // Increment usage after successful execution
            yield incrementUsage();
            figma.closePlugin();
        }));
    }
}))();
function handleTextFormatting(node) {
    // Show UI for text formatting options
    figma.showUI(__html__, { width: 400, height: 300 });
    figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
        switch (msg.type) {
            case 'apply-style':
                yield applyTextStyle(msg.keywords, msg.styleId);
                break;
            case 'apply-bold':
                yield applyBoldFormatting(msg.keywords);
                break;
            case 'apply-italic':
                yield applyItalicFormatting(msg.keywords);
                break;
            case 'apply-underline':
                yield applyUnderlineFormatting(msg.keywords);
                break;
            default:
                console.log('Unknown formatting type:', msg.type);
        }
    });
}
function applyTextStyle(keywords, styleId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyFormattingToKeywords(keywords, (node, start, end) => {
            node.setRangeTextStyleId(start, end, styleId);
        });
        figma.notify("✅ Text style applied!");
    });
}
function applyBoldFormatting(keywords) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyFormattingToKeywords(keywords, (node, start, end) => {
            node.setRangeTextStyleId(start, end, "bold-style-id");
        });
        figma.notify("✅ Bold formatting applied!");
    });
}
function applyItalicFormatting(keywords) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyFormattingToKeywords(keywords, (node, start, end) => {
            node.setRangeTextStyleId(start, end, "italic-style-id");
        });
        figma.notify("✅ Italic formatting applied!");
    });
}
function applyUnderlineFormatting(keywords) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyFormattingToKeywords(keywords, (node, start, end) => {
            node.setRangeTextStyleId(start, end, "underline-style-id");
        });
        figma.notify("✅ Underline formatting applied!");
    });
}
function handleTextCase(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const originalCharacters = node.characters;
        const originalFills = [];
        const hadUniformFill = node.fills !== figma.mixed;
        const uniformFill = hadUniformFill ? node.fills : null;
        const hadUniformFillStyle = node.fillStyleId !== figma.mixed;
        const uniformFillStyleId = hadUniformFillStyle ? node.fillStyleId : null;
        // Store the original fills for each character
        for (let i = 0; i < originalCharacters.length; i++) {
            originalFills.push(node.getRangeFills(i, i + 1));
        }
        let newText = originalCharacters;
        // Get the current text style ID dynamically from the selected text node
        const currentTextStyleId = node.textStyleId;
        /**
         * Clone the current text node into multiple layers, place them in an auto layout
         * frame, and keep the resulting layers selected for easy manipulation.
         */
        const splitTextIntoLayers = (segments, nameBuilder, emptyMessage, successMessage, containerName) => {
            const filteredSegments = segments
                .map(segment => segment.trim())
                .filter(segment => segment.length > 0);
            if (filteredSegments.length === 0) {
                figma.notify(emptyMessage);
                return;
            }
            const parent = node.parent;
            if (!parent || !('appendChild' in parent)) {
                figma.notify('Unable to split this text because it has no valid parent.');
                return;
            }
            const newLayers = [];
            filteredSegments.forEach((segmentText, index) => {
                const newLayer = node.clone();
                newLayer.characters = segmentText;
                const trimmedSegmentText = segmentText.trim();
                const MAX_NAME_LENGTH = 60;
                let layerName = trimmedSegmentText.length > 0
                    ? trimmedSegmentText
                    : nameBuilder(index, segmentText);
                if (layerName.length > MAX_NAME_LENGTH) {
                    layerName = `${layerName.slice(0, MAX_NAME_LENGTH - 1)}…`;
                }
                newLayer.name = layerName;
                newLayers.push(newLayer);
            });
            const autoLayoutFrame = figma.createFrame();
            autoLayoutFrame.name = containerName;
            autoLayoutFrame.layoutMode = 'VERTICAL';
            autoLayoutFrame.primaryAxisSizingMode = 'AUTO';
            autoLayoutFrame.counterAxisSizingMode = 'AUTO';
            autoLayoutFrame.itemSpacing = 8;
            autoLayoutFrame.paddingTop = 0;
            autoLayoutFrame.paddingBottom = 0;
            autoLayoutFrame.paddingLeft = 0;
            autoLayoutFrame.paddingRight = 0;
            autoLayoutFrame.fills = [];
            autoLayoutFrame.clipsContent = false;
            autoLayoutFrame.x = node.x;
            autoLayoutFrame.y = node.y;
            parent.appendChild(autoLayoutFrame);
            newLayers.forEach(layer => autoLayoutFrame.appendChild(layer));
            node.remove();
            figma.currentPage.selection = newLayers;
            figma.notify(successMessage(newLayers.length));
        };
        switch (figma.command) {
            case 'titlecase':
                const conjunctions = ['for', 'as', 'an', 'a', 'in', 'on', 'of', 'am', 'are', 'and', 'to', 'is', 'at', 'also', 'with', 'or'];
                // Step 1: Convert all text to lowercase
                newText = newText.toLowerCase();
                // Step 2: Apply Title Case transformation
                newText = newText.replace(/\b(\w+(['’]\w+)?|\w+)\b/g, (match, word) => {
                    if (conjunctions.includes(word)) {
                        // Keep conjunctions lowercase
                        return word;
                    }
                    else if (word.includes("'") || word.includes("’")) {
                        // Handle words with straight or curly apostrophes
                        const apostropheIndex = word.indexOf("'") !== -1 ? word.indexOf("'") : word.indexOf("’");
                        const beforeApostrophe = word.slice(0, apostropheIndex + 1); // Part before and including the apostrophe
                        const afterApostrophe = word.slice(apostropheIndex + 1); // Part after the apostrophe
                        // Capitalize the first letter of the word, and keep the rest lowercase
                        return beforeApostrophe.charAt(0).toUpperCase() + beforeApostrophe.slice(1) + afterApostrophe.toLowerCase();
                    }
                    else {
                        // Capitalize the first letter of standard words
                        return match.charAt(0).toUpperCase() + match.slice(1);
                    }
                });
                figma.notify('Tadaannn... 🥁 Case changed to TitleCase without hurting cojuctions. 💅');
                break;
            case 'sentencecase':
                const allUppercase = newText.split(' ').every(word => word.toUpperCase() === word);
                let titleCaseCount = 0;
                newText.split(' ').every(word => {
                    const firstLetter = word.charAt(0);
                    const restOfWord = word.slice(1);
                    if (firstLetter.toUpperCase() === firstLetter && restOfWord.toLowerCase() === restOfWord) {
                        titleCaseCount++;
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (allUppercase) {
                    newText = newText.toLowerCase().charAt(0).toUpperCase() + newText.slice(1).toLowerCase();
                }
                else if (titleCaseCount >= 2) {
                    newText = newText.toLowerCase().replace(/(^|[.!?]\s+)(\w+)/g, firstLetter => firstLetter.charAt(0).toUpperCase() + firstLetter.slice(1).toLocaleLowerCase());
                }
                else {
                    const sentenceRegex = /(^|[.!?]\s+)(\w+)/g;
                    newText = newText.replace(sentenceRegex, (match, boundary, word) => {
                        const isAcronym = word.length > 1 && word.toUpperCase() === word;
                        if (isAcronym) {
                            return boundary + word;
                        }
                        else {
                            return boundary + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                        }
                    });
                }
                figma.notify('Tadaannn... 🥁 Your Text case changed to Sentencecase.');
                break;
            case 'uppercase':
                newText = newText.toUpperCase();
                figma.notify('Tadaannn... 🥁 Your Text case changed to UPPERCASE. 🐘');
                break;
            case 'lowercase':
                newText = newText.toLowerCase();
                figma.notify('Tadaannn... 🥁 Your Text case changed to lowercase. 😚');
                break;
            case 'addbreakline':
                newText = newText.replace(/\. ?([a-z]|[A-Z])/g, '.\n$1');
                newText = newText.replace(/(^\w|\. ?\w)/gm, (match) => match.toUpperCase());
                figma.notify('Tadaannn... 🥁 Your Text now has line breaks after Fullstop.');
                break;
            case "copycta":
                yield cycleCopyText(node, CTA_TEXTS, 'ctaIndex');
                figma.notify('Tadaannn... 🥁 Button Text Added');
                return;
            case "copyhero":
                yield cycleCopyText(node, HERO_TEXTS, 'heroIndex');
                figma.notify('Tadaannn... 🥁 Hero Text Added');
                return;
            case "copyerror":
                yield cycleCopyText(node, ERROR_TEXTS, 'errorIndex');
                figma.notify('Tadaannn... 🥁 Error Text Added');
                return;
            case 'rmvspace':
                newText = newText.replace(/\s+/g, ' ');
                figma.notify('Tadaannn... 🥁 Your Text is now unwanted space free. 🤧');
                break;
            case "removesymbols":
                newText = originalCharacters.replace(/[^\p{L}\p{N}\s]/gu, " ");
                figma.notify("Removed punctuation & symbols ✔");
                break;
            case 'slug':
                newText = originalCharacters
                    .trim()
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                figma.notify('Tadaannn... 🥁 Converted to slug format.');
                break;
            case 'splitindividually': {
                const lines = originalCharacters.split(/\r\n|\r|\n/);
                if (lines.length <= 1) {
                    figma.notify('No line breaks found.');
                    return;
                }
                splitTextIntoLayers(lines, (index) => `${node.name} - Line ${index + 1}`, 'No text lines found to split.', (count) => `Tadaannn... 🥁 Split into ${count} individual text layers!`, `${node.name} - Split Lines`);
                return;
            }
            case 'splitwords': {
                const words = originalCharacters.split(/\s+/);
                splitTextIntoLayers(words, (index) => `${node.name} - Word ${index + 1}`, 'No words found to split.', (count) => `Tadaannn... 🥁 Split into ${count} word layers!`, `${node.name} - Split Words`);
                return;
            }
            case 'splitletters': {
                const letters = Array.from(originalCharacters);
                splitTextIntoLayers(letters.filter(letter => /\S/.test(letter)), (index, letter) => `${node.name} - Letter ${index + 1}: ${letter}`, 'No letters found to split.', (count) => `Tadaannn... 🥁 Split into ${count} letter layers!`, `${node.name} - Split Letters`);
                return;
            }
            default:
                console.error('Unknown command:', figma.command);
                return;
        }
        // Update the node with the modified text
        try {
            node.characters = newText;
        }
        catch (error) {
            console.error('Error updating text characters:', error);
            return; // Exit early if we can't update the text
        }
        // Reapply fill style if it was uniform
        if (hadUniformFillStyle && uniformFillStyleId) {
            try {
                // Use async API for dynamic pages
                await node.setFillStyleIdAsync(uniformFillStyleId);
            }
            catch (error) {
                console.error('Error applying fill style ID:', error);
            }
        }
        else if (hadUniformFill && uniformFill) {
            try {
                node.fills = uniformFill;
            }
            catch (error) {
                console.error('Error applying uniform fill:', error);
            }
        }
        else {
            // Reapply the original fills to the corresponding character ranges
            try {
                for (let i = 0; i < newText.length; i++) {
                    if (originalFills[i] !== null && originalFills[i] !== undefined) {
                        node.setRangeFills(i, i + 1, originalFills[i]);
                    }
                }
            }
            catch (error) {
                console.error('Error applying range fills:', error);
            }
        }
        // Apply the text style after the transformation is done
        if (currentTextStyleId && currentTextStyleId !== figma.mixed) {
            node.setTextStyleIdAsync(currentTextStyleId).catch(error => {
                console.error('Error applying text style:', error);
            });
        }
    });
}
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === "apply-dynamic") {
        yield applyDynamicFormat(msg.value, msg.mode);
        yield incrementUsage();
        figma.closePlugin("Done!");
        return;
    }
    if (msg.type === "activate-license") {
        const success = yield activateLicense(msg.licenseKey);
        console.log("activate license", success);
        if (success) {
            figma.notify("✅ License activated! Enjoy unlimited usage.");
            figma.ui.postMessage({ type: 'license-activated' });
            // Reload the plugin to apply license
            setTimeout(() => {
                figma.closePlugin();
            }, 1000);
        }
        else {
            figma.notify("❌ Invalid license key. Please check and try again.");
            figma.ui.postMessage({ type: 'license-error', message: 'Invalid license key' });
        }
        return;
    }
    if (msg.type === "check-usage") {
        const usageCheck = yield canUsePlugin();
        const usage = yield getUsageData();
        figma.ui.postMessage({
            type: 'usage-info',
            hasLicense: yield hasLicense(),
            remaining: usageCheck.remaining || 'unlimited',
            used: usage.count,
            limit: FREE_DAILY_LIMIT
        });
        return;
    }
});
function applyDynamicFormat(value, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodes = figma.currentPage.selection.filter(n => n.type === "TEXT");
        if (nodes.length === 0) {
            figma.notify("Please select at least one text layer");
            return;
        }
        for (const node of nodes) {
            yield figma.loadFontAsync(node.fontName);
            let text = node.characters;
            if (mode === "prefix") {
                text = value + text;
            }
            else if (mode === "suffix") {
                text = text + value;
            }
            else if (mode === "between") {
                const parts = text.split(/\s+/);
                text = parts.join(value);
            }
            node.characters = text;
        }
    });
}
const CTA_TEXTS = [
    "Get Started",
    "Learn More",
    "Know More",
    "Read More",
    "Buy Now",
    "Try Free Demo",
    "Explore Features",
    "Continue",
    "Subscribe",
    "Contact Us"
];
const HERO_TEXTS = [
    "Transform Your Ideas Into Reality",
    "Build Something Amazing",
    "Your Journey Starts Here",
    "Innovation Meets Excellence",
    "Empower Your Creativity",
    "Where Great Things Happen",
    "Unlock Your Potential",
    "Design. Create. Inspire.",
    "Make It Happen",
    "Start Building Today"
];
const ERROR_TEXTS = [
    "Something went wrong",
    "Oops! Something went wrong",
    "An error occurred",
    "We're sorry, something went wrong",
    "Unable to complete this action",
    "Please try again",
    "Error loading content",
    "Something unexpected happened",
    "We encountered an issue",
    "Please refresh and try again"
];
// ==================== MONETIZATION SYSTEM ====================
const FREE_DAILY_LIMIT = 10;
const LICENSE_PRICE = 5; // $5 lifetime
// Check if user has valid license
function hasLicense() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const savedKey = yield figma.clientStorage.getAsync("licenseKey");
        console.log(savedKey);
        if (!savedKey)
            return false;
        try {
            const response = yield fetch(VERIFY_LICENSE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: savedKey }),
            });
            const result = yield response.json();
            // If invalid server-side → user loses access
            if (!result.valid) {
                yield figma.clientStorage.deleteAsync("licenseKey");
                return false;
            }
            // Refresh unlimited flag if changed
            yield figma.clientStorage.setAsync("unlimited", (_a = result.unlimited) !== null && _a !== void 0 ? _a : false);
            return true;
        }
        catch (err) {
            console.error("License check error:", err);
            return false;
        }
    });
}
// Helper to pad number with leading zero
function padZero(num) {
    return num < 10 ? `0${num}` : `${num}`;
}
// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
}
// Get current usage data
function getUsageData() {
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
// Increment usage count
function incrementUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        const usage = yield getUsageData();
        usage.count++;
        yield figma.clientStorage.setAsync('usageData', usage);
    });
}
// Check if user can use the plugin (has license or under daily limit)
// Whitelist removed — use manual license rows in the database instead
function canUsePlugin() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ENABLE_MONETIZATION)
            return { allowed: true };
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
    });
}
function getDeviceId() {
    return __awaiter(this, void 0, void 0, function* () {
        const deviceId = yield figma.clientStorage.getAsync("deviceId");
        if (deviceId)
            return deviceId;
        const newId = crypto.randomUUID();
        yield figma.clientStorage.setAsync("deviceId", newId);
        return newId;
    });
}
// Show payment/license UI
function showAccountUI()(remaining) {
    figma.showUI(__html__, { width: 400, height: 500 });
    figma.ui.postMessage({
        type: 'show-license',
        remaining,
        price: LICENSE_PRICE
    });
}
// Activate license (called from UI after payment)
function activateLicense(licenseKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        console.log("activate license", licenseKey);
        const device_id = yield getDeviceId(); // REQUIRED
        try {
            const response = yield fetch(VERIFY_LICENSE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: licenseKey, device_id }), // FIXED
            });
            const result = yield response.json();
            if (result.valid) {
                yield figma.clientStorage.setAsync("licenseKey", licenseKey);
                yield figma.clientStorage.setAsync("unlimited", (_a = result.unlimited) !== null && _a !== void 0 ? _a : false);
                yield figma.clientStorage.setAsync("licenseEmail", (_b = result.email) !== null && _b !== void 0 ? _b : "");
                yield figma.clientStorage.setAsync("licensePlan", (_c = result.plan) !== null && _c !== void 0 ? _c : "");
                yield figma.clientStorage.setAsync("licenseVersion", (_d = result.version) !== null && _d !== void 0 ? _d : "");
                return true;
            }
            return false;
        }
        catch (err) {
            console.error("License activation error:", err);
            return false;
        }
    });
}
// Get stored index or default to 0
function getStoredIndex(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const stored = yield figma.clientStorage.getAsync(key);
        return stored !== undefined ? stored : 0;
    });
}
// Save index for next plugin run
function saveStoredIndex(key, index) {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.clientStorage.setAsync(key, index);
    });
}
function cycleCopyText(node, texts, storageKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const index = yield getStoredIndex(storageKey);
        const text = texts[index];
        yield figma.loadFontAsync(node.fontName);
        node.characters = text;
        // Move to next text and save for next run
        const nextIndex = (index + 1) % texts.length;
        yield saveStoredIndex(storageKey, nextIndex);
    });
}
