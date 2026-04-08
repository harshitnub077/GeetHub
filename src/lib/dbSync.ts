import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

class DatabaseManager {
  private static instance: DatabaseSync | null = null;

  static getInstance(): DatabaseSync {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseSync(DB_PATH);
      // Optional: Initialize database settings if needed
      // DatabaseManager.instance.prepare('PRAGMA journal_mode = WAL').run();
    }
    return DatabaseManager.instance;
  }
}

export const getDb = () => DatabaseManager.getInstance();
