// Firebase Configuration
// Note: These values are public by design in client-side apps
// Security is enforced through Firebase Security Rules (configured in Firebase Console)

export const firebaseConfig = {
  apiKey: "AIzaSyB00lLnYNjAI_TqdvlDniEK9wgaFQ0143I",
  authDomain: "imager-678f0.firebaseapp.com",
  databaseURL: "https://imager-678f0-default-rtdb.firebaseio.com",
  projectId: "imager-678f0",
  storageBucket: "imager-678f0.firebasestorage.app",
  messagingSenderId: "453061054446",
  appId: "1:453061054446:web:7069245e2df8434bba48ff",
  measurementId: "G-BY5SXCLK6L",
};

// Security: Validate that we're only accessing allowed paths
export const ALLOWED_DB_PATHS = {
  SVG_STATS: "svgStats",
  VERSION: "ueVersion",
  USERS: "users",
};

// Rate limiting configuration
export const RATE_LIMIT_WINDOW = {
  MAX_UPDATES_PER_MINUTE: 60, // Maximum updates per minute per user
  MAX_BATCH_SIZE: 100, // Maximum batch size to prevent abuse
};

