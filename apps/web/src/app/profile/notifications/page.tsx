// apps/web/src/app/profile/notifications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Archive, Trash2, Search, Settings, ArrowLeft } from 'lucide-react';
// No useAuth hook needed - using localStorage directly like other components
import { apiGet, apiPost, apiPatch, apiDelete } from '@/utils/api';
import { getStoredLocale, Locale } from '@/utils/i18n';
import NotificationPreferencesModal from '@/components/common/NotificationPreferencesModal';

interface AppNotification {
  _id: string;
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  type: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  createdAt: string;
  payload?: any;
}

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [locale, setLocale] = useState<Locale>("en");

  const notificationsPerPage = 20;

  // ... (useEffect for user, locale remains same)

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: notificationsPerPage.toString(),
        offset: ((currentPage - 1) * notificationsPerPage).toString()
      });

      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (typeFilter !== 'all') queryParams.append('type', typeFilter);
      if (priorityFilter !== 'all') queryParams.append('priority', priorityFilter);

      const data = await apiGet<any>(`/api/v1/notifications?${queryParams.toString()}`);
      setNotifications(data.data.notifications || []);
      setTotalNotifications(data.data.total || 0);
      setTotalPages(Math.ceil((data.data.total || 0) / notificationsPerPage));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await apiGet<any>(`/api/v1/notifications/unread-count`);
      setUnreadCount(data.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiPatch(`/api/v1/notifications/${notificationId}/read`, {});
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, status: 'read' as const } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiPost(`/api/v1/notifications/mark-all-read`, {});
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' as const }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      await apiPatch(`/api/v1/notifications/${notificationId}/archive`, {});
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const notification = notifications.find(n => n._id === notificationId);
      if (notification?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await apiDelete(`/api/v1/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const notification = notifications.find(n => n._id === notificationId);
      if (notification?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Load user preferences
  const loadUserPreferences = async () => {
    try {
      const data = await apiGet<any>(`/api/v1/user-preferences`);
      setUserPreferences(data.data.preferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  // Load preferences when component mounts
  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
    }
  }, [user?.id]);

  // Notification preferences functions
  const handleSavePreferences = async (preferences: any) => {
    try {
      await apiPost(`/api/v1/user-preferences`, { preferences });
      setShowPreferences(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-500';
      case 'read': return 'bg-gray-400';
      case 'archived': return 'bg-gray-300';
      default: return 'bg-gray-400';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const notificationTypes = [
    'order_placed', 'order_confirmed', 'order_processing', 'order_shipped', 'order_delivered',
    'payment_pending', 'payment_confirmed', 'payment_failed', 'product_created', 'product_updated',
    'new_review', 'login_alert', 'message_received', 'support_ticket'
  ];

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to view your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => window.location.href = '/profile'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage your notifications and preferences</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowPreferences(true)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
                <span className="sm:hidden">Preferences</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalNotifications}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-xs sm:text-sm text-gray-600">Unread</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-gray-600">{notifications.filter(n => n.status === 'read').length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Read</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-gray-500">{notifications.filter(n => n.status === 'archived').length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Archived</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${notification.status === 'unread' ? 'bg-blue-50' : ''
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <span className={`w-3 h-3 rounded-full ${getStatusColor(notification.status)}`} />
                          <span className={`px-2 sm:px-3 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Content */}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          {notification.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-3">
                          {notification.message}
                        </p>

                        {/* Type */}
                        <div className="text-xs sm:text-sm text-gray-500">
                          Type: {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-start sm:justify-end gap-2 sm:ml-4">
                        {notification.status === 'unread' && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => archiveNotification(notification._id)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Showing {((currentPage - 1) * notificationsPerPage) + 1} to {Math.min(currentPage * notificationsPerPage, totalNotifications)} of {totalNotifications} results
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handleSavePreferences}
        initialPreferences={userPreferences}
        locale={locale}
      />
    </div>
  );
} 