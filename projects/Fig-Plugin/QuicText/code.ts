// ==================== BUNDLED FIGMA PLUGIN ====================

// ==================== TYPES.TS ====================

// ==================== TYPE DEFINITIONS ====================

interface SupabaseResponse {
  valid?: boolean;
  unlimited?: boolean;
  email?: string;
  plan?: string;
  version?: string;
  error?: string;
}

interface PaymentConfig {
  checkoutUrl: string;
  amount: number;
  currency: string;
}

interface UsageData {
  count: number;
  date: string; // YYYY-MM-DD format
}

interface LicenseData {
  key: string;
  unlimited: boolean;
  email: string;
  plan: string;
  version: string;
  activatedAt: string;
}

type DynamicCommand = 'addprefix' | 'addsuffix' | 'addbetween';

type FontReference = FontName | typeof figma.mixed;

// ==================== CONFIG.TS ====================

// ==================== CONFIGURATION ====================

// Monetization settings
const ENABLE_MONETIZATION = true;
const FREE_DAILY_LIMIT = 10;
const LICENSE_PRICE = 9; // $5 lifetime

// API endpoints
const VERIFY_LICENSE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/verify-license";
const SUPABASE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co";
const SUPABASE_ANON_KEY = "99721bbe20f7fedf28087bc968479e65a32a340cb5fc72121b06e94b9484354d"; // Replace with your actual key

// Demo mode for testing
const DEMO_MODE = false; // Set to false to test real Supabase responses

// Dynamic command types
const DEFAULT_VALUES = {
  prefix: '#',
  between: '-',
  suffix: '.'
};

// Text constants
const CTA_TEXTS = [
  "Get Started", "Learn More", "Know More", "Read More", "Buy Now",
  "Try Free Demo", "Explore Features", "Continue", "Subscribe", "Contact Us"
];

const HERO_TEXTS = [
  "Transform Your Ideas Into Reality", "Build Something Amazing",
  "Your Journey Starts Here", "Innovation Meets Excellence",
  "Empower Your Creativity", "Where Great Things Happen",
  "Unlock Your Potential", "Design. Create. Inspire.",
  "Make It Happen", "Start Building Today"
];

const ERROR_TEXTS = [
  "Something went wrong", "Oops! Something went wrong", "An error occurred",
  "We're sorry, something went wrong", "Unable to complete this action",
  "Please try again", "Error loading content", "Something unexpected happened",
  "We encountered an issue", "Please refresh and try again"
];

// Dynamic command mappings
const dynamicCommandModes: Record<DynamicCommand, 'prefix' | 'suffix' | 'between'> = {
  addprefix: 'prefix',
  addsuffix: 'suffix',
  addbetween: 'between',
};

// ==================== UTILS.TS ====================

// ==================== UTILITY FUNCTIONS ====================



/**
 * Get all font ranges in a text node
 */
