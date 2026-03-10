
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting FORCE SYNC of categories...")

  // 1. Delete all existing subcategories and categories
  // This ensures we have ONLY what's in the list
  await prisma.subCategory.deleteMany({})
  await prisma.category.deleteMany({})
  
  console.log("Cleaned existing categories/subcategories.")

  const categories = [
    {
      name: "Hardware",
      subCategories: ["HDD", "VGA", "LAN", "Monitor", "PSU/Adaptor", "RAM", "Printer", "Switch", "Internet", "Others"],
    },
    {
      name: "Software",
      subCategories: ["Windows", "Email", "Office", "Web Browser", "ACAD/Desain", "Chat"],
    },
    {
      name: "Jaringan",
      subCategories: ["HW", "Setting LAN", "Kerio Firewall"],
    },
    {
      name: "Telepon",
      subCategories: ["Kabel", "PABX", "Telepon"],
    },
    {
      name: "Request",
      subCategories: ["Instalasi Jaringan", "Instalasi Telepon", "Instalasi Software", "Pembuatan Aplikasi", "Revisi Aplikasi"],
    },
  ]

  for (const cat of categories) {
    const category = await prisma.category.create({
        data: { name: cat.name }
    })

    console.log(`Created Category: ${cat.name}`)

    for (const subName of cat.subCategories) {
        await prisma.subCategory.create({
            data: {
                name: subName,
                categoryId: category.id
            }
        })
    }
  }

  console.log("Force sync completed successfully.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error("Error during force sync:", e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
