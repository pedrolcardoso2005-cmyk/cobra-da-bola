import { useEffect, useRef, useState } from "react";
import "./QuestionPanel.css";

export function QuestionPanel({
  prompt,
  label = "Pergunta",
  progressive = true,
  onRevealComplete,
  choices,
}: {
  prompt: string;
  label?: string;
  progressive?: boolean;
  onRevealComplete?: () => void;
  choices?: string[];
}) {
  const words = prompt.split(" ");
  const [count, setCount] = useState(progressive ? 0 : words.length);
  const promptRef = useRef(prompt);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    promptRef.current = prompt;
    if (!progressive || reducedMotion) {
      setCount(words.length);
      if (progressive) onRevealComplete?.();
      return;
    }
    setCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= words.length) {
        clearInterval(interval);
        onRevealComplete?.();
      }
    }, 90);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  return (
    <div className="question-panel sticker">
      <span className="question-panel__label font-display">{label}</span>
      <p className="question-panel__text">
        {words.slice(0, count).join(" ")}
        {count < words.length && <span className="question-panel__caret">|</span>}
      </p>
      {choices && count >= words.length && (
        <div className="question-panel__choices">
          {choices.map((c, i) => (
            <span key={i} className="question-panel__choice sticker-sm font-display">
              {String.fromCharCode(65 + i)}. {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
