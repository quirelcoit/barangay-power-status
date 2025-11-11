import { Link } from "react-router-dom";
import { Power } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Power className="w-6 h-6 text-power-600" />
          <span className="hidden sm:inline">Barangay Power Status</span>
          <span className="sm:hidden">Power Status</span>
        </Link>
        <div className="flex gap-2">
          <Link
            to="/report"
            className="px-3 py-2 bg-power-600 text-white rounded-lg text-sm hover:bg-power-700 transition-colors"
          >
            Report Hazard
          </Link>
          <Link
            to="/admin/login"
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
