const APP_ID = "6a381c14e4aa9004665edfee";
const API_KEY = "56713a3d771f461d8934586b587d1ebd";
const BASE_URL = `https://base44.app/api/apps/${APP_ID}/entities`;

const headers: Record<string, string> = {
  "api_key": API_KEY,
  "Content-Type": "application/json",
  "X-App-Id": APP_ID,
};

async function get<T>(entity: string, params?: Record<string, string>): Promise<T[]> {
  let url = `${BASE_URL}/${entity}`;
  if (params && Object.keys(params).length > 0) {
    url += `?${new URLSearchParams(params)}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${entity}: ${res.status}`);
  return res.json();
}

async function getOne<T>(entity: string, id: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${entity}/${id}`, { headers });
  if (!res.ok) throw new Error(`${entity}/${id}: ${res.status}`);
  return res.json();
}

async function post<T>(entity: string, data: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${entity}`, {
    method: "POST", headers, body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`create ${entity}: ${res.status}`);
  return res.json();
}

async function patch<T>(entity: string, id: string, data: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${entity}/${id}`, {
    method: "PATCH", headers, body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`patch ${entity}/${id}: ${res.status}`);
  return res.json();
}

export interface Business {
  id: string; name: string; description?: string; category: string;
  logo?: string; cover_image?: string; address?: string;
  delivery_fee: number; delivery_time: number; min_order: number;
  rating: number; is_open: boolean; status: string;
}

export interface Product {
  id: string; name: string; description?: string; price: number;
  image?: string; category?: string; business_id: string; is_available: boolean;
}

export interface Order {
  id: string; status: string; items: string;
  delivery_address: string; customer_name: string; customer_phone: string;
  subtotal: number; delivery_fee: number; discount: number; total: number;
  payment_method: string; business_id: string; customer_id: string;
  notes?: string; created_date: string;
}

export const api = {
  businesses: {
    list: (category?: string) => {
      const f: Record<string, unknown> = { status: "active" };
      if (category) f.category = category;
      return get<Business>("Business", { q: JSON.stringify(f), sort: "-rating" });
    },
    get: (id: string) => getOne<Business>("Business", id),
  },
  products: {
    byBusiness: (id: string) =>
      get<Product>("Product", { q: JSON.stringify({ business_id: id }) }),
  },
  orders: {
    create: (data: Partial<Order>) => post<Order>("Order", data),
    list: (customerId: string) =>
      get<Order>("Order", { q: JSON.stringify({ customer_id: customerId }), sort: "-created_date" }),
    get: (id: string) => getOne<Order>("Order", id),
    rate: (id: string, rating: number, comment?: string) =>
      patch<Order>("Order", id, { rating, review_comment: comment ?? "" }),
  },
};
