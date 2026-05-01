"use client";
// eslint-disable @typescript-eslint/no-explicit-any 
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Shield,
  DollarSign,
  Mail,
  ShoppingCart,
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lock,
  CreditCard,
  Bell,
  Database,
  Zap,
  Activity,
  Globe,
  Code,
  Share2,
  Server,
  Wrench,
  Trash2,
  FileText
} from "lucide-react";

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState("security");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default values? This action cannot be undone.")) {
      window.location.reload();
    }
  };

  const SettingCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const TabButton = ({ id, label, icon, isActive }: { id: string; label: string; icon: React.ReactNode; isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${isActive
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
    >
      {icon}
      <span className="inline">{label}</span>
    </button>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-sm sm:text-base text-gray-600">Configure system-wide settings and preferences</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="animate-pulse">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
                  <div className="space-y-2 sm:space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-sm sm:text-base text-gray-600">Configure system-wide settings and preferences</p>
          </div>
          <div className="flex flex-row items-stretch items-center gap-2 gap-3 w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Reset to Default</span>
              <span className="sm:hidden">Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Saving</span>
                </>
              ) : (
                <>
                  <Save size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={20} />
              <span className="text-green-800 font-medium">Settings saved successfully!</span>
            </div>
          </div>
        )}

        {saveStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-800 font-medium">Error saving settings. Please try again.</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabButton id="security" label="Security" icon={<Shield size={14} className="sm:w-4 sm:h-4" />} isActive={activeTab === "security"} />
          <TabButton id="business" label="Business" icon={<DollarSign size={14} className="sm:w-4 sm:h-4" />} isActive={activeTab === "business"} />
          <TabButton id="notifications" label="Notifications" icon={<Bell size={14} className="sm:w-4 sm:h-4" />} isActive={activeTab === "notifications"} />
          <TabButton id="platform" label="Platform" icon={<ShoppingCart size={14} className="sm:w-4 sm:h-4" />} isActive={activeTab === "platform"} />
          <TabButton id="system" label="System" icon={<Settings size={14} className="sm:w-4 sm:h-4" />} isActive={activeTab === "system"} />
        </div>

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Security Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <Shield size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900">Security Status</h3>
                  <p className="text-xs sm:text-sm text-blue-700">Current security configuration and recommendations</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Strong</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Password Policy</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Enabled</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Two-Factor Auth</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-yellow-700">Medium</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">API Security</p>
                </div>
              </div>
            </div>

            {/* Security Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SettingCard title="Password Policy" icon={<Lock size={20} className="text-blue-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      defaultValue={12}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="8"
                      max="32"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 12+ characters</p>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require special characters (!@#$%^&*)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require numbers (0-9)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require uppercase letters (A-Z)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require lowercase letters (a-z)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Prevent common passwords</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      defaultValue={90}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="30"
                      max="365"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Session & Login Security" icon={<Shield size={20} className="text-blue-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="15"
                      max="480"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 30 minutes for admin</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      defaultValue={5}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="3"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Lockout Duration (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="15"
                      max="1440"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Force logout on password change</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Track login locations</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require re-authentication for sensitive actions</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Two-Factor Authentication" icon={<Lock size={20} className="text-blue-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable Two-Factor Authentication</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require 2FA for admin accounts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require 2FA for vendor accounts</span>
                    </label>
                  </div>

                  <div className="border-t pt-3 sm:pt-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">2FA Methods</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Authenticator Apps (TOTP)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">SMS Verification</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Email Verification</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Hardware Security Keys (FIDO2)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="API Security" icon={<Zap size={20} className="text-blue-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      API Rate Limiting (requests per minute)
                    </label>
                    <input
                      type="number"
                      defaultValue={1000}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="100"
                      max="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      JWT Token Expiry (hours)
                    </label>
                    <input
                      type="number"
                      defaultValue={24}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="168"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require API key for external access</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable CORS protection</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Log all API requests</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Block suspicious IP addresses</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Data Protection & Privacy" icon={<Database size={20} className="text-blue-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable data encryption at rest</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable data encryption in transit (TLS)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Mask sensitive data in logs</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable audit logging</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Data Retention Period (days)
                    </label>
                    <input
                      type="number"
                      defaultValue={2555}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="30"
                      max="10950"
                    />
                    <p className="text-xs text-gray-500 mt-1">7 years for financial records</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Backup Encryption
                    </label>
                    <select
                      defaultValue="AES-256"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AES-128">AES-128</option>
                      <option value="AES-256">AES-256 (Recommended)</option>
                      <option value="ChaCha20">ChaCha20</option>
                    </select>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Compliance & Monitoring" icon={<Shield size={20} className="text-blue-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable GDPR compliance features</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable PCI DSS compliance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable SOC 2 compliance monitoring</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Security Scan Frequency
                    </label>
                    <select
                      defaultValue="daily"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily (Recommended)</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Real-time security alerts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Automated vulnerability scanning</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Security incident response automation</span>
                    </label>
                  </div>
                </div>
              </SettingCard>
            </div>

            {/* Security Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle size={16} className="text-yellow-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-800">Security Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-yellow-700">
                <div>
                  <p className="font-medium mb-2">🔒 Immediate Actions:</p>
                  <ul className="space-y-1">
                    <li>• Enable hardware security keys for admin accounts</li>
                    <li>• Implement IP whitelisting for admin access</li>
                    <li>• Set up automated security monitoring</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">📋 Best Practices:</p>
                  <ul className="space-y-1">
                    <li>• Regular security audits and penetration testing</li>
                    <li>• Employee security training programs</li>
                    <li>• Incident response plan documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Settings */}
        {activeTab === "business" && (
          <div className="space-y-6">
            {/* Business Overview */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <DollarSign size={20} className="text-green-600 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-green-900">Business Configuration</h3>
                  <p className="text-xs sm:text-sm text-green-700">Platform fees, payment settings, and business rules configuration</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Active</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Platform Fees</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">NGN</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Default Currency</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-blue-700">Enabled</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">VAT Collection</p>
                </div>
              </div>
            </div>

            {/* Business Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SettingCard title="Platform Fees & Orders" icon={<DollarSign size={20} className="text-green-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Platform Fee Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={2.5}
                        className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="10"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-2 text-xs sm:text-sm text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Applied to all successful transactions</p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount (₦)
                    </label>
                    <input
                      type="number"
                      defaultValue={1000}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Maximum Order Amount (₦)
                    </label>
                    <input
                      type="number"
                      defaultValue={1000000}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="1000"
                      step="10000"
                    />
                  </div>

                  {/* DISABLED FOR SINGLE-VENDOR PLATFORM - Uncomment to re-enable payout functionality
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Settlement Hold Days
                    </label>
                    <input
                      type="number"
                      defaultValue={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="30"
                    />
                    <p className="text-xs text-gray-500 mt-1">Days to hold funds before vendor payout</p>
                  </div>
                  */}

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable automatic settlement</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Charge fees on failed orders</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable dynamic pricing based on demand</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Currency & Tax Configuration" icon={<CreditCard size={20} className="text-green-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Default Currency
                    </label>
                    <select
                      defaultValue="NGN"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                      <option value="GHS">Ghanaian Cedi (₵)</option>
                      <option value="KES">Kenyan Shilling (KSh)</option>
                      <option value="ZAR">South African Rand (R)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Supported Currencies
                    </label>
                    <div className="space-y-2">
                      {["NGN", "USD", "EUR", "GBP"].map((currency) => (
                        <label key={currency} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked={currency === "NGN"}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-xs sm:text-sm text-gray-700">{currency}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3 sm:pt-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Tax Configuration</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Enable VAT Collection</span>
                      </label>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          VAT Rate (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            defaultValue={7.5}
                            className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            min="0"
                            max="25"
                            step="0.1"
                          />
                          <span className="absolute right-3 top-2 text-xs sm:text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Enable GST Collection</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Auto-calculate taxes</span>
                      </label>
                    </div>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Vendor Management & Commission" icon={<Settings size={20} className="text-green-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Vendor Commission Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={15.0}
                        className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="50"
                        step="0.5"
                      />
                      <span className="absolute right-3 top-2 text-xs sm:text-sm text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Percentage of sales revenue for vendors</p>
                  </div>

                  {/* DISABLED FOR SINGLE-VENDOR PLATFORM - Uncomment to re-enable payout functionality
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Minimum Payout Amount (₦)
                    </label>
                    <input
                      type="number"
                      defaultValue={5000}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="1000"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Payout Schedule
                    </label>
                    <select
                      defaultValue="weekly"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly (Recommended)</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  */}

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require vendor verification</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable vendor performance bonuses</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Allow vendor promotions and discounts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable vendor analytics dashboard</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Payment Processing & Methods" icon={<CreditCard size={20} className="text-green-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Payment Gateway Priority
                    </label>
                    <select
                      defaultValue="flutterwave"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="flutterwave">Flutterwave (Primary)</option>
                      <option value="paystack">Paystack (Secondary)</option>
                      <option value="orange_money">Orange Money (XOF Countries)</option>
                      <option value="stripe">Stripe (International)</option>
                      <option value="paypal">PayPal (International)</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Enabled Payment Methods</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Credit/Debit Cards</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Bank Transfers</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Mobile Money</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Orange Money (XOF Countries)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Cryptocurrency</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Buy Now, Pay Later</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Payment Processing Fee (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={1.5}
                        className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="5"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-2 text-xs sm:text-sm text-gray-500">%</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable automatic payment retries</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require CVV for card payments</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable 3D Secure authentication</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Business Rules & Policies" icon={<Settings size={20} className="text-green-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Order Cancellation Window (hours)
                    </label>
                    <input
                      type="number"
                      defaultValue={24}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="1"
                      max="168"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Return Policy Period (days)
                    </label>
                    <input
                      type="number"
                      defaultValue={14}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="1"
                      max="90"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Refund Processing Time (days)
                    </label>
                    <input
                      type="number"
                      defaultValue={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="1"
                      max="30"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable guest checkout</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Require account for returns</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable order tracking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Allow partial order cancellation</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Shipping & Delivery" icon={<ShoppingCart size={20} className="text-green-600" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Free Shipping Threshold (₦)
                    </label>
                    <input
                      type="number"
                      defaultValue={50000}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Standard Shipping Cost (₦)
                    </label>
                    <input
                      type="number"
                      defaultValue={1500}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Express Shipping Cost (₦)
                    </label>
                    <input
                      type="number"
                      defaultValue={3000}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable real-time shipping rates</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Allow vendor shipping options</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable same-day delivery</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Track delivery performance</span>
                    </label>
                  </div>
                </div>
              </SettingCard>
            </div>

            {/* Business Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <DollarSign size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-blue-800">Business Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-blue-700">
                <div>
                  <p className="font-medium mb-2">💰 Revenue Optimization:</p>
                  <ul className="space-y-1">
                    <li>• Current platform fee: 2.5% (industry average: 3-5%)</li>
                    <li>• Vendor commission: 15% (competitive rate)</li>
                    <li>• Payment processing: 1.5% (standard rate)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">📈 Growth Opportunities:</p>
                  <ul className="space-y-1">
                    <li>• Enable dynamic pricing for higher margins</li>
                    <li>• Add premium vendor features</li>
                    <li>• Implement loyalty programs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            {/* Notifications Overview */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                  <Bell size={20} className="text-purple-600 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-purple-900">Notification Configuration</h3>
                  <p className="text-xs sm:text-sm text-purple-700">Configure email, SMS, push notifications and delivery preferences</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Active</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Email Notifications</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Active</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">SMS Notifications</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-blue-700">Configured</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Push Notifications</p>
                </div>
              </div>
            </div>

            {/* Notifications Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SettingCard title="Email Notification Settings" icon={<Mail size={16} className="text-purple-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      defaultValue="smtp.gmail.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      defaultValue={587}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="25"
                      max="65535"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="noreply@afritrade.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="noreply@yourdomain.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      defaultValue="AfriTrade Hub"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable email notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Use SSL/TLS encryption</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable email templates</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable email analytics</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Daily Email Limit
                    </label>
                    <input
                      type="number"
                      defaultValue={10000}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1000"
                      max="100000"
                      step="1000"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="SMS Notification Settings" icon={<Bell size={16} className="text-purple-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      SMS Provider
                    </label>
                    <select
                      defaultValue="twilio"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="twilio">Twilio</option>
                      <option value="africastalking">Africa's Talking</option>
                      <option value="nexmo">Vonage (Nexmo)</option>
                      <option value="messagebird">MessageBird</option>
                      <option value="custom">Custom Provider</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      defaultValue=""
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your SMS API key"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Sender ID
                    </label>
                    <input
                      type="text"
                      defaultValue="AFRITRADE"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your sender ID"
                      maxLength={11}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Daily SMS Limit
                    </label>
                    <input
                      type="number"
                      defaultValue={5000}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="100"
                      max="50000"
                      step="100"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable SMS notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable delivery reports</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable SMS templates</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable international SMS</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Push Notification Settings" icon={<Bell size={16} className="text-purple-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Push Service Provider
                    </label>
                    <select
                      defaultValue="firebase"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="firebase">Firebase Cloud Messaging</option>
                      <option value="onesignal">OneSignal</option>
                      <option value="pusher">Pusher</option>
                      <option value="custom">Custom Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Server Key
                    </label>
                    <input
                      type="password"
                      defaultValue=""
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your push service key"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Project ID
                    </label>
                    <input
                      type="text"
                      defaultValue="afritrade-hub"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your project identifier"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable push notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable rich notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable notification grouping</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable silent notifications</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Notification TTL (seconds)
                    </label>
                    <input
                      type="number"
                      defaultValue={2419200}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                      max="2592000"
                      step="3600"
                    />
                    <p className="text-xs text-gray-500 mt-1">28 days maximum (2,419,200 seconds)</p>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Notification Templates" icon={<Mail size={16} className="text-purple-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Default Language
                    </label>
                    <select
                      defaultValue="en"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="yo">Yoruba</option>
                      <option value="ig">Igbo</option>
                      <option value="ha">Hausa</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Email Templates</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Welcome emails</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Order confirmations</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Password resets</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Account verification</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Marketing emails</span>
                    </label>
                  </div>

                  <div className="border-t pt-3 sm:pt-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">SMS Templates</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Order updates</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Delivery notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Security alerts</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-3 sm:pt-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Push Notification Templates</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Real-time updates</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Promotional offers</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">System announcements</span>
                      </label>
                    </div>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Notification Preferences" icon={<Settings size={16} className="text-purple-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Notification Frequency
                    </label>
                    <select
                      defaultValue="immediate"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly digest</option>
                      <option value="daily">Daily digest</option>
                      <option value="weekly">Weekly digest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Quiet Hours Start
                    </label>
                    <input
                      type="time"
                      defaultValue="22:00"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Quiet Hours End
                    </label>
                    <input
                      type="time"
                      defaultValue="08:00"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">User Notification Categories</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Order updates</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Payment confirmations</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Delivery notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Security alerts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Promotional offers</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Newsletter updates</span>
                    </label>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Vendor Notification Categories</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">New orders</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Payment settlements</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Inventory alerts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Performance reports</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Delivery & Analytics" icon={<Activity size={16} className="text-purple-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Retry Attempts
                    </label>
                    <input
                      type="number"
                      defaultValue={3}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Retry Interval (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue={5}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="60"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable delivery tracking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable notification analytics</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable A/B testing</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable notification scheduling</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Analytics Retention (days)
                    </label>
                    <input
                      type="number"
                      defaultValue={90}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="30"
                      max="365"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <p className="font-medium text-gray-700">Email Delivery Rate</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600">98.5%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <p className="font-medium text-gray-700">SMS Delivery Rate</p>
                        <p className="text-lg sm:text-2xl font-bold text-blue-600">96.2%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingCard>
            </div>

            {/* Notification Testing & Preview */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                  <Bell size={16} className="text-yellow-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-800">Test Notifications</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Mail size={14} className="sm:w-4 sm:h-4" />
                  Test Email
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Bell size={14} className="sm:w-4 sm:h-4" />
                  Test SMS
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Bell size={14} className="sm:w-4 sm:h-4" />
                  Test Push
                </button>
              </div>
              <p className="text-xs sm:text-sm text-yellow-700 mt-2 sm:mt-3">
                Use these buttons to test your notification configuration. Test notifications will be sent to your admin account.
              </p>
            </div>
          </div>
        )}

        {/* Platform Settings */}
        {activeTab === "platform" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Platform Overview */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                  <Globe size={16} className="text-emerald-600 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-emerald-900">Platform Configuration</h3>
                  <p className="text-xs sm:text-sm text-emerald-700">Configure branding, localization, integrations and platform-wide settings</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Active</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Branding</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Active</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Localization</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-blue-700">Configured</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Integrations</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-yellow-700">Pending</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">API Keys</p>
                </div>
              </div>
            </div>

            {/* Platform Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SettingCard title="Branding & Identity" icon={<Globe size={16} className="text-emerald-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      defaultValue="AfriTrade Hub"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your platform name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Platform Tagline
                    </label>
                    <input
                      type="text"
                      defaultValue="Connecting Africa's Commerce"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your platform tagline"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="color"
                        defaultValue="#10B981"
                        className="w-12 h-8 sm:w-16 sm:h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        defaultValue="#10B981"
                        className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="#10B981"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="color"
                        defaultValue="#0F766E"
                        className="w-12 h-8 sm:w-16 sm:h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        defaultValue="#0F766E"
                        className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="#0F766E"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      defaultValue="https://afritrade.com/logo.png"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://yourdomain.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Favicon URL
                    </label>
                    <input
                      type="url"
                      defaultValue="https://afritrade.com/favicon.ico"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://yourdomain.com/favicon.ico"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable custom branding</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Show platform logo in emails</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable white-label mode</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Localization & Language" icon={<Globe size={16} className="text-emerald-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Default Language
                    </label>
                    <select
                      defaultValue="en"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="ar">Arabic</option>
                      <option value="sw">Swahili</option>
                      <option value="yo">Yoruba</option>
                      <option value="ig">Igbo</option>
                      <option value="ha">Hausa</option>
                      <option value="pt">Portuguese</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Supported Languages
                    </label>
                    <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">English (en)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">French (fr)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Arabic (ar)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Swahili (sw)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Yoruba (yo)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Igbo (ig)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Hausa (ha)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Default Currency
                    </label>
                    <select
                      defaultValue="NGN"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                      <option value="GHS">Ghanaian Cedi (₵)</option>
                      <option value="KES">Kenyan Shilling (KSh)</option>
                      <option value="ZAR">South African Rand (R)</option>
                      <option value="EGP">Egyptian Pound (E£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Supported Currencies
                    </label>
                    <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Nigerian Naira (NGN)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">US Dollar (USD)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Euro (EUR)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Ghanaian Cedi (GHS)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Kenyan Shilling (KES)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Time Zone
                    </label>
                    <select
                      defaultValue="Africa/Lagos"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                      <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Accra">Africa/Accra (GMT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable auto-detection</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable RTL support</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable currency conversion</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Third-Party Integrations" icon={<Zap size={16} className="text-emerald-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Google Tag Manager ID
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Hotjar Site ID
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Integration Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Google Analytics</span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Not Configured</span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Facebook Pixel</span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Not Configured</span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Google Tag Manager</span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Not Configured</span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Hotjar</span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Not Configured</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable analytics tracking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable conversion tracking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable user behavior tracking</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="API & Developer Settings" icon={<Code size={16} className="text-emerald-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      API Base URL
                    </label>
                    <input
                      type="url"
                      defaultValue="https://api.afritrade.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://api.yourdomain.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      API Version
                    </label>
                    <select
                      defaultValue="v1"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="v1">v1 (Current)</option>
                      <option value="v2">v2 (Beta)</option>
                      <option value="v0">v0 (Legacy)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Platform Release
                    </label>
                    <input
                      type="text"
                      value="1.0.1"
                      readOnly
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Rate Limit (requests per minute)
                    </label>
                    <input
                      type="number"
                      defaultValue={1000}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="100"
                      max="10000"
                      step="100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      defaultValue=""
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://yourdomain.com/webhooks"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">API Features</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable public API</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable webhooks</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable API documentation</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable GraphQL</span>
                    </label>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Developer Tools</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable API testing console</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable debug mode</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable API logging</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Performance & Caching" icon={<Zap size={16} className="text-emerald-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Cache TTL (seconds)
                    </label>
                    <input
                      type="number"
                      defaultValue={3600}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="60"
                      max="86400"
                      step="300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      CDN Provider
                    </label>
                    <select
                      defaultValue="cloudflare"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="cloudflare">Cloudflare</option>
                      <option value="aws">AWS CloudFront</option>
                      <option value="google">Google Cloud CDN</option>
                      <option value="azure">Azure CDN</option>
                      <option value="custom">Custom CDN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      CDN URL
                    </label>
                    <input
                      type="url"
                      defaultValue="https://cdn.afritrade.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://cdn.yourdomain.com"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Caching Strategy</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable page caching</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable database query caching</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable image optimization</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable lazy loading</span>
                    </label>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Performance Monitoring</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable performance monitoring</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable error tracking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable real-time monitoring</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Social Media & SEO" icon={<Share2 size={16} className="text-emerald-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      defaultValue="AfriTrade Hub - Connecting Africa's Commerce"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your page title"
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Meta Description
                    </label>
                    <textarea
                      defaultValue="AfriTrade Hub is the premier marketplace connecting African businesses and consumers. Buy, sell, and trade with confidence across the continent."
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                      placeholder="Your page description"
                      maxLength={160}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      defaultValue="AfriTrade, Africa, marketplace, e-commerce, business, trade"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Facebook App ID
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Twitter Username
                    </label>
                    <input
                      type="text"
                      defaultValue="@afritradehub"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="@yourusername"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">SEO Features</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable sitemap generation</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable robots.txt</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable structured data</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable AMP pages</span>
                    </label>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Social Sharing</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable social sharing buttons</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable Open Graph tags</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable Twitter Cards</span>
                    </label>
                  </div>
                </div>
              </SettingCard>
            </div>

            {/* Platform Status & Health */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Activity size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-blue-800">Platform Status & Health</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Operational</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">API Services</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Operational</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Database</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Operational</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Payment Gateway</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Operational</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">CDN</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button className="px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Check System Health
                </button>
                <button className="px-3 py-2 text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  View System Logs
                </button>
                <button className="px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Generate Status Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === "system" && (
          <div className="space-y-6">
            {/* System Overview */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-slate-100 rounded-lg">
                  <Database size={16} className="text-slate-600 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">System Configuration</h3>
                  <p className="text-xs sm:text-sm text-slate-700">Configure server settings, database, maintenance, backups and system monitoring</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Healthy</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Server Status</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Connected</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Database</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-blue-700">Scheduled</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Backups</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Active</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Monitoring</p>
                </div>
              </div>
            </div>

            {/* System Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SettingCard title="Server Configuration" icon={<Server size={16} className="text-slate-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Server Environment
                    </label>
                    <select
                      defaultValue="production"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                      <option value="testing">Testing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Node.js Version
                    </label>
                    <select
                      defaultValue="18.x"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="16.x">Node.js 16.x (LTS)</option>
                      <option value="18.x">Node.js 18.x (LTS)</option>
                      <option value="20.x">Node.js 20.x (LTS)</option>
                      <option value="21.x">Node.js 21.x (Current)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Process Manager
                    </label>
                    <select
                      defaultValue="pm2"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="pm2">PM2</option>
                      <option value="forever">Forever</option>
                      <option value="nodemon">Nodemon</option>
                      <option value="systemd">Systemd</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Max Memory Usage (MB)
                    </label>
                    <input
                      type="number"
                      defaultValue={512}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="128"
                      max="4096"
                      step="128"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      CPU Limit (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={80}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="10"
                      max="100"
                      step="5"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable auto-restart on crash</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable load balancing</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable clustering</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable health checks</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Database Configuration" icon={<Database size={16} className="text-slate-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Database Type
                    </label>
                    <select
                      defaultValue="mongodb"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="mongodb">MongoDB</option>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="redis">Redis (Cache)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Connection String
                    </label>
                    <input
                      type="text"
                      defaultValue="mongodb://localhost:27017/afritrade"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="mongodb://username:password@host:port/database"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Connection Pool Size
                    </label>
                    <input
                      type="number"
                      defaultValue={10}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Connection Timeout (ms)
                    </label>
                    <input
                      type="number"
                      defaultValue={30000}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="5000"
                      max="120000"
                      step="5000"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Database Features</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable connection pooling</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable query logging</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable slow query monitoring</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable read replicas</span>
                    </label>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Performance</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable query caching</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable index optimization</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Maintenance & Updates" icon={<Wrench size={16} className="text-slate-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Maintenance Mode
                    </label>
                    <select
                      defaultValue="disabled"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="disabled">Disabled</option>
                      <option value="enabled">Enabled</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Maintenance Message
                    </label>
                    <textarea
                      defaultValue="We're currently performing scheduled maintenance. Please check back soon."
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      rows={3}
                      placeholder="Enter maintenance message"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Auto-Update Check
                    </label>
                    <select
                      defaultValue="daily"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="disabled">Disabled</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Update Channel
                    </label>
                    <select
                      defaultValue="stable"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="stable">Stable</option>
                      <option value="beta">Beta</option>
                      <option value="alpha">Alpha</option>
                      <option value="nightly">Nightly</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Maintenance Features</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable scheduled maintenance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable auto-updates</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable rollback on failure</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable maintenance notifications</span>
                    </label>
                  </div>

                  <div className="flex flex-row gap-3">
                    <button className="flex-1 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Check for Updates
                    </button>
                    <button className="flex-1 px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Install Updates
                    </button>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Backup & Recovery" icon={<Save size={16} className="text-slate-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Backup Frequency
                    </label>
                    <select
                      defaultValue="daily"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Backup Retention (days)
                    </label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="7"
                      max="365"
                      step="7"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Backup Storage Location
                    </label>
                    <select
                      defaultValue="local"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="local">Local Storage</option>
                      <option value="s3">AWS S3</option>
                      <option value="gcs">Google Cloud Storage</option>
                      <option value="azure">Azure Blob Storage</option>
                      <option value="ftp">FTP Server</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Storage Path
                    </label>
                    <input
                      type="text"
                      defaultValue="/var/backups/afritrade"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="/path/to/backup/directory"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Backup Features</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable automated backups</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable backup compression</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable backup encryption</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable backup verification</span>
                    </label>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Recovery Options</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable point-in-time recovery</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable disaster recovery</span>
                    </label>
                  </div>

                  <div className="flex flex-row gap-3">
                    <button className="flex-1 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Create Backup
                    </button>
                    <button className="flex-1 px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Restore Backup
                    </button>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="System Monitoring" icon={<Activity size={16} className="text-slate-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Monitoring Interval (seconds)
                    </label>
                    <input
                      type="number"
                      defaultValue={60}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="30"
                      max="300"
                      step="30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Alert Threshold (CPU %)
                    </label>
                    <input
                      type="number"
                      defaultValue={90}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="50"
                      max="100"
                      step="5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Memory Alert Threshold (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={85}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="50"
                      max="100"
                      step="5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Disk Space Alert (GB)
                    </label>
                    <input
                      type="number"
                      defaultValue={10}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="1"
                      max="100"
                      step="1"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Monitoring Features</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable system metrics</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable performance monitoring</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable error tracking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable log monitoring</span>
                    </label>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Alerting</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable email alerts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable SMS alerts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable webhook alerts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable Slack notifications</span>
                    </label>
                  </div>
                </div>
              </SettingCard>

              <SettingCard title="Logging & Debugging" icon={<FileText size={16} className="text-slate-600 sm:w-5 sm:h-5" />}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Log Level
                    </label>
                    <select
                      defaultValue="info"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                      <option value="trace">Trace</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Log Retention (days)
                    </label>
                    <input
                      type="number"
                      defaultValue={90}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="7"
                      max="365"
                      step="7"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Log Directory
                    </label>
                    <input
                      type="text"
                      defaultValue="/var/logs/afritrade"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="/path/to/logs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Max Log File Size (MB)
                    </label>
                    <input
                      type="number"
                      defaultValue={100}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="10"
                      max="1000"
                      step="10"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Logging Features</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable structured logging</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable log rotation</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable log compression</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable log aggregation</span>
                    </label>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Debug Features</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable debug mode</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable stack traces</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">Enable request logging</span>
                    </label>
                  </div>

                  <div className="flex flex-row gap-3">
                    <button className="flex-1 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Logs
                    </button>
                    <button className="flex-1 px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Clear Logs
                    </button>
                  </div>
                </div>
              </SettingCard>
            </div>

            {/* System Actions & Tools */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                  <Settings size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-orange-800">System Actions & Tools</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <button className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors">
                  <Server size={20} className="text-orange-600 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium text-orange-800">Restart Server</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors">
                  <Database size={20} className="text-orange-600 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium text-orange-800">Optimize Database</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors">
                  <Trash2 size={20} className="text-orange-600 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium text-orange-800">Clear Cache</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors">
                  <Activity size={20} className="text-orange-600 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium text-orange-800">System Health</span>
                </button>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button className="px-3 py-2 text-xs sm:text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Generate System Report
                </button>
                <button className="px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Emergency Shutdown
                </button>
                <button className="px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Restore Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 
