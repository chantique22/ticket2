
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { compare, hash } from "bcryptjs"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const username = "admin"
  const password = "password123"

  console.log(`Checking user: ${username}`)
  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user) {
    console.log("User not found!")
    return
  }

  console.log("User found:", user.username, user.email)
  console.log("stored hash:", user.password)

  if (!user.password) {
    console.log("User has no password set.")
    return
  }

  const isValid = await compare(password, user.password)
  console.log("VALID_PASSWORD_CHECK:", isValid)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