async function loadAllFontsForNode(node: TextNode): Promise<boolean> {
  const fontPromises: Promise<void>[] = [];
  let failed = false;
  const charLength = Math.max(0, node.characters.length);

  for (let i = 0; i < charLength;) {
    try {
      const endIdx = Math.min(i + 1, charLength);
      if (endIdx <= i) break; // Safety check

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
        fontPromises.push(
          figma.loadFontAsync(font).catch(err => {
            console.error('Error loading font:', font, err);
            failed = true;
          })
        );
      }
      i = j;
    } catch (err) {
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
function getAllUniqueFonts(textNodes: TextNode[]): FontName[] {
  const fontSet = new Set<string>();
  const fonts: FontName[] = [];
  for (const node of textNodes) {
    try {
      const charLength = Math.max(0, node.characters.length);
      for (let i = 0; i < charLength;) {
        try {
          const endIdx = Math.min(i + 1, charLength);
          if (endIdx <= i) break;

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
            fonts.push(font as FontName);
          }
          i = j;
        } catch (err) {
          console.warn('Error getting font range:', err);
          i++;
        }
      }
    } catch (err) {
      console.warn('Error processing node in getAllUniqueFonts:', err);
    }
  }
  return fonts;
}

/**
 * Load all fonts
 */
async function loadAllFonts(fonts: FontName[]): Promise<boolean> {
  const loadResults = await Promise.all(
    fonts.map(async (font) => {
      try {
        console.log('Loading font:', font);
        await figma.loadFontAsync(font);
        return true;
      } catch (err) {
        console.error('Error loading font:', font, err);
        return false;
      }
    })
  );
  return loadResults.every(Boolean);
}

/**
 * Check if fonts are equal
 */
function fontsEqual(a: FontReference, b: FontReference): boolean {
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
function createFontKey(font: FontReference): string {
  if (font === figma.mixed) {
    return 'mixed';
  }
  return `${font.family}::${font.style}`;
}

/**
 * Get keyword list from string
 */
function getKeywordList(keywords: string): string[] {
  return keywords
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k.length > 0);
}

/**
 * Helper to pad number with leading zero
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
}

/**
 * Generate UUID without crypto API
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==================== STORAGE.TS ====================

// ==================== STORAGE UTILITIES ====================




/**
 * Get current usage data
 */
async function getUsageData(): Promise<UsageData> {
  const stored = await figma.clientStorage.getAsync('usageData');
  const today = getTodayDate();

  if (!stored) {
    return { count: 0, date: today };
  }

  const usage = stored as UsageData;

  // Reset if it's a new day
  if (usage.date !== today) {
    return { count: 0, date: today };
  }

  return usage;
}

/**
 * Increment usage count
 */
async function incrementUsage(): Promise<void> {
  const usage = await getUsageData();
  usage.count++;
  await figma.clientStorage.setAsync('usageData', usage);
}

/**
 * Get device ID (creates one if it doesn't exist)
 */
async function getDeviceId(): Promise<string> {
  try {
    console.log("Getting device ID from storage...");
    const deviceId = await figma.clientStorage.getAsync("deviceId");
    console.log("Device ID from storage:", deviceId ? "exists" : "null");

    if (deviceId) {
      console.log("Returning existing device ID");
      return deviceId as string;
    }

    console.log("Generating new device ID...");
    const newId = generateUUID();
    console.log("Generated new ID:", newId.substring(0, 8) + "...");

    console.log("Saving new device ID to storage...");
    await figma.clientStorage.setAsync("deviceId", newId);
    console.log("Device ID saved successfully");

    return newId;
  } catch (err) {
    console.error("Error in getDeviceId:", err);
    // Return a fallback ID if storage fails
    const fallbackId = "fallback-" + Date.now();
    console.log("Using fallback device ID:", fallbackId);
    return fallbackId;
  }
}

/**
 * Get stored index for cycling text
 */
async function getStoredIndex(key: string): Promise<number> {
  const stored = await figma.clientStorage.getAsync(key);
  return stored !== undefined ? stored : 0;
}

/**
 * Save index for cycling text
 */
async function saveStoredIndex(key: string, index: number): Promise<void> {
  await figma.clientStorage.setAsync(key, index);
}

/**
 * Save license data to storage
 */
async function saveLicenseData(licenseData: LicenseData): Promise<void> {
  console.log("Saving consolidated license data...");
  await figma.clientStorage.setAsync("licenseData", licenseData);
  console.log("License data saved successfully");

  // Save individual keys sequentially for backward compatibility
  console.log("Saving individual license keys...");
  try {
    await figma.clientStorage.setAsync("licenseKey", licenseData.key);
    console.log("licenseKey saved");
  } catch (err) {
    console.warn("Failed to save licenseKey:", err);
  }

  try {
    await figma.clientStorage.setAsync("unlimited", licenseData.unlimited);
    console.log("unlimited flag saved");
  } catch (err) {
    console.warn("Failed to save unlimited:", err);
  }

  try {
    await figma.clientStorage.setAsync("licenseEmail", licenseData.email);
    console.log("licenseEmail saved");
  } catch (err) {
    console.warn("Failed to save email:", err);
  }

  try {
    await figma.clientStorage.setAsync("licensePlan", licenseData.plan);
    console.log("licensePlan saved");
  } catch (err) {
    console.warn("Failed to save plan:", err);
  }

  try {
    await figma.clientStorage.setAsync("licenseVersion", licenseData.version);
    console.log("licenseVersion saved");
  } catch (err) {
    console.warn("Failed to save version:", err);
  }

  console.log("All individual keys saved successfully");
}

async function getEffectiveDefault(
  key: 'prefix' | 'between' | 'suffix'
): Promise<string> {
  const storageKey = `default_${key}`;
  const stored = await getDefaultValue(storageKey);

  if (stored !== null && stored !== undefined && stored !== '') {
    return stored;
  }

  return DEFAULT_VALUES[key];
}


/**
 * Get a stored default value for dynamic commands (prefix/suffix/between)
 */
async function getDefaultValue(key: string): Promise<string | null> {
  try {
    const v = await figma.clientStorage.getAsync(key);
    return v !== undefined ? (v as string) : null;
  } catch (err) {
    console.warn('Error reading default value:', key, err);
    return null;
  }
}

/**
 * Save a default value for dynamic commands
 */
async function saveDefaultValue(key: string, value: string): Promise<void> {
  try {
    await figma.clientStorage.setAsync(key, value);
  } catch (err) {
    console.warn('Error saving default value:', key, err);
  }
}

/**
 * Read consolidated license data (if stored)
 */
async function getLicenseData(): Promise<LicenseData | null> {
  try {
    const stored = await figma.clientStorage.getAsync('licenseData');
    if (stored) return stored as LicenseData;

    // Fallback to older individual keys
    const key = await figma.clientStorage.getAsync('licenseKey');
    if (!key) return null;
    const unlimited = Boolean(await figma.clientStorage.getAsync('unlimited'));
    const email = (await figma.clientStorage.getAsync('licenseEmail')) || '';
    const plan = (await figma.clientStorage.getAsync('licensePlan')) || '';
    const version = (await figma.clientStorage.getAsync('licenseVersion')) || '';
    const activatedAt = (await figma.clientStorage.getAsync('licenseActivatedAt')) || '';

    return {
      key: key as string,
      unlimited,
      email: email as string,
      plan: plan as string,
      version: version as string,
      activatedAt: activatedAt as string
    } as LicenseData;
  } catch (err) {
    console.warn('Error reading license data:', err);
    return null;
  }
}

/**
 * Clear stored license information
 */
async function clearLicenseData(): Promise<void> {
  try {
    await figma.clientStorage.deleteAsync('licenseData');
    await figma.clientStorage.deleteAsync('licenseKey');
    await figma.clientStorage.deleteAsync('unlimited');
    await figma.clientStorage.deleteAsync('licenseEmail');
    await figma.clientStorage.deleteAsync('licensePlan');
    await figma.clientStorage.deleteAsync('licenseVersion');
    await figma.clientStorage.deleteAsync('licenseActivatedAt');
    console.log('Cleared license data from storage');
  } catch (err) {
    console.warn('Error clearing license data:', err);
  }
}

// ==================== LICENSE.TS ====================

// ==================== LICENSE MANAGEMENT ====================





/**
 * Check if user has valid license
 */
async function hasLicense(): Promise<boolean> {
  try {
    // First try the new consolidated storage format
    const licenseData = await figma.clientStorage.getAsync("licenseData");
    if (licenseData && typeof licenseData === 'object') {
      console.log("Found license data in consolidated format");
      return true;
    }

    // Fallback to individual keys
    const savedKey = await figma.clientStorage.getAsync("licenseKey");
    if (!savedKey) return false;

    if (typeof savedKey !== 'string' || savedKey.length === 0) {
      return false;
    }

    const result = await verifyLicenseKey(savedKey as string);

    if (result && result.valid) {
      // Cache valid license info
      await figma.clientStorage.setAsync("unlimited", result.unlimited ?? false).catch(() => {});
      return true;
    } else {
      // Invalid license - clear it
      await figma.clientStorage.deleteAsync("licenseKey").catch(() => {});
      return false;
    }
  } catch (err) {
    console.error("License check error:", err);
    return false;
  }
}

/**
 * Verify license key with Supabase
 */
async function verifyLicenseKey(licenseKey: string): Promise<SupabaseResponse | null> {
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
    } else {
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
    const deviceId = await getDeviceId();

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
    let response: Response;
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

      response = await fetch(VERIFY_LICENSE_URL, {
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
    } catch (fetchErr) {
      console.error("❌ Fetch error details:");
      const error = fetchErr as Error;
      console.error("  Error type:", error.constructor?.name || 'Unknown');
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
        errorText = await response.text();
        console.log("❌ Error response body:", errorText);
      } catch (textErr) {
        errorText = "Could not read response body";
        console.error("❌ Could not read error response:", textErr);
      }
      console.error(`❌ License verification failed with status: ${response.status}`);
      return { valid: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const contentType = response.headers?.get ? response.headers.get("content-type") : "unknown";
    console.log("📄 Content-Type:", contentType);

    // Be more lenient with content-type check - try to parse JSON regardless
    let data: any;
    try {
      console.log("🔄 Parsing JSON response...");
      data = await response.json();
      console.log("✅ JSON parsed successfully");
      console.log("📦 Full Supabase response:", JSON.stringify(data, null, 2));
    } catch (jsonErr) {
      console.error("❌ Error parsing JSON response:", jsonErr);
      // If JSON parsing fails, that's when we return the invalid format error
      let text = "";
      try {
        text = await response.text();
        console.log("📄 Raw response text:", text);
      } catch (textErr) {
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

    return data as SupabaseResponse;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        console.error("⏰ License verification timeout");
        return { valid: false, error: "Request timeout" };
      }
      console.error("❌ Error verifying license:", err.message);
      return { valid: false, error: err.message };
    } else {
      console.error("❌ Error verifying license:", err);
    }
    return { valid: false, error: String(err) };
  }
}

/**
 * Check if user can use the plugin (has license or under daily limit)
 */
async function canUsePlugin(): Promise<{ allowed: boolean; remaining?: number }> {
  if (!ENABLE_MONETIZATION) return { allowed: true };

  try {
    // Check for consolidated license data first
    const licenseData = await figma.clientStorage.getAsync("licenseData");
    if (licenseData && typeof licenseData === 'object' && licenseData.unlimited) {
      return { allowed: true };
    }

    // Fallback to individual unlimited flag
    const unlimited = Boolean(await figma.clientStorage.getAsync("unlimited"));
    if (unlimited) return { allowed: true };

    const licensed = await hasLicense();
    if (licensed) return { allowed: true };

    const usage = await getUsageData();
    const remaining = FREE_DAILY_LIMIT - usage.count;

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining)
    };
  } catch (err) {
    console.error("Error in canUsePlugin:", err);
    // On error, allow usage to prevent blocking users
    return { allowed: true };
  }
}

