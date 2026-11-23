import {
  careerQuotaFor,
  planForParticipantCount,
  REVEAL_WORD_MS,
  routeCareerResult,
  semifinalPairings,
  type BracketMatchup,
  type MatchState,
  type PlayerRef,
  type TeamState,
} from "@cobra/shared";
import type { EngineAction } from "./actions.js";

const TARGET_SCORE = 10;

export class EngineError extends Error {}

function clone(state: MatchState): MatchState {
  return structuredClone(state);
}

function pushHistory(state: MatchState, type: string, message: string): void {
  state.history.push({
    id: `h${state.history.length}`,
    at: Date.now(),
    type,
    message,
    actorUserId: null,
  });
}

function findPlayer(state: MatchState, playerId: string): PlayerRef {
  const p = state.players.find((pl) => pl.id === playerId);
  if (!p) throw new EngineError(`Jogador ${playerId} nao encontrado`);
  return p;
}

function teamOf(state: MatchState, playerId: string): TeamState | null {
  if (!state.teams) return null;
  return state.teams.find((t) => t.playerIds.includes(playerId)) ?? null;
}

/** Players currently allowed to press the buzzer, given the match phase. */
export function eligibleBuzzers(state: MatchState): string[] {
  if (state.phase === "phase1" && state.teams && state.phase1) {
    return state.teams.map((t) => t.playerIds[t.rotationIndex]).filter(Boolean);
  }
  if (state.phase === "phase1" && !state.teams) {
    // n === 2 never reaches here (it skips straight to final), kept defensive.
    return state.players.map((p) => p.id);
  }
  if (state.phase === "career" && state.career) {
    return state.career.eligiblePlayerIds.filter(
      (id) => !state.career!.excludedThisRound.includes(id),
    );
  }
  if (state.phase === "semifinal" && state.semifinal && state.semifinalActiveIndex !== null) {
    const m = state.semifinal[state.semifinalActiveIndex];
    return [m.playerAId, m.playerBId];
  }
  if (state.phase === "final" && state.final) {
    return [state.final.playerAId, state.final.playerBId];
  }
  return [];
}

function ensureBracketRound(state: MatchState): void {
  state.bracketRound = { currentQuestionId: null, usedQuestionIds: [], buzz: emptyBuzz() };
}

function bracketFor(state: MatchState): BracketMatchup | null {
  if (state.phase === "semifinal" && state.semifinal && state.semifinalActiveIndex !== null) {
    return state.semifinal[state.semifinalActiveIndex];
  }
  if (state.phase === "final" && state.final) return state.final;
  return null;
}

