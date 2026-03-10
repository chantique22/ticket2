
import "dotenv/config"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })

async function main() {
  const client = await pool.connect()
  try {
    console.log("Truncating Users to fix Unique constraints...")
    await client.query('TRUNCATE TABLE "User" CASCADE;')
    console.log("Users table truncated.")
  } catch (err) {
    console.error("Error truncating users:", err)
  } finally {
    client.release()
  }
}

main().finally(() => pool.end())
