import type { Business, Order, Product } from "@/types";

const APP_ID = "6a381c14e4aa9004665edfee";
const API_KEY = "56713a3d771f461d8934586b587d1ebd";
const BASE_URL = `https://base44.app/api/apps/${APP_ID}/entities`;

const defaultHeaders: Record<string, string> = {
  "api_key": API_KEY,
  "Content-Type": "application/json",
  "X-App-Id": APP_ID,
};

async function apiGet<T>(entity: string, params?: Record<string, string>): Promise<T[]> {
  let url = `${BASE_URL}/${entity}`;
  if (params && Object.keys(params).length > 0) {
    const sp = new URLSearchParams(params);
    url += `?${sp.toString()}`;
  }
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch ${entity}: ${res.status}`);
  return res.json() as Promise<T[]>;
}

async function apiGetOne<T>(entity: string, id: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${entity}/${id}`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch ${entity}/${id}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPost<T>(entity: string, data: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${entity}`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create ${entity}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPatch<T>(entity: string, id: string, data: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${entity}/${id}`, {
    method: "PATCH",
    headers: defaultHeaders,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update ${entity}/${id}: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  businesses: {
    list: (category?: string) => {
      const filter: Record<string, unknown> = { status: "active" };
      if (category) filter.category = category;
      return apiGet<Business>("Business", { q: JSON.stringify(filter), sort: "-rating" });
    },
    get: (id: string) => apiGetOne<Business>("Business", id),
  },
  products: {
    byBusiness: (businessId: string) =>
      apiGet<Product>("Product", { q: JSON.stringify({ business_id: businessId }) }),
  },
  orders: {
    create: (data: Partial<Order>) => apiPost<Order>("Order", data),
    list: (customerId: string) =>
      apiGet<Order>("Order", { q: JSON.stringify({ customer_id: customerId }), sort: "-created_date" }),
    get: (id: string) => apiGetOne<Order>("Order", id),
    rate: (id: string, rating: number, comment?: string) =>
      apiPatch<Order>("Order", id, { rating, review_comment: comment ?? "" }),
  },
};
