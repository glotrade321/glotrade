import { Country, State, City } from 'country-state-city';

// Enhanced country data with phone codes, states, cities, and business features
export interface CountryData {
  name: string;
  phoneCode: string;
  // Enhanced business features
  currency: string;
  paymentProviders: string[];
  businessTypes: string[];
  requiredDocs: string[];
  isTargetMarket: boolean;
}

export interface StateData {
  name: string;
  isoCode: string;
}

// Custom business configuration for target markets
// This will be merged with the data from country-state-city
export const customCountryConfigs: Record<string, Partial<CountryData>> = {
  "Nigeria": {
    currency: "NGN",
    paymentProviders: ["paystack", "bank_transfer"],
    businessTypes: ["individual", "company", "partnership"],
    requiredDocs: ["cac", "tax_id", "business_address"],
    isTargetMarket: true,
  },
  "Benin": {
    currency: "XOF",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Burkina Faso": {
    currency: "XOF",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Côte d'Ivoire": {
    currency: "XOF",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Guinea-Bissau": {
    currency: "XOF",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Mali": {
    currency: "XOF",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Niger": {
    currency: "XOF",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Senegal": {
    currency: "XOF",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Togo": {
    currency: "XOF",
    paymentProviders: ["bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Cameroon": {
    currency: "XAF",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Madagascar": {
    currency: "MGA",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Botswana": {
    currency: "BWP",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Guinea Conakry": {
    currency: "GNF",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Sierra Leone": {
    currency: "SLL",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "RD Congo": {
    currency: "CDF",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  },
  "Central African Republic": {
    currency: "XAF",
    paymentProviders: ["orange_money", "bank_transfer", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
  }
};

// Helper to get country code by name
const getCountryCodeByName = (name: string): string | undefined => {
  return Country.getAllCountries().find(c => c.name === name)?.isoCode;
};

// Map to cache country name to code for performance
const countryNameToCodeMap: Record<string, string> = {};

// Initialize the map
Country.getAllCountries().forEach(c => {
  countryNameToCodeMap[c.name] = c.isoCode;
});

// Helper functions adapted to use country-state-city
export const getCountryPhoneCode = (countryName: string): string => {
  const code = countryNameToCodeMap[countryName];
  if (!code) return "+234";
  const country = Country.getCountryByCode(code);
  return country ? `+${country.phonecode}` : "+234";
};

export const getStatesForCountry = (countryName: string): StateData[] => {
  const code = countryNameToCodeMap[countryName];
  if (!code) return [];
  return State.getStatesOfCountry(code).map(s => ({
    name: s.name,
    isoCode: s.isoCode
  }));
};

export const getCitiesForState = (countryName: string, stateName: string): string[] => {
  const countryCode = countryNameToCodeMap[countryName];
  if (!countryCode) return [];

  const states = State.getStatesOfCountry(countryCode);
  const state = states.find(s => s.name === stateName);
  if (!state) return [];

  return City.getCitiesOfState(countryCode, state.isoCode).map(c => c.name);
};

export const getCountryNames = (): string[] => {
  return Country.getAllCountries().map(c => c.name);
};

// Enhanced helper functions for business features
export const getCountryCurrency = (countryName: string): string => {
  if (customCountryConfigs[countryName]?.currency) {
    return customCountryConfigs[countryName].currency!;
  }
  const code = countryNameToCodeMap[countryName];
  if (!code) return "NGN";
  return Country.getCountryByCode(code)?.currency || "USD";
};

export const getCountryPaymentProviders = (country: string): string[] => {
  return customCountryConfigs[country]?.paymentProviders || ["paystack"];
};

export const getCountryBusinessTypes = (country: string): string[] => {
  return customCountryConfigs[country]?.businessTypes || ["individual"];
};

export const getCountryRequiredDocs = (country: string): string[] => {
  return customCountryConfigs[country]?.requiredDocs || ["business_license"];
};

export const isTargetMarket = (country: string): boolean => {
  return customCountryConfigs[country]?.isTargetMarket || false;
};

export const getTargetMarketCountries = (): string[] => {
  return Object.keys(customCountryConfigs).filter(country => customCountryConfigs[country].isTargetMarket);
};

export const getXOFCountries = (): string[] => {
  return Object.keys(customCountryConfigs).filter(country => customCountryConfigs[country].currency === "XOF");
};

export const getNGNCountries = (): string[] => {
  return Object.keys(customCountryConfigs).filter(country => customCountryConfigs[country].currency === "NGN");
};