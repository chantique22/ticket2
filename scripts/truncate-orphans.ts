
import "dotenv/config"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })

async function main() {
  const client = await pool.connect()
  try {
    console.log("Starting truncation of orphaned tables...")
    
    // Using TRUNCATE with CASCADE to clear Tickets and Notifications
    // This allows prisma db push to recreate Category/SubCategory tables and constraints
    await client.query('TRUNCATE TABLE "Notification", "Ticket" CASCADE;')
    
    console.log("Successfully truncated 'Notification' and 'Ticket' tables.")
    console.log("You can now run 'npx prisma db push' safely.")
  } catch (err) {
    console.error("Error during truncation:", err)
  } finally {
    client.release()
  }
}

main().finally(() => pool.end())
