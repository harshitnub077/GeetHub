import React from 'react';

const simplifyChord = (chord: string) => {
  const match = chord.match(/^[A-G][#b]?(m)?/);
  return match ? match[0] : chord;
};

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const transposeChord = (chord: string, steps: number) => {
  return chord.replace(/^[A-G][#b]?/, (match) => {
    let index = notes.indexOf(match);
    if (index === -1) {
      const flatEquivs: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
      index = notes.indexOf(flatEquivs[match]);
    }
    if (index === -1) return match;
    const newIndex = (index + steps + 12 * 10) % 12;
    return notes[newIndex];
  });
};

interface ChordRendererProps {
  content: string;
  transposeBy: number;
  simplify: boolean;
}

export function ChordRenderer({ content, transposeBy, simplify }: ChordRendererProps) {
  const lines = content.split('\n');

  return (
    <div className="font-mono text-base md:text-lg leading-[2.5] tracking-wide w-full overflow-x-auto">
      {lines.map((line, lineIdx) => {
        const parts = line.split(/(\[[^\]]+\])/g).filter(Boolean);
        
        const segments: { chord: string; text: string }[] = [];
        let currentChord = '';
        
        parts.forEach(part => {
          if (part.startsWith('[') && part.endsWith(']')) {
            currentChord = part.slice(1, -1);
            if (transposeBy !== 0) currentChord = transposeChord(currentChord, transposeBy);
            if (simplify) currentChord = simplifyChord(currentChord);
          } else {
            segments.push({ chord: currentChord, text: part });
            currentChord = '';
          }
        });
        
        if (currentChord) {
          segments.push({ chord: currentChord, text: '' });
        }

        if (segments.length === 0) {
          return <div key={lineIdx} className="h-8"></div>;
        }

        return (
          <div key={lineIdx} className="flex flex-wrap items-end mb-4 md:mb-6">
            {segments.map((seg, segIdx) => (
              <div key={segIdx} className="relative flex flex-col items-start">
                {seg.chord && (
                  <span className="text-primary font-bold text-sm md:text-base absolute -top-4 left-0 select-none whitespace-nowrap">
                    {seg.chord}
                  </span>
                )}
                <span className="whitespace-pre text-foreground/90 leading-tight block pt-3">
                  {seg.text || ' '}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