/**
 * Activate license (called from UI after payment)
 */
async function activateLicense(licenseKey: string): Promise<boolean> {
  if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.trim().length === 0) {
    console.error("Invalid license key format");
    return false;
  }

  try {
    console.log("Attempting to activate license:", licenseKey.substring(0, 8) + "...");

    console.log("Getting device ID...");
    const device_id = await getDeviceId();
    console.log("Device ID obtained:", device_id ? "yes" : "no");

    if (!device_id) {
      console.error("Failed to get device ID");
      return false;
    }

    console.log("Verifying license key...");
    const result = await verifyLicenseKey(licenseKey.trim());
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
          unlimited: result.unlimited ?? false,
          email: result.email ?? "",
          plan: result.plan ?? "",
          version: result.version ?? "",
          activatedAt: new Date().toISOString()
        };

        console.log("Saving consolidated license data...");
        await figma.clientStorage.setAsync("licenseData", licenseData);
        console.log("License data saved successfully");

        // Save individual keys sequentially for backward compatibility
        console.log("Saving individual license keys...");
        try {
          await figma.clientStorage.setAsync("licenseKey", licenseKey.trim());
          console.log("licenseKey saved");
        } catch (err) {
          console.warn("Failed to save licenseKey:", err);
        }

        try {
          await figma.clientStorage.setAsync("unlimited", result.unlimited ?? false);
          console.log("unlimited flag saved");
        } catch (err) {
          console.warn("Failed to save unlimited:", err);
        }

        try {
          await figma.clientStorage.setAsync("licenseEmail", result.email ?? "");
          console.log("licenseEmail saved");
        } catch (err) {
          console.warn("Failed to save email:", err);
        }

        try {
          await figma.clientStorage.setAsync("licensePlan", result.plan ?? "");
          console.log("licensePlan saved");
        } catch (err) {
          console.warn("Failed to save plan:", err);
        }

        try {
          await figma.clientStorage.setAsync("licenseVersion", result.version ?? "");
          console.log("licenseVersion saved");
        } catch (err) {
          console.warn("Failed to save version:", err);
        }

        console.log("All individual keys saved successfully");

        console.log("License activated successfully");
        return true;
      } catch (storageErr) {
        console.error("Error saving license to storage:", storageErr);
        // Even if storage fails, consider the license valid for this session
        console.log("License valid for this session despite storage error");
        return true;
      }
    } else {
      console.warn("License verification returned invalid:", result?.error || "Unknown error");
      return false;
    }
  } catch (err) {
    console.error("License activation error:", err);
    return false;
  }
}


