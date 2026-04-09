# Contributor Quick Reference

## Environment Setup
Copy `.env.example` to `.env.local` and fill in your values:
```
DB_PATH=./geethub_master.db
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Database
- `npm run setup-db` — Initialize FTS5 full-text-search index
- `npm run sync-fts` — Re-sync FTS index after bulk song import

## Dev Server
```bash
npm install
npm run dev
```
