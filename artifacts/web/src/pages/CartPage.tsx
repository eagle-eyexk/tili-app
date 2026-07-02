import { useLocation } from "wouter";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { getCart, setCart, cartTotal, getGuestId, getGuestName, setGuestName, getGuestPhone, setGuestPhone, type Cart } from "@/lib/cart";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [cart, setLocalCart] = useState<Cart | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cash" | "card">("cash");

  useEffect(() => {
    setLocalCart(getCart());
    setName(getGuestName());
    setPhone(getGuestPhone());
  }, []);

  const refresh = () => setLocalCart(getCart());

  const updateQty = (id: string, delta: number) => {
    const c = getCart();
    if (!c) return;
    const idx = c.items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    c.items[idx].quantity += delta;
    if (c.items[idx].quantity <= 0) c.items.splice(idx, 1);
    setCart(c.items.length ? c : null);
    refresh();
  };

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!cart) throw new Error("Shporta është e zbrazur");
      if (!name.trim()) throw new Error("Ju lutemi shkruani emrin tuaj");
      if (!phone.trim()) throw new Error("Ju lutemi shkruani numrin e telefonit");
      if (!address.trim()) throw new Error("Ju lutemi shkruani adresën e dorëzimit");

      setGuestName(name);
      setGuestPhone(phone);

      const subtotal = cartTotal(cart);
      const order = await api.orders.create({
        business_id: cart.businessId,
        customer_id: getGuestId(),
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_address: address.trim(),
        notes: notes.trim() || undefined,
        payment_method: payment,
        items: JSON.stringify(cart.items),
        subtotal,
        delivery_fee: cart.deliveryFee,
        discount: 0,
        total: subtotal + cart.deliveryFee,
        status: "pending",
      });
      setCart(null);
      return order;
    },
    onSuccess: (order) => {
      toast({ title: "Porosia u dërgua! ✓", description: "Po përgatisim porosinë tuaj." });
      navigate(`/order/${order.id}`);
    },
    onError: (e: Error) => {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Shporta është e zbrazur</h2>
        <p className="text-gray-400 mb-6 text-sm">Shtoni produkte nga restorante tona</p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Shko te Kryefaqja
        </button>
      </div>
    );
  }

  const subtotal = cartTotal(cart);
  const total = subtotal + cart.deliveryFee;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-5 text-sm"
      >
        <ArrowLeft size={16} />
        Vazhdo blerjen
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Shporta juaj</h1>
      <p className="text-sm text-gray-500 mb-5">nga {cart.businessName}</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 divide-y divide-gray-50">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-4">
            {item.image && (
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
              <p className="text-green-600 font-bold text-sm">€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQty(item.id, -1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                {item.quantity === 1 ? <Trash2 size={12} className="text-red-400" /> : <Minus size={12} />}
              </button>
              <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, 1)}
                className="w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 p-4 space-y-3">
        <h2 className="font-bold text-gray-900 text-sm">Detajet e dorëzimit</h2>
        {[
          { placeholder: "Emri juaj *", value: name, onChange: setName, type: "text" },
          { placeholder: "Numri i telefonit *", value: phone, onChange: setPhone, type: "tel" },
          { placeholder: "Adresa e dorëzimit *", value: address, onChange: setAddress, type: "text" },
        ].map(({ placeholder, value, onChange, type }) => (
          <input
            key={placeholder}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all placeholder-gray-400"
          />
        ))}
        <textarea
          placeholder="Shënime për porosinë (opsionale)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all placeholder-gray-400 resize-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 p-4">
        <h2 className="font-bold text-gray-900 text-sm mb-3">Mënyra e pagesës</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["cash", "card"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setPayment(m)}
              className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                payment === m
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300"
              }`}
            >
              {m === "cash" ? "💵 Para Cash" : "💳 Kartë"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-4 space-y-2">
        {[
          ["Nëntotali", `€${subtotal.toFixed(2)}`],
          ["Dërgimi", cart.deliveryFee === 0 ? "Falas" : `€${cart.deliveryFee.toFixed(2)}`],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm text-gray-500">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
          <span>Totali</span>
          <span className="text-green-600">€{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => orderMutation.mutate()}
        disabled={orderMutation.isPending}
        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors text-sm"
      >
        {orderMutation.isPending ? "Duke dërguar…" : `Konfirmo Porosinë · €${total.toFixed(2)}`}
      </button>
    </div>
  );
}
