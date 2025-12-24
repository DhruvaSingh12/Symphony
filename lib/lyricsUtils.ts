export interface LyricLine {
    time: number;
    text: string;
}

// Parses an LRC string into an array of LyricLine objects.
// Handles formats like [mm:ss.xx] and [mm:ss:xx].
export const parseLRC = (lrcContent: string): LyricLine[] => {
    const lines = lrcContent.split('\n');
    const lyrics: LyricLine[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g;

    for (const line of lines) {
        const text = line.replace(/\[\d{2}:\d{2}[.:]\d{2,3}\]/g, '').trim();
        if (!text && !line.includes('[]')) continue; // Skip empty lines unless they are intended spacers

        // Reset regex state for each line
        timeRegex.lastIndex = 0;
        let match;
        while ((match = timeRegex.exec(line)) !== null) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]);

            // Convert to total seconds
            const time = minutes * 60 + seconds + milliseconds / (match[3].length === 3 ? 1000 : 100);
            lyrics.push({ time, text });
        }
    }

    // Sort by time in case lines are out of order
    return lyrics.sort((a, b) => a.time - b.time);
};