1. copy .env.example -> .env.local and fill values:
   MONGODB_URI=...
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...

2. install deps:
   npm install mongoose @upstash/redis @faker-js/faker

3. seed DB:
   node dist/scripts/seed.js      # if compiled, or run with ts-node: npx ts-node scripts/seed.ts

4. run dev:
   npm run dev
