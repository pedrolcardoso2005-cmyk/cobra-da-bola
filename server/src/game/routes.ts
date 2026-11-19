import { Router } from "express";
import { requireAuth } from "../auth/routes.js";
import { roomManager } from "./rooms.js";

export const roomsRouter = Router();

roomsRouter.get("/:code", requireAuth, (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: "Sala nao encontrada" });
  res.json({
    code: room.match.code,
    phase: room.match.phase,
    participantCount: room.match.participantCount,
    hostUserId: room.match.hostUserId,
  });
});
