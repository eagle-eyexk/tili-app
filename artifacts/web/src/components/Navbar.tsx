import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getCart, cartItemCount } from "@/lib/cart";

const navLinks = [
  { href: "/", label: "Kryefaqja" },
  { href: "/orders", label: "Porositë" },
];

export function Navbar() {
  const [location] = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const cart = getCart();
      setCartCount(cart ? cartItemCount(cart) : 0);
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/tiligo-logo.jpg" alt="TiliGo" className="h-9 w-9 rounded-xl object-cover" />
          <span className="font-bold text-xl text-gray-900 tracking-tight">TiliGo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                location === l.href
                  ? "text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors hidden md:flex">
            <Search size={20} />
          </button>

          <Link
            href="/cart"
            className="relative p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          <button className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors hidden md:flex">
            <User size={20} />
          </button>

          <button
            className="md:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium py-1 ${
                location === l.href ? "text-green-600" : "text-gray-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
