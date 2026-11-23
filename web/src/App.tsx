import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { trackPageView } from "./lib/visit";
import { useAuth } from "./state/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import HowToPlay from "./pages/HowToPlay";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import SoloHistory from "./pages/SoloHistory";
import RoomEntry from "./pages/RoomEntry";
import SoloView from "./pages/SoloView";
import PlayerView from "./pages/PlayerView";
import ScreenView from "./pages/ScreenView";
import { useParams } from "react-router-dom";
import Admin from "./pages/Admin";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-page">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// "/" used to be unconditionally behind RequireAuth (redirecting straight
// to /login for anyone not signed in). It's public-facing now: a visitor
// without an account should be able to see what the game is before being
// asked to sign up (see HowToPlay/Landing) -- only once there IS a user
// does "/" become the real post-login hub, unchanged from before.
function Entry() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-page">Carregando...</div>;
  return user ? <Home /> : <Landing />;
}

// Reachable both before login (from Landing, closing CTA leads to /login)
// and after login (from the hub, where there's nothing left to log into).
function HowToPlayRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-page">Carregando...</div>;
  return user ? <HowToPlay /> : <HowToPlay ctaTo="/login" />;
}

function RedirectToPlayer() {
  const { code } = useParams();
  return <Navigate to={`/sala/${code}/jogador`} replace />;
}

export default function App() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registrar" element={<Register />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />
      <Route path="/como-jogar" element={<HowToPlayRoute />} />

      <Route path="/" element={<Entry />} />
      <Route path="/sozinho" element={<RequireAuth><SoloView /></RequireAuth>} />
      <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/ranking" element={<RequireAuth><Ranking /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
      <Route path="/historico" element={<RequireAuth><SoloHistory /></RequireAuth>} />

      <Route path="/sala/:code" element={<RequireAuth><RoomEntry /></RequireAuth>} />
      <Route path="/sala/:code/jogador" element={<RequireAuth><PlayerView /></RequireAuth>} />
      <Route path="/sala/:code/telao" element={<RequireAuth><ScreenView /></RequireAuth>} />
      <Route path="/sala/:code/apresentador" element={<RedirectToPlayer />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
