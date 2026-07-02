export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/tiligo-logo.jpg" alt="TiliGo" className="h-8 w-8 rounded-xl object-cover" />
            <span className="text-white font-bold text-xl">TiliGo</span>
          </div>
          <p className="text-sm leading-relaxed">
            Dërgimi i ushqimit shpejt dhe me dashuri në Kosovë. 🍃
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Lidhjet</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition-colors">Kryefaqja</a></li>
            <li><a href="/orders" className="hover:text-white transition-colors">Porositë e mia</a></li>
            <li><a href="/cart" className="hover:text-white transition-colors">Shporta</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Rreth Nesh</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Si funksionon</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Bashkëpunim me ne</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privatësia</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Kushtet e shërbimit</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Kontakt</h4>
          <ul className="space-y-2 text-sm">
            <li>📧 info@tiligo.net</li>
            <li>📱 +383 44 000 000</li>
            <li>📍 Prishtinë, Kosovë</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} TiliGo. Të gjitha të drejtat e rezervuara.
      </div>
    </footer>
  );
}