export function applyAction(input: MatchState, action: EngineAction): MatchState {
  const state = clone(input);

  switch (action.type) {
    case "JOIN_PLAYER": {
      if (state.phase !== "lobby") throw new EngineError("A partida ja comecou");
      if (state.players.length >= 12) throw new EngineError("Sala cheia (maximo 12 jogadores)");
      if (state.players.some((p) => p.id === action.player.id)) return state;
      state.players.push(action.player);
      state.participantCount = state.players.length;
      pushHistory(state, "join", `${action.player.displayName} entrou na sala`);
      return state;
    }

    case "LEAVE_PLAYER": {
      if (state.phase !== "lobby") throw new EngineError("Nao e possivel sair depois que a partida comecou");
      const player = state.players.find((p) => p.id === action.playerId);
      if (!player) return state;
      state.players = state.players.filter((p) => p.id !== action.playerId);
      state.participantCount = state.players.length;
      pushHistory(state, "leave", `${player.displayName} saiu da sala`);
      return state;
    }

    case "SET_CONNECTED": {
      const p = state.players.find((pl) => pl.id === action.playerId);
      if (p) p.connected = action.connected;
      // Never leave a pending skip request waiting on a representative who
      // just disconnected and can't respond -- resolve it in favor of
      // skipping, exactly as if they had agreed.
      if (!action.connected && (state.phase === "phase1" || state.phase === "semifinal" || state.phase === "final")) {
        const buzz = activeBuzz(state);
        if (buzz && !buzz.firstPlayerId && buzz.skipRequestedBy.length > 0) {
          const eligible = eligibleBuzzers(state);
          const otherRequested = buzz.skipRequestedBy.some((id) => id !== action.playerId);
          if (eligible.includes(action.playerId) && otherRequested) {
            resolveSkip(state);
          }
        }
      }
      return state;
    }

    case "SET_TEAMS": {
      if (state.phase !== "lobby") throw new EngineError("Times ja definidos");
      for (const [playerId, team] of Object.entries(action.assignments)) {
        const p = findPlayer(state, playerId);
        p.teamId = team;
      }
      return state;
    }

    case "START_MATCH": {
      if (state.phase !== "lobby") throw new EngineError("Partida ja iniciada");
      state.countdownEndsAt = null;
      const n = state.players.length;
      if (n < 2 || n > 12) throw new EngineError("Numero de participantes deve ser entre 2 e 12");
      const plan = planForParticipantCount(n as any);
      state.participantCount = n;

      if (!plan.hasTeams) {
        if (n === 2) {
          state.final = {
            id: "final",
            label: "Final",
            playerAId: state.players[0].id,
            playerBId: state.players[1].id,
            scoreA: 0,
            scoreB: 0,
            winnerId: null,
          };
          ensureBracketRound(state);
          state.phase = "final";
          state.timer = { seconds: state.settings.answerSeconds, endsAt: null, remainingForActivePlayer: null };
          state.presenterCue = { type: "final_start" };
          pushHistory(state, "start", "Partida 1x1 iniciada direto na final");
          return state;
        }
        // n === 3: straight to career with the whole lobby as the cohort.
        state.career = {
          careerQuestionId: null,
          revealedClubCount: 0,
          eligiblePlayerIds: state.players.map((p) => p.id),
          excludedThisRound: [],
          buzz: emptyBuzz(),
        };
        state.phase = "career";
        pushHistory(state, "start", "Partida iniciada direto na fase de carreira (3 participantes)");
        return state;
      }

      // n >= 4: assign unassigned players to balance team sizes if the host
      // did not fully assign teams, then build TeamState and start Phase 1.
      autoBalanceTeams(state, plan.teamASize, plan.teamBSize);
      const teamA = state.players.filter((p) => p.teamId === "A").map((p) => p.id);
      const teamB = state.players.filter((p) => p.teamId === "B").map((p) => p.id);
      state.teams = [
        { id: "A", color: "lima", score: 0, playerIds: teamA, rotationIndex: 0 },
        { id: "B", color: "orange", score: 0, playerIds: teamB, rotationIndex: 0 },
      ];
      state.phase1 = { buzz: emptyBuzz(), currentQuestionId: null, usedQuestionIds: [], targetScore: 10 };
      state.phase = "phase1";
      state.timer = { seconds: state.settings.answerSeconds, endsAt: null, remainingForActivePlayer: null };
      pushHistory(state, "start", `Fase 1 iniciada: Equipe A (${teamA.length}) vs Equipe B (${teamB.length})`);
      return state;
    }

    case "RELEASE_PHASE1_QUESTION": {
      requirePhase(state, "phase1");
      state.phase1!.currentQuestionId = action.question.id;
      state.phase1!.buzz = emptyBuzz();
      state.lastAnswer = null;
      state.presenterCue = { type: "presenting_question", text: action.question.prompt };
      pushHistory(state, "question", "Pergunta liberada na Fase 1");
      return state;
    }

    case "RELEASE_BRACKET_QUESTION": {
      if (state.phase !== "semifinal" && state.phase !== "final") {
        throw new EngineError(`Acao invalida na fase atual (${state.phase})`);
      }
      if (!state.bracketRound) ensureBracketRound(state);
      state.bracketRound!.currentQuestionId = action.question.id;
      state.bracketRound!.buzz = emptyBuzz();
      state.lastAnswer = null;
      state.presenterCue = { type: "presenting_question", text: action.question.prompt };
      pushHistory(state, "question", "Pergunta liberada no confronto");
      return state;
    }

    case "RELEASE_CAREER_QUESTION": {
      requirePhase(state, "career");
      state.career!.careerQuestionId = action.careerQuestion.id;
      state.career!.revealedClubCount = 1;
      state.career!.excludedThisRound = [];
      state.career!.buzz = { ...emptyBuzz(), armed: true, questionOpenedAt: Date.now() };
      state.lastAnswer = null;
      state.presenterCue = { type: "presenting_question", text: "De quem e essa carreira?" };
      pushHistory(state, "career_question", "Nova carreira revelada");
      return state;
    }

    case "ARM_BUTTONS": {
      if (state.phase === "phase1") {
        state.phase1!.buzz = { ...emptyBuzz(), armed: true, questionOpenedAt: action.now };
      } else if (state.phase === "semifinal" || state.phase === "final") {
        if (!state.bracketRound) ensureBracketRound(state);
        state.bracketRound!.buzz = { ...emptyBuzz(), armed: true, questionOpenedAt: action.now };
      } else {
        throw new EngineError(`Acao invalida na fase atual (${state.phase})`);
      }
      state.timer = { seconds: action.durationSeconds, endsAt: null, remainingForActivePlayer: null };
      return state;
    }

    case "REVEAL_NEXT_CLUB": {
      requirePhase(state, "career");
      const c = state.career!;
      c.revealedClubCount += 1;
      c.buzz = { ...emptyBuzz(), armed: true, questionOpenedAt: Date.now() };
      pushHistory(state, "club", `Proximo clube revelado (${c.revealedClubCount})`);
      return state;
    }

    case "PLAYER_BUZZ": {
      const buzz = activeBuzz(state);
      if (!buzz) throw new EngineError("Nenhuma disputa de botao ativa");
      if (!buzz.armed) throw new EngineError("Botoes ainda bloqueados");
      if (buzz.firstPlayerId) {
        if (!buzz.buzzOrder.includes(action.playerId) && !buzz.lockedOut.includes(action.playerId)) {
          buzz.lockedOut.push(action.playerId);
        }
        return state;
      }
      const eligible = eligibleBuzzers(state);
      if (!eligible.includes(action.playerId)) {
        throw new EngineError("Jogador nao esta habilitado a apertar agora");
      }
      buzz.firstPlayerId = action.playerId;
      buzz.buzzOrder.push(action.playerId);
      // Authoritative freeze point: how many words of the prompt were
      // visible at this exact instant, derived from the server's own
      // questionOpenedAt timestamp -- never from anything the client
      // reports. Every player renders exactly this count once it's set
      // (see PlayerView.tsx), so the frozen fragment is identical for
      // everyone no matter each client's own latency/clock.
      if (buzz.questionOpenedAt != null) {
        const wordsElapsed = Math.floor((action.now - buzz.questionOpenedAt) / REVEAL_WORD_MS) + 1;
        buzz.frozenWordCount = Math.max(1, Math.min(wordsElapsed, action.totalWords));
      } else {
        buzz.frozenWordCount = action.totalWords;
      }
      // A fresh buzz always starts a new attempt; clear any stale result
      // left over from a previous buzzer (relevant in career mode, where
      // a wrong answer re-arms the buzzer for the next player without an
      // explicit "advance" step in between).
      state.lastAnswer = null;
      if (state.phase === "phase1" || state.phase === "semifinal" || state.phase === "final" || state.phase === "career") {
        const seconds = state.timer?.seconds ?? state.settings.answerSeconds;
        state.timer = { seconds, endsAt: action.now + seconds * 1000, remainingForActivePlayer: seconds };
      }
      pushHistory(state, "buzz", `${findPlayer(state, action.playerId).displayName} apertou primeiro`);
      return state;
    }

    case "REQUEST_SKIP": {
      if (state.phase !== "phase1" && state.phase !== "semifinal" && state.phase !== "final") {
        throw new EngineError(`Acao invalida na fase atual (${state.phase})`);
      }
      const buzz = activeBuzz(state);
      if (!buzz || buzz.questionOpenedAt == null) {
        throw new EngineError("Nao ha pergunta sendo apresentada");
      }
      if (buzz.firstPlayerId) {
        throw new EngineError("Alguem ja apertou o botao -- nao e mais possivel pedir para pular");
      }
      const eligible = eligibleBuzzers(state);
      if (!eligible.includes(action.playerId)) {
        throw new EngineError("Apenas os representantes desta rodada podem pedir para pular");
      }
      if (!buzz.skipRequestedBy.includes(action.playerId)) {
        buzz.skipRequestedBy.push(action.playerId);
        pushHistory(state, "skip_request", `${findPlayer(state, action.playerId).displayName} pediu para pular esta pergunta`);
      }
      const other = eligible.find((id) => id !== action.playerId);
      const otherAgreedOrGone = !other || buzz.skipRequestedBy.includes(other) || !findPlayer(state, other).connected;
      if (otherAgreedOrGone) resolveSkip(state);
      return state;
    }

    case "SET_COUNTDOWN": {
      if (state.phase !== "lobby") return state;
      state.countdownEndsAt = action.endsAt;
      return state;
    }

    case "AUTO_SKIP": {
      if (state.phase !== "phase1" && state.phase !== "semifinal" && state.phase !== "final") return state;
      const buzz = activeBuzz(state);
      if (!buzz || buzz.firstPlayerId || state.lastAnswer) return state;
      resolveSkip(state);
      return state;
    }

    case "SUBMIT_ANSWER": {
      const buzz = activeBuzz(state);
      if (!buzz || buzz.firstPlayerId !== action.playerId) {
        throw new EngineError("Apenas quem apertou primeiro pode responder");
      }
      state.lastAnswer = {
        playerId: action.playerId,
        submittedAnswer: action.answer,
        correct: false,
        timedOut: false,
        skipped: false,
        pointsAwardedTo: null,
      };
      if (state.timer) state.timer.endsAt = null;
      return state;
    }

    case "TIMEOUT": {
      const buzz = activeBuzz(state);
      if (!buzz || !buzz.firstPlayerId) return state; // nobody to time out
      const playerId = buzz.firstPlayerId;
      applyJudgement(state, playerId, false, true);
      return state;
    }

    case "HOST_JUDGE": {
      applyJudgement(state, action.playerId, action.correct, false);
      return state;
    }

    case "ADVANCE_PHASE1_QUESTION": {
      requirePhase(state, "phase1");
      if (!state.teams) return state;
      for (const team of state.teams) {
        if (team.playerIds.length > 0) {
          team.rotationIndex = (team.rotationIndex + 1) % team.playerIds.length;
        }
      }
      state.phase1!.buzz = emptyBuzz();
      if (state.phase1!.currentQuestionId) {
        state.phase1!.usedQuestionIds.push(state.phase1!.currentQuestionId);
      }
      state.phase1!.currentQuestionId = null;
      state.lastAnswer = null;
      state.presenterCue = { type: "idle" };
      return state;
    }

    case "ADVANCE_BRACKET_QUESTION": {
      if (state.phase !== "semifinal" && state.phase !== "final") {
        throw new EngineError(`Acao invalida na fase atual (${state.phase})`);
      }
      if (state.bracketRound) {
        if (state.bracketRound.currentQuestionId) {
          state.bracketRound.usedQuestionIds.push(state.bracketRound.currentQuestionId);
        }
        state.bracketRound.currentQuestionId = null;
        state.bracketRound.buzz = emptyBuzz();
      }
      state.lastAnswer = null;
      state.presenterCue = { type: "idle" };
      return state;
    }

    case "END_CAREER_ROUND": {
      requirePhase(state, "career");
      state.career!.careerQuestionId = null;
      state.career!.revealedClubCount = 0;
      state.career!.excludedThisRound = [];
      state.career!.buzz = emptyBuzz();
      state.lastAnswer = null;
      pushHistory(state, "career_end", "Carreira encerrada sem acerto, proxima sera revelada");
      return state;
    }

    case "ADJUST_SCORE": {
      if (state.teams) {
        const team = state.teams.find((t) => t.id === action.teamOrPlayerId);
        if (team) {
          team.score = Math.max(0, team.score + action.delta);
          pushHistory(state, "adjust", `Placar da equipe ${team.id} ajustado em ${action.delta}`);
          return state;
        }
      }
      const bracket = bracketFor(state);
      if (bracket) {
        if (bracket.playerAId === action.teamOrPlayerId) bracket.scoreA = Math.max(0, bracket.scoreA + action.delta);
        else if (bracket.playerBId === action.teamOrPlayerId) bracket.scoreB = Math.max(0, bracket.scoreB + action.delta);
        pushHistory(state, "adjust", `Placar ajustado manualmente em ${action.delta}`);
      }
      return state;
    }

    case "PAUSE": {
      state.paused = true;
      return state;
    }
    case "RESUME": {
      state.paused = false;
      return state;
    }

    case "END_MATCH_FORCE": {
      finishMatch(state, null, null);
      pushHistory(state, "force_end", "Partida encerrada manualmente pelo apresentador");
      return state;
    }

    default:
      return state;
  }
}

