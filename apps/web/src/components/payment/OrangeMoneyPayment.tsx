"use client";
import { useState } from 'react';
import { toast } from '@/components/common/Toast';
import { API_BASE_URL, getAuthHeader, apiPost } from '@/utils/api';

interface OrangeMoneyPaymentProps {
  amount: number;
  currency: string;
  orderId: string;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
}

export default function OrangeMoneyPayment({
  amount,
  currency,
  orderId,
  onSuccess,
  onError
}: OrangeMoneyPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast('Please enter your phone number', 'error');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast('Please enter a valid phone number with country code (e.g., +221771234567)', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiPost<{ status: string; data: { url: string }; message?: string }>("/api/v1/payments/init", {
        orderId,
        provider: 'orange_money',
        amount,
        currency,
        customer: {
          phone: phoneNumber
        },
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      });

      if (data.status === 'success') {
        // Redirect to Orange Money payment page
        window.location.href = data.data.url;
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Orange Money payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError(errorMessage);
      toast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      {/* Orange Money Branding */}
      <div className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
          <span className="text-white text-lg font-bold">OM</span>
        </div>
        <div>
          <h3 className="font-semibold text-orange-900 dark:text-orange-100">Orange Money</h3>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Pay securely with your Orange Money account
          </p>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Amount to pay</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatAmount(amount, currency)}
        </p>
      </div>

      {/* Phone Number Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Orange Money Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+221 77 123 4567"
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter your Orange Money phone number with country code
        </p>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isLoading || !phoneNumber.trim()}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Pay with Orange Money</span>
            <span className="text-orange-200">→</span>
          </>
        )}
      </button>

      {/* Payment Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to pay with Orange Money:</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
          <li>Click "Pay with Orange Money" to proceed</li>
          <li>You'll be redirected to Orange Money payment page</li>
          <li>Enter your Orange Money PIN to authorize the payment</li>
          <li>You'll receive a confirmation SMS</li>
          <li>Return to this page to see your payment status</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>🔒 Your payment is secured by Orange Money's encryption</p>
        <p>No card details are stored on our servers</p>
      </div>
    </div>
  );
}
