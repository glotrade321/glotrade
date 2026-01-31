"use client";
import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/utils/api";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Hash,
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";

interface TransactionValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recipientInfo: {
    isVerified: boolean;
    kycLevel: number;
    lastSeen: string;
    accountAge: number;
    transactionHistory: {
      totalTransactions: number;
      totalAmount: number;
      averageAmount: number;
      lastTransaction: string;
    };
  };
  amountValidation: {
    isWithinLimits: boolean;
    dailyLimit: number;
    remainingDailyLimit: number;
    monthlyLimit: number;
    remainingMonthlyLimit: number;
  };
  securityChecks: {
    isRecipientBlocked: boolean;
    isSuspiciousActivity: boolean;
    isHighRiskAmount: boolean;
    isNewRecipient: boolean;
  };
}

interface TransactionValidatorProps {
  recipientId: string;
  amount: number;
  currency: string;
  onValidationComplete: (validation: TransactionValidation) => void;
  onClose: () => void;
}

export default function TransactionValidator({
  recipientId,
  amount,
  currency,
  onValidationComplete,
  onClose
}: TransactionValidatorProps) {
  const [validation, setValidation] = useState<TransactionValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  // Validate transaction
  useEffect(() => {
    if (hasValidated) return; // Prevent multiple validations

    const validateTransaction = async () => {
      try {
        setIsLoading(true);

        const data = await apiPost<{ status: string; data: TransactionValidation; message?: string }>("/api/v1/wallets/validate-transfer", {
          recipientId,
          amount: amount.toString(),
          currency
        });

        console.log('Validation API response:', data);

        if (data.status === "success") {
          const validation: TransactionValidation = data.data;
          console.log('Validation data:', validation);
          setValidation(validation);
          setHasValidated(true);
          onValidationComplete(validation);
        } else {
          console.error('Validation failed:', data.message || "Unknown error");
          throw new Error(data.message || "Validation failed");
        }
      } catch (error: any) {
        console.error("Error validating transaction:", error);
        // Set error state
        const errorValidation: TransactionValidation = {
          isValid: false,
          warnings: [],
          errors: [error.message || "Service error"],
          suggestions: ["Try again later"],
          riskLevel: 'high',
          recipientInfo: {
            isVerified: false,
            kycLevel: 0,
            lastSeen: "Unknown",
            accountAge: 0,
            transactionHistory: {
              totalTransactions: 0,
              totalAmount: 0,
              averageAmount: 0,
              lastTransaction: "None"
            }
          },
          amountValidation: {
            isWithinLimits: false,
            dailyLimit: 0,
            remainingDailyLimit: 0,
            monthlyLimit: 0,
            remainingMonthlyLimit: 0
          },
          securityChecks: {
            isRecipientBlocked: false,
            isSuspiciousActivity: false,
            isHighRiskAmount: false,
            isNewRecipient: false
          }
        };
        setValidation(errorValidation);
        setHasValidated(true);
      } finally {
        setIsLoading(false);
      }
    };

    validateTransaction();
  }, [recipientId, amount, currency, onValidationComplete, hasValidated]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900/30 rounded-full animate-pulse"></div>
          <Shield className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Security Verification</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
          We're analyzing this transaction for security and compliance...
        </p>
      </div>
    );
  }

  if (!validation) return null;

  return (
    <div className={`flex flex-col p-6 rounded-xl shadow-lg border-l-4 ${validation.isValid
        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500'
        : 'bg-red-50 dark:bg-red-950/20 border-red-500'
      }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {validation.isValid ? (
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          ) : (
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          )}
          <div>
            <h3 className={`text-lg font-bold ${validation.isValid ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'}`}>
              {validation.isValid ? 'Transaction Validated' : 'Validation Failed'}
            </h3>
            <p className="text-xs font-medium opacity-80">
              Risk Level: <span className={
                validation.riskLevel === 'low' ? 'text-emerald-600' :
                  validation.riskLevel === 'medium' ? 'text-amber-600' : 'text-red-600'
              }>{validation.riskLevel.toUpperCase()}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {validation.errors.map((error, index) => (
          <div key={index} className="flex gap-2 items-start text-sm text-red-700 dark:text-red-300">
            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ))}

        {validation.warnings.map((warning, index) => (
          <div key={index} className="flex gap-2 items-start text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        ))}

        {validation.suggestions.length > 0 && validation.isValid && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-2 uppercase tracking-tight">Security Tips</p>
            {validation.suggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-2 items-start text-sm text-blue-700 dark:text-blue-300 mb-1 last:mb-0">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 pt-4 border-t border-black/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase mb-2">
                  <User className="w-3.5 h-3.5" /> Recipient Reliability
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">KYC Verified</span>
                    <span className={validation.recipientInfo.isVerified ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                      {validation.recipientInfo.isVerified ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Account Age</span>
                    <span className="text-gray-900 dark:text-white font-medium">{validation.recipientInfo.accountAge} days</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">History</span>
                    <span className="text-gray-900 dark:text-white font-medium">{validation.recipientInfo.transactionHistory.totalTransactions} trans.</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase mb-2">
                  <Hash className="w-3.5 h-3.5" /> Security Checks
                </h4>
                <div className="space-y-1.5">
                  <div className={`p-2 rounded flex items-center justify-between text-[10px] sm:text-xs font-medium ${validation.securityChecks.isRecipientBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    <span>Blacklist Check</span>
                    <span>{validation.securityChecks.isRecipientBlocked ? 'FAILED' : 'CLEARED'}</span>
                  </div>
                  <div className={`p-2 rounded flex items-center justify-between text-[10px] sm:text-xs font-medium ${validation.securityChecks.isSuspiciousActivity ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    <span>Pattern Analysis</span>
                    <span>{validation.securityChecks.isSuspiciousActivity ? 'SUSPICIOUS' : 'NORMAL'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase mb-2">
                  <DollarSign className="w-3.5 h-3.5" /> Limits & Compliance
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Daily Limit Used</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {Math.round(((validation.amountValidation.dailyLimit - validation.amountValidation.remainingDailyLimit) / validation.amountValidation.dailyLimit) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${validation.amountValidation.remainingDailyLimit > 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, Math.round(((validation.amountValidation.dailyLimit - validation.amountValidation.remainingDailyLimit) / validation.amountValidation.dailyLimit) * 100))}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Remaining: {validation.amountValidation.remainingDailyLimit.toLocaleString()} {currency}
                    </p>
                  </div>

                  <div className={`p-2 rounded border border-blue-100 dark:border-blue-900/30 text-[10px] sm:text-xs italic text-blue-700 dark:text-blue-300`}>
                    Last seen activity: {new Date(validation.recipientInfo.lastSeen).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
        >
          {validation.isValid ? 'Continue Security Protocol' : 'Close & Investigate'}
        </button>
      )}
    </div>
  );
}
