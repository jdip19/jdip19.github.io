"use strict";
// ==================== TEXT PROCESSING ====================
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFormattingToKeywords = applyFormattingToKeywords;
exports.processAllTextNodes = processAllTextNodes;
exports.collectTextNodes = collectTextNodes;
const utils_1 = require("./utils");
const storage_1 = require("./storage");
const config_1 = require("./config");
/**
 * Apply formatting to keywords in text nodes
 */
async function applyFormattingToKeywords(keywords, applyRange) {
    const keywordList = (0, utils_1.getKeywordList)(keywords);
    if (keywordList.length === 0) {
        return;
    }
    const textNodes = getAllTextNodes();
    for (const node of textNodes) {
        try {
            await figma.loadFontAsync(node.fontName);
        }
        catch (err) {
            console.warn("Could not load font for node:", err);
        }
        const text = node.characters;
        keywordList.forEach((word) => {
            if (word.length === 0 || word.length > text.length) {
                return; // Skip if word is empty or longer than text
            }
            let index = text.indexOf(word);
            while (index !== -1 && index >= 0) {
                const endIndex = index + word.length;
                // Ensure indices are valid before applying
                if (index >= 0 && endIndex <= text.length) {
                    try {
                        applyRange(node, index, endIndex);
                    }
                    catch (err) {
                        console.warn(`Could not apply formatting at range ${index}-${endIndex}:`, err);
                    }
                }
                index = text.indexOf(word, index + word.length);
            }
        });
    }
}
/**
 * Process all text nodes with a transformation function
 */
async function processAllTextNodes(textNodes) {
    let skippedCount = 0;
    let anyChanged = false;
    for (const node of textNodes) {
        // Warn if the node has mixed fills
        if (node.fills === figma.mixed) {
            figma.notify("Warning: Some text nodes have mixed color styles. These may be lost after processing.");
        }
        try {
            const changed = await handleTextCase(node);
            if (changed)
                anyChanged = true;
        }
        catch (err) {
            skippedCount++;
            console.error("Error processing node:", node, err);
        }
    }
    if (skippedCount > 0) {
        figma.notify(`Skipped ${skippedCount} text node(s) due to processing errors.`);
    }
    return anyChanged;
}
/**
 * Get all text nodes from current page
 */
const getAllTextNodes = () => {
    return figma.root.findAll((n) => n.type === "TEXT");
};
/**
 * Collect text nodes from selection
 */
function collectTextNodes(nodes) {
    const result = [];
    const visited = new Set();
    const traverse = (node) => {
        if (node.type === "TEXT") {
            if (!visited.has(node.id)) {
                result.push(node);
                visited.add(node.id);
            }
        }
        if ("children" in node) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    };
    nodes.forEach(traverse);
    return result;
}
function cleanBaseText(text) {
    return text
        .replace(/\s+/g, " ")
        .trim();
}
/**
 * Handle text case transformation
 */
