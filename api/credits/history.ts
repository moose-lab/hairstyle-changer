import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../lib/auth-middleware.js";
import { getTransactionHistory } from "../../lib/credits.js";

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
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const transactions = await getTransactionHistory(user.id, limit, offset);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: { limit, offset },
    });
  } catch (error) {
    console.error("[credits/history] Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch transaction history" });
  }
}
