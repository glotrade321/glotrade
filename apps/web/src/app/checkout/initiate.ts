import { apiPost } from "@/utils/api";

export async function initiatePayment(payload: any) {
  return apiPost<any>("/api/v1/payments/init", payload);
}

export async function createOrder(payload: any) {
  return apiPost<any>("/api/v1/orders", payload);
}

