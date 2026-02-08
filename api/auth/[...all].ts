import type { VercelRequest, VercelResponse } from "@vercel/node";
import { auth } from "../../lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const handler = toNodeHandler(auth);

export default async function (req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
