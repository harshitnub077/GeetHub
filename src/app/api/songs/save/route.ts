import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const song = await request.json();

    if (!song.title || !song.artist || !song.chord_data) {
      return NextResponse.json({ error: 'Missing required fields (title, artist, chord_data)' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src/data/songs.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const currentSongs = JSON.parse(fileContents);

    // Generate a unique ID if not provided
    const id = song.id || `${song.title.toLowerCase().replace(/\s+/g, '-')}-${song.artist.toLowerCase().replace(/\s+/g, '-')}`;
    
    const newSong = {
      id,
      title: song.title,
      artist: song.artist,
      genre: song.genre || 'Unknown',
      album: song.album || 'Unknown',
      contributor_username: 'imported-from-ug',
      chord_data: song.chord_data,
    };

    // Check if song already exists with this ID
    if (currentSongs.some((s: any) => s.id === id)) {
        return NextResponse.json({ error: 'Song already exists in your collection' }, { status: 409 });
    }

    currentSongs.push(newSong);

    fs.writeFileSync(filePath, JSON.stringify(currentSongs, null, 2), 'utf8');

    return NextResponse.json({ success: true, song: newSong });
  } catch (error: any) {
    console.error('Save Song Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save song' }, { status: 500 });
  }
}
