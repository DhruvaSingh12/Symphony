import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

const loadFFmpeg = async () => {
    if (ffmpeg) return ffmpeg;

    ffmpeg = new FFmpeg();

    if (!ffmpeg.loaded) {
        try {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
        } 
        catch (error) {
            console.error('Failed to load FFmpeg:', error);
            ffmpeg = null;
            throw new Error('Failed to load audio processor');
        }
    }

    return ffmpeg;
};

export const processAudio = async (file: File): Promise<File> => {
    const instance = await loadFFmpeg(); 
    const inputName = 'input.' + file.name.split('.').pop();
    const outputName = 'output.mp3';

    try {
        await instance.writeFile(inputName, await fetchFile(file));

        // Convert to MP3 (libmp3lame) at 128kbps, 44.1kHz, Stereo
        await instance.exec([
            '-i', inputName,
            '-c:a', 'libmp3lame',
            '-b:a', '128k',
            '-ar', '44100',
            '-ac', '2',
            outputName
        ]);
        const data = await instance.readFile(outputName);
        const processedBlob = new Blob([data as any], { type: 'audio/mpeg' });
        
        return new File([processedBlob], file.name.replace(/\.[^/.]+$/, "") + ".mp3", {
            type: 'audio/mpeg'
        });

    } 
    catch (error) {
        console.error('Audio processing failed:', error);
        if (instance) {
            try {
                await instance.terminate();
            } 
            catch (e) {}
        }
        ffmpeg = null; 
        
        throw error;

    } 
    finally {
        if (ffmpeg && ffmpeg.loaded) {
            try {
                await ffmpeg.deleteFile(inputName);
                await ffmpeg.deleteFile(outputName);
            } 
            catch (e) {}
        }
    }
};

const fetchFile = async (file: File): Promise<Uint8Array> => {
    return new Uint8Array(await file.arrayBuffer());
};


export const processImage = async (file: File): Promise<File> => {
    const TARGET_SIZE_KB = 200;
    const MAX_WIDTH = 1920; 
    const MAX_HEIGHT = 1080;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
             URL.revokeObjectURL(img.src);
             
             let width = img.width;
             let height = img.height;

             // Resize if too large
             if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                 const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                 width = Math.round(width * ratio);
                 height = Math.round(height * ratio);
             }

             const canvas = document.createElement('canvas');
             canvas.width = width;
             canvas.height = height;
             
             const ctx = canvas.getContext('2d');
             if (!ctx) {
                 reject(new Error('Canvas context failed'));
                 return;
             }
             
             ctx.drawImage(img, 0, 0, width, height);

             // Compression Loop
             let quality = 0.9;
             
             const attemptCompression = () => {
                 canvas.toBlob(
                     (blob) => {
                         if (!blob) {
                             reject(new Error('Image processing failed'));
                             return;
                         }

                         if (blob.size / 1024 <= TARGET_SIZE_KB || quality <= 0.1) {
                             resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                                 type: 'image/webp'
                             }));
                         } 
                         else {
                             // Reduce quality and try again
                             quality -= 0.1;
                             attemptCompression(); 
                         }
                     },
                     'image/webp',
                     quality
                 );
             };

             attemptCompression();
        };

        img.onerror = (err) => reject(err);
    });
};