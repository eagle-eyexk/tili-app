import { Link } from "wouter";
import { Clock, Star, ShoppingBag } from "lucide-react";
import type { Business } from "@/lib/api";

interface Props { business: Business; }

export function BusinessCard({ business }: Props) {
  return (
    <Link href={`/business/${business.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 group-hover:-translate-y-0.5">
        <div className="relative h-44 bg-gradient-to-br from-green-100 to-emerald-50 overflow-hidden">
          {business.cover_image ? (
            <img
              src={business.cover_image}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-green-300" />
            </div>
          )}
          {!business.is_open && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">Mbyllur</span>
            </div>
          )}
          {business.logo && (
            <div className="absolute bottom-3 left-3">
              <img
                src={business.logo}
                alt=""
                className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md"
              />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-green-600 transition-colors">
            {business.name}
          </h3>
          {business.description && (
            <p className="text-gray-500 text-xs mb-3 line-clamp-1">{business.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-gray-700">{business.rating?.toFixed(1) ?? "—"}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {business.delivery_time} min
            </span>
            <span className="ml-auto text-green-600 font-semibold">
              {business.delivery_fee === 0 ? "Falas" : `€${business.delivery_fee.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
