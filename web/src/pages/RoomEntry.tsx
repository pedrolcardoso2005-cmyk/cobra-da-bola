import { Link, useParams } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import "./RoomEntry.css";

export default function RoomEntry() {
  const { code } = useParams();
  const { user } = useAuth();

  return (
    <div className="center-page">
      <h1 className="font-display brand-title">Sala {code}</h1>
      <p className="brand-subtitle">Escolha como voce vai acompanhar esta partida, {user?.displayName}.</p>
      <div className="room-entry__options">
        <Link to={`/sala/${code}/jogador`} className="room-entry__option sticker tilt-left">
          <span className="font-display">Jogar</span>
          <span>Entrar com seu botao de resposta</span>
        </Link>
        <Link to={`/sala/${code}/telao`} className="room-entry__option sticker">
          <span className="font-display">Telao</span>
          <span>Para TV, monitor ou transmissao (16:9)</span>
        </Link>
        <Link to={`/sala/${code}/apresentador`} className="room-entry__option sticker tilt-right">
          <span className="font-display">Apresentador</span>
          <span>Painel de controle da partida</span>
        </Link>
      </div>
      <Link className="link-muted" to="/">Voltar para o inicio</Link>
    </div>
  );
}
