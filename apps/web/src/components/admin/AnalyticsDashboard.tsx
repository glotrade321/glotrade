"use client";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Star,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Package
} from "lucide-react";
import { apiGet } from "@/utils/api";
import { formatCurrency } from "@/utils/format";

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
  ArcElement
);

interface SalesTimeSeries {
  date: string;
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

interface UserGrowth {
  month: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
}

interface TopVendor {
  vendorId: string;
  username: string;
  storeName: string;
  totalSales: number;
  totalOrders: number;
  averageRating: number;
  totalProducts: number;
}

interface PlatformPerformance {
  conversionRate: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  topSellingCategories: Array<{
    category: string;
    sales: number;
    orders: number;
  }>;
}

interface AnalyticsDashboardProps {
  className?: string;
}

interface TopProduct {
  productId: string;
  name: string;
  totalSales: number;
  totalOrders: number;
  averageRating: number;
  category: string;
  price: number;
}

export default function AnalyticsDashboard({ className = "" }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  // Analytics data
  const [salesTimeSeries, setSalesTimeSeries] = useState<SalesTimeSeries[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [platformPerformance, setPlatformPerformance] = useState<PlatformPerformance | null>(null);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

      const [salesData, growthData, productsData, performanceData] = await Promise.all([
        apiGet(`/api/v1/admin/dashboard/sales-timeseries?days=${days}`),
        apiGet('/api/v1/admin/dashboard/user-growth'),
        apiGet('/api/v1/admin/dashboard/top-products?limit=5'),
        apiGet('/api/v1/admin/dashboard/performance')
      ]) as any[];

      if (salesData.status === 'success' && salesData.data) setSalesTimeSeries(salesData.data as SalesTimeSeries[]);
      if (growthData.status === 'success' && growthData.data) setUserGrowth(growthData.data as UserGrowth[]);
      if (productsData.status === 'success' && productsData.data) setTopProducts(productsData.data as TopProduct[]);
      if (performanceData.status === 'success' && performanceData.data) setPlatformPerformance(performanceData.data as PlatformPerformance);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Chart options
  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: isMobile ? 12 : 14
          },
          padding: isMobile ? 10 : 20
        }
      },
      title: {
        display: true,
        text: `Sales Performance - Last ${timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} Days`,
        font: {
          size: isMobile ? 14 : 16
        },
        padding: {
          top: 10,
          bottom: isMobile ? 10 : 20
        }
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          callback: function (value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const userGrowthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: isMobile ? 12 : 14
          },
          padding: isMobile ? 10 : 20
        }
      },
      title: {
        display: true,
        text: 'User Growth - Last 12 Months',
        font: {
          size: isMobile ? 14 : 16
        },
        padding: {
          top: 10,
          bottom: isMobile ? 10 : 20
        }
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend since we have custom one
      },
      title: {
        display: true,
        text: 'Top Selling Categories by Revenue',
        font: {
          size: isMobile ? 14 : 16,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: isMobile ? 10 : 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: isMobile ? 12 : 14
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        },
        callbacks: {
          label: function (context: any) {
            return `Sales: ₦${formatCurrency(context.parsed.y)}`;
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
          font: {
            size: isMobile ? 10 : 12,
            weight: 'bold' as const
          },
          color: '#6B7280',
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
            weight: 'bold' as const
          },
          color: '#6B7280',
          callback: function (value: any) {
            return `₦${(value / 1000).toFixed(0)}K`;
          }
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false
      }
    }
  };

  // Prepare chart data - only when we have valid data
  const salesChartData = {
    labels: salesTimeSeries.length > 0 ? salesTimeSeries.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) : [],
    datasets: [
      {
        label: 'Revenue',
        data: salesTimeSeries.length > 0 ? salesTimeSeries.map(item => item.revenue) : [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Orders',
        data: salesTimeSeries.length > 0 ? salesTimeSeries.map(item => item.orders) : [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const userGrowthChartData = {
    labels: userGrowth.length > 0 ? userGrowth.map(item => {
      const [year, month] = item.month.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }) : [],
    datasets: [
      {
        label: 'New Users',
        data: userGrowth.length > 0 ? userGrowth.map(item => item.newUsers) : [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Total Users',
        data: userGrowth.length > 0 ? userGrowth.map(item => item.totalUsers) : [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
      }
    ]
  };

  const categoryChartData = {
    labels: platformPerformance?.topSellingCategories && platformPerformance.topSellingCategories.length > 0
      ? platformPerformance.topSellingCategories.map(cat => cat.category)
      : [],
    datasets: [
      {
        label: 'Sales (₦)',
        data: platformPerformance?.topSellingCategories && platformPerformance.topSellingCategories.length > 0
          ? platformPerformance.topSellingCategories.map(cat => cat.sales)
          : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',   // Blue
          'rgba(16, 185, 129, 0.9)',   // Green
          'rgba(245, 158, 11, 0.9)',   // Orange
          'rgba(239, 68, 68, 0.9)',    // Red
          'rgba(139, 92, 246, 0.9)',   // Purple
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
      }
    ]
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600">Real-time insights into platform performance</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-500">Last updated</p>
            <p className="text-xs sm:text-sm font-medium text-gray-900">
              {lastUpdated.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              })}
            </p>
          </div>
          <button
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={16} className={`sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Filter size={16} className="text-gray-600 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Time Range:</span>
          </div>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${timeRange === range
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {platformPerformance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-blue-600">
                  {platformPerformance.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-blue-100 flex-shrink-0">
                <TrendingUp size={20} className="text-blue-600 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-green-600">
                  {formatCurrency(platformPerformance.averageOrderValue)}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-green-100 flex-shrink-0">
                <ShoppingCart size={20} className="text-green-600 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Customer Retention</p>
                <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-purple-600">
                  {platformPerformance.customerRetentionRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-purple-100 flex-shrink-0">
                <Users size={20} className="text-purple-600 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Top Categories</p>
                <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-orange-600">
                  {platformPerformance.topSellingCategories.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">Categories tracked</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-orange-100 flex-shrink-0">
                <Star size={20} className="text-orange-600 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Time Series Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Sales Performance</h3>
          {isLoading ? (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="h-64 sm:h-80">
              <Line data={salesChartData} options={salesChartOptions} />
            </div>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">User Growth</h3>
          {isLoading ? (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="h-64 sm:h-80">
              <Line data={userGrowthChartData} options={userGrowthChartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Top Selling Categories</h3>
          {isLoading ? (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="h-64 sm:h-80">
                <Bar data={categoryChartData} options={categoryChartOptions} />
              </div>
              {/* Custom Legend */}
              {platformPerformance?.topSellingCategories && platformPerformance.topSellingCategories.length > 0 && (
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    {platformPerformance.topSellingCategories.map((category, index) => (
                      <div key={category.category} className="flex items-center gap-1 sm:gap-2">
                        <div
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm"
                          style={{
                            backgroundColor: categoryChartData.datasets[0].backgroundColor[index] || '#3B82F6'
                          }}
                        ></div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {category.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          ₦{formatCurrency(category.sales)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Top Products (Replaces Top Vendors) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Selling Products</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm">
              <Download size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 animate-pulse">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 mb-1 sm:mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-24 sm:w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-screen overflow-y-auto">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold ${index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(product.totalSales)} • {product.totalOrders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star size={12} className="text-yellow-400 fill-current sm:w-3.5 sm:h-3.5" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No sales data available yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {platformPerformance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Category Performance Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-gray-700">Category</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-gray-700">Total Sales</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-gray-700">Orders</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-gray-700">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {platformPerformance.topSellingCategories.map((category, index) => (
                  <tr key={category.category} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}></div>
                        <span className="font-medium text-xs sm:text-sm text-gray-900">{category.category}</span>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium text-xs sm:text-sm text-gray-900">
                      {formatCurrency(category.sales)}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm text-gray-600">
                      {formatNumber(category.orders)}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm text-gray-600">
                      {formatCurrency(category.orders > 0 ? category.sales / category.orders : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 