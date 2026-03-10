import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

const url = env('DATABASE_URL')

// Debug sederhana: Kalau pas jalanin command muncul tulisan "URL KOSONG", 
// berarti .env kamu gak kebaca
if (!url) {
  console.error("❌ ERROR: URL KOSONG! Cek file .env kamu di root folder.");
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url
  }
})