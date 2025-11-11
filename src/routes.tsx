import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navbar } from "./components";
import { Home } from "./pages/Home";
import { ReportNew } from "./pages/ReportNew";
import { BarangayView } from "./pages/BarangayView";
import { AdminLogin } from "./pages/Admin/Login";
import { AdminCallback } from "./pages/Admin/Callback";
import { Dashboard } from "./pages/Admin/Dashboard";
import { UpdateEditor } from "./pages/Admin/UpdateEditor";

export function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportNew />} />
        <Route path="/barangay/:barangayId" element={<BarangayView />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/callback" element={<AdminCallback />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/updates" element={<UpdateEditor />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
