import * as mm from 'music-metadata-browser';

export interface ExtractedMetadata {
  title?: string;
  artists: string[];
  album?: string;
  duration?: number;
  image?: {
    data: Uint8Array;
    format: string;
  };
}

/**
 * Extracts ID3 metadata from an audio file using music-metadata-browser.
 */
export const extractMetadata = async (file: File): Promise<ExtractedMetadata> => {
  try {
    const metadata = await mm.parseBlob(file);
    const { common, format } = metadata;

    // Handle artists: split by semi-colon or comma if it's a single string
    let artists: string[] = [];
    if (common.artists && common.artists.length > 0) {
      artists = common.artists;
    } else if (common.artist) {
      // Split by common delimiters and trim
      artists = common.artist.split(/[;,]/).map(a => a.trim()).filter(Boolean);
    }

    // Extract image
    let image;
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0];
      image = {
        data: pic.data,
        format: pic.format
      };
    }

    return {
      title: common.title,
      artists,
      album: common.album,
      duration: format.duration ? Math.round(format.duration) : 0,
      image
    };
  } catch (error) {
    console.error("Metadata extraction failed:", error);
    return { artists: [] };
  }
};

/**
 * Helper to convert Uint8Array image data to a File object.
 */
export const metadataImageToFile = (imageData: Uint8Array, format: string, fileName: string): File => {
  const extension = format.split('/')[1] || 'jpg';
  const blob = new Blob([imageData as any], { type: format });
  return new File([blob], `${fileName}.${extension}`, { type: format });
};