function requirePhase(state: MatchState, phase: MatchState["phase"]): void {
  if (state.phase !== phase) throw new EngineError(`Acao invalida na fase atual (${state.phase})`);
}

function emptyBuzz() {
  return { questionOpenedAt: null, armed: false, firstPlayerId: null, buzzOrder: [], lockedOut: [], frozenWordCount: null, skipRequestedBy: [] };
}

/** Ends the current phase1/semifinal/final round with no points awarded to
 * anyone, because its two representatives mutually agreed to skip it (or
 * one did and the other is disconnected and can't respond). Never used for
 * career -- the presenter's existing END_CAREER_ROUND already covers "no
 * one knew it" there. */
function resolveSkip(state: MatchState): void {
  if (state.phase === "phase1" && state.phase1) {
    state.phase1.buzz = emptyBuzz();
  } else if ((state.phase === "semifinal" || state.phase === "final") && state.bracketRound) {
    state.bracketRound.buzz = emptyBuzz();
  } else {
    return;
  }
  if (state.timer) state.timer.endsAt = null;
  state.lastAnswer = { playerId: null, submittedAnswer: null, correct: false, timedOut: false, skipped: true, pointsAwardedTo: null };
  state.presenterCue = { type: "skipped" };
  pushHistory(state, "skip", "Pergunta pulada de comum acordo entre os representantes");
}

