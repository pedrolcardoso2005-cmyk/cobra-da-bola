import type { MatchState } from "@cobra/shared";
import "./ChampionScreen.css";

export function ChampionScreen({ match }: { match: MatchState }) {
  const champion = match.players.find((p) => p.userId === match.winnerUserId);
  const runnerUp = match.players.find((p) => p.userId === match.runnerUpUserId);

  return (
    <div className="champion-screen">
      <div className="champion-screen__burst" aria-hidden="true" />
      <span className="font-display champion-screen__kicker">Temos um</span>
      <h1 className="font-display champion-screen__title">Cobra da Bola!</h1>
      {champion && (
        <div className="champion-card sticker tilt-left">
          <div className="champion-card__avatar">{initials(champion.displayName)}</div>
          <span className="font-display champion-card__name">{champion.displayName}</span>
          <span className="font-score champion-card__score">
            {match.final ? Math.max(match.final.scoreA, match.final.scoreB) : 10}
          </span>
        </div>
      )}
      {runnerUp && (
        <div className="champion-runnerup">
          Vice-campeao: <strong className="font-display">{runnerUp.displayName}</strong>
        </div>
      )}
      <div className="champion-stats">
        {match.players
          .slice()
          .sort((a, b) => b.correctAnswers - a.correctAnswers)
          .map((p) => (
            <div key={p.id} className="champion-stats__row sticker-sm">
              <span className="font-display">{p.displayName}</span>
              <span>
                {p.correctAnswers} acertos - {p.wrongAnswers} erros
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
