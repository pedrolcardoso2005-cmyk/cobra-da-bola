import "./Fireworks.css";

/**
 * Hand-built fireworks/confetti burst -- small square particles shot out
 * radially with staggered delays, pure CSS keyframes (no canvas, no new
 * dependency). Reused by the final-match BracketScene (subtle) and the
 * champion coronation (intense).
 */
export function Fireworks({ intense = false }: { intense?: boolean }) {
  const count = intense ? 14 : 8;
  const particles = Array.from({ length: count }, (_, i) => i);
  const colors = ["var(--lima)", "var(--bote)", "var(--giz)"];

  return (
    <div className={`fireworks ${intense ? "fireworks--intense" : ""}`} aria-hidden="true">
      {particles.map((i) => (
        <span
          key={i}
          className="fireworks__particle"
          style={
            {
              "--angle": `${(360 / count) * i}deg`,
              "--delay": `${(i % 5) * 110}ms`,
              "--color": colors[i % colors.length],
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
