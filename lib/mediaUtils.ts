import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const AUDIO_CONFIG = {
  OPUS_BITRATE: "112k",
  AAC_BITRATE: "112k",
  SAMPLE_RATE_OPUS: "48000",
  SAMPLE_RATE_AAC: "44100", // Standard for AAC/MP4
  CHANNELS: "2",
  MAX_UPLOAD_MB: 50,
};

// Target specifications for "optimized" check
const TARGET_BITRATE_BPS = 112 * 1024;
const TARGET_SAMPLE_RATE = 48000;

const CORE_VERSION = "0.12.4";
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

const createFFmpeg = async (): Promise<FFmpeg> => {
  const ffmpeg = new FFmpeg();
  
  const coreURL = await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript");
  const wasmURL = await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm");

  await ffmpeg.load({
    coreURL,
    wasmURL,
  });

  // Cleanup blob URLs to free memory
  URL.revokeObjectURL(coreURL);
  URL.revokeObjectURL(wasmURL);

  return ffmpeg;
};

// AUDIO VALIDATION
const validateAudioUpload = (file: File) => {
  if (!file.type.startsWith("audio/")) {
    throw new Error("Invalid audio file");
  }

  if (file.size > AUDIO_CONFIG.MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error("Audio file exceeds upload limit");
  }
};

// AUDIO ENCODERS
const encodeOpus = async (
  ffmpeg: FFmpeg,
  input: string,
  output: string
) => {
  await ffmpeg.exec([
    "-y",
    "-i",
    input,
    "-vn",
    "-map_metadata",
    "-1",
    "-c:a",
    "libopus",
    "-b:a",
    AUDIO_CONFIG.OPUS_BITRATE,
    "-ac",
    AUDIO_CONFIG.CHANNELS,
    "-ar",
    AUDIO_CONFIG.SAMPLE_RATE_OPUS,
    output,
  ]);
};

const encodeAAC = async (
  ffmpeg: FFmpeg,
  input: string,
  output: string
) => {
  await ffmpeg.exec([
    "-y",
    "-i",
    input,
    "-vn",
    "-map_metadata",
    "-1",
    "-c:a",
    "aac",
    "-b:a",
    AUDIO_CONFIG.AAC_BITRATE,
    "-ac",
    AUDIO_CONFIG.CHANNELS,
    "-ar",
    AUDIO_CONFIG.SAMPLE_RATE_AAC,
    output,
  ]);
};

// Internal processing function for a single codec with optimization check
const tryEncode = async (
  file: File,
  codec: 'opus' | 'aac'
): Promise<File | null> => {
  let ffmpeg: FFmpeg | null = null;
  const uniqueId = crypto.randomUUID();
  const ext = codec === 'opus' ? 'opus' : 'm4a';
  const mime = codec === 'opus' ? 'audio/opus' : 'audio/aac';
  const extension = file.name.split(".").pop();
  const inputName = `input-${uniqueId}.${extension}`;
  const outputName = `output-${uniqueId}.${ext}`;

  // Sanitize name for the final File object to avoid Storage errors
  const sanitizedOriginalName = sanitizePath(file.name.replace(/\.[^/.]+$/, ""));
  const finalFileName = `${sanitizedOriginalName}.${ext}`;

  try {
    // 1. Check if file is already optimized (112k, 48k/44.1k, and correct format)
    // For simplicity, we check if it's already an Opus/AAC file with similar bitrate
    const isAlreadyTargetMime = file.type === mime;
    const estimatedBitrate = (file.size * 8) / (durationToSeconds(file) || 1); // Simple estimation
    const isAlreadyOptimized = isAlreadyTargetMime && 
                               estimatedBitrate <= TARGET_BITRATE_BPS * 1.1; // 10% tolerance

    if (isAlreadyOptimized) {
      console.info(`Skipping conversion for ${file.name}, already optimized.`);
      return file;
    }

    ffmpeg = await createFFmpeg();
    
    await ffmpeg.writeFile(
      inputName,
      new Uint8Array(await file.arrayBuffer())
    );

    if (codec === 'opus') {
      await encodeOpus(ffmpeg, inputName, outputName);
    } else {
      await encodeAAC(ffmpeg, inputName, outputName);
    }

    const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
    return new File([data as any], finalFileName, {
      type: mime,
    });
  } catch (err) {
    console.warn(`${codec.toUpperCase()} processing failed:`, err);
    return null;
  } finally {
    if (ffmpeg) {
      try {
        await safeDelete(ffmpeg, inputName);
        await safeDelete(ffmpeg, outputName);
        ffmpeg.terminate();
      } catch {}
    }
  }
};

