import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/roles";

const router = Router();

router.get("/ping", requireAuth, requireRoles("ADMINFAB"), (_req, res) => {
  res.json({ ok: true, area: "adminfab" });
});

export default router;
