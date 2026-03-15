/**
 * chordEngine.ts
 * Generates a realistic chord progression for a given set of lyrics.
 * This provides a "Community Chords" placeholder for songs fetched from lrclib.net.
 * Artists: Contribute the real chords via the "Commit" page!
 */

// Common chord progressions by key signature
const PROGRESSIONS: Record<string, string[][]> = {
  major: [
    ['C', 'G', 'Am', 'F'],         // I - V - vi - IV (most popular)
    ['G', 'D', 'Em', 'C'],         // G major variant
    ['D', 'A', 'Bm', 'G'],         // D major variant
    ['E', 'B', 'C#m', 'A'],        // E major variant
    ['A', 'E', 'F#m', 'D'],        // A major variant
    ['F', 'C', 'Dm', 'Bb'],        // F major variant
  ],
  minor: [
    ['Am', 'F', 'C', 'G'],         // vi - IV - I - V
    ['Em', 'C', 'G', 'D'],         // E minor variant
    ['Dm', 'Bb', 'F', 'C'],        // D minor variant
    ['Bm', 'G', 'D', 'A'],         // B minor variant
  ],
};

function getRandomProgression(seed: string): string[] {
  // Use the title as a seed so the same song always gets the same progression
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isMajor = hash % 3 !== 0; // ~66% major, ~33% minor
  const pool = isMajor ? PROGRESSIONS.major : PROGRESSIONS.minor;
  return pool[hash % pool.length];
}

export function generateChordData(plainLyrics: string, title: string): string {
  if (!plainLyrics) return '';
  const chords = getRandomProgression(title);
  const lines = plainLyrics.split('\n');
  
  let chordIndex = 0;
  return lines.map((line) => {
    if (!line.trim()) return ''; // Keep blank lines for verse separation
    
    const words = line.split(' ');
    const result: string[] = [];
    
    words.forEach((word, wordIndex) => {
      // Place a chord on roughly every 4th-6th word, or at line start
      if (wordIndex === 0 || wordIndex % Math.floor(Math.random() * 3 + 3) === 0) {
        result.push(`[${chords[chordIndex % chords.length]}]${word}`);
        chordIndex++;
      } else {
        result.push(word);
      }
    });
    
    return result.join(' ');
  }).join('\n');
}
