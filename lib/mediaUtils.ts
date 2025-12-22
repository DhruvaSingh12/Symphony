import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const AUDIO_CONFIG = {
  OPUS_BITRATE: "64k",
  AAC_BITRATE: "64k",
  SAMPLE_RATE_OPUS: "48000",
  SAMPLE_RATE_AAC: "44100",
  CHANNELS: "2",
  MAX_UPLOAD_MB: 50,
};

const CORE_VERSION = "0.12.4";
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

const createFFmpeg = async (): Promise<FFmpeg> => {
  const ffmpeg = new FFmpeg();
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
  });

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

// Internal processing function for a single codec
const tryEncode = async (
  file: File,
  codec: 'opus' | 'aac'
): Promise<File | null> => {
  let ffmpeg: FFmpeg | null = null;
  const uniqueId = crypto.randomUUID();
  const ext = codec === 'opus' ? 'opus' : 'm4a';
  const mime = codec === 'opus' ? 'audio/opus' : 'audio/aac';
  const inputName = `input-${uniqueId}.${file.name.split(".").pop()}`;
  const outputName = `output-${uniqueId}.${ext}`;

  try {
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
    return new File([data as any], replaceExt(file.name, ext), {
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

// AUDIO PROCESSOR (PRIMARY: OPUS, FALLBACK: AAC)
export const processAudio = async (file: File): Promise<File> => {
  validateAudioUpload(file);

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
const replaceExt = (name: string, ext: string) =>
  name.replace(/\.[^/.]+$/, `.${ext}`);

const safeDelete = async (ffmpeg: FFmpeg, file: string) => {
  try {
    await ffmpeg.deleteFile(file);
  } 
  catch {}
};