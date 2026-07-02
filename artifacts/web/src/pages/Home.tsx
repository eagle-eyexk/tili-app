import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { HeroSection } from "@/components/HeroSection";
import { CategoryPills } from "@/components/CategoryPills";
import { BusinessCard } from "@/components/BusinessCard";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";
import { Store } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
      </div>
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => api.businesses.list(),
  });

  const filtered = useMemo(() => {
    if (!businesses) return [];
    return businesses.filter((b) => {
      const matchCat = !category || b.category?.toLowerCase().includes(category.toLowerCase());
      const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [businesses, category, search]);

  return (
    <>
      <HeroSection onSearch={(q) => { setSearch(q); setCategory(""); }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Kategoritë Populore</h2>
          <CategoryPills selected={category} onChange={(c) => { setCategory(c); setSearch(""); }} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              {category || search
                ? `Rezultate${search ? ` për "${search}"` : ""}`
                : "Restorante & Dyqane"}
            </h2>
            {!isLoading && (
              <span className="text-sm text-gray-500">{filtered.length} vende</span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Store size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="font-medium text-gray-500">Nuk u gjet asgjë</p>
              <p className="text-sm mt-1">Provo me fjalë të tjera ose zgjidh kategori tjetër</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((b) => <BusinessCard key={b.id} business={b} />)}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