export function activeBuzz(state: MatchState) {
  if (state.phase === "phase1") return state.phase1?.buzz ?? null;
  if (state.phase === "career") return state.career?.buzz ?? null;
  if (state.phase === "semifinal" || state.phase === "final") return state.bracketRound?.buzz ?? null;
  return null;
}

function applyJudgement(state: MatchState, playerId: string, correct: boolean, timedOut: boolean): void {
  const player = findPlayer(state, playerId);

  if (state.phase === "phase1") {
    const team = teamOf(state, playerId)!;
    const other = state.teams!.find((t) => t.id !== team.id)!;
    if (correct) {
      team.score += 1;
      player.correctAnswers += 1;
      state.lastAnswer = { playerId, submittedAnswer: state.lastAnswer?.submittedAnswer ?? null, correct: true, timedOut, skipped: false, pointsAwardedTo: team.id };
      state.presenterCue = { type: "correct", playerId };
      pushHistory(state, "judge", `${player.displayName} acertou (+1 Equipe ${team.id})`);
    } else {
      other.score += 1;
      player.wrongAnswers += 1;
      state.lastAnswer = { playerId, submittedAnswer: state.lastAnswer?.submittedAnswer ?? null, correct: false, timedOut, skipped: false, pointsAwardedTo: other.id };
      state.presenterCue = { type: "wrong", playerId };
      pushHistory(state, "judge", `${player.displayName} errou (+1 Equipe ${other.id})`);
    }
    if (state.timer) state.timer.endsAt = null;
    if (team.score >= TARGET_SCORE || other.score >= TARGET_SCORE) {
      const winner = team.score >= TARGET_SCORE ? team : other;
      const loser = winner === team ? other : team;
      for (const pid of loser.playerIds) findPlayer(state, pid).eliminated = true;
      beginCareerOrSkip(state, winner.playerIds);
    }
    return;
  }

  if (state.phase === "career") {
    const c = state.career!;
    if (state.timer) state.timer.endsAt = null;
    if (correct) {
      player.qualified = true;
      player.correctAnswers += 1;
      const rank = state.careerResults.length + 1;
      player.careerRank = rank;
      state.careerResults.push({ playerId, rank });
      c.eligiblePlayerIds = c.eligiblePlayerIds.filter((id) => id !== playerId);
      state.lastAnswer = { playerId, submittedAnswer: state.lastAnswer?.submittedAnswer ?? null, correct: true, timedOut, skipped: false, pointsAwardedTo: "career" };
      state.presenterCue = { type: "qualified", playerId };
      pushHistory(state, "judge", `${player.displayName} acertou a carreira (classificado em ${rank}o)`);

      const cohort = careerCohort(state);
      const quota = careerQuotaFor(cohort.length);
      if (state.careerResults.length >= quota) {
        resolveCareer(state, cohort);
        return;
      }
      c.careerQuestionId = null;
      c.revealedClubCount = 0;
      c.excludedThisRound = [];
      c.buzz = emptyBuzz();
    } else {
      player.wrongAnswers += 1;
      c.excludedThisRound.push(playerId);
      c.buzz = { ...c.buzz, firstPlayerId: null, buzzOrder: [], armed: c.eligiblePlayerIds.some((id) => !c.excludedThisRound.includes(id)) };
      // Kept truthy just long enough for the UI to show the "errou" result;
      // the next PLAYER_BUZZ (re-armed above) clears it so the next
      // contender isn't blocked from answering by this stale result.
      state.lastAnswer = { playerId, submittedAnswer: state.lastAnswer?.submittedAnswer ?? null, correct: false, timedOut, skipped: false, pointsAwardedTo: "career" };
      state.presenterCue = { type: "wrong", playerId };
      pushHistory(state, "judge", `${player.displayName} errou nesta carreira`);
    }
    return;
  }

  // semifinal / final: 1v1 bracket scoring
  const bracket = bracketFor(state)!;
  const isA = bracket.playerAId === playerId;
  if (correct) {
    if (isA) bracket.scoreA += 1;
    else bracket.scoreB += 1;
    player.correctAnswers += 1;
    state.lastAnswer = { playerId, submittedAnswer: state.lastAnswer?.submittedAnswer ?? null, correct: true, timedOut, skipped: false, pointsAwardedTo: "player" };
    state.presenterCue = { type: "correct", playerId };
    pushHistory(state, "judge", `${player.displayName} acertou (+1)`);
  } else {
    if (isA) bracket.scoreB += 1;
    else bracket.scoreA += 1;
    player.wrongAnswers += 1;
    state.lastAnswer = { playerId, submittedAnswer: state.lastAnswer?.submittedAnswer ?? null, correct: false, timedOut, skipped: false, pointsAwardedTo: "opponent" };
    state.presenterCue = { type: "wrong", playerId };
    pushHistory(state, "judge", `${player.displayName} errou (+1 adversario)`);
  }
  if (state.timer) state.timer.endsAt = null;
  if (state.bracketRound) state.bracketRound.buzz = emptyBuzz();

  if (bracket.scoreA >= TARGET_SCORE || bracket.scoreB >= TARGET_SCORE) {
    bracket.winnerId = bracket.scoreA >= TARGET_SCORE ? bracket.playerAId : bracket.playerBId;
    const loserId = bracket.winnerId === bracket.playerAId ? bracket.playerBId : bracket.playerAId;
    if (state.phase === "final") {
      findPlayer(state, loserId).eliminated = true;
      finishMatch(state, bracket.winnerId, loserId);
      return;
    }
    // semifinal resolved
    findPlayer(state, loserId).eliminated = true;
    findPlayer(state, bracket.winnerId).qualified = true;
    state.presenterCue = { type: "qualified", playerId: bracket.winnerId };
    const nextIndex = (state.semifinalActiveIndex ?? 0) + 1;
    if (nextIndex < state.semifinal!.length) {
      state.semifinalActiveIndex = nextIndex;
      pushHistory(state, "semifinal", "Segunda semifinal comeca");
    } else {
      const winners = state.semifinal!.map((m) => m.winnerId!);
      state.final = {
        id: "final",
        label: "Final",
        playerAId: winners[0],
        playerBId: winners[1],
        scoreA: 0,
        scoreB: 0,
        winnerId: null,
      };
      state.semifinalActiveIndex = null;
      state.phase = "final";
      state.presenterCue = { type: "final_start" };
      pushHistory(state, "final", "Final definida");
    }
  }
}

