/**
 * Client-side image compression utility.
 *
 * Large photos are resized on a canvas and re-encoded as JPEG so the
 * resulting base64 payload stays well within Vercel's 4.5 MB serverless
 * body-size limit.
 *
 * Key constraints:
 *  - Vercel body limit ≈ 4.5 MB (raw bytes of the HTTP body)
 *  - base64 inflates binary by ~33 %
 *  - JSON envelope adds data-URL prefix + prompt text
 *  → We target ≤ 2 MB compressed binary (→ ~2.67 MB base64 → safe)
 */

/** Maximum dimension (width or height) after resize */
const MAX_DIMENSION = 2048;

/**
 * Target compressed size in bytes.
 * 2 MB binary → ~2.67 MB base64 → well within 4.5 MB after JSON wrapper.
 */
const TARGET_SIZE = 2 * 1024 * 1024;

/** Minimum JPEG quality we'll try before giving up on quality alone */
const MIN_QUALITY = 0.3;

/** Encode a canvas to JPEG Blob at a given quality */
function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
  );
}

/**
 * Compress / resize an image File and return a base64 string (without
 * the data-URL prefix) together with its MIME type.
 */
export async function compressImage(
  file: File,
): Promise<{ base64: string; mimeType: string }> {
  // ---- Determine target dimensions ----
  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // ---- Draw onto a canvas ----
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Always output as JPEG – PNG ignores the quality parameter entirely,
  // so iterative compression only works with JPEG/WebP.
  const outputType = "image/jpeg";

  // ---- Phase 1: lower quality until under TARGET_SIZE ----
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > TARGET_SIZE && quality > MIN_QUALITY) {
    quality -= 0.05;
    blob = await canvasToBlob(canvas, quality);
  }

  // ---- Phase 2: if quality alone isn't enough, also shrink dimensions ----
  let scale = 1;
  while (blob.size > TARGET_SIZE && scale > 0.25) {
    scale -= 0.2;
    const sw = Math.round(width * scale);
    const sh = Math.round(height * scale);

    canvas.width = sw;
    canvas.height = sh;

    // Need a fresh bitmap to redraw at new size
    const bm = await createImageBitmap(file);
    ctx.drawImage(bm, 0, 0, sw, sh);
    bm.close();

    blob = await canvasToBlob(canvas, MIN_QUALITY);
  }

  // ---- Convert Blob → base64 string ----
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return { base64: btoa(binary), mimeType: outputType };
}
