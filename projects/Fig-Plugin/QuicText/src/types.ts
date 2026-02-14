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
  usageCount: number;
  syncedUsageCount: number;
  lastFetchedTotal: number;
  lastSyncAt?: string;
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