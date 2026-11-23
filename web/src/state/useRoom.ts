import { useCallback, useEffect, useRef, useState } from "react";
import type {
  HostQuestionView,
  MatchState,
  PlayerView,
  PublicQuestion,
  TeamKey,
} from "@cobra/shared";
import { getSocket } from "../lib/socket";

export type RoomRole = "player" | "screen" | "host";

export function useRoom(code: string | undefined, role: RoomRole) {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [careerClubs, setCareerClubs] = useState<string[] | null>(null);
  const [skippedAnswer, setSkippedAnswer] = useState<string | null>(null);
  const [answerKey, setAnswerKey] = useState<{ question: HostQuestionView | null; careerPlayerName: string | null } | null>(null);
  const [playerView, setPlayerView] = useState<PlayerView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    if (!code) return;
    const socket = socketRef.current;

    function onState(payload: { match: MatchState }) {
      setMatch(payload.match);
    }
    function onQuestion(payload: { question: PublicQuestion | null; careerClubs: string[] | null; skippedAnswer?: string | null }) {
      setSkippedAnswer(payload.skippedAnswer ?? null);
      setQuestion(payload.question);
      setCareerClubs(payload.careerClubs);
    }
    function onAnswerKey(payload: { question: HostQuestionView | null; careerPlayerName: string | null }) {
      setAnswerKey(payload);
    }
    function onPlayerView(payload: PlayerView) {
      setPlayerView(payload);
    }
    function onError(payload: { message: string }) {
      setError(payload.message);
    }

    socket.on("room:state", onState);
    socket.on("room:question", onQuestion);
    socket.on("host:answerKey", onAnswerKey);
    socket.on("player:view", onPlayerView);
    socket.on("error", onError);

    socket.emit("room:join", { code, role }, (res) => {
      if (res.ok) setJoined(true);
      else setError(res.error);
    });

    return () => {
      socket.off("room:state", onState);
      socket.off("room:question", onQuestion);
      socket.off("host:answerKey", onAnswerKey);
      socket.off("player:view", onPlayerView);
      socket.off("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, role]);

  const actions = useActions(socketRef.current, code);

  return { match, question, careerClubs, skippedAnswer, answerKey, playerView, error, joined, actions };
}

function useActions(socket: ReturnType<typeof getSocket>, code: string | undefined) {
  const setTeams = useCallback((assignments: Record<string, TeamKey>, mode: "manual" | "random" = "manual") => {
    socket.emit("room:setTeams", { assignments, mode });
  }, [socket]);
  const start = useCallback(() => socket.emit("room:start"), [socket]);
  const pause = useCallback(() => socket.emit("room:pause"), [socket]);
  const resume = useCallback(() => socket.emit("room:resume"), [socket]);
  const leaveRoom = useCallback(() => socket.emit("room:leave"), [socket]);
  const releaseQuestion = useCallback((questionId?: string) => socket.emit("host:releaseQuestion", { questionId }), [socket]);
  const armButtons = useCallback(() => socket.emit("host:armButtons"), [socket]);
  const revealNextClub = useCallback(() => socket.emit("host:revealNextClub"), [socket]);
  const judge = useCallback((playerId: string, correct: boolean) => socket.emit("host:judge", { playerId, correct }), [socket]);
  const endCareerRound = useCallback(() => socket.emit("host:endCareerRound"), [socket]);
  const advance = useCallback(() => socket.emit("host:advance"), [socket]);
  const adjustScore = useCallback((teamOrPlayerId: string, delta: number) => socket.emit("host:adjustScore", { teamOrPlayerId, delta }), [socket]);
  const undo = useCallback(() => socket.emit("host:undo"), [socket]);
  const endMatch = useCallback(() => socket.emit("host:endMatch"), [socket]);
  const buzz = useCallback((questionId: string) => socket.emit("player:buzz", { questionId, clientSentAt: Date.now() }), [socket]);
  const submitAnswer = useCallback((questionId: string, answer: string) => socket.emit("player:submitAnswer", { questionId, answer }), [socket]);
  const requestSkip = useCallback(() => socket.emit("player:requestSkip"), [socket]);

  return {
    code,
    setTeams,
    start,
    pause,
    resume,
    leaveRoom,
    releaseQuestion,
    armButtons,
    revealNextClub,
    judge,
    endCareerRound,
    advance,
    adjustScore,
    undo,
    endMatch,
    buzz,
    submitAnswer,
    requestSkip,
  };
}
