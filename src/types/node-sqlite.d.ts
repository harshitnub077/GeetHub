declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(path: string, options?: any);
    prepare(query: string): any;
    exec(sql: string): void;
    close(): void;
  }
}
