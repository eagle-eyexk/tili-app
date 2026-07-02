const CATEGORIES = [
  { id: "", label: "Të gjitha", emoji: "🏠" },
  { id: "Restaurant", label: "Restorante", emoji: "🍽️" },
  { id: "Pizza", label: "Pizza", emoji: "🍕" },
  { id: "Burger", label: "Burger", emoji: "🍔" },
  { id: "Sushi", label: "Sushi", emoji: "🍣" },
  { id: "Duner", label: "Duner", emoji: "🌯" },
  { id: "Sallatë", label: "Sallatë", emoji: "🥗" },
  { id: "Kafe", label: "Kafe", emoji: "☕" },
  { id: "Ëmbëlsira", label: "Ëmbëlsira", emoji: "🍰" },
  { id: "Market", label: "Market", emoji: "🛒" },
  { id: "Fastfood", label: "Fast Food", emoji: "🍟" },
];

interface Props {
  selected: string;
  onChange: (cat: string) => void;
}

export function CategoryPills({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
            selected === cat.id
              ? "bg-green-500 text-white border-green-500 shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600"
          }`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
