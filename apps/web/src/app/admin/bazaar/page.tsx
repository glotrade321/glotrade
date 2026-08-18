"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Ticket,
  DollarSign,
  Users,
  Store,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  Save,
  Loader2,
  RefreshCw,
  Power,
  Clock,
  Filter,
  MessageSquare,
  Camera,
} from "lucide-react";
import { apiGet, apiPut, apiPost, apiPatch } from "@/utils/api";
import QRCodeScanner from "@/components/wallet/QRCodeScanner";

export default function AdminBazaarPage() {
  // Stats
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Seasonal Controls Config
  const [config, setConfig] = useState<any>({
    isPortalActive: true,
    ticketSalesActive: true,
    exhibitorApplicationsActive: true,
    sponsorshipActive: true,
    inactiveMessage: "",
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState<string | null>(null);

  // Gate Check-In Tool State
  const [ticketInput, setTicketInput] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState<any>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const handleScanQRData = (data: any) => {
    setShowCameraScanner(false);
    let extractedCode = "";
    if (typeof data === "string") {
      extractedCode = data;
    } else if (data?.code || data?.ticketCode || data?.text) {
      extractedCode = data.code || data.ticketCode || data.text;
    }

    if (extractedCode.includes("code=")) {
      try {
        const urlObj = new URL(extractedCode);
        extractedCode = urlObj.searchParams.get("code") || extractedCode;
      } catch {
        const match = extractedCode.match(/code=([^&]+)/);
        if (match) extractedCode = match[1];
      }
    }

    if (extractedCode) {
      setTicketInput(extractedCode.trim());
      executeCheckIn(extractedCode.trim());
    }
  };

  // Bookings List
  const [activeTab, setActiveTab] = useState<"ticket" | "exhibitor" | "sponsorship" | "contact">("ticket");
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Stats & Config
  const loadStatsAndConfig = async () => {
    try {
      const [statsRes, configRes]: any[] = await Promise.all([
        apiGet("/api/v1/bazaar/admin/stats"),
        apiGet("/api/v1/bazaar/config"),
      ]);
      if (statsRes?.data) setStats(statsRes.data);
      if (configRes?.data) setConfig(configRes.data);
    } catch (err) {
      console.error("Failed to load bazaar admin data:", err);
    } finally {
      setStatsLoading(false);
      setConfigLoading(false);
    }
  };

  // Fetch Bookings
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const query: any = {
        type: activeTab,
        page,
        limit: 15,
      };
      if (searchTerm) query.search = searchTerm;
      if (statusFilter !== "all") query.paymentStatus = statusFilter;

      const res: any = await apiGet("/api/v1/bazaar/admin/bookings", { query });
      if (res?.data) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadStatsAndConfig();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [activeTab, page, statusFilter]);

  // Save Seasonal Controls
  const handleSaveConfig = async () => {
    setConfigSaving(true);
    setConfigMsg(null);
    try {
      const res: any = await apiPut("/api/v1/bazaar/admin/config", config);
      if (res?.data) {
        setConfig(res.data);
        setConfigMsg("Seasonal portal settings updated successfully.");
      }
    } catch (err: any) {
      setConfigMsg(err?.message || "Failed to update settings.");
    } finally {
      setConfigSaving(false);
    }
  };

  const executeCheckIn = async (codeToVerify: string) => {
    setCheckInLoading(true);
    setCheckInResult(null);

    try {
      const res: any = await apiPost("/api/v1/bazaar/admin/check-in", {
        code: codeToVerify.trim(),
      });
      setCheckInResult({
        success: res?.status === "success",
        message: res?.message || "Check-in response received",
        data: res?.data,
      });
      if (res?.status === "success") {
        setTicketInput("");
        loadStatsAndConfig();
        loadBookings();
      }
    } catch (err: any) {
      setCheckInResult({
        success: false,
        message: err?.message || "Check-in failed.",
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    executeCheckIn(ticketInput);
  };

  // Toggle booking payment or checkin status
  const handleUpdateBooking = async (id: string, payload: any) => {
    try {
      await apiPatch(`/api/v1/bazaar/admin/bookings/${id}`, payload);
      loadBookings();
      loadStatsAndConfig();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="text-blue-600" size={28} /> GloTrade Bazaar Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage event portal seasonal visibility, ticket sales, stall bookings, and gate check-ins.
            </p>
          </div>
          <button
            onClick={() => {
              loadStatsAndConfig();
              loadBookings();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* SECTION 1: Seasonal Controls Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Power className="text-amber-500" size={20} /> Seasonal Portal Accessibility Controls
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                config.isPortalActive
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              Portal Status: {config.isPortalActive ? "ONLINE / ACTIVE" : "OFF-SEASON / INACTIVE"}
            </span>
          </div>

          {configMsg && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-200">
              {configMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Master Portal Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Event Portal Active</span>
                <input
                  type="checkbox"
                  checked={config.isPortalActive}
                  onChange={(e) => setConfig({ ...config, isPortalActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Master switch for `/bazaar` accessibility.</p>
            </div>

            {/* Ticket Sales Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Ticket Sales</span>
                <input
                  type="checkbox"
                  checked={config.ticketSalesActive}
                  onChange={(e) => setConfig({ ...config, ticketSalesActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable or pause ticket purchases.</p>
            </div>

            {/* Exhibitors Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Exhibitor Applications</span>
                <input
                  type="checkbox"
                  checked={config.exhibitorApplicationsActive}
                  onChange={(e) =>
                    setConfig({ ...config, exhibitorApplicationsActive: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable or pause booth bookings.</p>
            </div>

            {/* Sponsorship Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Sponsorship Enquiries</span>
                <input
                  type="checkbox"
                  checked={config.sponsorshipActive}
                  onChange={(e) => setConfig({ ...config, sponsorshipActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable sponsorship applications.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-700">
              Custom Off-Season Announcement Message (Displayed on `/bazaar` when Portal is Inactive)
            </label>
            <input
              type="text"
              value={config.inactiveMessage}
              onChange={(e) => setConfig({ ...config, inactiveMessage: e.target.value })}
              placeholder="e.g. GloTrade Bazaar Abuja 2026 portal is currently offline..."
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={handleSaveConfig}
              disabled={configSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm inline-flex items-center gap-2"
            >
              {configSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Controls & Settings
            </button>
          </div>
        </div>

        {/* SECTION 2: Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Total Revenue</span>
              <DollarSign className="text-emerald-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ₦{(stats?.totalRevenue || 0).toLocaleString("en-NG")}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Tickets Sold</span>
              <Ticket className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalTickets || 0}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Exhibitors</span>
              <Store className="text-purple-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalExhibitors || 0}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Sponsorships</span>
              <Award className="text-amber-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalSponsorships || 0}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Checked-in</span>
              <Users className="text-teal-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalCheckedIn || 0}</p>
          </div>
        </div>

        {/* SECTION 3: Gate Ticket Check-in Scanner Tool */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="text-amber-400" size={22} />
            <h2 className="text-base font-bold text-white">Event Gate Ticket Verification & Check-in</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Enter the 8-character Ticket Code (e.g. `GTB-XXXXXX`) or transaction reference to verify guest entry.
          </p>

          <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="e.g. GTB-A1B2C3"
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCameraScanner(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Camera size={18} /> Scan QR Code
            </button>
            <button
              type="submit"
              disabled={checkInLoading}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {checkInLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Verify & Check In Guest
            </button>
          </form>

          {showCameraScanner && (
            <QRCodeScanner
              onScan={handleScanQRData}
              onClose={() => setShowCameraScanner(false)}
            />
          )}

          {checkInResult && (
            <div
              className={`mt-4 p-4 rounded-lg text-sm border flex items-start gap-3 ${
                checkInResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {checkInResult.success ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <div>
                <p className="font-bold">{checkInResult.message}</p>
                {checkInResult.data && (
                  <p className="text-xs text-slate-300 mt-1">
                    Guest: <span className="font-bold text-white">{checkInResult.data.customerName}</span> | Package: {checkInResult.data.packageName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Bookings Management Data Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
            <button
              onClick={() => {
                setActiveTab("ticket");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "ticket"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Ticket size={16} /> Tickets ({stats?.totalTickets || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("exhibitor");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "exhibitor"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Store size={16} /> Exhibitor Stalls ({stats?.totalExhibitors || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("sponsorship");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "sponsorship"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Award size={16} /> Sponsorships ({stats?.totalSponsorships || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("contact");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "contact"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageSquare size={16} /> Contact Messages ({stats?.totalContacts || 0})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search name, email, ref, or ticket code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadBookings()}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            {bookingsLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={24} />
                Loading records...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No records found.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Code / Ref</th>
                    <th className="px-4 py-3">Customer Info</th>
                    <th className="px-4 py-3">Package & Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Gate Check-In</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className="font-bold text-blue-600 block">{item.ticketCode}</span>
                        <span className="text-gray-400 text-[10px]">{item.reference}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.customerName}</p>
                        <p className="text-xs text-gray-500">{item.customerEmail} • {item.customerPhone}</p>
                        {item.businessName && (
                          <p className="text-xs text-purple-600 font-medium">Biz: {item.businessName}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.packageName}</p>
                        <p className="text-xs font-bold text-emerald-600">
                          ₦{item.amount.toLocaleString("en-NG")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            item.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : item.paymentStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.checkInStatus === "checked_in"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.checkInStatus === "checked_in" ? "Checked-In" : "Pending Gate"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {item.paymentStatus !== "paid" && (
                          <button
                            onClick={() => handleUpdateBooking(item._id, { paymentStatus: "paid" })}
                            className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded text-xs font-medium border border-green-200"
                          >
                            Mark Paid
                          </button>
                        )}
                        {item.checkInStatus !== "checked_in" && item.paymentStatus === "paid" && (
                          <button
                            onClick={() => handleUpdateBooking(item._id, { checkInStatus: "checked_in" })}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200"
                          >
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
