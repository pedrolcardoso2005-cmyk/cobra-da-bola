import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import RoomEntry from "./pages/RoomEntry";
import PlayerView from "./pages/PlayerView";
import ScreenView from "./pages/ScreenView";
import HostView from "./pages/HostView";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-page">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registrar" element={<Register />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />

      <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/ranking" element={<RequireAuth><Ranking /></RequireAuth>} />

      <Route path="/sala/:code" element={<RequireAuth><RoomEntry /></RequireAuth>} />
      <Route path="/sala/:code/jogador" element={<RequireAuth><PlayerView /></RequireAuth>} />
      <Route path="/sala/:code/telao" element={<RequireAuth><ScreenView /></RequireAuth>} />
      <Route path="/sala/:code/apresentador" element={<RequireAuth><HostView /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
