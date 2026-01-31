import { apiGet, apiPost } from "./api";

export interface Voucher {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUsage: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableUsers?: string[];
  userUsageLimit: number;
  description?: string;
  terms?: string;
}

export interface ValidateVoucherResult {
  isValid: boolean;
  voucher?: Voucher;
  error?: string;
  discountAmount?: number;
}

export interface AppliedVoucher {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  discountAmount: number;
  description?: string;
}

// Validate a voucher code
export async function validateVoucher(
  code: string,
  orderAmount: number,
  productIds?: string[]
): Promise<ValidateVoucherResult> {
  try {
    const data = await apiPost<{ data: ValidateVoucherResult }>("/api/v1/vouchers/validate", {
      code,
      orderAmount,
      productIds
    });
    return data.data;
  } catch (error: any) {
    console.error('Error validating voucher:', error);
    return {
      isValid: false,
      error: error.message || 'Failed to validate voucher'
    };
  }
}

// Get available vouchers for the current user
export async function getAvailableVouchers(): Promise<Voucher[]> {
  try {
    const data = await apiGet<{ data: Voucher[] }>("/api/v1/vouchers/available");
    return data.data || [];
  } catch (error) {
    console.error('Error fetching available vouchers:', error);
    return [];
  }
}

// Redeem a voucher
export async function redeemVoucher(code: string, orderId: string): Promise<boolean> {
  try {
    await apiPost("/api/v1/vouchers/redeem", {
      code,
      orderId
    });
    return true;
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    throw error;
  }
}

// Record voucher usage when applied during checkout
export async function recordVoucherUsage(code: string): Promise<boolean> {
  try {
    await apiPost("/api/v1/vouchers/record-usage", {
      code
    });
    return true;
  } catch (error) {
    console.error('Error recording voucher usage:', error);
    throw error;
  }
}

// Calculate discount amount for a voucher
export function calculateVoucherDiscount(
  voucher: Voucher,
  orderAmount: number
): number {
  switch (voucher.type) {
    case 'percentage':
      const percentageDiscount = (orderAmount * voucher.value) / 100;
      if (voucher.maxDiscount) {
        return Math.min(percentageDiscount, voucher.maxDiscount);
      }
      return percentageDiscount;

    case 'fixed':
      return Math.min(voucher.value, orderAmount);

    case 'free_shipping':
      // This would need shipping cost from the order
      return 0; // Placeholder

    default:
      return 0;
  }
} 