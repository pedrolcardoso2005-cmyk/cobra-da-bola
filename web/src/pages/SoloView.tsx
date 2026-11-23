import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { api } from "../lib/api";
import { REVEAL_WORD_MS, type PublicQuestion } from "@cobra/shared";
import { SoloCharacter } from "../components/SoloCharacter";
import { Fireworks } from "../components/scenes/Fireworks";
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
  /** True when this came from "Pular" rather than a graded answer: no
   * points awarded, shown neutrally instead of acertou/errou. */
  skipped?: boolean;
}

interface CareerAnswerResult {
  correct: boolean;
  playerName: string;
  acceptedAnswers: string[] | null;
  skipped?: boolean;
}

export default function SoloView() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"perguntas" | "carreiras">("perguntas");

  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [seenQuestionIds, setSeenQuestionIds] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [champion, setChampion] = useState(false);
  const [loading, setLoading] = useState(false);
  // Groups this run's answers for "Meu Historico" (melhor pontuacao,
  // historico de partidas) -- purely a grouping key the server never
  // validates, regenerated every time a fresh "partida" starts.
  const [questionSessionId, setQuestionSessionId] = useState(() => crypto.randomUUID());
  const [careerSessionId, setCareerSessionId] = useState(() => crypto.randomUUID());

  // Progressive word-by-word reveal for the Perguntas tab -- purely local
  // (no race to sync, it's a single player), but the same pacing and
  // freeze-on-answer behaviour as the multiplayer reveal (PlayerView.tsx).
  const soloWords = useMemo(() => (question?.prompt ?? "").split(/\s+/).filter(Boolean), [question?.prompt]);
  const [soloRevealedCount, setSoloRevealedCount] = useState(0);
  const [soloFrozen, setSoloFrozen] = useState(false);

  useEffect(() => {
    setSoloRevealedCount(soloWords.length > 0 ? 1 : 0);
    setSoloFrozen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  useEffect(() => {
    if (soloFrozen || soloRevealedCount >= soloWords.length) return;
    const id = setTimeout(() => setSoloRevealedCount((n) => n + 1), REVEAL_WORD_MS);
    return () => clearTimeout(id);
  }, [soloFrozen, soloRevealedCount, soloWords.length]);

  const [career, setCareer] = useState<PublicCareer | null>(null);
  const [seenCareerIds, setSeenCareerIds] = useState<string[]>([]);
  const [revealedCount, setRevealedCount] = useState(1);
  const [careerAnswer, setCareerAnswer] = useState("");
  const [careerResult, setCareerResult] = useState<CareerAnswerResult | null>(null);
  const [careerScore, setCareerScore] = useState({ correct: 0, skipped: 0 });
  const [careerEmpty, setCareerEmpty] = useState(false);
  const [questionEmpty, setQuestionEmpty] = useState(false);

  async function loadNextQuestion(excludeIds: string[]) {
    setLoading(true);
    setResult(null);
    setAnswer("");
    try {
      const qs = new URLSearchParams({
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
    setSoloFrozen(true);
    const data = await api.post<AnswerResult>("/api/solo/pergunta/responder", {
      questionId: question.id,
      answer: value.trim(),
      sessionId: questionSessionId,
    });
    setResult(data);
    setScore((prev) => {
      const next = data.correct ? { ...prev, correct: prev.correct + 1 } : { ...prev, wrong: prev.wrong + 1 };
      if (data.correct && next.correct >= WIN_SCORE) setChampion(true);
      return next;
    });
    setSeenQuestionIds((prev) => [...prev, question.id]);
  }

  async function skipQuestion() {
    if (!question) return;
    setSoloFrozen(true);
    const data = await api.post<{ correctAnswer: string; acceptedAnswers?: string[]; explanation: string | null }>(
      "/api/solo/pergunta/pular",
      { questionId: question.id, sessionId: questionSessionId },
    );
    setResult({ correct: false, correctAnswer: data.correctAnswer, acceptedAnswers: data.acceptedAnswers, explanation: data.explanation, skipped: true });
    setScore((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
    setSeenQuestionIds((prev) => [...prev, question.id]);
  }

  function startQuestions() {
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    setChampion(false);
    setSeenQuestionIds([]);
    setQuestionSessionId(crypto.randomUUID());
    void loadNextQuestion([]);
  }

  async function loadNextCareer(excludeIds: string[]) {
    setLoading(true);
    setCareerResult(null);
    setCareerAnswer("");
    setRevealedCount(1);
    try {
      const qs = new URLSearchParams({
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
    const data = await api.post<CareerAnswerResult>("/api/solo/carreira/responder", {
      careerId: career.id,
      answer: careerAnswer.trim(),
      sessionId: careerSessionId,
    });
    setCareerResult(data);
    setCareerScore((prev) => ({ ...prev, correct: data.correct ? prev.correct + 1 : prev.correct }));
    setSeenCareerIds((prev) => [...prev, career.id]);
  }

  async function skipCareer() {
    if (!career) return;
    const data = await api.post<{ playerName: string; acceptedAnswers: string[] | null }>(
      "/api/solo/carreira/pular",
      { careerId: career.id, sessionId: careerSessionId },
    );
    setCareerResult({ correct: false, playerName: data.playerName, acceptedAnswers: data.acceptedAnswers, skipped: true });
    setCareerScore((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
    setSeenCareerIds((prev) => [...prev, career.id]);
  }

  function startCareers() {
    setCareerScore({ correct: 0, skipped: 0 });
    setSeenCareerIds([]);
    setCareerSessionId(crypto.randomUUID());
    void loadNextCareer([]);
  }

  return (
    <div className="home-shell">
      <header className="home-header">
        <h1 className="font-display home-header__title">Jogar sozinho</h1>
        <nav className="row">
          <span className="home-header__user">Ola, {user?.displayName}</span>
          <Link className="btn btn-ghost" to="/historico">Meu historico</Link>
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
          <p>Perguntas e carreiras sorteadas de todo o banco.</p>
          {mode === "perguntas" ? (
            <button className="btn btn-primary btn-block" onClick={startQuestions} disabled={loading}>
              {loading ? "Carregando..." : question ? "Reiniciar" : "Comecar"}
            </button>
          ) : (
            <button className="btn btn-primary btn-block" onClick={startCareers} disabled={loading}>
              {loading ? "Carregando..." : career ? "Reiniciar" : "Comecar"}
            </button>
          )}
        </section>

        {mode === "perguntas" && (
          <section className="panel sticker home-card solo-play">
            <div className="row-between">
              <h2 className="font-display">Perguntas</h2>
              <span className="font-score solo-score">{score.correct} acertos - {score.wrong} erros - {score.skipped} puladas</span>
            </div>

            {champion ? (
              <div className="center-page" style={{ position: "relative" }}>
                <Fireworks intense />
                <SoloCharacter state="champion" />
                <h1 className="font-display" style={{ color: "var(--lima)", fontSize: "2rem" }}>Voce e o Cobra da Bola!</h1>
                <p>Chegou a {WIN_SCORE} acertos.</p>
                <button className="btn btn-primary" onClick={startQuestions}>Jogar de novo</button>
              </div>
            ) : !question ? (
              <p>{questionEmpty ? "Nenhuma pergunta encontrada com esse tema/dificuldade. Tente outro filtro." : 'Escolha o tema e a dificuldade e aperte "Comecar".'}</p>
            ) : (
              <div className="stack">
                <p className="player-answer__question">{soloWords.slice(0, soloRevealedCount).join(" ")}</p>
                {soloFrozen && soloRevealedCount < soloWords.length && (
                  <p className="error-text">A pergunta foi interrompida porque voce respondeu antes de ela terminar.</p>
                )}
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
                {!result && (
                  <button type="button" className="btn btn-ghost" onClick={() => void skipQuestion()}>
                    Pular pergunta
                  </button>
                )}
                {result && (
                  <>
                    <SoloCharacter state={result.skipped ? "skipped" : result.correct ? "correct" : "wrong"} />
                    <div className={`solo-feedback ${result.skipped ? "" : result.correct ? "is-correct" : "is-wrong"}`}>
                      <strong>{result.skipped ? "Pulada." : result.correct ? "Acertou!" : "Errou."}</strong> Resposta correta: {result.correctAnswer}
                      {result.explanation && <p className="solo-feedback__note">{result.explanation}</p>}
                    </div>
                  </>
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
              <span className="font-score solo-score">{careerScore.correct} acertos - {careerScore.skipped} puladas</span>
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
                      Revelar proximo clube
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => void skipCareer()}>
                      Pular carreira
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
                  <>
                    <SoloCharacter state={careerResult.skipped ? "skipped" : careerResult.correct ? "correct" : "wrong"} />
                    <div className={`solo-feedback ${careerResult.skipped ? "" : careerResult.correct ? "is-correct" : "is-wrong"}`}>
                      <strong>{careerResult.skipped ? "Pulada." : careerResult.correct ? "Acertou!" : "Errou."}</strong> Era: {careerResult.playerName}
                    </div>
                  </>
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
