export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://glotradecom.onrender.com";

type FetchOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

const buildUrl = (path: string, query?: FetchOptions["query"]) => {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

const handleApiError = async (url: string, res: Response) => {
  const text = await res.text();
  let errorMessage;
  try {
    const json = JSON.parse(text);
    if (json.message) {
      errorMessage = json.message;
    } else if (json.error) {
      errorMessage = json.error;
    }
  } catch (e) {
    // If JSON parse fails or no message found, fall through
  }

  if (errorMessage) {
    throw new Error(errorMessage);
  }
  throw new Error(`${res.status} ${res.statusText}: ${text}`);
};

export async function apiGet<T>(path: string, options: FetchOptions = {}) {
  const { query, headers, ...rest } = options;
  const url = buildUrl(path, query);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...(headers || {}),
    },
    cache: "no-store",
    credentials: "include", // Send cookies
    ...rest,
  });

  if (!res.ok) {
    await handleApiError(url, res);
  }

  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: any, options: FetchOptions = {}) {
  const { query, headers, ...rest } = options;
  const url = buildUrl(path, query);

  // Check if body is FormData
  const isFormData = body instanceof FormData;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      // Don't set Content-Type for FormData - let browser set it with boundary
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...getAuthHeader(),
      ...(headers || {}),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include", // Send cookies
    ...rest,
  });
  if (!res.ok) {
    await handleApiError(url, res);
  }
  return (await res.json()) as T;
}

export async function apiPut<T>(path: string, body?: any, options: FetchOptions = {}) {
  const { query, headers, ...rest } = options;
  const url = buildUrl(path, query);

  // Check if body is FormData
  const isFormData = body instanceof FormData;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      // Don't set Content-Type for FormData - let browser set it with boundary
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...getAuthHeader(),
      ...(headers || {}),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include", // Send cookies
    ...rest,
  });
  if (!res.ok) {
    await handleApiError(url, res);
  }
  return (await res.json()) as T;
}

export async function apiPatch<T>(path: string, body?: any, options: FetchOptions = {}) {
  const { query, headers, ...rest } = options;
  const url = buildUrl(path, query);

  // Check if body is FormData
  const isFormData = body instanceof FormData;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      // Don't set Content-Type for FormData - let browser set it with boundary
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...getAuthHeader(),
      ...(headers || {}),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include", // Send cookies
    ...rest,
  });
  if (!res.ok) {
    await handleApiError(url, res);
  }
  return (await res.json()) as T;
}

export async function apiDelete<T>(path: string, options: FetchOptions = {}) {
  const { query, headers, ...rest } = options;
  const url = buildUrl(path, query);
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...(headers || {}),
    },
    credentials: "include", // Send cookies
    ...rest,
  });
  if (!res.ok) {
    await handleApiError(url, res);
  }
  return (await res.json()) as T;
}

// Additional helpers for user storage sync
export type UserStorage = { wishlist: string[]; cart: { productId: string; qty: number }[] };

export function getAuthHeader(): Record<string, string> {
  try {
    // First try to get JWT token from localStorage (correct key used by login page)
    const jwtToken = localStorage.getItem("afritrade:auth") || localStorage.getItem("afritrade:jwt") || localStorage.getItem("jwt") || localStorage.getItem("token");
    if (jwtToken) {
      return { Authorization: `Bearer ${jwtToken}` };
    }

    // Check if user data contains a token
    const raw = localStorage.getItem("afritrade:user") || localStorage.getItem("user");
    if (raw) {
      const obj = JSON.parse(raw);
      // Check for token in user object
      if (obj?.token) {
        return { Authorization: `Bearer ${obj.token}` };
      }
      // Check for JWT in user object
      if (obj?.jwt) {
        return { Authorization: `Bearer ${obj.jwt}` };
      }
      // Fallback removed: We strictly require a JWT token now.
      // If no token is found, we return an empty object, which will likely result in a 401 from the API,
      // but that is better than sending an invalid token (the user ID).
    }

    return {};
  } catch (error) {
    return {};
  }
}

export async function getUserStorage(): Promise<UserStorage> {
  const res = await apiGet<{ status: string; data: UserStorage }>("/api/v1/users/me/storage", { headers: { ...getAuthHeader() }, credentials: "include" });
  return res.data;
}

export async function saveUserStorage(storage: Partial<UserStorage>): Promise<UserStorage> {
  const res = await apiPost<{ status: string; data: UserStorage }>("/api/v1/users/me/storage", storage, { headers: { ...getAuthHeader() }, credentials: "include" });
  return res.data;
}

