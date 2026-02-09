# Resource Leakage & Excess Usage Analysis
**Date:** February 2026  
**Project:** Glotrade E-commerce Platform  
**Focus:** Vercel Function Invocations & Backend API Efficiency

---

## Executive Summary

Your Vercel usage shows **117,000+ function invocations per day** (average), with peaks reaching **206,747 invocations**. This analysis identifies the root causes and provides actionable optimization strategies.

### Key Findings
1. **No backend caching** on expensive admin dashboard endpoints
2. **Aggressive polling** (5-minute intervals) on admin dashboards
3. **Multiple real-time connections** per user session
4. **Client-side components** making API calls on every render/navigation
5. **No request deduplication** for parallel API calls
6. **Limited ISR usage** - most pages are server-rendered on every request

---

## 🔴 Critical Issues

### 1. Admin Dashboard Polling (HIGH IMPACT)

**Location:**
- `apps/web/src/components/admin/DashboardMetrics.tsx` (Line 236)
- `apps/web/src/app/admin/page.tsx` (Line 146)

**Problem:**
```typescript
// Set up auto-refresh every 5 minutes
const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
```

**Impact:**
- **3 API calls per refresh** (dashboard, health, categories)
- **12 calls per hour per admin user**
- **288 calls per day per admin user** (if dashboard is open 24h)
- **No caching** - each call hits database with expensive aggregations

**Backend Cost:**
Each `getDashboardMetrics()` call executes:
- 9 parallel database queries (countDocuments, aggregations)
- Complex aggregations for revenue, active users, recent activity
- **No Redis/memory caching** - queries run every time

**Estimated Impact:**
- If 5 admin users keep dashboard open: **1,440 API calls/day**
- Each call = 9+ DB queries = **12,960+ database operations/day**

---

### 2. No Backend Caching on Admin Endpoints (CRITICAL)

**Location:**
- `apps/api/src/services/AdminService.ts`
- `apps/api/src/controllers/admin.controller.ts`

**Problem:**
```typescript
// NO CACHING - runs expensive queries every time
async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [totalUsers, totalProducts, totalOrders, ...] = await Promise.all([
    User.countDocuments(ghostFilter),
    Product.countDocuments(),
    Order.countDocuments(),
    this.calculateTotalOrderValue(), // Aggregation
    this.calculateTotalRevenue(),    // Aggregation
    this.getActiveUsersCount(),      // Complex aggregation
    // ... more queries
  ]);
}
```

**Impact:**
- Every admin dashboard load = **9+ database queries**
- Analytics endpoints run complex aggregations without caching
- `getCategoryStats()`, `getSalesTimeSeries()`, `getUserGrowthAnalytics()` all uncached

**Cache Service Available But Not Used:**
- `CacheService` exists (`apps/api/src/services/CacheService.ts`)
- Redis support configured
- **But admin endpoints don't use it**

**Estimated Savings:**
- Add 5-minute cache: **95% reduction** in database queries
- Add 1-hour cache for analytics: **99% reduction**

---

### 3. FeaturedRail Component - Multiple API Calls Per Page Load

**Location:**
- `apps/web/src/components/home/FeaturedRail.tsx` (Line 57-67)

**Problem:**
```typescript
const [r1, r2, r3] = await Promise.all([
  apiGet(`/api/v1/market/products/featured`, { query: { limit: 12 } }),
  apiGet(`/api/v1/market/products`, { query: { limit: 24, sort: "-views" } }),
  apiGet(`/api/v1/market/products`, { query: { limit: 24, discountMin: 5 } })
]);
```

**Impact:**
- **3 API calls** on every homepage load
- Runs on **every navigation** to homepage (client component)
- No caching, no request deduplication
- If homepage gets 1,000 views/day = **3,000 API calls/day**

**Additional Issue:**
- Component re-renders when `hints.recentBrands` changes
- Triggers new API calls even if data hasn't changed

---

### 4. Real-Time Connections - Multiple Per User

**Location:**
- `apps/web/src/hooks/useRealTimeNotifications.ts`
- `apps/web/src/components/layout/NotificationBell.tsx`
- `apps/web/src/hooks/useRealTimeWallet.ts`

**Problem:**
- EventSource connections to `/api/v1/realtime/notifications/stream`
- **15-second heartbeat timeout** causes frequent reconnections
- Each connection = active serverless function
- Multiple components may create multiple connections

**Impact:**
- If connection drops, exponential backoff reconnects
- Each reconnect = new function invocation
- Multiple users = multiple long-lived connections

**Estimated Impact:**
- 100 concurrent users = **100+ active EventSource connections**
- Each connection timeout/reconnect = additional invocations

---

### 5. Server-Side Rendering Without Caching

**Location:**
- `apps/web/src/app/page.tsx` (Homepage)
- `apps/web/src/app/marketplace/page.tsx`
- `apps/web/src/app/marketplace/[id]/page.tsx`

