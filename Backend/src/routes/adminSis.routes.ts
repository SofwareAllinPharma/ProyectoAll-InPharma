import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/roles";

const router = Router();

router.get("/ping", requireAuth, requireRoles("ADMINSIS"), (_req, res) => {
  res.json({ ok: true, area: "adminsis" });
});

export default router;
