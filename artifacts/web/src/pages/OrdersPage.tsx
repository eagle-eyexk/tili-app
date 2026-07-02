import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Clock, ShoppingBag, ChevronRight } from "lucide-react";
import { api, type Order } from "@/lib/api";
import { getGuestId } from "@/lib/cart";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Në pritje", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Konfirmuar", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Po përgatitet", color: "bg-orange-100 text-orange-700" },
  ready: { label: "Gati", color: "bg-purple-100 text-purple-700" },
  delivering: { label: "Po dërgohet", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Dorëzuar ✓", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Anuluar", color: "bg-red-100 text-red-700" },
};

function OrderCard({ order }: { order: Order }) {
  const [, navigate] = useLocation();
  let items: Array<{ name: string; quantity: number }> = [];
  try { items = JSON.parse(order.items); } catch {}

  const info = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };

  return (
    <button
      onClick={() => navigate(`/order/${order.id}`)}
      className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
        <ShoppingBag size={18} className="text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Clock size={11} />
            {new Date(order.created_date).toLocaleDateString("sq-AL")}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
        </p>
        <p className="font-bold text-gray-900 text-sm mt-1">€{order.total?.toFixed(2)}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 mt-1 shrink-0" />
    </button>
  );
}

export default function OrdersPage() {
  const customerId = getGuestId();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => api.orders.list(customerId),
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Porositë e mia</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : !orders?.length ? (
        <div className="text-center py-20">
          <ShoppingBag size={52} className="mx-auto mb-4 text-gray-200" />
          <p className="font-medium text-gray-500">Nuk keni asnjë porosi akoma</p>
          <p className="text-sm text-gray-400 mt-1">Porositni ushqimin tuaj të parë!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
