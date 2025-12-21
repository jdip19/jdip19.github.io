// ==================== TEXT PROCESSING ====================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getKeywordList, loadAllFontsForNode } from './utils';
import { getStoredIndex, saveStoredIndex, getEffectiveDefault } from './storage';
import { CTA_TEXTS, HERO_TEXTS, ERROR_TEXTS } from './config';
/**
 * Apply formatting to keywords in text nodes
 */
export function applyFormattingToKeywords(keywords, applyRange) {
    return __awaiter(this, void 0, void 0, function* () {
        const keywordList = getKeywordList(keywords);
        if (keywordList.length === 0) {
            return;
        }
        const textNodes = getAllTextNodes();
        for (const node of textNodes) {
            try {
                yield figma.loadFontAsync(node.fontName);
            }
            catch (err) {
                console.warn('Could not load font for node:', err);
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
    });
}
/**
 * Process all text nodes with a transformation function
 */
export function processAllTextNodes(textNodes) {
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
/**
 * Get all text nodes from current page
 */
const getAllTextNodes = () => {
    return figma.root.findAll(n => n.type === "TEXT");
};
/**
 * Collect text nodes from selection
 */
export function collectTextNodes(nodes) {
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
/**
 * Apply a simple dynamic format (prefix/suffix/between) to current selection
 */
export function applyDynamicFormat(value, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodes = figma.currentPage.selection.filter(n => n.type === 'TEXT');
        if (nodes.length === 0) {
            figma.notify('Please select at least one text layer');
            return;
        }
        for (const node of nodes) {
            try {
                yield figma.loadFontAsync(node.fontName);
            }
            catch (err) {
                console.warn('Font load failed for node:', node, err);
            }
            let text = node.characters;
            if (mode === 'prefix') {
                text = value + text;
            }
            else if (mode === 'suffix') {
                text = text + value;
            }
            else if (mode === 'between') {
                const parts = text.split(/\s+/);
                text = parts.join(value);
            }
            try {
                node.characters = text;
            }
            catch (err) {
                console.error('Failed to apply dynamic format to node:', err);
            }
        }
    });
}
/**
 * Apply a quick command (addprefix/addsuffix/addbetween) using stored defaults
 */
export function applyQuickCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        const map = {
            addprefix: { mode: 'prefix' },
            addbetween: { mode: 'between' },
            addsuffix: { mode: 'suffix' }
        };
        const entry = map[command];
        if (!entry) {
            console.error('Unsupported quick command:', command);
            return;
        }
        const value = yield getEffectiveDefault(entry.mode);
        yield applyDynamicFormat(value, entry.mode);
    });
}
/**
 * Handle text case transformation
 */
function handleTextCase(node) {
    return __awaiter(this, void 0, void 0, function* () {
        // Load all fonts for this node before processing
        try {
            yield loadAllFontsForNode(node);
        }
        catch (fontError) {
            console.warn('Failed to load fonts for node:', fontError);
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
                node.fillStyleId = uniformFillStyleId;
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
                for (let i = 0; i < Math.min(newText.length, originalFills.length); i++) {
                    if (i < node.characters.length && originalFills[i] !== null && originalFills[i] !== undefined) {
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
/**
 * Cycle through copy text options
 */
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
