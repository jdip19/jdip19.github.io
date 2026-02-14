// ==================== USAGE ANALYTICS SYNC ====================
const USAGE_STATS_KEY = "usageStats";
const SYNC_THRESHOLD = 25;
/**
 * Get the current usage stats from storage with safe defaults
 */
export async function getUsageStats() {
    try {
        const stored = await figma.clientStorage.getAsync(USAGE_STATS_KEY);
        if (!stored) {
            return {
                usageCount: 0,
                syncedUsageCount: 0,
                lastFetchedTotal: 0,
            };
        }
        return stored;
    }
    catch (err) {
        console.error("Error getting usage stats:", err);
        return {
            usageCount: 0,
            syncedUsageCount: 0,
            lastFetchedTotal: 0,
        };
    }
}
/**
 * Save usage stats to storage safely
 */
export async function saveUsageStats(stats) {
    try {
        await figma.clientStorage.setAsync(USAGE_STATS_KEY, stats);
    }
    catch (err) {
        console.error("Error saving usage stats:", err);
    }
}
/**
 * Increment usage count by 1 (called after each successful command)
 * No API calls here - purely local
 */
export async function incrementUsage() {
    const stats = await getUsageStats();
    stats.usageCount++;
    await saveUsageStats(stats);
}
/**
 * Calculate delta between current and synced usage
 */
export function calculateDelta(stats) {
    return stats.usageCount - stats.syncedUsageCount;
}
/**
 * Check if sync is needed and perform it if delta >= threshold
 * This is the main entry point for syncing logic
 */
export async function maybeSyncUsage() {
    const stats = await getUsageStats();
    const delta = calculateDelta(stats);
    if (delta >= SYNC_THRESHOLD) {
        await syncUsage(delta, stats);
    }
}
/**
 * Perform the actual sync with backend
 * Calls Supabase Edge Function and updates local state
 */
export async function syncUsage(delta, stats) {
    try {
        console.log(`Syncing usage: delta=${delta}`);
        // Call the Supabase Edge Function
        const response = await fetch("https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/track-commands", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ delta }),
        });
        if (!response.ok) {
            throw new Error(`Backend sync failed: ${response.status}`);
        }
        const result = await response.json();
        const updatedTotal = result.total_commands;
        // Update stats after successful sync
        stats.syncedUsageCount = stats.usageCount;
        stats.lastFetchedTotal = updatedTotal;
        stats.lastSyncAt = new Date().toISOString();
        await saveUsageStats(stats);
        console.log(`Sync successful: usageCount=${stats.usageCount}, total=${updatedTotal}`);
    }
    catch (err) {
        console.error("Error syncing usage:", err);
        // Silently fail - will retry on next command
    }
}
/**
 * Get the display total to show in UI
 * Formula: displayTotal = lastFetchedTotal + (usageCount - syncedUsageCount)
 */
export async function getDisplayTotal() {
    const stats = await getUsageStats();
    const delta = calculateDelta(stats);
    return stats.lastFetchedTotal + delta;
}
/**
 * Reset stats (useful for testing or when user wants to reset)
 */
export async function resetUsageStats() {
    const defaultStats = {
        usageCount: 0,
        syncedUsageCount: 0,
        lastFetchedTotal: 0,
    };
    await saveUsageStats(defaultStats);
    console.log("Usage stats reset to defaults");
}