/** The fixed set of players disputing this career stage: those still
 * eligible plus those who already classified. Membership never shrinks
 * except by qualifying, so this is stable for the whole career stage. */
function careerCohort(state: MatchState): string[] {
  return [...state.career!.eligiblePlayerIds, ...state.careerResults.map((r) => r.playerId)];
}

function resolveCareer(state: MatchState, cohort: string[]): void {
  const rankedIds = [...state.careerResults].sort((a, b) => a.rank - b.rank).map((r) => r.playerId);
  const routing = routeCareerResult(cohort, rankedIds);
  state.career = null;

  if (routing.outcome === "direct_final" || routing.outcome === "top2_to_final") {
    for (const id of routing.outcome === "top2_to_final" ? routing.eliminated : []) {
      findPlayer(state, id).eliminated = true;
    }
    state.final = {
      id: "final",
      label: "Final",
      playerAId: routing.finalists[0],
      playerBId: routing.finalists[1],
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
    };
    state.phase = "final";
    state.timer = { seconds: state.settings.answerSeconds, endsAt: null, remainingForActivePlayer: null };
    state.presenterCue = { type: "final_start" };
    pushHistory(state, "final", "Classificados para a final definidos pela carreira");
    return;
  }

  for (const id of routing.eliminated) findPlayer(state, id).eliminated = true;
  const [sf1, sf2] = semifinalPairings(routing.seeded);
  state.semifinal = [
    { id: "sf1", label: "Semifinal 1", playerAId: sf1[0], playerBId: sf1[1], scoreA: 0, scoreB: 0, winnerId: null },
    { id: "sf2", label: "Semifinal 2", playerAId: sf2[0], playerBId: sf2[1], scoreA: 0, scoreB: 0, winnerId: null },
  ];
  state.semifinalActiveIndex = 0;
  state.phase = "semifinal";
  state.timer = { seconds: state.settings.answerSeconds, endsAt: null, remainingForActivePlayer: null };
  state.presenterCue = { type: "semifinal_start" };
  pushHistory(state, "semifinal", "Semifinais definidas pela ordem de classificacao da carreira");
}

