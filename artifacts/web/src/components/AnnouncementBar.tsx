import { Link } from "wouter";
import { X } from "lucide-react";
import { useState } from "react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-green-600 text-white text-sm py-2 px-4 text-center relative">
      <span>
        Mirë se vjen! Porosit si mysafir ose{" "}
        <Link href="/register" className="underline font-semibold">Regjistrohu falas</Link>
        {" · "}
        <Link href="/login" className="underline font-semibold">Hyr</Link>
      </span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
        aria-label="Mbyll"
      >
        <X size={14} />
      </button>
    </div>
  );
}
