"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Shield,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Store,
  Eye,
  Star,
  CreditCard,
  Wallet,
  TicketPercent
} from "lucide-react";
import { apiGet } from "@/utils/api";
import { formatCurrency } from "@/utils/format";

interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingVerifications: number;
  pendingWithdrawals: number;
  pendingCreditRequests: number;
  recentActivity: Array<{
    type: 'order' | 'user' | 'product' | 'review' | 'payment';
    data: Record<string, unknown>;
    timestamp: string;
  }>;
}

interface PlatformHealth {
  systemUptime: number;
  apiResponse: number;
  mobileUsers: number;
  securityScore: string;
  activeCoupons: number;
  lastBackup: string;
  activeSessions: number;
  databaseSize: number;
}

interface CategoryStats {
  category: string;
  categorySlug: string;
  level: number;
  parentCategory?: string;
  productCount: number;
  totalSales: number;
  orderCount: number;
  subcategories?: Array<{
    name: string;
    slug: string;
    productCount: number;
    totalSales: number;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
  subtitle?: string;
}

const MetricCard = ({ title, value, change, icon, color, isLoading, subtitle }: MetricCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
        {isLoading ? (
          <div className="mt-1 sm:mt-2 h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <p className="mt-1 sm:mt-2 text-xl sm:text-xl font-bold text-gray-900 truncate">{value}</p>
        )}
        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">{subtitle}</p>
        )}
        {change && (
          <p className="mt-1 text-xs sm:text-sm text-green-600 flex items-center gap-1">
            <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0`}>
        {icon}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ activity }: { activity: DashboardMetrics['recentActivity'][0] }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={16} className="text-blue-500" />;
      case 'user':
        return <Users size={16} className="text-green-500" />;
      case 'product':
        return <Package size={16} className="text-purple-500" />;
      case 'review':
        return <Star size={16} className="text-yellow-500" />;
      case 'payment':
        return <CreditCard size={16} className="text-emerald-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const getActivityText = (activity: DashboardMetrics['recentActivity'][0]) => {
    switch (activity.type) {
      case 'order':
        const orderData = activity.data as { orderNumber?: string; status?: string; totalPrice?: number; currency?: string; buyer?: { username?: string; firstName?: string; lastName?: string } };
        const buyerName = orderData.buyer?.firstName && orderData.buyer?.lastName
          ? `${orderData.buyer.firstName} ${orderData.buyer.lastName}`
          : orderData.buyer?.username || 'Customer';
        return `Order #${orderData.orderNumber || 'N/A'} - ${orderData.status || 'pending'} (${formatCurrency(orderData.totalPrice || 0)} ${orderData.currency || 'NGN'}) by ${buyerName}`;

      case 'user':
        const userData = activity.data as { username?: string; role?: string; firstName?: string; lastName?: string; isVerified?: boolean };
        const fullName = userData.firstName && userData.lastName
          ? `${userData.firstName} ${userData.lastName}`
          : userData.username || 'New User';
        const verificationStatus = userData.isVerified ? ' (Verified)' : ' (Pending)';
        return `${fullName} joined as ${userData.role || 'user'}${verificationStatus}`;

      case 'product':
        const productData = activity.data as { title?: string; price?: number; category?: string; seller?: { username?: string; store?: { name?: string } } };
        const sellerName = productData.seller?.store?.name || productData.seller?.username || 'seller';
        return `${productData.title || 'New Product'} (${formatCurrency(productData.price || 0)} NGN) added by ${sellerName} in ${productData.category || 'General'}`;

      case 'review':
        const reviewData = activity.data as { rating?: number; comment?: string; user?: { username?: string }; product?: { title?: string } };
        return `${reviewData.user?.username || 'User'} rated "${reviewData.product?.title || 'Product'}" ${reviewData.rating || 0}/5 stars`;

      case 'payment':
        const paymentData = activity.data as { amount?: number; currency?: string; status?: string; provider?: string; order?: { totalPrice?: number; status?: string } };
        const amountInNaira = (paymentData.amount || 0) / 100; // Convert from kobo
        return `Payment of ${formatCurrency(amountInNaira)} ${paymentData.currency || 'NGN'} via ${paymentData.provider || 'Provider'} - ${paymentData.status || 'pending'}`;

      default:
        return 'Unknown activity';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
          {getActivityText(activity)}
        </p>
        <p className="text-xs text-gray-500">
          {formatTimestamp(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [metricsData, healthData, categoryData] = await Promise.all([
          apiGet<{ status: string; data: DashboardMetrics }>("/api/v1/admin/dashboard"),
          apiGet<{ status: string; data: PlatformHealth }>("/api/v1/admin/dashboard/health"),
          apiGet<{ status: string; data: CategoryStats[] }>("/api/v1/admin/dashboard/categories")
        ]);

        setMetrics(metricsData.data);
        console.log('DashboardMetrics: Received data', metricsData.data);
        console.log('DashboardMetrics: Recent Activity', metricsData.data.recentActivity);
        setPlatformHealth(healthData.data);
        setCategoryStats(categoryData.data);
        setLastUpdated(new Date());
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);

        // Don't set mock data - only use real database data
        // setMetrics({
        //   totalUsers: 1247,
        //   totalProducts: 8934,
        //   totalOrders: 5678,
        //   totalRevenue: 234567,
        //   activeUsers: 892,
        //   pendingVerifications: 23,
        //   recentActivity: []
        // });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up auto-refresh every 40 minutes (reduced from 5 minutes)
    // With backend caching, 40 minutes is sufficient and reduces load
    const interval = setInterval(fetchDashboardData, 40 * 60 * 1000);

    // Pause polling when tab is hidden to save resources
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        // Resume polling when tab becomes visible
        fetchDashboardData();
        const newInterval = setInterval(fetchDashboardData, 40 * 60 * 1000);
        return () => clearInterval(newInterval);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (error && !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }


  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
  };

  // Calculate derived metrics
  const userEngagement = metrics ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0;
  const conversionRate = metrics ? Math.round((metrics.totalOrders / metrics.totalUsers) * 100) : 0;
  const avgOrderValue = metrics ? Math.round(metrics.totalRevenue / metrics.totalOrders) : 0;
  const productDensity = metrics ? Math.round((metrics.totalProducts / metrics.totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with last updated */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Platform Overview</h2>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <Clock size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Last updated: </span>
          <span className="sm:hidden">Updated: </span>
          {lastUpdated.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          title="Total Users"
          value={formatNumber(metrics?.totalUsers || 0)}
          icon={<Users size={20} className="text-white sm:w-6 sm:h-6" />}
          color="bg-blue-500"
          isLoading={isLoading}
          subtitle="Registered platform users"
        />

        <MetricCard
          title="Total Products"
          value={formatNumber(metrics?.totalProducts || 0)}
          icon={<Package size={20} className="text-white sm:w-6 sm:h-6" />}
          color="bg-green-500"
          isLoading={isLoading}
          subtitle="Available products"
        />

        <MetricCard
          title="Total Orders"
          value={formatNumber(metrics?.totalOrders || 0)}
          icon={<ShoppingCart size={20} className="text-white sm:w-6 sm:h-6" />}
          color="bg-purple-500"
          isLoading={isLoading}
          subtitle="Completed transactions"
        />

        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          icon={<DollarSign size={20} className="text-white sm:w-6 sm:h-6" />}
          color="bg-orange-500"
          isLoading={isLoading}
          subtitle="Platform earnings"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          title="Active Users (30 days)"
          value={formatNumber(metrics?.activeUsers || 0)}
          icon={<Activity size={20} className="text-white sm:w-6 sm:h-6" />}
          color="bg-indigo-500"
          isLoading={isLoading}
          subtitle={`${userEngagement}% of total users`}
        />

        <MetricCard
          title="Pending Verifications"
          value={metrics?.pendingVerifications || 0}
          icon={<Shield size={20} className="text-white sm:w-6 sm:h-6" />}
          color="bg-yellow-500"
          isLoading={isLoading}
          subtitle="Awaiting approval"
        />
        {/* Wallet System Metrics */}
        <MetricCard
          title="Pending Withdrawals"
          value={metrics?.pendingWithdrawals || 0}
          icon={<Wallet size={20} className="text-white sm:w-6 sm:h-6" />}
          color="bg-teal-500"
          isLoading={isLoading}
          subtitle="Awaiting approval"
        />

        <MetricCard
          title="Pending Credit Requests"
          value={metrics?.pendingCreditRequests || 0}
          icon={<CreditCard size={20} className="text-white sm:w-6 sm:h-6" />}
          color="bg-indigo-500"
          isLoading={isLoading}
          subtitle="Awaiting review"
        />
      </div>

      {/* Platform Health & Performance */}
      {platformHealth && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <MetricCard
            title="System Uptime"
            value={`${platformHealth.systemUptime}%`}
            icon={<CheckCircle size={20} className="text-white sm:w-6 sm:h-6" />}
            color="bg-green-500"
            isLoading={isLoading}
            subtitle="Platform availability"
          />

          <MetricCard
            title="Active Sessions"
            value={platformHealth.activeSessions}
            icon={<Eye size={20} className="text-white sm:w-6 sm:h-6" />}
            color="bg-blue-500"
            isLoading={isLoading}
            subtitle="Current users online"
          />

          <MetricCard
            title="Active Coupons"
            value={platformHealth.activeCoupons}
            icon={<TicketPercent size={20} className="text-white sm:w-6 sm:h-6" />}
            color="bg-pink-500"
            isLoading={isLoading}
            subtitle="Currently valid coupons"
          />

          <MetricCard
            title="Last Backup"
            value={new Date(platformHealth.lastBackup).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}
            icon={<Shield size={20} className="text-white sm:w-6 sm:h-6" />}
            color="bg-purple-500"
            isLoading={isLoading}
            subtitle="Data protection"
          />
        </div>
      )}

      {/* Quick Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{userEngagement}%</p>
            <p className="text-xs sm:text-sm text-gray-600">User Engagement</p>
          </div>

          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-green-600">{conversionRate}%</p>
            <p className="text-xs sm:text-sm text-gray-600">Conversion Rate</p>
          </div>

          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-purple-600">{formatCurrency(avgOrderValue)}</p>
            <p className="text-xs sm:text-sm text-gray-600">Avg Order Value</p>
          </div>

          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-orange-600">{productDensity}%</p>
            <p className="text-xs sm:text-sm text-gray-600">Product Density</p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity size={16} className="text-gray-400 sm:w-5 sm:h-5" />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Activity size={32} className="mx-auto mb-2 text-gray-300 sm:w-12 sm:h-12" />
                <p className="text-sm sm:text-base">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Categories</h3>
            <Store size={16} className="text-gray-400 sm:w-5 sm:h-5" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {categoryStats && categoryStats.length > 0 ? (
              categoryStats.slice(0, 5).map((category, index) => (
                <div key={index} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                  {/* Main Category */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-xs sm:text-sm">{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{category.category}</p>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <span>{category.productCount} products</span>
                          <span>•</span>
                          <span>{category.orderCount} orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">{formatCurrency(category.totalSales)}</p>
                      <p className="text-xs text-gray-500">Total sales</p>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="ml-8 sm:ml-11 space-y-1 sm:space-y-2">
                      {category.subcategories.slice(0, 3).map((sub, subIndex) => (
                        <div key={subIndex} className="flex items-center justify-between py-1 px-2 bg-white rounded border-l-2 border-blue-200">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{sub.name}</span>
                            <span className="text-xs text-gray-500">({sub.productCount})</span>
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-600 flex-shrink-0 ml-2">
                            {formatCurrency(sub.totalSales)}
                          </span>
                        </div>
                      ))}
                      {category.subcategories.length > 3 && (
                        <div className="ml-2 text-xs text-gray-500 italic">
                          +{category.subcategories.length - 3} more subcategories
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Store size={32} className="mx-auto mb-2 text-gray-300 sm:w-12 sm:h-12" />
                <p className="text-sm sm:text-base">No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 