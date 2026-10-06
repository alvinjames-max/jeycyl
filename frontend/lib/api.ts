import {
  Cake,
  CreateCakePayload,
  CreateCustomerPayload,
  CreateOrderPayload,
  Customer,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  PricePreviewItemRequest,
  PricePreviewResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const TOKEN_STORAGE_KEY = "jeycyl_admin_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return "/placeholder-cake.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return `${API_BASE}/${url}`;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getStoredToken();

  const headers = new Headers(options.headers || {});

  // Add Authorization Bearer header if token exists
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set Content-Type to application/json by default unless body is FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Backend session-cookie auth
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errText = await response.text();
      if (errText) {
        try {
          const errJson = JSON.parse(errText);
          errorMsg = errJson.error || errJson.message || errText;
        } catch {
          errorMsg = errText.trim();
        }
      }
    } catch {
      // Keep fallback errorMsg
    }
    throw new Error(errorMsg);
  }

  // For 204 No Content or empty responses
  const contentType = response.headers.get("Content-Type") || "";
  if (response.status === 204 || !contentType.includes("application/json")) {
    const text = await response.text();
    return text as unknown as T;
  }

  const data = await response.json();
  return data as T;
}

export const api = {
  // Public Catalog
  async getCakes(): Promise<Cake[]> {
    const data = await apiFetch<Cake[] | null>("/cakes", { method: "GET" });
    return data || [];
  },

  async getCake(id: number): Promise<Cake> {
    return apiFetch<Cake>(`/cakes/${id}`, { method: "GET" });
  },

  // Pricing preview
  async previewPrice(items: PricePreviewItemRequest[]): Promise<PricePreviewResponse> {
    return apiFetch<PricePreviewResponse>("/pricing/preview", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  },

  // Customers
  async createOrGetCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    return apiFetch<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getCustomer(id: number): Promise<Customer> {
    return apiFetch<Customer>(`/customers/${id}`, { method: "GET" });
  },

  async getCustomerOrders(customerId: number): Promise<Order[]> {
    const data = await apiFetch<Order[] | null>(
      `/customers/${customerId}/orders`,
      { method: "GET" }
    );
    return data || [];
  },

  // Orders
  async placeOrder(payload: CreateOrderPayload): Promise<Order> {
    return apiFetch<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getOrder(id: number): Promise<Order> {
    return apiFetch<Order>(`/orders/${id}`, { method: "GET" });
  },

  // Payments
  async recordPayment(payload: {
    order_id: number;
    amount: number;
    method: PaymentMethod;
    transaction_ref?: string;
  }): Promise<Payment> {
    return apiFetch<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getOrderPayments(orderId: number): Promise<Payment[]> {
    const data = await apiFetch<Payment[] | null>(
      `/orders/${orderId}/payments`,
      { method: "GET" }
    );
    return data || [];
  },

  // Auth
  async login(username: string, password: string): Promise<{ status: string; token: string }> {
    const res = await apiFetch<{ status: string; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async logout(): Promise<{ status: string }> {
    try {
      const res = await apiFetch<{ status: string }>("/auth/logout", {
        method: "POST",
      });
      setStoredToken(null);
      return res;
    } catch (err) {
      setStoredToken(null);
      throw err;
    }
  },

  // Admin endpoints
  async getAdminOrders(): Promise<Order[]> {
    const data = await apiFetch<Order[] | null>("/admin/orders", {
      method: "GET",
    });
    return data || [];
  },

  async createCake(payload: CreateCakePayload): Promise<Cake> {
    return apiFetch<Cake>("/admin/cakes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async setCakeAvailability(id: number, available: boolean): Promise<void> {
    await apiFetch<void>(`/admin/cakes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ available }),
    });
  },

  async uploadCakeImage(cakeId: number, file: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/admin/cakes/${cakeId}/image`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Failed to upload image");
    }

    return response.json();
  },

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
    await apiFetch<void>(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