async function handleTextCase(node) {
    // Load all fonts for this node before processing
    try {
        await (0, utils_1.loadAllFontsForNode)(node);
    }
    catch (fontError) {
        console.warn("Failed to load fonts for node:", fontError);
        // Continue processing even if font loading fails
    }
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
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0);
        if (filteredSegments.length === 0) {
            figma.notify(emptyMessage);
            return;
        }
        const parent = node.parent;
        if (!parent || !("appendChild" in parent)) {
            figma.notify("Unable to split this text because it has no valid parent.");
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
        autoLayoutFrame.layoutMode = "VERTICAL";
        autoLayoutFrame.primaryAxisSizingMode = "AUTO";
        autoLayoutFrame.counterAxisSizingMode = "AUTO";
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
        newLayers.forEach((layer) => autoLayoutFrame.appendChild(layer));
        node.remove();
        figma.currentPage.selection = newLayers;
        figma.notify(successMessage(newLayers.length));
    };
    switch (figma.command) {
        case "titlecase":
            const conjunctions = [
                "for", "as", "an", "a", "in", "on", "of", "am", "are", "and", "to", "is", "at", "also", "with", "or",
            ];
            // Step 0: Trim and remove extra spaces
            newText = cleanBaseText(newText);
            // Step 1: Convert all text to lowercase
            newText = newText.toLowerCase();
            // Step 2: Apply Title Case transformation
            newText = newText.replace(/\b(\w+(['’]\w+)?|\w+)\b/g, (match, word) => {
                if (conjunctions.includes(word)) {
                    return word;
                }
                else if (word.includes("'") || word.includes("’")) {
                    const apostropheIndex = word.indexOf("'") !== -1 ? word.indexOf("'") : word.indexOf("’");
                    const beforeApostrophe = word.slice(0, apostropheIndex + 1);
                    const afterApostrophe = word.slice(apostropheIndex + 1);
                    return (beforeApostrophe.charAt(0).toUpperCase() +
                        beforeApostrophe.slice(1) +
                        afterApostrophe.toLowerCase());
                }
                else {
                    return match.charAt(0).toUpperCase() + match.slice(1);
                }
            });
            figma.notify("Tadaannn... 🥁 Case changed to TitleCase without hurting cojuctions. 💅");
            break;
        case "sentencecase":
            const sentenceRegex = /(^|[.!?]\s+)(\w+)/g;
            newText = newText
                .toLowerCase()
                .replace(sentenceRegex, (match, boundary, word) => {
                const isAcronym = word.length > 1 && word.toUpperCase() === word;
                return (boundary +
                    (isAcronym ? word : word.charAt(0).toUpperCase() + word.slice(1)));
            });
            figma.notify("Tadaannn... 🥁 Your Text case changed to Sentencecase.");
            break;
        case "uppercase":
            newText = newText.toUpperCase();
            figma.notify("Tadaannn... 🥁 Your Text case changed to UPPERCASE. 🐘");
            break;
        case "lowercase":
            newText = newText.toLowerCase();
            figma.notify("Tadaannn... 🥁 Your Text case changed to lowercase. 😚");
            break;
        case "addbreakline":
            newText = newText.replace(/\. ?([a-z]|[A-Z])/g, ".\n$1");
            newText = newText.replace(/(^\w|\. ?\w)/gm, (match) => match.toUpperCase());
            figma.notify("Tadaannn... 🥁 Your Text now has line breaks after Fullstop.");
            break;
        case "addcdate": {
            const format = await (0, storage_1.getDateFormat)();
            const dateText = (0, utils_1.formatDate)(format);
            newText = dateText;
            figma.notify(`📅 Date added (${format})`);
            break;
        }
        case "addctime": {
            const format = await (0, storage_1.getTimeFormat)();
            const timeText = (0, utils_1.formatTime)(format);
            newText = timeText;
            figma.notify(`⏰ Time added (${format})`);
            break;
        }
        case "addctimestamp": {
            const dateFormat = await (0, storage_1.getDateFormat)();
            const timeFormat = await (0, storage_1.getTimeFormat)();
            const timestampText = `${(0, utils_1.formatDate)(dateFormat)} • ${(0, utils_1.formatTime)(timeFormat)}`;
            newText = timestampText;
            figma.notify(`⏰ Timestamp added (${dateFormat} ${timeFormat})`);
            break;
        }
        case "copylorem":
            await cycleCopyText(node, config_1.LOREM_TEXT, "emailIndex");
            figma.notify("Tadaannn... 🥁 Lorem Ipsum Text Added");
            return true;
        case "copyemail":
            await cycleCopyText(node, config_1.EMAIL_TEXTS, "emailIndex");
            figma.notify("Tadaannn... 🥁 Email Text Added");
            return true;
        case "copynumber":
            await cycleCopyText(node, config_1.MOBILE_NUMBER_TEXT, "numberIndex");
            figma.notify("Tadaannn... 🥁 Mobile Number Text Added");
            return true;
        case "copycta":
            await cycleCopyText(node, config_1.CTA_TEXTS, "ctaIndex");
            figma.notify("Tadaannn... 🥁 Button Text Added");
            return true;
        case "copyhero":
            await cycleCopyText(node, config_1.HERO_TEXTS, "heroIndex");
            figma.notify("Tadaannn... 🥁 Hero Text Added");
            return true;
        case "copyerror":
            await cycleCopyText(node, config_1.ERROR_TEXTS, "errorIndex");
            figma.notify("Tadaannn... 🥁 Error Text Added");
            return true;
        case "rmvspace":
            newText = newText
                .split("\n")
                .map((line) => line.trim().replace(/\s+/g, " "))
                .join("\n");
            figma.notify("Tadaannn... 🥁 Your Text is now unwanted space free. 💅");
            break;
        case "rmvbreakline":
            newText = newText.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
            figma.notify("Tadaannn... 🥁 Your Text is now breaklines free. 💅");
            break;
        case "removesymbols":
            newText = cleanBaseText(originalCharacters.replace(/[^\p{L}\p{N}\s]/gu, ""));
            figma.notify("Removed punctuation & symbols from your text! 💅");
            break;
        case "removeemoji":
            newText = originalCharacters
                .replace(/\r\n|\r|\u2028|\u2029/g, "\n")
                // ✅ better emoji removal (covers ⏱ and others)
                .replace(/\p{Extended_Pictographic}/gu, "")
                .split("\n")
                .map((line) => (line === "" ? "" : line.replace(/[^\S]+/g, " ").trim()))
                .join("\n");
            figma.notify("Tadaannn... 🥁 All emojis removed! 💅");
            break;
        case "slug":
            newText = originalCharacters
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
            figma.notify("Tadaannn... 🥁 Converted to slug format.");
            break;
        case "splitindividually": {
            const lines = originalCharacters.split(/\r\n|\r|\n/);
            if (lines.length <= 1) {
                figma.notify("No line breaks found.");
                return false;
            }
            splitTextIntoLayers(lines, (index) => `${node.name} - Line ${index + 1}`, "No text lines found to split.", (count) => `Tadaannn... 🥁 Split into ${count} individual text layers!`, `${node.name} - Split Lines`);
            return true;
        }
        case "splitwords": {
            const words = originalCharacters.split(/\s+/);
            splitTextIntoLayers(words, (index) => `${node.name} - Word ${index + 1}`, "No words found to split.", (count) => `Tadaannn... 🥁 Split into ${count} word layers!`, `${node.name} - Split Words`);
            return true;
        }
        case "splitletters": {
            const letters = Array.from(originalCharacters);
            splitTextIntoLayers(letters.filter((letter) => /\S/.test(letter)), (index, letter) => `${node.name} - Letter ${index + 1}: ${letter}`, "No letters found to split.", (count) => `Tadaannn... 🥁 Split into ${count} letter layers!`, `${node.name} - Split Letters`);
            return true;
        }
        case "addprefix": {
            // Simplified: use stored default and treat like other commands
            const value = await (0, storage_1.getEffectiveDefault)("prefix");
            newText = value + originalCharacters;
            figma.notify("Tadaannn... 🥁 Prefix added");
            break;
        }
        case "addbetween": {
            const value = await (0, storage_1.getEffectiveDefault)("between");
            const parts = originalCharacters.split(/\s+/);
            newText = parts.join(value);
            figma.notify("Tadaannn... 🥁 In-between added");
            break;
        }
        case "addsuffix": {
            const value = await (0, storage_1.getEffectiveDefault)("suffix");
            newText = originalCharacters + value;
            figma.notify("Tadaannn... 🥁 Suffix added");
            break;
        }
        default:
            console.error("Unknown command:", figma.command);
            return false;
    }
    // If no change, skip updating and return false
    const didChange = newText !== originalCharacters;
    if (!didChange)
        return false;
    // Update the node with the modified text
    try {
        node.characters = newText;
    }
    catch (error) {
        console.error("Error updating text characters:", error);
        return false; // Exit early if we can't update the text
    }
    // Reapply fill style if it was uniform
    if (hadUniformFillStyle && uniformFillStyleId) {
        try {
            // Use async API for setting style to be compatible with dynamic-page document access
            await node.setFillStyleIdAsync(uniformFillStyleId);
        }
        catch (error) {
            console.error("Error applying fill style ID:", error);
        }
    }
    else if (hadUniformFill && uniformFill) {
        try {
            node.fills = uniformFill;
        }
        catch (error) {
            console.error("Error applying uniform fill:", error);
        }
    }
    else {
        // Reapply the original fills to the corresponding character ranges
        try {
            for (let i = 0; i < Math.min(newText.length, originalFills.length); i++) {
                if (i < node.characters.length &&
                    originalFills[i] !== null &&
                    originalFills[i] !== undefined) {
                    try {
                        node.setRangeFills(i, Math.min(i + 1, node.characters.length), originalFills[i]);
                    }
                    catch (rangeError) {
                        console.warn(`Could not apply fill at index ${i}:`, rangeError);
                    }
                }
            }
        }
        catch (error) {
            console.error("Error applying range fills:", error);
        }
    }
    // Apply the text style after the transformation is done
    if (currentTextStyleId && currentTextStyleId !== figma.mixed) {
        node.setTextStyleIdAsync(currentTextStyleId).catch((error) => {
            console.error("Error applying text style:", error);
        });
    }
    return true;
}
/**
 * Cycle through copy text options
 */
async function cycleCopyText(node, texts, storageKey) {
    const index = await (0, storage_1.getStoredIndex)(storageKey);
    const text = texts[index];
    await figma.loadFontAsync(node.fontName);
    node.characters = text;
    // Move to next text and save for next run
    const nextIndex = (index + 1) % texts.length;
    await (0, storage_1.saveStoredIndex)(storageKey, nextIndex);
}
