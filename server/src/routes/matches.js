import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createMatch,
  getMatches,
  getMatch,
  updateMatch,
  deleteMatch,
  startMatch,
  recordBall,
  editBall,
  getMatchHistory,
} from "../controllers/matchController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Match CRUD
router.post("/", createMatch);
router.get("/", getMatches);
router.get("/:id", getMatch);
router.put("/:id", updateMatch);
router.delete("/:id", deleteMatch);

// Match actions
router.post("/:id/start", startMatch);
router.post("/:id/ball", recordBall);
router.put("/:id/ball/:ballId", editBall);
router.get("/:id/history", getMatchHistory);

export default router;
