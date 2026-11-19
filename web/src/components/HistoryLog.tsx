import type { HistoryEntry } from "@cobra/shared";
import "./HistoryLog.css";

export function HistoryLog({ entries }: { entries: HistoryEntry[] }) {
  const recent = entries.slice(-30).reverse();
  return (
    <div className="history-log">
      <span className="font-display history-log__title">Historico</span>
      <ul>
        {recent.map((e) => (
          <li key={e.id}>
            <span className="history-log__time">{new Date(e.at).toLocaleTimeString("pt-BR")}</span>
            {e.message}
          </li>
        ))}
        {recent.length === 0 && <li className="history-log__empty">Nenhuma acao ainda.</li>}
      </ul>
    </div>
  );
}
