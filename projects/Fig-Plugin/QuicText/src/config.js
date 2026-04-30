"use strict";
// ==================== CONFIGURATION ====================
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOREM_TEXT = exports.ERROR_TEXTS = exports.HERO_TEXTS = exports.CTA_TEXTS = exports.EMAIL_TEXTS = exports.MOBILE_NUMBER_TEXT = exports.DEFAULT_VALUES = exports.FONT_LOAD_TIMEOUT_MS = exports.FREE_USAGE_LIMIT = exports.SYNC_INTERVAL_MS = exports.SYNC_DELTA_THRESHOLD = exports.SUPABASE_ANON_KEY = exports.SUPABASE_URL = exports.SYNC_USAGE_URL = exports.VERIFY_LICENSE_URL = exports.LICENSE_PRICE = exports.FREE_DAILY_LIMIT = exports.ENABLE_MONETIZATION = void 0;
// Monetization settings
exports.ENABLE_MONETIZATION = true;
exports.FREE_DAILY_LIMIT = 10;
exports.LICENSE_PRICE = 5; // $5 lifetime
// API endpoints
exports.VERIFY_LICENSE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/verify-license";
exports.SYNC_USAGE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/track-commands";
exports.SUPABASE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co";
exports.SUPABASE_ANON_KEY = "99721bbe20f7fedf28087bc968479e65a32a340cb5fc72121b06e94b9484354d"; // Replace with your actual key
// Sync settings
exports.SYNC_DELTA_THRESHOLD = 25;
exports.SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
exports.FREE_USAGE_LIMIT = 10; // Max usage count for free users (for display purposes)
// Font loading timeout
exports.FONT_LOAD_TIMEOUT_MS = 5000;
// Default values for prefix/between/suffix commands
exports.DEFAULT_VALUES = {
    prefix: '#',
    between: '-',
    suffix: '.',
    defaultTime: 'hh:mm a',
    defaultDate: 'dd MMM yyyy',
};
exports.MOBILE_NUMBER_TEXT = [
    "+1 (555) 123-4567", "+44 20 7946 0958", "+91 98765 43210",
];
exports.EMAIL_TEXTS = [
    "jenaparker@gmail.com", "armanmirani@gmail.com", "nitishsharma@email.com"
];
// Text constants
exports.CTA_TEXTS = [
    "Get Started", "Learn More", "Know More", "Read More", "Buy Now",
    "Try Free Demo", "Explore Features", "Continue", "Subscribe", "Contact Us"
];
exports.HERO_TEXTS = [
    "Transform Your Ideas Into Reality", "Build Something Amazing",
    "Your Journey Starts Here", "Innovation Meets Excellence",
    "Empower Your Creativity", "Where Great Things Happen",
    "Unlock Your Potential", "Design. Create. Inspire.",
    "Make It Happen", "Start Building Today"
];
exports.ERROR_TEXTS = [
    "Something went wrong", "Oops! Something went wrong", "An error occurred",
    "We're sorry, something went wrong", "Unable to complete this action",
    "Please try again", "Error loading content", "Something unexpected happened",
    "We encountered an issue", "Please refresh and try again"
];
exports.LOREM_TEXT = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed convallis libero quis nisi vestibulum placerat. Proin cursus libero feugiat, tempor nunc pulvinar, lacinia libero. Etiam at commodo leo. Ut molestie, lorem sed placerat convallis, tellus felis vulputate dolor, a ullamcorper erat sem eget mi. Nullam porttitor fermentum suscipit. Duis sed dui pretium purus scelerisque sodales. Duis quis justo sed nisi consectetur sollicitudin."
];
