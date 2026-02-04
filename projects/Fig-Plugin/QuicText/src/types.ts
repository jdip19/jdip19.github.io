// ==================== TYPE DEFINITIONS ====================

export interface SupabaseResponse {
  valid?: boolean;
  unlimited?: boolean;
  email?: string;
  plan?: string;
  version?: string;
  error?: string;
}

export interface PaymentConfig {
  checkoutUrl: string;
  amount: number;
  currency: string;
}

export interface UsageData {
  count: number;
  date: string; // YYYY-MM-DD format
}

export interface LicenseData {
  key: string;
  unlimited: boolean;
  email: string;
  plan: string;
  version: string;
  activatedAt: string;
}

export type FontReference = FontName | typeof figma.mixed;