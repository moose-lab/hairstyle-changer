import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { getAuthUser } from "../../lib/auth-middleware";
import { getCreditBalance, deductCredit, addCredits } from "../../lib/credits";
import { getDb } from "../../lib/db";
import { GENERATION_COST } from "../../shared/const";

// Allow up to 120s for AI image generation (polling can take a while)
export const config = { maxDuration: 120 };

// --- Validation ---

const generateRequestSchema = z.object({
  image: z.string().min(1, "Image is required"),
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(500, "Prompt is too long"),
});

// --- WaveSpeed API types ---

interface WaveSpeedSubmitResponse {
  code: number;
  message: string;
  data: {
    id: string;
    model: string;
    status: string;
    outputs?: string[];
    base64_outputs?: string[];
  };
}

interface WaveSpeedResultResponse {
  code: number;
  message: string;
  data: {
    id: string;
    status: string;
    outputs?: string[];
    base64_outputs?: string[];
    has_nsfw_contents?: boolean[];
  };
}

// --- Gemini API types (fallback) ---

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{ content: { parts: GeminiPart[] } }>;
  error?: { message: string };
}

// --- Helpers ---

function buildHairstylePrompt(userPrompt: string): string {
  return `Change ONLY the hair. ${userPrompt}

Keep everything else exactly as in the original: face, skin tone, lighting, background, clothing, expression, pose.

Photorealistic, professional quality, natural lighting, high detail.`;
}

function extractBase64(dataUrl: string): { mimeType: string; data: string } {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid data URL format");
  }
  return { mimeType: matches[1], data: matches[2] };
}

