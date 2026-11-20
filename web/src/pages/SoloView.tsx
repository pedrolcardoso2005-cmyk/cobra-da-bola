import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { api } from "../lib/api";
import { CAREER_THEME_LABELS, CATEGORY_LABELS, DIFFICULTIES } from "../lib/labels";
import type { CareerTheme, Difficulty, PublicQuestion, QuestionCategory } from "@cobra/shared";
import "../components/CareerBoard.css";
import "./PlayerView.css";
import "./SoloView.css";

const WIN_SCORE = 10;

interface PublicCareer {
  id: string;
  clubs: string[];
}

interface AnswerResult {
  correct: boolean;
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanation: string | null;
}

interface CareerAnswerResult {
  correct: boolean;
  playerName: string;
  acceptedAnswers: string[] | null;
}

export default function SoloView() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"perguntas" | "carreiras">("perguntas");
  const [categories, setCategories] = useState<QuestionCategory[]>(["aleatorio"]);
  const [careerThemes, setCareerThemes] = useState<CareerTheme[]>(["aleatorio"]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);

  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [seenQuestionIds, setSeenQuestionIds] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [champion, setChampion] = useState(false);
  const [loading, setLoading] = useState(false);

  const [career, setCareer] = useState<PublicCareer | null>(null);
  const [seenCareerIds, setSeenCareerIds] = useState<string[]>([]);
  const [revealedCount, setRevealedCount] = useState(1);
  const [careerAnswer, setCareerAnswer] = useState("");
  const [careerResult, setCareerResult] = useState<CareerAnswerResult | null>(null);
  const [careerScore, setCareerScore] = useState({ correct: 0, skipped: 0 });
  const [careerEmpty, setCareerEmpty] = useState(false);
  const [questionEmpty, setQuestionEmpty] = useState(false);

  function toggleCategory(cat: QuestionCategory) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }
  function toggleCareerTheme(t: CareerTheme) {
    setCareerThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }
  function toggleDifficulty(d: Difficulty) {
    setDifficulties((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function loadNextQuestion(excludeIds: string[]) {
    setLoading(true);
    setResult(null);
    setAnswer("");
    try {
      const qs = new URLSearchParams({
        categories: categories.join(","),
        difficulties: difficulties.join(","),
        excludeIds: excludeIds.join(","),
      });
      const data = await api.get<{ question: PublicQuestion | null }>(`/api/solo/pergunta?${qs}`);
      setQuestion(data.question);
      setQuestionEmpty(!data.question);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer(choiceOverride?: string) {
    const value = choiceOverride ?? answer;
    if (!question || !value.trim()) return;
    const data = await api.post<AnswerResult>("/api/solo/pergunta/responder", { questionId: question.id, answer: value.trim() });
    setResult(data);
    setScore((prev) => {
      const next = data.correct ? { ...prev, correct: prev.correct + 1 } : { ...prev, wrong: prev.wrong + 1 };
      if (data.correct && next.correct >= WIN_SCORE) setChampion(true);
      return next;
    });
    setSeenQuestionIds((prev) => [...prev, question.id]);
  }

  function startQuestions() {
    setScore({ correct: 0, wrong: 0 });
    setChampion(false);
    setSeenQuestionIds([]);
    void loadNextQuestion([]);
  }

  async function loadNextCareer(excludeIds: string[]) {
    setLoading(true);
    setCareerResult(null);
    setCareerAnswer("");
    setRevealedCount(1);
    try {
      const qs = new URLSearchParams({
        themes: careerThemes.join(","),
        difficulties: difficulties.join(","),
        excludeIds: excludeIds.join(","),
      });
      const data = await api.get<{ career: PublicCareer | null }>(`/api/solo/carreira?${qs}`);
      setCareer(data.career);
      setCareerEmpty(!data.career);
    } finally {
      setLoading(false);
    }
  }

  function revealNextClub() {
    if (!career) return;
    setRevealedCount((n) => Math.min(n + 1, career.clubs.length));
  }

  async function submitCareerAnswer() {
    if (!career || !careerAnswer.trim()) return;
    const data = await api.post<CareerAnswerResult>("/api/solo/carreira/responder", { careerId: career.id, answer: careerAnswer.trim() });
    setCareerResult(data);
    setCareerScore((prev) => ({ ...prev, correct: data.correct ? prev.correct + 1 : prev.correct }));
    setSeenCareerIds((prev) => [...prev, career.id]);
  }

  function startCareers() {
    setCareerScore({ correct: 0, skipped: 0 });
    setSeenCareerIds([]);
    void loadNextCareer([]);
  }

  return (
    <div className="home-shell">
      <header className="home-header">
        <h1 className="font-display home-header__title">Jogar sozinho</h1>
        <nav className="row">
          <span className="home-header__user">Ola, {user?.displayName}</span>
          <Link className="btn btn-ghost" to="/">Voltar ao inicio</Link>
        </nav>
      </header>

      <div className="row solo-tabs">
        <button className={`btn ${mode === "perguntas" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("perguntas")}>
          Perguntas
        </button>
        <button className={`btn ${mode === "carreiras" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("carreiras")}>
          Desafio das Carreiras
        </button>
      </div>

      <main className="solo-main">
        <section className="panel sticker home-card solo-config">
          <h2 className="font-display">Configuracao</h2>
          {mode === "perguntas" ? (
            <div className="field">
              <label>Tema (nenhum selecionado = aleatorio)</label>
              <div className="chip-grid">
                {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((cat) => (
                  <button type="button" key={cat} className={`chip ${categories.includes(cat) ? "is-active" : ""}`} onClick={() => toggleCategory(cat)}>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="field">
              <label>Tema do Desafio das Carreiras</label>
              <div className="chip-grid">
                {(Object.keys(CAREER_THEME_LABELS) as CareerTheme[]).map((t) => (
                  <button type="button" key={t} className={`chip ${careerThemes.includes(t) ? "is-active" : ""}`} onClick={() => toggleCareerTheme(t)}>
                    {CAREER_THEME_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="field">
            <label>Dificuldades (nenhuma = todas)</label>
            <div className="chip-grid">
              {DIFFICULTIES.map((d) => (
                <button type="button" key={d} className={`chip ${difficulties.includes(d) ? "is-active" : ""}`} onClick={() => toggleDifficulty(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          {mode === "perguntas" ? (
            <button className="btn btn-primary btn-block" onClick={startQuestions}>
              {question ? "Reiniciar" : "Comecar"}
            </button>
          ) : (
            <button className="btn btn-primary btn-block" onClick={startCareers}>
              {career ? "Reiniciar" : "Comecar"}
            </button>
          )}
        </section>

        {mode === "perguntas" && (
          <section className="panel sticker home-card solo-play">
            <div className="row-between">
              <h2 className="font-display">Perguntas</h2>
              <span className="font-score solo-score">{score.correct} acertos - {score.wrong} erros</span>
            </div>

            {champion ? (
              <div className="center-page">
                <h1 className="font-display" style={{ color: "var(--lima)", fontSize: "2rem" }}>Voce e o Cobra da Bola!</h1>
                <p>Chegou a {WIN_SCORE} acertos.</p>
                <button className="btn btn-primary" onClick={startQuestions}>Jogar de novo</button>
              </div>
            ) : !question ? (
              <p>{questionEmpty ? "Nenhuma pergunta encontrada com esse tema/dificuldade. Tente outro filtro." : 'Escolha o tema e a dificuldade e aperte "Comecar".'}</p>
            ) : (
              <div className="stack">
                <p className="player-answer__question">{question.prompt}</p>
                {question.choices ? (
                  <div className="player-answer__choices">
                    {question.choices.map((c) => (
                      <button
                        type="button"
                        key={c}
                        className="btn btn-bote"
                        disabled={!!result}
                        onClick={() => {
                          setAnswer(c);
                          void submitAnswer(c);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                ) : (
                  <form
                    className="row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void submitAnswer();
                    }}
                  >
                    <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Sua resposta" disabled={!!result} autoFocus />
                    <button className="btn btn-primary" type="submit" disabled={!!result || !answer.trim()}>Responder</button>
                  </form>
                )}
                {result && (
                  <div className={`solo-feedback ${result.correct ? "is-correct" : "is-wrong"}`}>
                    <strong>{result.correct ? "Acertou!" : "Errou."}</strong> Resposta correta: {result.correctAnswer}
                    {result.explanation && <p className="solo-feedback__note">{result.explanation}</p>}
                  </div>
                )}
                {result && !champion && (
                  <button className="btn btn-bote btn-block" disabled={loading} onClick={() => loadNextQuestion([...seenQuestionIds])}>
                    Proxima pergunta
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {mode === "carreiras" && (
          <section className="panel sticker home-card solo-play">
            <div className="row-between">
              <h2 className="font-display">Desafio das Carreiras</h2>
              <span className="font-score solo-score">{careerScore.correct} acertos</span>
            </div>

            {!career ? (
              <p>{careerEmpty ? "Nenhuma carreira encontrada com esse tema/dificuldade. Tente outro filtro." : 'Escolha o tema e a dificuldade e aperte "Comecar".'}</p>
            ) : (
              <div className="stack">
                <span className="font-display career-board__title">De quem e essa carreira?</span>
                <div className="career-board__clubs">
                  {career.clubs.slice(0, revealedCount).map((club, i) => (
                    <div key={i} className="career-club sticker-sm is-revealed">
                      <span className="font-display">{club}</span>
                    </div>
                  ))}
                </div>

                {!careerResult && (
                  <div className="row">
                    <button className="btn btn-bote" disabled={revealedCount >= career.clubs.length} onClick={revealNextClub}>
                      Pular (revelar proximo clube)
                    </button>
                  </div>
                )}

                {!careerResult && (
                  <form
                    className="row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void submitCareerAnswer();
                    }}
                  >
                    <input value={careerAnswer} onChange={(e) => setCareerAnswer(e.target.value)} placeholder="Qual jogador?" autoFocus />
                    <button className="btn btn-primary" type="submit" disabled={!careerAnswer.trim()}>Responder</button>
                  </form>
                )}

                {careerResult && (
                  <div className={`solo-feedback ${careerResult.correct ? "is-correct" : "is-wrong"}`}>
                    <strong>{careerResult.correct ? "Acertou!" : "Errou."}</strong> Era: {careerResult.playerName}
                  </div>
                )}
                {careerResult && (
                  <button className="btn btn-bote btn-block" disabled={loading} onClick={() => loadNextCareer([...seenCareerIds])}>
                    Proxima carreira
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