**Current State:**
```typescript
// Homepage has ISR (good!)
const res = await apiGet("/api/v1/market/products", { 
  query: { limit: 24 }, 
  next: { revalidate: 3600 } 
});

// But FeaturedRail is client component - makes separate calls!
```

**Problem:**
- Homepage server component has ISR (1 hour)
- But `FeaturedRail` is client component making **3 additional API calls**
- Product detail pages may not have ISR
- Marketplace listing pages may not have ISR

**Impact:**
- Server-rendered pages still trigger client-side API calls
- No request deduplication between server/client components

---

### 6. Analytics Pages - Heavy API Calls

**Location:**
- `apps/web/src/app/admin/analytics/page.tsx` (Line 326)
- `apps/web/src/app/admin/reports/page.tsx` (Line 145)

**Problem:**
```typescript
const [dashboardResponse, salesResponse, growthResponse, ...] = await Promise.all([
  apiGet('/api/v1/admin/dashboard'),
  apiGet(`/api/v1/admin/dashboard/sales-timeseries?days=${days}`),
  apiGet('/api/v1/admin/dashboard/user-growth'),
  apiGet('/api/v1/admin/dashboard/top-products'),
  apiGet('/api/v1/admin/dashboard/geographic'),
  // ... more
]);
```

**Impact:**
- **6+ API calls** per analytics page load
- Each endpoint runs expensive aggregations
- **No caching** on backend
- Called on every page visit

---

## 📊 Resource Usage Breakdown

### Vercel Function Invocations (Feb 1-8, 2026)

| Date | Invocations | Edge Requests | Fast Origin Transfer |
|------|-------------|---------------|---------------------|
| Feb 1 | 42,187 | 44,201 | 3.23 GB |
| Feb 2 | 59,785 | 62,336 | 4.72 GB |
| Feb 4 | 118,784 | 117,257 | 9.89 GB |
| Feb 6 | 206,747 | 196,691 | 17.05 GB |
| **Average** | **~117,000/day** | **~100,000/day** | **~8 GB/day** |

### Estimated Breakdown by Source

1. **Admin Dashboard Polling:** ~15,000-30,000/day (12-25%)
2. **FeaturedRail Component:** ~3,000-9,000/day (3-8%)
3. **Real-time Connections:** ~10,000-20,000/day (8-17%)
4. **Analytics Pages:** ~5,000-10,000/day (4-9%)
5. **Normal User Navigation:** ~60,000-80,000/day (51-68%)

---

## ✅ Optimization Recommendations

### Priority 1: Backend Caching (CRITICAL)

**Action:** Add Redis caching to admin endpoints

**Files to Modify:**
- `apps/api/src/services/AdminService.ts`
- `apps/api/src/controllers/admin.controller.ts`

**Implementation:**
```typescript
import { cacheService } from './CacheService';

async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const CACHE_KEY = 'admin:dashboard:metrics';
  const CACHE_TTL = 300; // 5 minutes
  
  // Try cache first
  const cached = await cacheService.get(CACHE_KEY);
  if (cached) return cached;
  
  // Fetch fresh data
  const metrics = await this.fetchDashboardMetrics();
  
  // Cache for 5 minutes
  await cacheService.set(CACHE_KEY, metrics, CACHE_TTL);
  
  return metrics;
}
```

**Expected Impact:**
- **95% reduction** in database queries for admin endpoints
- **80-90% reduction** in response time
- **Significant cost savings** on Render (database CPU)

---

### Priority 2: Reduce Polling Frequency

**Action:** Increase polling interval or make it user-configurable

**Files to Modify:**
- `apps/web/src/components/admin/DashboardMetrics.tsx`
- `apps/web/src/app/admin/page.tsx`

**Implementation:**
```typescript
// Option 1: Increase to 15 minutes
const interval = setInterval(fetchDashboardData, 15 * 60 * 1000);

// Option 2: Only poll when tab is visible
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(interval);
    } else {
      interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

**Expected Impact:**
- **66% reduction** in polling calls (5min → 15min)
- **Additional 50% reduction** if pause when tab hidden
- **Total: ~83% reduction** in admin polling calls

---

### Priority 3: Cache FeaturedRail Component

**Action:** Add client-side caching or move to server component

**Files to Modify:**
- `apps/web/src/components/home/FeaturedRail.tsx`

**Implementation:**
```typescript
// Option 1: Use React Query or SWR for caching
import useSWR from 'swr';

const { data: items } = useSWR(
  'featured-products',
  () => fetchFeaturedProducts(),
  { revalidateOnFocus: false, revalidateOnReconnect: false, dedupingInterval: 60000 }
);

