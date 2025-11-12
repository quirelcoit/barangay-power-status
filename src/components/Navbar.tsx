import { Link, useNavigate } from "react-router-dom";
import { Power } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAdminClick = () => {
    if (user) {
      navigate("/admin/dashboard");
    } else {
      navigate("/admin/login");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-base sm:text-lg"
        >
          <Power className="w-5 h-5 sm:w-6 sm:h-6 text-power-600" />
          <span className="hidden sm:inline">Barangay Power Status</span>
          <span className="sm:hidden text-sm">Power Status</span>
        </Link>
        <div className="flex gap-2">
          <Link
            to="/progress"
            className="px-3 py-2 sm:py-2.5 bg-amber-600 text-white rounded-lg text-xs sm:text-sm hover:bg-amber-700 transition-colors hidden sm:block min-h-10"
          >
            ⚡ Power Status
          </Link>
          <Link
            to="/report"
            className="px-3 py-2 sm:py-2.5 bg-power-600 text-white rounded-lg text-xs sm:text-sm hover:bg-power-700 transition-colors min-h-10"
          >
            Report Hazard
          </Link>
          <Link
            to="/admin/map"
            className="px-3 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors hidden sm:block min-h-10"
          >
            📍 View Map
          </Link>
          <button
            onClick={handleAdminClick}
            className={`px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors min-h-10 ${
              user
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {user ? "✓ Admin" : "Admin"}
          </button>
        </div>
      </div>
    </nav>
  );
}
