// ==================== CONFIGURATION ====================
// Monetization settings
export const ENABLE_MONETIZATION = true;
export const FREE_DAILY_LIMIT = 10;
export const LICENSE_PRICE = 5; // $5 lifetime
// API endpoints
export const VERIFY_LICENSE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/verify-license";
export const SYNC_USAGE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/track-commands";
export const SUPABASE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co";
export const SUPABASE_ANON_KEY = "99721bbe20f7fedf28087bc968479e65a32a340cb5fc72121b06e94b9484354d"; // Replace with your actual key
// Sync settings
export const SYNC_DELTA_THRESHOLD = 4;
// Default values for prefix/between/suffix commands
export const DEFAULT_VALUES = {
    prefix: '#',
    between: '-',
    suffix: '.'
};
// Text constants
export const CTA_TEXTS = [
    "Get Started", "Learn More", "Know More", "Read More", "Buy Now",
    "Try Free Demo", "Explore Features", "Continue", "Subscribe", "Contact Us"
];
export const HERO_TEXTS = [
    "Transform Your Ideas Into Reality", "Build Something Amazing",
    "Your Journey Starts Here", "Innovation Meets Excellence",
    "Empower Your Creativity", "Where Great Things Happen",
    "Unlock Your Potential", "Design. Create. Inspire.",
    "Make It Happen", "Start Building Today"
];
export const ERROR_TEXTS = [
    "Something went wrong", "Oops! Something went wrong", "An error occurred",
    "We're sorry, something went wrong", "Unable to complete this action",
    "Please try again", "Error loading content", "Something unexpected happened",
    "We encountered an issue", "Please refresh and try again"
];
