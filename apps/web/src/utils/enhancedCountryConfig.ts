// Enhanced country configuration for vendor application form
// This file provides business-specific country data for the "Become a Seller" form

export interface EnhancedCountryConfig {
  code: string;
  name: string;
  currency: string;
  phoneCode: string;
  paymentProviders: string[];
  businessTypes: string[];
  requiredDocs: string[];
  isTargetMarket: boolean;
  priority: number; // 1 = highest priority (Nigeria), 2 = XOF countries, 3 = others
}

// Enhanced country configuration for our target markets
export const enhancedCountryConfig: EnhancedCountryConfig[] = [
  // Primary Target Market - Nigeria (Priority 1)
  {
    code: "NG",
    name: "Nigeria",
    currency: "NGN",
    phoneCode: "+234",
    paymentProviders: ["paystack", "bank_transfer"],
    businessTypes: ["individual", "company", "partnership"],
    requiredDocs: ["cac", "tax_id", "business_address"],
    isTargetMarket: true,
    priority: 1
  },

  // XOF Countries - West African CFA Franc (Priority 2)
  {
    code: "BJ",
    name: "Benin",
    currency: "XOF",
    phoneCode: "+229",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "BF",
    name: "Burkina Faso",
    currency: "XOF",
    phoneCode: "+226",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "CI",
    name: "Côte d'Ivoire",
    currency: "XOF",
    phoneCode: "+225",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "GW",
    name: "Guinea-Bissau",
    currency: "XOF",
    phoneCode: "+245",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "ML",
    name: "Mali",
    currency: "XOF",
    phoneCode: "+223",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "NE",
    name: "Niger",
    currency: "XOF",
    phoneCode: "+227",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "SN",
    name: "Senegal",
    currency: "XOF",
    phoneCode: "+221",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "TG",
    name: "Togo",
    currency: "XOF",
    phoneCode: "+228",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  // Orange Money supported countries (Priority 2)
  {
    code: "CM",
    name: "Cameroon",
    currency: "XAF",
    phoneCode: "+237",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "MG",
    name: "Madagascar",
    currency: "MGA",
    phoneCode: "+261",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "BW",
    name: "Botswana",
    currency: "BWP",
    phoneCode: "+267",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "GN",
    name: "Guinea Conakry",
    currency: "GNF",
    phoneCode: "+224",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "SL",
    name: "Sierra Leone",
    currency: "SLL",
    phoneCode: "+232",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "CD",
    name: "RD Congo",
    currency: "CDF",
    phoneCode: "+243",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  {
    code: "CF",
    name: "Central African Republic",
    currency: "XAF",
    phoneCode: "+236",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },

  // Other African countries (Priority 3)
  {
    code: "GH",
    name: "Ghana",
    currency: "GHS",
    phoneCode: "+233",
    paymentProviders: ["bank_transfer"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: false,
    priority: 3
  },

  {
    code: "KE",
    name: "Kenya",
    currency: "KES",
    phoneCode: "+254",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: false,
    priority: 3
  },

  {
    code: "ZA",
    name: "South Africa",
    currency: "ZAR",
    phoneCode: "+27",
    paymentProviders: ["bank_transfer", "bank_transfer"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: false,
    priority: 3
  },

  {
    code: "EG",
    name: "Egypt",
    currency: "EGP",
    phoneCode: "+20",
    paymentProviders: ["bank_transfer", "bank_transfer"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: false,
    priority: 3
  }
];

// Helper functions for enhanced country configuration
export const getCountryByCode = (code: string): EnhancedCountryConfig | undefined => {
  return enhancedCountryConfig.find(country => country.code === code);
};

export const getCountryByName = (name: string): EnhancedCountryConfig | undefined => {
  return enhancedCountryConfig.find(country => country.name === name);
};

export const getTargetMarketCountries = (): EnhancedCountryConfig[] => {
  return enhancedCountryConfig.filter(country => country.isTargetMarket);
};

export const getXOFCountries = (): EnhancedCountryConfig[] => {
  return enhancedCountryConfig.filter(country => country.currency === "XOF");
};

export const getNGNCountries = (): EnhancedCountryConfig[] => {
  return enhancedCountryConfig.filter(country => country.currency === "NGN");
};

export const getCountriesByPriority = (): EnhancedCountryConfig[] => {
  return enhancedCountryConfig.sort((a, b) => a.priority - b.priority);
};

export const getCountriesByCurrency = (currency: string): EnhancedCountryConfig[] => {
  return enhancedCountryConfig.filter(country => country.currency === currency);
};

export const getCountriesByPaymentProvider = (provider: string): EnhancedCountryConfig[] => {
  return enhancedCountryConfig.filter(country => 
    country.paymentProviders.includes(provider)
  );
};

export const getCountriesByBusinessType = (businessType: string): EnhancedCountryConfig[] => {
  return enhancedCountryConfig.filter(country => 
    country.businessTypes.includes(businessType)
  );
};

// Business-specific helper functions
export const getRequiredDocsForCountry = (countryCode: string): string[] => {
  const country = getCountryByCode(countryCode);
  return country?.requiredDocs || ["business_license"];
};

export const getPaymentProvidersForCountry = (countryCode: string): string[] => {
  const country = getCountryByCode(countryCode);
  return country?.paymentProviders || ["paystack"];
};

export const getBusinessTypesForCountry = (countryCode: string): string[] => {
  const country = getCountryByCode(countryCode);
  return country?.businessTypes || ["individual"];
};

export const getCurrencyForCountry = (countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  return country?.currency || "NGN";
};

export const getPhoneCodeForCountry = (countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  return country?.phoneCode || "+234";
};

// Validation functions
export const isValidCountryCode = (code: string): boolean => {
  return enhancedCountryConfig.some(country => country.code === code);
};

export const isTargetMarketCountry = (countryCode: string): boolean => {
  const country = getCountryByCode(countryCode);
  return country?.isTargetMarket || false;
};

export const supportsPaymentProvider = (countryCode: string, provider: string): boolean => {
  const country = getCountryByCode(countryCode);
  return country?.paymentProviders.includes(provider) || false;
};

export const supportsBusinessType = (countryCode: string, businessType: string): boolean => {
  const country = getCountryByCode(countryCode);
  return country?.businessTypes.includes(businessType) || false;
};

// Export default configuration
export default enhancedCountryConfig; 