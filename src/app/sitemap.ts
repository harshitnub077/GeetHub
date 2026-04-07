import { MetadataRoute } from 'next';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://geethub.musicians'; // Replace with real domain

  try {
    const db = new DatabaseSync(DB_PATH);
    const songs = db.prepare('SELECT id, updated_at FROM songs LIMIT 45000').all() as any[];

    const songUrls = songs.map((song) => ({
      url: `${baseUrl}/song/${song.id}`,
      lastModified: song.updated_at ? new Date(song.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/explore`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...songUrls,
    ];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ];
  }
}
