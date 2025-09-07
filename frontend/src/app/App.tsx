import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PreLoginLoyout from "../layouts/PreLoginLoyout";
import LandingPage from "../features/landing/pages/LandingPage";
import Login from "../features/auth/pages/Login"; 
import QuieneSomos from "../features/landing/pages/QuieneSomos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Todas estas rutas comparten el mismo layout (Navbar + Footer) */}
        <Route element={<PreLoginLoyout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/quienes-somos" element={<QuieneSomos />} />
        </Route>

        {/* Cualquier ruta no definida -> Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
