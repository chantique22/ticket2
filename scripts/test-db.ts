import { prisma } from "../lib/prisma";

async function main() {
    try {
        console.log("Connecting to database...");
        const userCount = await prisma.user.count();
        console.log(`Successfully connected! Found ${userCount} users.`);
    } catch (e) {
        console.error("Connection failed:", e);
        process.exit(1);
    } finally {
        // We don't need to explicitly disconnect with the singleton pattern in lib/prisma 
        // but for a script it's good practice to let the process exit.
        process.exit(0);
    }
}

main();