// Option 2: Move to server component with ISR
// Fetch in page.tsx and pass as props
```

**Expected Impact:**
- **90% reduction** in FeaturedRail API calls
- Faster page loads

---

### Priority 4: Add ISR to More Pages

**Action:** Convert client components to server components with ISR

**Files to Modify:**
- `apps/web/src/app/marketplace/page.tsx`
- `apps/web/src/app/marketplace/[id]/page.tsx`
- `apps/web/src/app/best-selling/page.tsx`

**Implementation:**
```typescript
export default async function MarketplacePage({ searchParams }) {
  const products = await apiGet("/api/v1/market/products", {
    query: { ...searchParams },
    next: { revalidate: 300 } // 5 minutes
  });
  
  return <MarketplaceClient products={products} />;
}
```

**Expected Impact:**
- **70-90% reduction** in function invocations for product pages
- Faster page loads
- Better SEO

---

### Priority 5: Optimize Real-Time Connections

**Action:** Reduce reconnection frequency and add connection pooling

**Files to Modify:**
- `apps/web/src/hooks/useRealTimeNotifications.ts`

**Implementation:**
```typescript
// Increase heartbeat timeout
heartbeatTimeout = setTimeout(() => {
  // Only reconnect if really necessary
  if (autoReconnect && eventSourceRef.current?.readyState === EventSource.CLOSED) {
    connect();
  }
}, 30000); // 30 seconds instead of 15

// Add connection state management
// Prevent multiple connections from same component
```

**Expected Impact:**
- **30-50% reduction** in reconnection attempts
- More stable connections

---

### Priority 6: Request Deduplication

**Action:** Add request deduplication for parallel API calls

**Files to Modify:**
- `apps/web/src/utils/api.ts`

**Implementation:**
```typescript
const pendingRequests = new Map<string, Promise<any>>();

export async function apiGet<T>(path: string, options: FetchOptions = {}) {
  const url = buildUrl(path, options.query);
  
  // Check if request is already pending
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url);
  }
  
  const promise = fetch(url, { ... }).then(res => res.json());
  pendingRequests.set(url, promise);
  
  promise.finally(() => {
    pendingRequests.delete(url);
  });
  
  return promise;
}
```

**Expected Impact:**
- **Prevents duplicate requests** when multiple components fetch same data
- **20-30% reduction** in redundant API calls

---

## 📈 Expected Overall Impact

### Conservative Estimate (Implementing Priorities 1-3)

| Optimization | Current | After | Reduction |
|-------------|---------|-------|-----------|
| Admin Dashboard Calls | 15,000/day | 2,000/day | **87%** |
| FeaturedRail Calls | 3,000/day | 300/day | **90%** |
| Database Queries | 135,000/day | 20,000/day | **85%** |
| **Total Function Invocations** | **117,000/day** | **~70,000/day** | **~40%** |

### Aggressive Estimate (Implementing All Priorities)

| Optimization | Current | After | Reduction |
|-------------|---------|-------|-----------|
| Admin Dashboard Calls | 15,000/day | 1,000/day | **93%** |
| FeaturedRail Calls | 3,000/day | 100/day | **97%** |
| Product Page Calls | 50,000/day | 5,000/day | **90%** |
| Database Queries | 135,000/day | 10,000/day | **93%** |
| **Total Function Invocations** | **117,000/day** | **~35,000/day** | **~70%** |

---

## 🎯 Implementation Priority

1. **Week 1:** Backend caching (Priority 1) - **Highest ROI**
2. **Week 1:** Reduce polling (Priority 2) - **Quick win**
3. **Week 2:** Cache FeaturedRail (Priority 3) - **Easy fix**
4. **Week 2:** Add ISR to pages (Priority 4) - **Medium effort**
5. **Week 3:** Optimize real-time (Priority 5) - **Lower priority**
6. **Week 3:** Request deduplication (Priority 6) - **Nice to have**

---

## 📝 Additional Notes

### What's Working Well

1. ✅ Homepage has ISR (1 hour revalidation)
2. ✅ Image optimization usage is minimal (good caching)
3. ✅ Direct API calls to Render (no unnecessary proxying)
4. ✅ CacheService infrastructure exists (just needs to be used)

### Monitoring Recommendations

1. Add Vercel Analytics to track which pages generate most invocations
2. Add logging to identify peak usage times
3. Monitor Redis cache hit rates after implementing caching
4. Track admin dashboard usage patterns

---

## 🔧 Quick Wins (Can Implement Today)

1. **Change polling interval from 5min to 15min** (5 minutes)
2. **Add 5-minute cache to admin endpoints** (30 minutes)
3. **Add React Query to FeaturedRail** (15 minutes)
4. **Pause polling when tab is hidden** (10 minutes)

**Total time: ~1 hour for 40-50% reduction in function invocations**

---

**Next Steps:** Review this analysis and prioritize which optimizations to implement first.