// Simple helper for bitrate estimation (not perfectly accurate without parsing)
const durationToSeconds = (file: File): number => {
  // We'll rely on the duration passed from metadata or a placeholder
  // Since we don't have it here yet, this check is limited.
  // In BatchUpload, we have it. Let's adjust to pass it.
  return (file as any)._duration || 0; 
};

// AUDIO PROCESSOR (PRIMARY: OPUS, FALLBACK: AAC)
export const processAudio = async (file: File, duration?: number): Promise<File> => {
  validateAudioUpload(file);
  
  // Attach duration for tryEncode optimization check
  if (duration !== undefined) {
    (file as any)._duration = duration;
  }

  // Try Opus
  const opusFile = await tryEncode(file, 'opus');
  if (opusFile) return opusFile;

  // Try AAC (with a fresh FFmpeg instance)
  const aacFile = await tryEncode(file, 'aac');
  if (aacFile) return aacFile;

  // Final fallback
  throw new Error("All audio processing attempts failed");
};

// IMAGE PROCESSOR 
export const processImage = async (file: File): Promise<File> => {
  const TARGET_SIZE_KB = 20;
  const MAX_WIDTH = 1920;
  const MAX_HEIGHT = 1080;
  const MIN_WIDTH = 64;
  const MIN_HEIGHT = 64;
  const MIN_QUALITY = 0.2;
  const SCALE_STEP = 0.85;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });

  URL.revokeObjectURL(img.src);

  let { width, height } = img;

  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
    width = Math.max(Math.round(width * ratio), MIN_WIDTH);
    height = Math.max(Math.round(height * ratio), MIN_HEIGHT);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const render = (w: number, h: number) => {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
  };

  render(width, height);

  let quality = 0.9;
  let blob: Blob | null = null;

  while (true) {
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject()),
        "image/webp",
        quality
      );
    });

    if (blob.size / 1024 <= TARGET_SIZE_KB) break;

    if (quality > MIN_QUALITY) {
      quality -= 0.1;
      continue;
    }

    const newW = Math.max(MIN_WIDTH, Math.floor(canvas.width * SCALE_STEP));
    const newH = Math.max(MIN_HEIGHT, Math.floor(canvas.height * SCALE_STEP));
    if (newW === canvas.width && newH === canvas.height) break;

    render(newW, newH);
    quality = 0.8;
  }

  if (!blob) throw new Error("Image processing failed");

  return new File([blob], replaceExt(file.name, "webp"), {
    type: "image/webp",
  });
};

// HELPERS
export const sanitizePath = (path: string): string => {
  // Replace illegal characters for Supabase Storage (e.g., emojis, parentheses, single quotes)
  // We keep alphanumeric, hyphens, underscores, and dots.
  return path
    .replace(/[^\w\s\.-]/gi, '') // Remove everything except alphanumeric, spaces, dots, hyphens
    .replace(/\s+/g, '_')        // Replace spaces with underscores
    .trim();
};

const replaceExt = (name: string, ext: string) =>
  name.replace(/\.[^/.]+$/, `.${ext}`);

const safeDelete = async (ffmpeg: FFmpeg, file: string) => {
  try {
    await ffmpeg.deleteFile(file);
  } 
  catch {}
};