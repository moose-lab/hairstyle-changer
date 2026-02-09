import { betterAuth } from "better-auth";
import { Pool, neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Node.js doesn't have a built-in WebSocket; provide ws for @neondatabase/serverless Pool
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

// Use Neon serverless Pool for Better Auth (WebSocket-compatible with Vercel)
const pool = new Pool({ connectionString });

// Use Neon HTTP query function for lightweight queries (credit_balance init)
const sql = neon(connectionString);

export const auth = betterAuth({
  database: pool,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Initialize credit balance for newly registered users
          try {
            await sql`
              INSERT INTO "credit_balance" ("userId", "balance")
              VALUES (${user.id}, 3)
              ON CONFLICT ("userId") DO NOTHING`;
            await sql`
              INSERT INTO "credit_transaction" ("id", "userId", "amount", "type", "description")
              VALUES (${crypto.randomUUID()}, ${user.id}, 3, 'signup_bonus', 'Welcome bonus credits')`;
          } catch (err) {
            console.error("[auth] Failed to initialize credits for user:", user.id, err);
          }
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min cache
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:5173",
  ],

  advanced: {
    cookiePrefix: "hairstyle",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session;
