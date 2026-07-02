import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react";
import { api } from "@/lib/api";

const STEPS = [
  { key: "pending", label: "Porosia u pranua", icon: "🛎️" },
  { key: "confirmed", label: "Konfirmuar nga restoranti", icon: "✅" },
  { key: "preparing", label: "Po përgatitet", icon: "👨‍🍳" },
  { key: "ready", label: "Gati për dërgim", icon: "📦" },
  { key: "delivering", label: "Në rrugë për ju", icon: "🛵" },
  { key: "delivered", label: "Dorëzuar!", icon: "🎉" },
];

const STATUS_ORDER = STEPS.map((s) => s.key);

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.orders.get(id!),
    enabled: !!id,
    refetchInterval: 10_000,
  });

  const currentIdx = order ? STATUS_ORDER.indexOf(order.status) : -1;
  let items: Array<{ name: string; quantity: number; price: number }> = [];
  try { if (order) items = JSON.parse(order.items); } catch {}

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-5 text-sm"
      >
        <ArrowLeft size={16} />
        Porositë e mia
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Gjurmimi i Porosisë</h1>
      {order && (
        <p className="text-sm text-gray-400 mb-6 flex items-center gap-1">
          <Clock size={12} />
          {new Date(order.created_date).toLocaleString("sq-AL")}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100" />
              <div className="flex-1 h-4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : order ? (
        <>
          {order.status !== "cancelled" ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
              {STEPS.map((step, idx) => {
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                          done
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-300"
                        } ${active ? "ring-2 ring-green-300 ring-offset-2" : ""}`}
                      >
                        {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${done ? "bg-green-300" : "bg-gray-100"}`} />
                      )}
                    </div>
                    <div className="pb-6 last:pb-0">
                      <p className={`text-sm font-medium leading-none mb-0.5 ${done ? "text-gray-900" : "text-gray-300"}`}>
                        {step.icon} {step.label}
                      </p>
                      {active && (
                        <p className="text-xs text-green-500 font-semibold mt-1">Statusi aktual</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-5 text-center">
              <p className="text-red-600 font-bold">❌ Porosia u anulua</p>
            </div>
          )}

          {items.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Produktet e porositura</h2>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}× {item.name}</span>
                    <span className="font-medium text-gray-900">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-3 mt-3 border-t border-gray-100">
                <span>Totali</span>
                <span className="text-green-600">€{order.total?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-400 py-12">Porosia nuk u gjet</p>
      )}
    </div>
  );
}
