import "dotenv/config"
import { prisma } from "../lib/prisma"
import { hash } from "bcryptjs"

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin"
  const email = process.env.ADMIN_EMAIL?.trim() || "admin@example.com"
  const password = process.env.ADMIN_PASSWORD || "password123"

  const passwordHash = await hash(password, 10)

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { id: true },
  })

  if (existing) {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        username,
        email,
        password: passwordHash,
        role: "ADMIN",
      },
      select: { id: true, username: true, email: true, role: true },
    })
    console.log("Updated admin user:", user)
    return
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: passwordHash,
      role: "ADMIN",
      name: "Administrator",
    },
    select: { id: true, username: true, email: true, role: true },
  })

  console.log("Created admin user:", user)
  console.log(`Login with username/email: ${username} / ${email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