function beginCareerOrSkip(state: MatchState, cohort: string[]): void {
  state.phase1 = null;
  if (cohort.length === 2) {
    state.final = {
      id: "final",
      label: "Final",
      playerAId: cohort[0],
      playerBId: cohort[1],
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
    };
    state.phase = "final";
    state.presenterCue = { type: "final_start" };
    pushHistory(state, "final", "Equipe vencedora segue direto para a final");
    return;
  }
  state.career = {
    careerQuestionId: null,
    revealedClubCount: 0,
    eligiblePlayerIds: [...cohort],
    excludedThisRound: [],
    buzz: emptyBuzz(),
  };
  state.phase = "career";
  state.presenterCue = { type: "idle" };
  pushHistory(state, "career_start", "Fase de carreira iniciada para a equipe vencedora");
}

function finishMatch(state: MatchState, winnerId: string | null, runnerUpId: string | null): void {
  state.phase = "champion";
  const winner = winnerId ? findPlayer(state, winnerId) : null;
  const runnerUp = runnerUpId ? findPlayer(state, runnerUpId) : null;
  state.winnerUserId = winner?.userId ?? null;
  state.runnerUpUserId = runnerUp?.userId ?? null;
  if (winnerId) {
    state.presenterCue = { type: "champion", playerId: winnerId };
    pushHistory(state, "champion", `${winner?.displayName} e o Cobra da Bola!`);
  }
}

function autoBalanceTeams(state: MatchState, teamASize: number, teamBSize: number): void {
  const unassigned = state.players.filter((p) => p.teamId === null);
  const countA = state.players.filter((p) => p.teamId === "A").length;
  const countB = state.players.filter((p) => p.teamId === "B").length;
  let needA = teamASize - countA;
  let needB = teamBSize - countB;
  const shuffled = shuffle(unassigned);
  for (const p of shuffled) {
    if (needA > 0) {
      p.teamId = "A";
      needA -= 1;
    } else if (needB > 0) {
      p.teamId = "B";
      needB -= 1;
    }
  }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
