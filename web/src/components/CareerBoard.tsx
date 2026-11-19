import type { PlayerRef } from "@cobra/shared";
import "./CareerBoard.css";

export function CareerBoard({
  clubs,
  totalClubs,
  cohort,
  quota,
  classifiedCount,
}: {
  clubs: string[];
  totalClubs: number;
  cohort: PlayerRef[];
  quota: number;
  classifiedCount: number;
}) {
  return (
    <div className="career-board">
      <div className="career-board__main sticker">
        <span className="font-display career-board__title">De quem e essa carreira?</span>
        <div className="career-board__clubs">
          {Array.from({ length: Math.max(totalClubs, clubs.length, 4) }).map((_, i) => {
            const club = clubs[i];
            return (
              <div key={i} className={`career-club sticker-sm ${club ? "is-revealed" : "is-hidden"}`}>
                {club ? <span className="font-display">{club}</span> : <span className="career-club__q">?</span>}
              </div>
            );
          })}
        </div>
      </div>
      <aside className="career-board__side sticker">
        <span className="font-display career-board__side-title">Classificados</span>
        <span className="font-score career-board__count">
          {classifiedCount}/{quota}
        </span>
        <ul className="career-board__players">
          {cohort.map((p) => (
            <li key={p.id} className={p.qualified ? "is-qualified" : p.eliminated ? "is-eliminated" : ""}>
              {p.careerRank ? `${p.careerRank}o ` : ""}
              {p.displayName}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
