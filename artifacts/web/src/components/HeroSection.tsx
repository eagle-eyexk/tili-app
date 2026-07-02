import { Search } from "lucide-react";
import { useState } from "react";

interface Props {
  onSearch: (q: string) => void;
}

export function HeroSection({ onSearch }: Props) {
  const [q, setQ] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(q);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 min-h-[480px] flex items-center">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 mb-6">
          <img src="/tiligo-logo.jpg" alt="TiliGo" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-white font-bold text-lg tracking-tight">TiliGo</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-sm">
          Porosit ushqim të shijshëm
        </h1>
        <p className="text-xl text-green-50 mb-10 font-medium">
          nga restorante të zgjedhura — shpejt, me dashuri 🍃
        </p>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex items-stretch gap-2 bg-white rounded-2xl p-2 shadow-xl">
          <div className="flex items-center gap-2 flex-1 px-3">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kërko restorante ose ushqim…"
              className="flex-1 outline-none text-gray-700 bg-transparent text-sm placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm shrink-0"
          >
            Kërko
          </button>
        </form>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {["🍕 Pizza", "🍔 Burger", "🍣 Sushi", "🌯 Duner", "🥗 Sallatë", "☕ Kafe", "🍰 Ëmbëlsira", "🛒 Market"].map((tag) => (
            <span
              key={tag}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full cursor-pointer transition-colors"
              onClick={() => onSearch(tag.split(" ").slice(1).join(" "))}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
