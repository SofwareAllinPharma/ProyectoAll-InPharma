import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PreLoginLayout from "../layouts/PreLoginLayout";
import PostLoginLayout from "../layouts/PostLoginLayout";
import LandingPage from "../features/landing/pages/LandingPage";
import Login from "../features/auth/pages/Login";
import QuieneSomos from "../features/landing/pages/QuieneSomos";

// Post-login
import SelectProfile from "../features/profiles/pages/SelectProfile";
import TecnicoDashboard from "../features/profiles/pages/TecnicoDashboard";
import AtencionDashboard from "../features/profiles/pages/AtencionDashboard";
import AdminDashboard from "../features/profiles/pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pre-login */}
        <Route element={<PreLoginLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/quienes-somos" element={<QuieneSomos />} />
        </Route>

        {/* Post-login */}
        <Route element={<PostLoginLayout />}>
          <Route path="/perfiles" element={<SelectProfile />} />
          <Route path="/tecnico" element={<TecnicoDashboard />} />
          <Route path="/atencion" element={<AtencionDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