function getBase64Size(base64String: string): number {
  const base64Data = base64String.replace(/^data:[^;]+;base64,/, "");
  return (base64Data.length * 3) / 4;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadToBlob(dataUrl: string): Promise<{ url: string }> {
  const { mimeType, data } = extractBase64(dataUrl);
  const buffer = Buffer.from(data, "base64");
  const ext = mimeType.split("/")[1] || "png";
  const filename = `hairstyle-input-${Date.now()}.${ext}`;

  const blob = await put(filename, buffer, {
    access: "public",
    contentType: mimeType,
  });

  return { url: blob.url };
}

function cleanupBlob(url: string): void {
  del(url).catch((err) =>
    console.warn("[hairstyle] Failed to clean up blob:", err.message)
  );
}

// --- WaveSpeed Nano Banana Pro Edit API ---

async function generateWithWaveSpeed(
  apiKey: string,
  imageDataUrl: string,
  prompt: string
): Promise<string> {
  const WAVESPEED_API = "https://api.wavespeed.ai/api/v3";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const fullPrompt = buildHairstylePrompt(prompt);

  // Step 1: Upload image to Vercel Blob for a public URL
  console.log("[hairstyle] Uploading image to Vercel Blob...");
  const { url: imageUrl } = await uploadToBlob(imageDataUrl);
  console.log("[hairstyle] Image uploaded:", imageUrl);

  try {
    // Step 2: Submit the edit task with the public URL
    const submitResponse = await axios.post<WaveSpeedSubmitResponse>(
      `${WAVESPEED_API}/google/nano-banana-pro/edit`,
      {
        prompt: fullPrompt,
        images: [imageUrl],
        resolution: "1k",
        output_format: "png",
        enable_sync_mode: true,
        enable_base64_output: true,
      },
      { headers, timeout: 120000 }
    );

    const submitData = submitResponse.data;
    if (submitData.code !== 200) {
      throw new Error(`WaveSpeed API error: ${submitData.message}`);
    }

    // If sync mode returned results immediately
    if (
      submitData.data.status === "completed" &&
      submitData.data.base64_outputs?.length
    ) {
      return `data:image/png;base64,${submitData.data.base64_outputs[0]}`;
    }

    if (
      submitData.data.status === "completed" &&
      submitData.data.outputs?.length
    ) {
      return submitData.data.outputs[0];
    }

    // Step 3: Poll for result (if async)
    const taskId = submitData.data.id;
    const maxAttempts = 60;

    for (let i = 0; i < maxAttempts; i++) {
      await sleep(2000);

      const resultResponse = await axios.get<WaveSpeedResultResponse>(
        `${WAVESPEED_API}/predictions/${taskId}/result`,
        { headers, timeout: 30000 }
      );

      const resultData = resultResponse.data;

      if (resultData.data.status === "completed") {
        if (resultData.data.base64_outputs?.length) {
          return `data:image/png;base64,${resultData.data.base64_outputs[0]}`;
        }
        if (resultData.data.outputs?.length) {
          return resultData.data.outputs[0];
        }
        throw new Error("Task completed but no image output found");
      }

      if (resultData.data.status === "failed") {
        throw new Error("Image generation failed on the server");
      }
    }

    throw new Error("Timeout waiting for image generation result");
  } finally {
    cleanupBlob(imageUrl);
  }
}

// --- Gemini API (fallback) ---

async function generateWithGemini(
  apiKey: string,
  imageData: { mimeType: string; data: string },
  prompt: string
): Promise<string> {
  const fullPrompt = buildHairstylePrompt(prompt);
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  const response = await axios.post<GeminiResponse>(
    geminiUrl,
    {
      contents: [
        {
          parts: [
            { text: fullPrompt },
            {
              inline_data: {
                mime_type: imageData.mimeType,
                data: imageData.data,
              },
            },
          ],
        },
      ],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    },
    { timeout: 60000, headers: { "Content-Type": "application/json" } }
  );

  if (response.data.error) {
    throw new Error(`Gemini API error: ${response.data.error.message}`);
  }

  const candidates = response.data.candidates;
  if (!candidates?.length) {
    throw new Error("No results generated by Gemini");
  }

  const imagePart = candidates[0].content.parts.find((p) => p.inline_data);
  if (!imagePart?.inline_data) {
    throw new Error("No image generated by Gemini");
  }

  return `data:${imagePart.inline_data.mime_type};base64,${imagePart.inline_data.data}`;
}

// --- Serverless handler ---

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // --- Auth & Credit Check ---
  const user = await getAuthUser(req);
  let isAnonymous = false;

  if (user) {
    // Authenticated: check credit balance
    const balance = await getCreditBalance(user.id);
    if (balance < GENERATION_COST) {
      return res.status(403).json({
        success: false,
        error: "Insufficient credits",
        credits: balance,
      });
    }
  } else {
    // Anonymous: allowed (frontend tracks tries via localStorage)
    isAnonymous = true;
  }

  // Validate request body
  const parseResult = generateRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: parseResult.error.issues[0].message,
    });
  }

  const { image, prompt } = parseResult.data;

  // Check image size (max 10MB)
  const imageSize = getBase64Size(image);
  const maxSize = 10 * 1024 * 1024;
  if (imageSize > maxSize) {
    return res.status(400).json({
      success: false,
      error: `Image is too large. Maximum size is 10MB, got ${(imageSize / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  // Extract base64 data
  let imageDataParsed: { mimeType: string; data: string };
  try {
    imageDataParsed = extractBase64(image);
  } catch {
    return res.status(400).json({
      success: false,
      error: "Invalid image format. Expected base64-encoded data URL",
    });
  }

  // Determine which API to use
  const wavespeedKey = process.env.WAVESPEED_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!wavespeedKey && !geminiKey) {
    return res.status(500).json({
      success: false,
      error: "API key not configured. Set WAVESPEED_API_KEY or GEMINI_API_KEY.",
    });
  }

  // --- Deduct credit before generation (authenticated users only) ---
  let generationId: string | null = null;
  if (user) {
    const sql = getDb();
    const trimmedPrompt = prompt.trim();
    const rows = await sql`
      INSERT INTO "generation_history" ("userId", "prompt", "status", "creditCost")
      VALUES (${user.id}, ${trimmedPrompt}, 'processing', ${GENERATION_COST})
      RETURNING "id"`;
    generationId = rows[0].id as string;

    const newBalance = await deductCredit(
      user.id,
      GENERATION_COST,
      `Generation: ${trimmedPrompt.slice(0, 80)}`,
      generationId
    );

    if (newBalance === null) {
      // Race condition: balance depleted between check and deduction
      const errMsg = "Insufficient credits";
      await sql`UPDATE "generation_history" SET "status" = 'failed', "errorMessage" = ${errMsg}, "completedAt" = NOW() WHERE "id" = ${generationId}`;
      return res.status(403).json({
        success: false,
        error: "Insufficient credits",
        credits: 0,
      });
    }
  }

  const startTime = Date.now();

  try {
    let generatedImage: string;
    const provider = wavespeedKey ? "wavespeed" : "gemini";

    if (wavespeedKey) {
      console.log("[hairstyle] Using WaveSpeed Nano Banana Pro Edit API");
      generatedImage = await generateWithWaveSpeed(wavespeedKey, image, prompt);
    } else {
      console.log("[hairstyle] Using Gemini API (fallback)");
      generatedImage = await generateWithGemini(
        geminiKey!,
        imageDataParsed,
        prompt
      );
    }

    // Record success for authenticated users
    if (user && generationId) {
      const elapsed = Date.now() - startTime;
      const sql = getDb();
      await sql`
        UPDATE "generation_history"
        SET "status" = 'completed', "provider" = ${provider}, "processingTimeMs" = ${elapsed}, "completedAt" = NOW()
        WHERE "id" = ${generationId}`;
    }

    const responsePayload: Record<string, unknown> = {
      success: true,
      image: generatedImage,
    };

    if (user) {
      responsePayload.credits = await getCreditBalance(user.id);
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error in hairstyle generation:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    // Refund credit on failure for authenticated users
    if (user && generationId) {
      try {
        await addCredits(
          user.id,
          GENERATION_COST,
          "refund",
          `Refund: generation failed - ${message.slice(0, 80)}`,
          generationId
        );
        console.log(`[hairstyle] Credit refunded to user ${user.id}`);
      } catch (refundErr) {
        console.error("[hairstyle] Failed to refund credit:", refundErr);
      }

      const sql = getDb();
      const errSlice = message.slice(0, 500);
      await sql`
        UPDATE "generation_history"
        SET "status" = 'failed', "errorMessage" = ${errSlice}, "completedAt" = NOW()
        WHERE "id" = ${generationId}`.catch(() => {});
    }

    return res.status(500).json({ success: false, error: message });
  }
}
