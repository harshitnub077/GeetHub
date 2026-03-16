import { NextRequest, NextResponse } from 'next/server';
import songsData from '@/data/songs.json';

// Simple heuristic function to answer questions analytically if no LLM configured
function generateHeuristicResponse(song: any, question: string): string {
  const q = question.toLowerCase();
  const chordsStr = song.chord_data || "";
  
  // Extract all chord names inside brackets [Am], [C], etc.
  const chordRegex = /\[([^\]]+)\]/g;
  const chords: string[] = [];
  let match;
  while ((match = chordRegex.exec(chordsStr)) !== null) {
    chords.push(match[1]);
  }

  const uniqueChords = Array.from(new Set(chords));
  const chordCounts = chords.reduce((acc: any, c) => {
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  if (q.includes("chord") || q.includes("which")) {
    return `This song uses the following chords: ${uniqueChords.join(', ')}. The most frequently used chord is **${Object.keys(chordCounts).reduce((a, b) => chordCounts[a] > chordCounts[b] ? a : b, chords[0] || 'N/A')}**.`;
  }
  
  if (q.includes("scale") || q.includes("key")) {
    const rootEstimate = chords[0] || "Unknown";
    return `Based on the starting chord, the song is likely in the key or scale centered around **${rootEstimate}**. Adjusting capos to transpose can change the root pitch appropriately!`;
  }

  if (q.includes("strum") || q.includes("rhythm")) {
    return `We recommend starting with a standard **4/4 Down-Down-Up-Up-Down-Up** strumming pattern is general fit for Pop/Bollywood ballads. Adjust tempo to feel natural.`;
  }

  return `I found that **${song.title}** uses ${chords.length} chord transitions consisting of [${uniqueChords.join(', ')}]. \n\n*Tip: Try asking about 'strumming' or 'scale'.*`;
}

export async function POST(request: NextRequest) {
  try {
    const { songId, question } = await request.json();
    
    if (!songId || !question) {
      return NextResponse.json({ error: 'Missing songId or question' }, { status: 400 });
    }

    const song = songsData.find((s: any) => s.id === songId);
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Check for AI API Key - if missing, use pure analytical heuristics
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert guitar and music theory assistant. Answer this query regarding the song "${song.title}" by "${song.artist}".

Song Chords/Lyrics Data:
\`\`\`
${song.chord_data}
\`\`\`

User Question: ${question}

Provide a concise, helpful, and formatted answer as if replying in a helpful chat dashboard.`
              }]
            }],
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
          })
        });

        const data = await aiResponse.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          return NextResponse.json({ answer: responseText });
        }
      } catch (e) {
        console.error("AI Fetch Failure: ", e);
      }
    }

    // Fallback to Heuristics
    const fallbackAnswer = generateHeuristicResponse(song, question);
    return NextResponse.json({ answer: fallbackAnswer });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
