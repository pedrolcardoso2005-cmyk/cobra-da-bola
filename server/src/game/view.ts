import type {
  HostQuestionView,
  MatchState,
  PlayerButtonState,
  PlayerView,
  PublicQuestion,
  Question,
  CareerQuestion,
} from "@cobra/shared";
import { activeBuzz, eligibleBuzzers } from "./engine.js";

export function toPublicQuestion(q: Question): PublicQuestion {
  return { id: q.id, prompt: q.prompt, format: q.format, choices: q.choices, category: q.category, difficulty: q.difficulty };
}

export function toHostQuestionView(q: Question): HostQuestionView {
  return { ...toPublicQuestion(q), correctAnswer: q.correctAnswer, acceptedAnswers: q.acceptedAnswers };
}

export function computeButtonState(match: MatchState, playerId: string): PlayerButtonState {
  const player = match.players.find((p) => p.id === playerId);
  if (!player) return "spectating";
  if (player.eliminated) return "eliminated";
  if (match.phase === "champion") return player.qualified || match.winnerUserId === player.userId ? "qualified" : "eliminated";
  if (match.phase === "lobby") return "spectating";

  const eligible = eligibleBuzzers(match);
  if (!eligible.includes(playerId)) {
    return player.qualified ? "qualified" : "spectating";
  }
  const buzz = activeBuzz(match);
  if (!buzz) return "blocked";
  if (buzz.firstPlayerId === playerId) return "buzzed_self";
  if (buzz.firstPlayerId) return "buzzed_other";
  return buzz.armed ? "armed" : "blocked";
}

export function buildPlayerView(match: MatchState, playerId: string, currentQuestion: Question | null, now: number): PlayerView {
  const self = match.players.find((p) => p.id === playerId)!;
  const buttonState = computeButtonState(match, playerId);
  const canSubmitAnswer = buttonState === "buzzed_self" && (!match.lastAnswer || match.lastAnswer.playerId !== playerId);
  let myTimerSecondsLeft: number | null = null;
  if (buttonState === "buzzed_self" && match.timer?.endsAt) {
    myTimerSecondsLeft = Math.max(0, Math.ceil((match.timer.endsAt - now) / 1000));
  }
  return {
    match: match as PlayerView["match"],
    self,
    currentQuestion: currentQuestion ? toPublicQuestion(currentQuestion) : null,
    myButtonState: buttonState,
    canSubmitAnswer,
    myTimerSecondsLeft,
  };
}

export function careerClubsRevealed(careerQuestion: CareerQuestion | null, revealedCount: number): string[] | null {
  if (!careerQuestion) return null;
  return careerQuestion.clubs.slice(0, revealedCount);
}
