import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../lib/auth-middleware";
import { getCreditBalance } from "../../lib/credits";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const balance = await getCreditBalance(user.id);
    return res.status(200).json({ success: true, credits: balance });
  } catch (error) {
    console.error("[credits/balance] Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch credit balance" });
  }
}
