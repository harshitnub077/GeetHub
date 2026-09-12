/**
 * chordFormatter.ts
 * Universal Chord Normalization Engine for GeetHub.
 * Converts any raw chord sheet (HTML, Ultimate-Guitar tabs, ChordPro, 2-line chord sheets)
 * into one standard, beautiful, bracketed text format across the entire website.
 */

export const CHORD_REGEX = /^[A-G](?:b|#)?(?:m|maj|min|dim|aug|sus[24]?|add\d+|[2-9]|1[13]|M\d+)?(?:\/[A-G][#b]?)?$/;

const SECTION_NAMES = [
  'Intro', 'Verse', 'Chorus', 'Bridge', 'Outro',
  'Hook', 'Pre-Chorus', 'Interlude', 'Solo', 'Instrumental',
  'Refrain', 'Drop', 'Ending'
];

/**
 * Returns true if a string represents a valid musical chord (e.g. "Am", "C#m7", "F#dim", "G/B").
 */
export function isValidChord(token: string): boolean {
  if (!token) return false;
  const clean = token.replace(/^[\[(]+|[\])]+$/g, '').trim();
  return CHORD_REGEX.test(clean);
}

/**
 * Checks if a line primarily consists of chords (e.g. "Am    G    F    E" or "[Am]  [G]").
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // If starts with section header e.g. [Verse 1], it is a header, not a chord line
  if (/^\[?(intro|verse|chorus|bridge|outro|solo|interlude|hook|pre-chorus)/i.test(trimmed)) {
    return false;
  }

  // Split into whitespace tokens
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  for (const t of tokens) {
    const cleanT = t.replace(/^[\[(]+|[\])]+$/g, '').replace(/[|/x\d:-]/g, '').trim();
    if (cleanT && CHORD_REGEX.test(cleanT)) chordCount++;
  }

  return chordCount >= Math.max(1, Math.ceil(tokens.length * 0.6));
}

/**
 * Snaps a character position to the nearest word boundary in a lyric line.
 */
function snapToWordBoundary(text: string, index: number): number {
  if (index <= 0) return 0;
  if (index >= text.length) return text.length;
  if (text[index - 1] === ' ') return index;

  let start = index;
  while (start > 0 && text[start - 1] !== ' ') start--;

  let next = index;
  while (next < text.length && text[next] !== ' ') next++;
  while (next < text.length && text[next] === ' ') next++;

  if (index - start <= 3) return start;
  if (next - index <= 2) return next;
  return start;
}

/**
 * Merges a chord line positioned above a lyric line into a single aligned inline bracketed line.
 * Example:
 * Chord line: "      E                    Abm"
 * Lyric line: "Nindiya yeh legi tujhe thaam re"
 * Result:     "Nindiya [E]yeh legi tujhe thaam [Abm]re"
 */
export function mergeChordAndLyric(chordLine: string, lyricLine: string): string {
  const chordMatches: { chord: string; index: number }[] = [];
  const regex = /\[?([A-G](?:b|#)?(?:m|maj|min|dim|aug|sus[24]?|add\d+|[2-9]|1[13]|M\d+)?(?:\/[A-G][#b]?)?)\]?/g;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(chordLine)) !== null) {
    if (CHORD_REGEX.test(m[1])) {
      chordMatches.push({ chord: m[1], index: m.index });
    }
  }

  if (chordMatches.length === 0) return lyricLine;

  let lastPos = 0;
  const snapped = chordMatches.map((c) => {
    let pos = snapToWordBoundary(lyricLine, c.index);
    if (pos < lastPos) pos = lastPos;
    lastPos = pos;
    return { chord: c.chord, index: pos };
  });

  let result = '';
  let lastLyricIdx = 0;
  for (const { chord, index } of snapped) {
    result += lyricLine.slice(lastLyricIdx, index);
    result += `[${chord}]`;
    lastLyricIdx = index;
  }
  result += lyricLine.slice(lastLyricIdx);
  return result;
}

/**
 * Formats a standalone chord line by wrapping each chord in brackets: "[G] [Bm] [Em] [C]"
 */
function formatChordsOnlyLine(line: string): string {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.map((t) => {
    const clean = t.replace(/^[\[(]+|[\])]+$/g, '').trim();
    return CHORD_REGEX.test(clean) ? `[${clean}]` : t;
  }).join(' ');
}

/**
 * The master normalization function.
 * Converts ANY chord format into the unified standard format.
 */
export function normalizeChordSheet(raw: string): string {
  if (!raw) return '';
  let text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 1. Unescape HTML entities & strip tags (from web scrapers / indichords)
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '');

  // 2. Normalize Ultimate-Guitar tags
  text = text.replace(/\[ch\](.*?)\[\/ch\]/gi, '[$1]');
  text = text.replace(/\[\/?tab\]/gi, '');

  // 3. Normalize Jammai / ChordPro colons (e.g. [G:maj] -> [G], [A:min] -> [Am])
  text = text.replace(
    /\[([A-G][#b]?):(maj|min|m|7|maj7|min7|m7|sus2|sus4|dim|aug)([^\]]*)\]/gi,
    (_, note, quality, rest) => {
      let q = quality.toLowerCase();
      if (q === 'maj') q = '';
      else if (q === 'min') q = 'm';
      return `[${note}${q}${rest || ''}]`;
    }
  );

  const rawLines = text.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
        processedLines.push('');
      }
      continue;
    }

    // Filter out common scraped watermarks and headers
    if (/chordzone\s*\.?\s*org/i.test(trimmed)) continue;
    if (/^https?:\/\//i.test(trimmed)) continue;
    if (/^contact at .*@/i.test(trimmed)) continue;
    if (/^tabbed by/i.test(trimmed)) continue;

    // Normalize section headers (e.g. "[VERSE 1]" or "Verse 1:" or "--- Chorus ---")
    const secMatch = trimmed.match(
      /^\[?(intro|verse(?:\s*\d+)?|chorus(?:\s*\d+)?|bridge(?:\s*\d+)?|outro|hook|pre-chorus|interlude|solo|instrumental)\]?:?$/i
    );
    if (secMatch) {
      const name = secMatch[1]
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      processedLines.push(`[${name}]`);
      continue;
    }

    // Check if current line is a chord line
    if (isChordLine(line)) {
      const nextLine = i + 1 < rawLines.length ? rawLines[i + 1] : null;
      const nextTrimmed = nextLine ? nextLine.trim() : '';

      const isNextSection =
        nextTrimmed &&
        /^\[?(intro|verse|chorus|bridge|outro|solo|interlude|hook|pre-chorus)/i.test(nextTrimmed);
      const isNextChord = nextTrimmed ? isChordLine(nextLine!) : false;

      // If followed by lyrics, merge into one inline bracketed line
      if (nextTrimmed && !isNextSection && !isNextChord && !nextTrimmed.includes('===')) {
        const merged = mergeChordAndLyric(line, nextLine!);
        processedLines.push(merged);
        i++; // skip lyric line since merged
        continue;
      } else {
        processedLines.push(formatChordsOnlyLine(line));
        continue;
      }
    }

    processedLines.push(line);
  }

  return processedLines.join('\n').trim();
}

/**
 * Extracts a unique list of chords from the song in order of appearance.
 */
export function extractChords(chordData: string): string[] {
  if (!chordData) return [];
  const normalized = normalizeChordSheet(chordData);
  const matches = normalized.match(/\[([A-G][^\]]*)\]/g) || [];
  const seen = new Set<string>();
  const chords: string[] = [];

  for (const m of matches) {
    const rawChord = m.slice(1, -1).trim();
    // Verify it is a musical chord and not a section header like [Verse 1]
    if (CHORD_REGEX.test(rawChord) && !seen.has(rawChord)) {
      seen.add(rawChord);
      chords.push(rawChord);
    }
  }

  return chords;
}
