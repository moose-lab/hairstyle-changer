import type { VercelRequest, VercelResponse } from "@vercel/node";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Validates the session from request headers/cookies.
 * Returns the authenticated user or null if unauthenticated.
 * Does NOT send a response — caller decides how to handle.
 */
export async function getAuthUser(
  req: VercelRequest
): Promise<AuthUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch (error) {
    console.error("[auth-middleware] Session validation failed:", error);
    return null;
  }
}

/**
 * Middleware that requires authentication.
 * Returns the user or sends a 401 and returns null.
 */
export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthUser | null> {
  const user = await getAuthUser(req);

  if (!user) {
    res
      .status(401)
      .json({ success: false, error: "Authentication required" });
    return null;
  }

  return user;
}