// ==================== TEXT-PROCESSING.TS ====================

// ==================== TEXT PROCESSING ====================





/**
 * Apply formatting to keywords in text nodes
 */
async function applyFormattingToKeywords(
  keywords: string,
  applyRange: (node: TextNode, start: number, end: number) => void
): Promise<void> {
  const keywordList = getKeywordList(keywords);
  if (keywordList.length === 0) {
    return;
  }
  const textNodes = getAllTextNodes();
  for (const node of textNodes) {
    try {
      await figma.loadFontAsync(node.fontName as FontName);
    } catch (err) {
      console.warn('Could not load font for node:', err);
    }
    const text = node.characters;
    keywordList.forEach((word: string) => {
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
          } catch (err) {
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
async function processAllTextNodes(textNodes: TextNode[]) {
  let skippedCount = 0;
  for (const node of textNodes) {
    // Warn if the node has mixed fills
    if (node.fills === figma.mixed) {
      figma.notify('Warning: Some text nodes have mixed color styles. These may be lost after processing.');
    }
    try {
      await handleTextCase(node);
    } catch (err) {
      skippedCount++;
      console.error('Error processing node:', node, err);
    }
  }
  if (skippedCount > 0) {
    figma.notify(`Skipped ${skippedCount} text node(s) due to processing errors.`);
  }
}

/**
 * Get all text nodes from current page
 */
const getAllTextNodes = (): TextNode[] => {
  return figma.root.findAll(n => n.type === "TEXT") as TextNode[];
};

/**
 * Collect text nodes from selection
 */
function collectTextNodes(nodes: readonly SceneNode[]): TextNode[] {
  const result: TextNode[] = [];
  const visited = new Set<string>();

  const traverse = (node: SceneNode) => {
    if (node.type === 'TEXT') {
      if (!visited.has(node.id)) {
        result.push(node as TextNode);
        visited.add(node.id);
      }
    }

    if ('children' in node) {
      for (const child of node.children as readonly SceneNode[]) {
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
async function applyDynamicFormat(value: string, mode: 'prefix' | 'suffix' | 'between') {
  const nodes = figma.currentPage.selection.filter(n => n.type === 'TEXT') as TextNode[];
  if (nodes.length === 0) {
    figma.notify('Please select at least one text layer');
    return;
  }

  for (const node of nodes) {
    try {
      await figma.loadFontAsync(node.fontName as FontName);
    } catch (err) {
      console.warn('Font load failed for node:', node, err);
    }

    let text = node.characters;
    if (mode === 'prefix') {
      text = value + text;
    } else if (mode === 'suffix') {
      text = text + value;
    } else if (mode === 'between') {
      const parts = text.split(/\s+/);
      text = parts.join(value);
    }

    try {
      node.characters = text;
    } catch (err) {
      console.error('Failed to apply dynamic format to node:', err);
    }
  }
}

/**
 * Apply a quick command (addprefix/addsuffix/addbetween) using stored defaults
 */
async function applyQuickCommand(command: string) {
  const map: Record<string, { mode: 'prefix' | 'between' | 'suffix' }> = {
    addprefix: { mode: 'prefix' },
    addbetween: { mode: 'between' },
    addsuffix: { mode: 'suffix' }
  };

  const entry = map[command];
  if (!entry) {
    console.error('Unsupported quick command:', command);
    return;
  }

  const value = await getEffectiveDefault(entry.mode);

  await applyDynamicFormat(value, entry.mode);
}




/**
 * Handle text case transformation
 */
async function handleTextCase(node: TextNode): Promise<void> {
  // Load all fonts for this node before processing
  try {
    await loadAllFontsForNode(node);
  } catch (fontError) {
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
  const splitTextIntoLayers = (
    segments: string[],
    nameBuilder: (index: number, text: string) => string,
    emptyMessage: string,
    successMessage: (count: number) => string,
    containerName: string
  ): void => {
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

    const newLayers: TextNode[] = [];

    filteredSegments.forEach((segmentText, index) => {
      const newLayer = node.clone();
      newLayer.characters = segmentText;
      const trimmedSegmentText = segmentText.trim();
      const MAX_NAME_LENGTH = 60;
      let layerName =
        trimmedSegmentText.length > 0
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
        } else if (word.includes("'") || word.includes("’")) {
          // Handle words with straight or curly apostrophes
          const apostropheIndex = word.indexOf("'") !== -1 ? word.indexOf("'") : word.indexOf("’");
          const beforeApostrophe = word.slice(0, apostropheIndex + 1); // Part before and including the apostrophe
          const afterApostrophe = word.slice(apostropheIndex + 1); // Part after the apostrophe

          // Capitalize the first letter of the word, and keep the rest lowercase
          return beforeApostrophe.charAt(0).toUpperCase() + beforeApostrophe.slice(1) + afterApostrophe.toLowerCase();
        } else {
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
        } else {
          return false;
        }
      });

      if (allUppercase) {
        newText = newText.toLowerCase().charAt(0).toUpperCase() + newText.slice(1).toLowerCase();
      } else if (titleCaseCount >= 2) {
        newText = newText.toLowerCase().replace(/(^|[.!?]\s+)(\w+)/g, firstLetter => firstLetter.charAt(0).toUpperCase() + firstLetter.slice(1).toLocaleLowerCase());
      } else {
        const sentenceRegex = /(^|[.!?]\s+)(\w+)/g;
        newText = newText.replace(sentenceRegex, (match, boundary, word) => {
          const isAcronym = word.length > 1 && word.toUpperCase() === word;
          if (isAcronym) {
            return boundary + word;
          } else {
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
      await cycleCopyText(node, CTA_TEXTS, 'ctaIndex');
      figma.notify('Tadaannn... 🥁 Button Text Added');
      return;

    case "copyhero":
      await cycleCopyText(node, HERO_TEXTS, 'heroIndex');
      figma.notify('Tadaannn... 🥁 Hero Text Added');
      return;

    case "copyerror":
      await cycleCopyText(node, ERROR_TEXTS, 'errorIndex');
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

      splitTextIntoLayers(
        lines,
        (index) => `${node.name} - Line ${index + 1}`,
        'No text lines found to split.',
        (count) => `Tadaannn... 🥁 Split into ${count} individual text layers!`,
        `${node.name} - Split Lines`
      );
      return;
    }

    case 'splitwords': {
      const words = originalCharacters.split(/\s+/);
      splitTextIntoLayers(
        words,
        (index) => `${node.name} - Word ${index + 1}`,
        'No words found to split.',
        (count) => `Tadaannn... 🥁 Split into ${count} word layers!`,
        `${node.name} - Split Words`
      );
      return;
    }

    case 'splitletters': {
      const letters = Array.from(originalCharacters);
      splitTextIntoLayers(
        letters.filter(letter => /\S/.test(letter)),
        (index, letter) => `${node.name} - Letter ${index + 1}: ${letter}`,
        'No letters found to split.',
        (count) => `Tadaannn... 🥁 Split into ${count} letter layers!`,
        `${node.name} - Split Letters`
      );
      return;
    }

    default:
      console.error('Unknown command:', figma.command);
      return;
  }

  // Update the node with the modified text
  try {
    node.characters = newText;
  } catch (error) {
    console.error('Error updating text characters:', error);
    return; // Exit early if we can't update the text
  }

  // Reapply fill style if it was uniform
  if (hadUniformFillStyle && uniformFillStyleId) {
    try {
      node.fillStyleId = uniformFillStyleId;
    } catch (error) {
      console.error('Error applying fill style ID:', error);
    }
  } else if (hadUniformFill && uniformFill) {
    try {
      node.fills = uniformFill;
    } catch (error) {
      console.error('Error applying uniform fill:', error);
    }
  } else {
    // Reapply the original fills to the corresponding character ranges
    try {
      for (let i = 0; i < Math.min(newText.length, originalFills.length); i++) {
        if (i < node.characters.length && originalFills[i] !== null && originalFills[i] !== undefined) {
          try {
            node.setRangeFills(i, Math.min(i + 1, node.characters.length), originalFills[i] as Paint[]);
          } catch (rangeError) {
            console.warn(`Could not apply fill at index ${i}:`, rangeError);
          }
        }
      }
    } catch (error) {
      console.error('Error applying range fills:', error);
    }
  }

  // Apply the text style after the transformation is done
  if (currentTextStyleId && currentTextStyleId !== figma.mixed) {
    node.setTextStyleIdAsync(currentTextStyleId as string).catch(error => {
      console.error('Error applying text style:', error);
    });
  }
}

/**
 * Cycle through copy text options
 */
async function cycleCopyText(node: TextNode, texts: string[], storageKey: string): Promise<void> {
  const index = await getStoredIndex(storageKey);
  const text = texts[index];

  await figma.loadFontAsync(node.fontName as FontName);
  node.characters = text;

  // Move to next text and save for next run
  const nextIndex = (index + 1) % texts.length;
  await saveStoredIndex(storageKey, nextIndex);
}



// ==================== MAIN.TS ====================

// ==================== MAIN PLUGIN FILE ====================






// Main plugin logic
async function main() {
  try {
    // 1️⃣ Get Pro always opens license UI
    if (figma.command === "myplan") {
      await showAccountUI();
      return;
    }

    // Quick dynamic commands (prefix/suffix/between) — handled centrally
    const dynamicCommands = ['addprefix', 'addsuffix', 'addbetween'];
    if (dynamicCommands.includes(figma.command || '')) {
      await applyQuickCommand(figma.command as string);
      figma.notify('Applied successfully!');
      figma.closePlugin();
      return;
    }

    // 2️⃣ Other commands → check license
    if (ENABLE_MONETIZATION) {
      const licensed = await hasLicense();
      if (!licensed) {
        await showAccountUI();
        return;
      }
    }

    // 3️⃣ Run command
    await processTextCommand();
    figma.closePlugin();

  } catch (error) {
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

  // Track usage
  if (ENABLE_MONETIZATION) {
    await incrementUsage();
  }

  await processAllTextNodes(textNodes);
}

// Handle UI messages
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'save-defaults':
        // msg.defaults = { prefix, between, suffix }
        if (msg.defaults) {
          if (msg.defaults.prefix !== undefined) await saveDefaultValue('default_prefix', msg.defaults.prefix || '');
          if (msg.defaults.between !== undefined) await saveDefaultValue('default_between', msg.defaults.between || '');
          if (msg.defaults.suffix !== undefined) await saveDefaultValue('default_suffix', msg.defaults.suffix || '');
        }
        figma.ui.postMessage({ type: 'defaults-saved', success: true });
        break;

      case 'request-defaults':
        {
          const prefix = await getDefaultValue('default_prefix');
          const between = await getDefaultValue('default_between');
          const suffix = await getDefaultValue('default_suffix')
          figma.ui.postMessage({ type: 'current-defaults', defaults: { prefix, between, suffix } });
        }
        break;
      case 'verify-license':
        const result = await verifyLicenseKey(msg.licenseKey);
        figma.ui.postMessage({
          type: 'license-verified',
          success: result?.valid || false,
          message: result?.error || (result?.valid ? 'License is valid' : 'License verification failed')
        });
        if (result?.valid) {
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
  } catch (error) {
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
    width: 500,
    height: isPro ? 420 : 520
  });

  figma.ui.postMessage({
    type: 'show-license',
    isPro,
    licenseData: licenseData ?? null,
    remaining,
    used,
    limit,
    price: LICENSE_PRICE,
    deviceId
  });
}

// Run the plugin
main();

