import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PreLoginLayout from "../layouts/PreLoginLayout";
import PostLoginLayout from "../layouts/PostLoginLayout";
import RequireAuth from "../lib/RequireAuth";
import LandingPage from "../features/landing/pages/LandingPage";
import Login from "../features/auth/pages/Login";
import QuienesSomos from "../features/landing/pages/QuienesSomos";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";

// privado
import SelectProfile from "../features/profiles/pages/SelectProfile";
import MyDataPage from "../features/profile/pages/MyDataPage";
import TecnicoDashboard from "../features/views/tecnico/TecnicoView";
import AdminFabDashboard from "../features/views/adminFab/AdminFabricaView";
import AdminSisDashboard from "../features/views/adminSis/AdminSistemaView";
import PuntoDashboard from "../features/views/punto/PuntoView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pre-login - publico */}
        <Route element={<PreLoginLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
        </Route>

        {/* Post-login - privado */}
        <Route
          element={<RequireAuth><PostLoginLayout /></RequireAuth>}
        >
          <Route path="/perfiles" element={<SelectProfile />} />
          <Route path="/mis-datos" element={<MyDataPage />} />
          <Route path="/tecnico/*" element={<TecnicoDashboard />} />
          <Route path="/adminfab/*" element={<AdminFabDashboard />} />
          <Route path="/puntoventa/*" element={<PuntoDashboard />} />
          <Route path="/adminsis/*" element={<AdminSisDashboard />} />
          
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
