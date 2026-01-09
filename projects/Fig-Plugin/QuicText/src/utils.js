// ==================== UTILITY FUNCTIONS ====================
/**
 * Get all font ranges in a text node
 */
export async function loadAllFontsForNode(node) {
    const fontPromises = [];
    let failed = false;
    const charLength = Math.max(0, node.characters.length);
    for (let i = 0; i < charLength;) {
        try {
            const endIdx = Math.min(i + 1, charLength);
            if (endIdx <= i)
                break; // Safety check
            const font = node.getRangeFontName(i, endIdx);
            let j = i + 1;
            // Find the next range where the font changes
            while (j < charLength) {
                const nextEndIdx = Math.min(j + 1, charLength);
                const nextFont = node.getRangeFontName(j, nextEndIdx);
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
        catch (err) {
            console.error('Error in loadAllFontsForNode:', err);
            i++;
        }
    }
    await Promise.all(fontPromises);
    return !failed;
}
/**
 * Get all unique fonts from text nodes
 */
export function getAllUniqueFonts(textNodes) {
    const fontSet = new Set();
    const fonts = [];
    for (const node of textNodes) {
        try {
            const charLength = Math.max(0, node.characters.length);
            for (let i = 0; i < charLength;) {
                try {
                    const endIdx = Math.min(i + 1, charLength);
                    if (endIdx <= i)
                        break;
                    const font = node.getRangeFontName(i, endIdx);
                    let j = i + 1;
                    while (j < charLength) {
                        const nextEndIdx = Math.min(j + 1, charLength);
                        const nextFont = node.getRangeFontName(j, nextEndIdx);
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
                catch (err) {
                    console.warn('Error getting font range:', err);
                    i++;
                }
            }
        }
        catch (err) {
            console.warn('Error processing node in getAllUniqueFonts:', err);
        }
    }
    return fonts;
}
/**
 * Load all fonts
 */
export async function loadAllFonts(fonts) {
    const loadResults = await Promise.all(fonts.map(async (font) => {
        try {
            console.log('Loading font:', font);
            await figma.loadFontAsync(font);
            return true;
        }
        catch (err) {
            console.error('Error loading font:', font, err);
            return false;
        }
    }));
    return loadResults.every(Boolean);
}
/**
 * Check if fonts are equal
 */
export function fontsEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a === figma.mixed || b === figma.mixed) {
        return false;
    }
    return a.family === b.family && a.style === b.style;
}
/**
 * Create font key for comparison
 */
export function createFontKey(font) {
    if (font === figma.mixed) {
        return 'mixed';
    }
    return `${font.family}::${font.style}`;
}
/**
 * Get keyword list from string
 */
export function getKeywordList(keywords) {
    return keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
}
/**
 * Helper to pad number with leading zero
 */
export function padZero(num) {
    return num < 10 ? `0${num}` : `${num}`;
}
/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
}
/**
 * Generate UUID without crypto API
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export function formatDate(format, date = new Date()) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    const yy = yyyy.slice(-2);
    return format
        .replace(/dd/g, dd)
        .replace(/mm/g, mm)
        .replace(/yyyy/g, yyyy)
        .replace(/yy/g, yy);
}
