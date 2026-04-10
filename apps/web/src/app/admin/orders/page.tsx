"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Package,
  MapPin,
  CalendarDays
} from "lucide-react";
import { apiGet, apiPost, apiPut } from "@/utils/api";
import { formatCurrency } from "@/utils/format";
import { getCountryPhoneCode } from "@/utils/countryData";

interface Order {
  _id: string;
  orderNumber: string;
  itemCount: number;
  buyer: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
  guestEmail?: string;
  vendor: {
    _id: string;
    username?: string;
    storeName?: string;
  };
  status: string;
  paymentStatus: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  lineItems: Array<{
    productId: string;
    productTitle?: string;
    productImage?: string;
    qty: number;
    unitPrice: number;
  }>;
  shippingDetails?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: String;
    zipCode?: string;
    phone?: string;
  };
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [loading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const getOrdersApiBase = () => {
    try {
      const raw = localStorage.getItem('afritrade:user');
      if (!raw) return '/api/v1/admin/orders';
      const user = JSON.parse(raw);
      return user.role === 'order_manager' ? '/api/v1/order-manager/orders' : '/api/v1/admin/orders';
    } catch {
      return '/api/v1/admin/orders';
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [currentPage, statusFilter, dateRange]);

  // Handle clicking outside date pickers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.date-picker-container')) {
        setShowFromPicker(false);
        setShowToPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString()
      });

      if (statusFilter) params.append("status", statusFilter);
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);
      if (searchTerm) params.append("q", searchTerm);

      const response = await apiGet(`${getOrdersApiBase()}?${params.toString()}`) as any;

      if (response.data) {
        setOrders(response.data.orders || []);
        setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await apiGet(`${getOrdersApiBase()}/stats`) as any;
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      await apiPut(`${getOrdersApiBase()}/${orderId}/status`, { status: newStatus });

      // Update local state
      setOrders(prev => prev.map(order =>
        order._id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));

      // Update selected order if it's the one being updated
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null);
      }

      // Refresh stats
      fetchOrderStats();

      // Show success message
      setSuccessMessage(`Order status updated to ${newStatus}`);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      setErrorMessage(error?.message || "Failed to update order status. Please try again.");
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrderCancel = async () => {
    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      await apiPost(`${getOrdersApiBase()}/${selectedOrder._id}/cancel`, {});
      fetchOrders(); // Refresh orders to show updated status
      fetchOrderStats(); // Refresh stats
      setShowCancelModal(false);
      setSuccessMessage(`Order #${selectedOrder.orderNumber || 'N/A'} has been successfully cancelled.`);
      setShowSuccessModal(true);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setSuccessMessage(`Failed to cancel order #${selectedOrder.orderNumber || 'N/A'}. Please try again.`);
      setShowSuccessModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrderRefund = async () => {
    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      // Using POST /api/v1/admin/orders/:id/refund (processRefund)
      // This is the simple admin refund endpoint that:
      // - Requires no request body
      // - Uses default "Admin refund" reason
      // - Refunds full order amount
      // - Perfect for quick admin actions from the orders page
      await apiPost(`${getOrdersApiBase()}/${selectedOrder._id}/refund`, {});
      fetchOrders(); // Refresh orders to show updated status
      fetchOrderStats(); // Refresh stats
      setShowRefundModal(false);
      setSuccessMessage(`Refund for order #${selectedOrder.orderNumber || 'N/A'} has been successfully processed.`);
      setShowSuccessModal(true);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error processing refund:", error);
      setSuccessMessage(`Failed to process refund for order #${selectedOrder.orderNumber || 'N/A'}. Please try again.`);
      setShowSuccessModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={16} />;
      case 'processing': return <RefreshCw size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      case 'refunded': return <DollarSign size={16} />;
      default: return <Clock size={16} />;
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateRange({ from: "", to: "" });
    setCurrentPage(1);
  };

  const formatDisplay = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Minimal calendar popover (no dependency) - matching user orders page
  const Calendar = ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => {
    const today = new Date(value || Date.now());
    const [y, setY] = useState(today.getFullYear());
    const [m, setM] = useState(today.getMonth());
    const first = new Date(y, m, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const leading: (number | null)[] = Array.from({ length: startDay }, () => null);
    const days: (number | null)[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weeks: (number | null)[] = leading.concat(days);
    const rows = Math.ceil(weeks.length / 7);
    const grid: (number | null)[][] = Array.from({ length: rows }, (_, r) => weeks.slice(r * 7, r * 7 + 7));
    const pad = (n: number) => String(n).padStart(2, '0');
    const sel = value ? new Date(value) : null;
    const isSel = (d: number) => sel && sel.getFullYear() === y && sel.getMonth() === m && sel.getDate() === d;
    const label = new Date(y, m, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });

    return (
      <div className="w-full select-none">
        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => setM((mm) => (mm === 0 ? (setY(y - 1), 11) : mm - 1))} className="rounded-full p-1 hover:bg-gray-100">
            <ChevronLeft size={16} />
          </button>
          <div className="text-sm font-semibold">{label}</div>
          <button onClick={() => setM((mm) => (mm === 11 ? (setY(y + 1), 0) : mm - 1))} className="rounded-full p-1 hover:bg-gray-100">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-500">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
          {grid.flat().map((d, i) => (
            <button
              key={i}
              disabled={!d}
              onClick={() => onChange(`${y}-${pad(m + 1)}-${pad(d!)}`)}
              className={`h-8 rounded ${!d ? 'opacity-0' : isSel(d!) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {d || ''}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="tmt-1 ext-sm sm:text-base text-gray-600">Monitor platform orders and handle administrative actions (refunds, cancellations)</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 mt-1">Note: Order status updates are handled by vendors</p>
          </div>
          <button
            onClick={() => { fetchOrders(); fetchOrderStats(); }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw size={14} className="mr-2 sm:w-4 sm:h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <ShoppingCart size={20} className="text-blue-600 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <DollarSign size={20} className="text-green-600 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <Truck size={20} className="text-purple-600 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <CheckCircle size={20} className="text-orange-600 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.deliveredOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder="Order #, customer, vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* From date */}
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">From Date</label>
              <div className="group relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm shadow-sm transition hover:border-gray-400 date-picker-container w-full">
                <CalendarDays size={14} className="mr-2 text-gray-500 sm:w-4 sm:h-4" />
                <button
                  type="button"
                  onClick={() => {
                    setShowFromPicker((v) => !v);
                    setShowToPicker(false);
                  }}
                  className="flex-1 text-left text-gray-800 outline-none truncate"
                >
                  {formatDisplay(dateRange.from) || 'From'}
                </button>
                {showFromPicker && (
                  <div className="absolute left-0 top-[110%] z-[9999] w-[18rem] rounded-xl border border-gray-200 bg-white p-3 shadow-2xl">
                    <div className="fixed inset-0 z-[9998] bg-transparent" onClick={() => setShowFromPicker(false)}></div>
                    <div className="relative z-[9999]" onClick={(e) => e.stopPropagation()}>
                      <Calendar
                        value={dateRange.from}
                        onChange={(date) => {
                          setDateRange(prev => ({ ...prev, from: date }));
                          setShowFromPicker(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* To date */}
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">To Date</label>
              <div className="group relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm shadow-sm transition hover:border-gray-400 date-picker-container w-full">
                <CalendarDays size={14} className="mr-2 text-gray-500 sm:w-4 sm:h-4" />
                <button
                  type="button"
                  onClick={() => {
                    setShowToPicker((v) => !v);
                    setShowFromPicker(false);
                  }}
                  className="flex-1 text-left text-gray-800 outline-none truncate"
                >
                  {formatDisplay(dateRange.to) || 'To'}
                </button>
                {showToPicker && (
                  <div className="absolute left-0 top-[110%] z-[9999] w-[18rem] rounded-xl border border-gray-200 bg-white p-3 shadow-2xl">
                    <div className="fixed inset-0 z-[9998] bg-transparent" onClick={() => setShowToPicker(false)}></div>
                    <div className="relative z-[9999]" onClick={(e) => e.stopPropagation()}>
                      <Calendar
                        value={dateRange.to}
                        onChange={(date) => {
                          setDateRange(prev => ({ ...prev, to: date }));
                          setShowToPicker(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-2 sm:gap-3">
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Orders</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No orders found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              #{order.orderNumber || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.itemCount || 0} item{(order.itemCount || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.buyer?.firstName || order.buyer?.username || (order.guestEmail ? 'Guest User' : 'Unknown User')} {order.buyer?.lastName || ''}
                            </p>
                            <p className="text-sm text-gray-500">{order.buyer?.email || order.guestEmail || 'No email'}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                            {order.paymentStatus === 'refunded' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <DollarSign size={12} className="mr-1" />
                                Refunded
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            ₦{formatCurrency(order.totalPrice)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Order Details"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Administrative Actions Only */}
                            {order.status !== 'cancelled' && order.status !== 'refunded' && (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowCancelModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel Order (Admin)"
                              >
                                <XCircle size={16} />
                              </button>
                            )}

                            {order.status === 'delivered' && order.paymentStatus !== 'refunded' && (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowRefundModal(true);
                                }}
                                className="text-orange-600 hover:text-orange-900"
                                title="Process Refund"
                              >
                                <DollarSign size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            #{order.orderNumber || 'N/A'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {order.itemCount || 0} item{(order.itemCount || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                          {order.paymentStatus === 'refunded' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <DollarSign size={12} className="mr-1" />
                              Refunded
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Customer:</span>
                          <span className="text-gray-900 font-medium">
                            {order.buyer?.firstName || order.buyer?.username || (order.guestEmail ? 'Guest User' : 'Unknown User')} {order.buyer?.lastName || ''}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="text-gray-900 font-semibold">
                            ₦{formatCurrency(order.totalPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Eye size={14} />
                          View Details
                        </button>

                        <div className="flex items-center gap-2">
                          {/* Administrative Actions Only */}
                          {order.status !== 'cancelled' && order.status !== 'refunded' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowCancelModal(true);
                              }}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Order (Admin)"
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          {order.status === 'delivered' && order.paymentStatus !== 'refunded' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowRefundModal(true);
                              }}
                              className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Process Refund"
                            >
                              <DollarSign size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                } border`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowOrderModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
              <div className="space-y-4 sm:space-y-6">
                {/* Order Header */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={24} className="text-blue-600 sm:w-8 sm:h-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                      Order #{selectedOrder.orderNumber || 'N/A'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">Created {formatDate(selectedOrder.createdAt)}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                      <span className={`w-fit inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1 capitalize">{selectedOrder.status}</span>
                      </span>
                      <span className="w-fit inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {formatCurrency(selectedOrder.totalPrice, selectedOrder.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Information Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {/* Customer Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Customer Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-blue-600">
                            {(selectedOrder.buyer?.firstName || selectedOrder.buyer?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {selectedOrder.buyer?.firstName && selectedOrder.buyer?.lastName
                              ? `${selectedOrder.buyer.firstName} ${selectedOrder.buyer.lastName}`
                              : selectedOrder.buyer?.username || (selectedOrder.guestEmail ? 'Guest User' : 'Unknown User')
                            }
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedOrder.buyer?.email || selectedOrder.guestEmail || 'No email'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status Update */}
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'refunded' && (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Update Order Status</h4>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <p className="mt-2 text-xs text-gray-500">Update the order status to track fulfillment progress</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Order Items</h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    {selectedOrder.lineItems && selectedOrder.lineItems.length > 0 ? (
                      <div className="space-y-3">
                        {selectedOrder.lineItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package size={16} className="text-gray-500 sm:w-5 sm:h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.productTitle || 'Product'}</p>
                                <p className="text-xs sm:text-sm text-gray-600">Qty: {item.qty}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {formatCurrency(item.unitPrice, selectedOrder.currency)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Total: {formatCurrency(item.unitPrice * item.qty, selectedOrder.currency)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4 text-sm sm:text-base">No items found</p>
                    )}
                  </div>
                </div>

                {/* Shipping Information */}
                {selectedOrder.shippingDetails && (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Shipping Address</h4>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" />
                        <div className="text-xs sm:text-sm text-gray-600 min-w-0 flex-1">
                          <p className="break-words">{selectedOrder.shippingDetails.address}</p>
                          <p className="break-words">{selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state}</p>
                          <p className="break-words">{selectedOrder.shippingDetails.country} {selectedOrder.shippingDetails.postalCode || selectedOrder.shippingDetails.zipCode}</p>
                          {selectedOrder.shippingDetails.phone && (
                            <p className="break-words text-gray-500 mt-1 flex items-center gap-1">
                              <span className="text-xs">📞</span> {getCountryPhoneCode(selectedOrder.shippingDetails.country)} {selectedOrder.shippingDetails.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.totalPrice, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Status:</span>
                      <div className="flex flex-col gap-1 items-end">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1 capitalize">{selectedOrder.status}</span>
                        </span>
                        {selectedOrder.paymentStatus === 'refunded' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            <DollarSign size={12} className="mr-1" />
                            Refunded
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                    )}
                    {selectedOrder.paymentStatus === 'refunded' && (
                      <>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="text-gray-600">Refund Amount:</span>
                          <span className="font-medium text-orange-600">
                            {formatCurrency(selectedOrder.refundAmount || selectedOrder.totalPrice, selectedOrder.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="text-gray-600">Refund Reason:</span>
                          <span className="font-medium text-gray-900 text-right max-w-48 truncate">
                            {selectedOrder.refundReason || 'Admin refund'}
                          </span>
                        </div>
                        {selectedOrder.refundedAt && (
                          <div className="flex justify-between text-sm sm:text-base">
                            <span className="text-gray-600">Refunded At:</span>
                            <span className="font-medium">{formatDate(selectedOrder.refundedAt)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-gray-200">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle size={16} className="text-red-600 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Cancel Order</h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-3 sm:p-6">
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                  Are you sure you want to cancel order <strong>#{selectedOrder.orderNumber || 'N/A'}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                  <p className="text-xs sm:text-sm text-red-800 font-medium mb-1">Warning:</p>
                  <ul className="text-xs sm:text-sm text-red-700 space-y-1 ml-3 sm:ml-4">
                    <li>• This action cannot be undone</li>
                    <li>• The order will be marked as cancelled</li>
                    <li>• Customer will be notified of the cancellation</li>
                    <li>• Any pending payments will be refunded</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-row items-center gap-2 sm:gap-3">
                <button
                  onClick={handleOrderCancel}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {actionLoading ? "Cancelling..." : "Cancel Order"}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Keep Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Confirmation Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowRefundModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-gray-200">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign size={16} className="text-orange-600 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Process Refund</h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Refund order payment</p>
              </div>
            </div>

            <div className="p-3 sm:p-6">
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                  Are you sure you want to process a refund for order <strong>#{selectedOrder.orderNumber || 'N/A'}</strong>?
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
                  <p className="text-xs sm:text-sm text-orange-800 font-medium mb-1">Refund Details:</p>
                  <ul className="text-xs sm:text-sm text-orange-700 space-y-1 ml-3 sm:ml-4">
                    <li>• Order total: {formatCurrency(selectedOrder.totalPrice, selectedOrder.currency)}</li>
                    <li>• Refund will be processed to original payment method</li>
                    <li>• Customer will be notified of the refund</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-row items-center gap-2 sm:gap-3">
                <button
                  onClick={handleOrderRefund}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {actionLoading ? "Processing..." : "Process Refund"}
                </button>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-gray-200">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={16} className="text-green-600 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Action Completed</h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Order management action</p>
              </div>
            </div>

            <div className="p-3 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <div className="w-fit mx-auto bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                  <p className="text-xs sm:text-sm text-green-800 text-center">
                    {successMessage}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setShowOrderModal(false);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowErrorModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-gray-200">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle size={16} className="text-red-600 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Action Failed</h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Unable to complete request</p>
              </div>
            </div>

            <div className="p-3 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                  <p className="text-xs sm:text-sm text-red-800 text-center">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 
