"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Globe,
  Smartphone,
  Search,
  Shield,
  Download,
  Users,
  RefreshCw,
  ShoppingCart
} from "lucide-react";
import { apiGet } from "@/utils/api";

interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  trend: number[];
}

interface GeographicData {
  country: string;
  users: number;
  orders: number;
  revenue: number;
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isMobile, setIsMobile] = useState(false);

  // Check access for product_manager
  useEffect(() => {
    try {
      const userData = localStorage.getItem('afritrade:user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'product_manager') {
          router.push('/admin/products');
        }
      }
    } catch { }
  }, []);

  // Real analytics data from API
  const [metrics, setMetrics] = useState<{
    totalRevenue: number;
    totalOrders: number;
    activeUsers: number;
    conversionRate: number;
  } | null>(null);

  // Real chart data from API
  const [salesTimeSeries, setSalesTimeSeries] = useState<Array<{
    date: string;
    orders: number;
    revenue: number;
    averageOrderValue: number;
  }>>([]);

  const [userGrowth, setUserGrowth] = useState<Array<{
    month: string;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
  }>>([]);

  // Real top products and vendors data from API
  const [topProducts, setTopProducts] = useState<Array<{
    productId: string;
    name: string;
    totalSales: number;
    totalOrders: number;
    averageRating: number;
    category: string;
    subcategory: string;
    subSubcategory: string;
    price: number;
  }>>([]);





  // Geographic distribution data from API
  const [geographicData, setGeographicData] = useState<{
    userDistribution: Array<{ country: string; count: number; percentage: number }>;
    orderDistribution: Array<{ country: string; count: number; revenue: number }>;
    topCities: Array<{ city: string; country: string; count: number }>;
    regionalPerformance: Array<{ region: string; users: number; orders: number; revenue: number }>;
  } | null>(null);

  // Platform health data from API
  const [platformHealth, setPlatformHealth] = useState<{
    systemUptime: number;
    apiResponse: number;
    mobileUsers: number;
    securityScore: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock analytics data (fallback only)
  const mockMetrics: AnalyticsMetric[] = [
    {
      label: "Total Revenue",
      value: "₦12,847,320",
      change: "+18.2%",
      changeType: "increase",
      trend: [120, 135, 142, 158, 162, 178, 192, 184, 201, 218, 234, 248]
    },
    {
      label: "Total Orders",
      value: "8,947",
      change: "+18.2%",
      changeType: "increase",
      trend: [120, 135, 142, 158, 162, 178, 192, 184, 201, 218, 234, 248]
    },
    {
      label: "Active Users",
      value: "2,847",
      change: "+12.8%",
      changeType: "increase",
      trend: [2100, 2250, 2320, 2480, 2520, 2680, 2820, 2740, 2910, 3080, 3240, 3380]
    },
    {
      label: "Conversion Rate",
      value: "3.2%",
      change: "+0.8%",
      changeType: "increase",
      trend: [2.4, 2.6, 2.8, 3.0, 3.1, 3.2, 3.3, 3.2, 3.4, 3.5, 3.6, 3.8]
    }
  ];

  const mockGeographicData: GeographicData[] = [
    { country: "Nigeria", users: 1247, orders: 5678, revenue: 8473200 },
    { country: "Ghana", users: 456, orders: 1890, revenue: 2345000 },
    { country: "Kenya", users: 389, orders: 1456, revenue: 1890000 },
    { country: "South Africa", users: 234, orders: 890, revenue: 1234000 },
    { country: "Uganda", users: 167, orders: 567, revenue: 890000 }
  ];

  // Chart data configuration - now using real data from API
  const revenueChartData = {
    labels: salesTimeSeries.length > 0
      ? salesTimeSeries.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })
      : ['No data'],
    datasets: [
      {
        label: 'Revenue (₦)',
        data: salesTimeSeries.length > 0
          ? salesTimeSeries.map(item => item.revenue)
          : [0],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const userGrowthChartData = {
    labels: userGrowth.length > 0
      ? userGrowth.map(item => {
        const [year, month] = item.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      })
      : ['No data'],
    datasets: [
      {
        label: 'New Users',
        data: userGrowth.length > 0
          ? userGrowth.map(item => item.newUsers)
          : [0],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: isMobile ? 11 : 12
        },
        bodyFont: {
          size: isMobile ? 10 : 11
        },
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            if (context.dataset.label === 'Revenue (₦)') {
              return `Revenue: ₦${value.toLocaleString()}`;
            } else if (context.dataset.label === 'New Users') {
              return `New Users: ${value}`;
            }
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        grid: {
          color: '#E5E7EB',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: isMobile ? 10 : 12
          },
          callback: function (value: any) {
            if (revenueChartData.datasets[0].label === 'Revenue (₦)') {
              return `₦${value.toLocaleString()}`;
            }
            return value;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };



  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch real dashboard metrics from our working API
        const [dashboardResponse, salesResponse, growthResponse, productsResponse, geographicResponse, healthResponse] = await Promise.all([
          apiGet<{
            status: string;
            data: {
              totalRevenue: number;
              totalOrders: number;
              totalUsers: number;
              activeUsers: number;
            };
          }>('/api/v1/admin/dashboard'),

          apiGet<{
            status: string;
            data: Array<{
              date: string;
              orders: number;
              revenue: number;
              averageOrderValue: number;
            }>;
          }>(`/api/v1/admin/dashboard/sales-timeseries?days=${timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90}`),

          apiGet<{
            status: string;
            data: Array<{
              month: string;
              newUsers: number;
              activeUsers: number;
              totalUsers: number;
            }>;
          }>('/api/v1/admin/dashboard/user-growth'),

          apiGet<{
            status: string;
            data: Array<{
              productId: string;
              name: string;
              totalSales: number;
              totalOrders: number;
              averageRating: number;
              category: string;
              subcategory: string;
              subSubcategory: string;
              price: number;
            }>;
          }>('/api/v1/admin/dashboard/top-products'),





          apiGet<{
            status: string;
            data: {
              userDistribution: Array<{ country: string; count: number; percentage: number }>;
              orderDistribution: Array<{ country: string; count: number; revenue: number }>;
              topCities: Array<{ city: string; country: string; count: number }>;
              regionalPerformance: Array<{ region: string; users: number; orders: number; revenue: number }>;
            };
          }>('/api/v1/admin/dashboard/geographic'),

          apiGet<{
            status: string;
            data: {
              systemUptime: number;
              apiResponse: number;
              mobileUsers: number;
              securityScore: string;
            };
          }>('/api/v1/admin/dashboard/health')
        ]);

        if (dashboardResponse.status === 'success' && dashboardResponse.data) {
          const data = dashboardResponse.data;
          setMetrics({
            totalRevenue: data.totalRevenue || 0,
            totalOrders: data.totalOrders || 0,
            activeUsers: data.activeUsers || 0,
            conversionRate: data.totalUsers > 0 ? Math.round((data.totalOrders / data.totalUsers) * 100) : 0
          });
        }

        if (salesResponse.status === 'success' && salesResponse.data) {
          setSalesTimeSeries(salesResponse.data);
        }

        if (growthResponse.status === 'success' && growthResponse.data) {
          setUserGrowth(growthResponse.data);
        }

        if (productsResponse.status === 'success' && productsResponse.data) {
          setTopProducts(productsResponse.data);
        }





        if (geographicResponse.status === 'success' && geographicResponse.data) {
          setGeographicData(geographicResponse.data);
        }

        if (healthResponse.status === 'success' && healthResponse.data) {
          setPlatformHealth(healthResponse.data);
        }

      } catch (error: any) {
        console.error("Error fetching analytics:", error);
        setError(error.message);
        // Keep mock data as fallback for now
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const MetricCard = ({ metric }: { metric: AnalyticsMetric }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{metric.label}</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900 truncate">{metric.value}</p>
          <div className={`mt-1 flex items-center gap-1 text-xs sm:text-sm ${metric.changeType === "increase" ? "text-green-600" :
            metric.changeType === "decrease" ? "text-red-600" : "text-gray-600"
            }`}>
            {metric.changeType === "increase" ? <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" /> :
              metric.changeType === "decrease" ? <TrendingDown size={12} className="sm:w-3.5 sm:h-3.5" /> : null}
            <span className="truncate">{metric.change} from last period</span>
          </div>
        </div>
        <div className="p-2 sm:p-3 rounded-lg bg-blue-100 flex-shrink-0 ml-2">
          <BarChart3 size={20} className="text-blue-600 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children }: { title: string; children: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
      {children}
    </div>
  );

  const DataTable = ({ title, data, columns, dataType }: {
    title: string;
    data: any[];
    columns: string[];
    dataType: 'products'
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto">
          <Download size={14} className="sm:w-4 sm:h-4" />
          Export
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th key={column} className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  {dataType === 'products' ? (
                    <>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {item.totalOrders}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        ₦{item.totalSales.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">{item.category}</div>
                          {item.subcategory && (
                            <div className="text-xs text-gray-500">→ {item.subcategory}</div>
                          )}
                          {item.subSubcategory && (
                            <div className="text-xs text-gray-500">→ {item.subSubcategory}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{item.averageRating.toFixed(1)}</span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(item.averageRating) ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    </>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <BarChart3 size={32} className="text-gray-300" />
                    <p>No {dataType === 'products' ? 'products' : 'vendors'} data available</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              {dataType === 'products' ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{item.name}</h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="font-medium text-xs">{item.averageRating.toFixed(1)}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(item.averageRating) ? 'text-yellow-400' : 'text-gray-300'} style={{ fontSize: '10px' }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Sales:</span>
                      <span className="ml-1 font-medium">{item.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Revenue:</span>
                      <span className="ml-1 font-medium">₦{item.totalSales.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="font-medium">{item.category}</div>
                    {item.subcategory && (
                      <div className="text-gray-500">→ {item.subcategory}</div>
                    )}
                    {item.subSubcategory && (
                      <div className="text-gray-500">→ {item.subSubcategory}</div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <BarChart3 size={32} className="text-gray-300" />
              <p className="text-sm">No {dataType === 'products' ? 'products' : 'vendors'} data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Platform performance and insights</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">Platform performance and insights</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Download size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics ? (
            <>
              <MetricCard metric={{
                label: "Total Revenue",
                value: `₦${metrics.totalRevenue.toLocaleString()}`,
                change: "Real data",
                changeType: "increase" as const,
                trend: []
              }} />
              <MetricCard metric={{
                label: "Total Orders",
                value: metrics.totalOrders.toString(),
                change: "Real data",
                changeType: "increase" as const,
                trend: []
              }} />
              <MetricCard metric={{
                label: "Active Users",
                value: metrics.activeUsers.toString(),
                change: "Real data",
                changeType: "increase" as const,
                trend: []
              }} />
              <MetricCard metric={{
                label: "Conversion Rate",
                value: `${metrics.conversionRate}%`,
                change: "Real data",
                changeType: "increase" as const,
                trend: []
              }} />
            </>
          ) : (
            mockMetrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartCard title="Revenue Trend">
            <div className="h-48 sm:h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : salesTimeSeries.length > 0 ? (
                <Line data={revenueChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <BarChart3 size={24} className="mx-auto mb-2 text-gray-300 sm:w-8 sm:h-8" />
                    <p className="text-xs sm:text-sm">No revenue data available</p>
                  </div>
                </div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="User Growth">
            <div className="h-48 sm:h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
                </div>
              ) : userGrowth.length > 0 ? (
                <Line data={userGrowthChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Users size={24} className="mx-auto mb-2 text-gray-300 sm:w-8 sm:h-8" />
                    <p className="text-xs sm:text-sm">No user growth data available</p>
                  </div>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Top Products Table */}
        <div className="grid grid-cols-1 gap-6">
          <DataTable
            title="Top Performing Products"
            data={isLoading ? [] : topProducts}
            columns={["Product", "Sales", "Revenue", "Category", "Rating"]}
            dataType="products"
          />
        </div>

        {/* Data Tables Row */}


        {/* Geographic Analytics */}
        <div className="space-y-4 sm:space-y-6">
          <ChartCard title="Geographic Distribution">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* User Distribution by Country */}
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">User Distribution by Country</h4>
                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                  {geographicData?.userDistribution?.slice(0, 10).map((geo, index) => (
                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Globe size={12} className="text-blue-600 sm:w-4 sm:h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{geo.country}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{geo.count} users</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-semibold text-blue-600 text-xs sm:text-sm">{geo.percentage}%</p>
                        <div className="w-12 sm:w-20 bg-gray-200 rounded-full h-1.5 sm:h-2 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
                            style={{ width: `${geo.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )) || (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <p className="text-xs sm:text-sm">No user distribution data available</p>
                      </div>
                    )}
                </div>
              </div>

              {/* Order Distribution by Country */}
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">Order Distribution by Country</h4>
                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                  {geographicData?.orderDistribution?.slice(0, 10).map((geo, index) => (
                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShoppingCart size={12} className="text-green-600 sm:w-4 sm:h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{geo.country}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{geo.count} orders</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-semibold text-green-600 text-xs sm:text-sm">₦{geo.revenue.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  )) || (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <p className="text-xs sm:text-sm">No order distribution data available</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Top Cities and Regional Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChartCard title="Top Cities by User Count">
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                {geographicData?.topCities?.slice(0, 15).map((city, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-purple-600">{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{city.city}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{city.country}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-purple-600 text-xs sm:text-sm">{city.count}</p>
                      <p className="text-xs sm:text-sm text-gray-500">users</p>
                    </div>
                  </div>
                )) || (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <p className="text-xs sm:text-sm">No city data available</p>
                    </div>
                  )}
              </div>
            </ChartCard>

            <ChartCard title="Regional Performance">
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                {geographicData?.regionalPerformance?.slice(0, 10).map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BarChart3 size={12} className="text-orange-600 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{region.region}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{region.users} users</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-orange-600 text-xs sm:text-sm">{region.orders}</p>
                      <p className="text-xs sm:text-sm text-gray-500">orders</p>
                      <p className="text-xs text-gray-400">₦{region.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                )) || (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <p className="text-xs sm:text-sm">No regional performance data available</p>
                    </div>
                  )}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Platform Health Metrics */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Platform Health</h3>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              <RefreshCw size={14} className="sm:w-4 sm:h-4" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Activity size={16} className="text-green-600 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {isLoading ? (
                      <div className="h-6 w-12 sm:h-8 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      platformHealth?.systemUptime ? `${platformHealth.systemUptime}%` : '99.9%'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Search size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">API Response</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {isLoading ? (
                      <div className="h-6 w-12 sm:h-8 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      platformHealth?.apiResponse ? `${platformHealth.apiResponse}ms` : '142ms'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Smartphone size={16} className="text-purple-600 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Mobile Users</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {isLoading ? (
                      <div className="h-6 w-12 sm:h-8 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      platformHealth?.mobileUsers ? `${platformHealth.mobileUsers}%` : '68%'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <Shield size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Security Score</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {isLoading ? (
                      <div className="h-6 w-12 sm:h-8 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      platformHealth?.securityScore || 'A+'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout >
  );
} 