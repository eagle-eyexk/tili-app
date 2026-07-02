import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Clock, Star, ShoppingBag, Plus, Minus, Truck } from "lucide-react";
import { useState, useCallback } from "react";
import { api, type Product } from "@/lib/api";
import { getCart, setCart, type CartItem } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";

function ProductRow({
  product,
  qty,
  onAdd,
  onRemove,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
        {product.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{product.description}</p>
        )}
        <p className="text-green-600 font-bold text-sm mt-1">€{product.price.toFixed(2)}</p>
      </div>

      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
        />
      )}

      <div className="flex items-center gap-2 shrink-0">
        {qty > 0 ? (
          <>
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center font-bold text-sm">{qty}</span>
          </>
        ) : null}
        <button
          onClick={onAdd}
          className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function BusinessPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: business } = useQuery({
    queryKey: ["business", id],
    queryFn: () => api.businesses.get(id!),
    enabled: !!id,
  });

  const { data: products } = useQuery({
    queryKey: ["products", id],
    queryFn: () => api.products.byBusiness(id!),
    enabled: !!id,
  });

  const addToCart = useCallback(
    (product: Product) => {
      if (!business) return;
      const existing = getCart();

      if (existing && existing.businessId !== business.id) {
        if (!window.confirm(`Shporta ka produkte nga "${existing.businessName}". Pastroni dhe shtoni nga "${business.name}"?`)) return;
        setCart(null);
      }

      const cart = getCart() ?? {
        businessId: business.id,
        businessName: business.name,
        deliveryFee: business.delivery_fee,
        items: [] as CartItem[],
      };

      const idx = cart.items.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        cart.items[idx].quantity += 1;
      } else {
        cart.items.push({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image });
      }
      setCart(cart);

      setQuantities((q) => ({ ...q, [product.id]: (q[product.id] ?? 0) + 1 }));
      toast({ title: `${product.name} u shtua ✓`, duration: 1500 });
    },
    [business, toast]
  );

  const removeFromCart = useCallback(
    (product: Product) => {
      const cart = getCart();
      if (!cart) return;
      const idx = cart.items.findIndex((i) => i.id === product.id);
      if (idx < 0) return;
      if (cart.items[idx].quantity <= 1) {
        cart.items.splice(idx, 1);
      } else {
        cart.items[idx].quantity -= 1;
      }
      setCart(cart.items.length ? cart : null);
      setQuantities((q) => ({ ...q, [product.id]: Math.max(0, (q[product.id] ?? 0) - 1) }));
    },
    []
  );

  const totalInCart = Object.values(quantities).reduce((s, v) => s + v, 0);
  const categories = products ? [...new Set(products.map((p) => p.category ?? "Tjera"))] : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-5 text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Kthehu
      </button>

      {business ? (
        <>
          <div className="relative h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50 mb-5">
            {business.cover_image ? (
              <img src={business.cover_image} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={48} className="text-green-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-white font-bold text-2xl">{business.name}</h1>
              <div className="flex items-center gap-3 text-white/80 text-sm mt-1">
                <span className="flex items-center gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400" />{business.rating?.toFixed(1)}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{business.delivery_time} min</span>
                <span className="flex items-center gap-1"><Truck size={12} />
                  {business.delivery_fee === 0 ? "Dërgim falas" : `€${business.delivery_fee.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          {products && products.length > 0 ? (
            <>
              {categories.map((cat) => (
                <div key={cat} className="mb-6">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">{cat}</h2>
                  <div className="bg-white rounded-2xl border border-gray-100 px-4 divide-y divide-gray-50">
                    {products
                      .filter((p) => (p.category ?? "Tjera") === cat && p.is_available)
                      .map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          qty={quantities[product.id] ?? 0}
                          onAdd={() => addToCart(product)}
                          onRemove={() => removeFromCart(product)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">Nuk ka produkte aktualisht</div>
          )}
        </>
      ) : (
        <div className="space-y-4 animate-pulse">
          <div className="h-52 rounded-2xl bg-gray-100" />
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      )}

      {totalInCart > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40">
          <button
            onClick={() => navigate("/cart")}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm transition-colors"
          >
            <span className="bg-white/20 rounded-lg w-6 h-6 flex items-center justify-center text-xs font-extrabold">{totalInCart}</span>
            Shko te Shporta
            <span className="ml-auto">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
