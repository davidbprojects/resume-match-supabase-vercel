import crypto from "crypto";
import type { NextRequest } from "next/server";

export function getActor(req: NextRequest): string {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const ua = req.headers.get("user-agent") || "";
  return crypto.createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 24);
}
