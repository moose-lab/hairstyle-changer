import { getDb } from "./db.js";

/**
 * Get the current credit balance for a user.
 * Returns 0 if no balance record exists.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const sql = getDb();
  const rows = await sql`SELECT "balance" FROM "credit_balance" WHERE "userId" = ${userId}`;
  return rows.length > 0 ? (rows[0].balance as number) : 0;
}

/**
 * Atomically deduct credits from a user's balance.
 * Uses UPDATE ... WHERE balance >= amount to prevent negative balances.
 * Returns the new balance, or null if insufficient credits.
 */
export async function deductCredit(
  userId: string,
  amount: number = 1,
  description: string = "Hairstyle generation",
  referenceId?: string
): Promise<number | null> {
  const sql = getDb();

  // Atomic deduction with balance check
  const rows = await sql`
    UPDATE "credit_balance"
    SET "balance" = "balance" - ${amount}, "updatedAt" = NOW()
    WHERE "userId" = ${userId} AND "balance" >= ${amount}
    RETURNING "balance"`;

  if (rows.length === 0) {
    return null; // insufficient credits
  }

  const newBalance = rows[0].balance as number;
  const refId = referenceId ?? null;

  // Record the transaction
  await sql`
    INSERT INTO "credit_transaction" ("userId", "amount", "type", "description", "referenceId")
    VALUES (${userId}, ${-amount}, 'generation', ${description}, ${refId})`;

  return newBalance;
}

/**
 * Add credits to a user's balance (for refunds, purchases, etc.)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: "purchase" | "refund" | "admin_adjustment" | "signup_bonus",
  description: string,
  referenceId?: string
): Promise<number> {
  const sql = getDb();
  const refId = referenceId ?? null;

  const rows = await sql`
    UPDATE "credit_balance"
    SET "balance" = "balance" + ${amount}, "updatedAt" = NOW()
    WHERE "userId" = ${userId}
    RETURNING "balance"`;

  const newBalance = rows.length > 0 ? (rows[0].balance as number) : 0;

  await sql`
    INSERT INTO "credit_transaction" ("userId", "amount", "type", "description", "referenceId")
    VALUES (${userId}, ${amount}, ${type}, ${description}, ${refId})`;

  return newBalance;
}

/**
 * Get a user's credit transaction history (most recent first).
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const sql = getDb();
  return sql`
    SELECT "id", "amount", "type", "description", "referenceId", "createdAt"
    FROM "credit_transaction"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT ${limit} OFFSET ${offset}`;
}
