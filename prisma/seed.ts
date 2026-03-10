import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
    console.log("Seeding master data...");

    // 0. Departments
    const departments = [
        'IT',
        'HR',
        'Finance',
        'Operations',
        'Sales',
    ]
    for (const d of departments) {
        await prisma.department.upsert({
            where: { name: d },
            update: {},
            create: { name: d },
        })
    }

    // 0b. Locations (optional master data used by Assets)
    const locations = [
        'Head Office',
        'Branch Office',
        'Warehouse',
        'Remote',
    ]
    for (const l of locations) {
        await prisma.location.upsert({
            where: { name: l },
            update: {},
            create: { name: l },
        })
    }

    // 0c. Categories + SubCategories (existing system uses these, so only upsert defaults)
    const categoriesWithSubs: Record<string, string[]> = {
        Hardware: ['Laptop', 'Desktop', 'Printer', 'Peripheral'],
        Software: ['Office Apps', 'Operating System', 'Line-of-business App'],
        Network: ['WiFi', 'LAN', 'VPN'],
        Account: ['Password Reset', 'Access Request'],
    }

    for (const [categoryName, subNames] of Object.entries(categoriesWithSubs)) {
        const category = await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName },
        })

        for (const subName of subNames) {
            await prisma.subCategory.upsert({
                where: {
                    name_categoryId: {
                        name: subName,
                        categoryId: category.id,
                    },
                },
                update: {},
                create: {
                    name: subName,
                    categoryId: category.id,
                },
            })
        }
    }

    // 1. Statuses
    const statuses = [
        { name: 'Open', color: 'red', isClosed: false, order: 1 },
        { name: 'On Going', color: 'blue', isClosed: false, order: 2 },
        { name: 'On Hold', color: 'orange', isClosed: false, order: 3 },
        { name: 'Resolved', color: 'green', isClosed: true, order: 4 },
        { name: 'Closed', color: 'gray', isClosed: true, order: 5 },
    ];
    for (const s of statuses) {
        await prisma.ticketStatus.upsert({
            where: { name: s.name },
            update: s,
            create: s,
        })
    }

    // 2. Priorities
    const priorities = [
        { name: 'Critical', slaHours: 2 },
        { name: 'High', slaHours: 8 },
        { name: 'Medium', slaHours: 24 },
        { name: 'Low', slaHours: 48 },
    ];
    for (const p of priorities) {
        await prisma.priority.upsert({
            where: { name: p.name },
            update: p,
            create: p,
        })
    }

    // 3. Channels
    const channels = ['WhatsApp', 'Telephone', 'Chat', 'Email', 'Walk-in', 'System'];
    for (const c of channels) {
        await prisma.channel.upsert({
            where: { name: c },
            update: {},
            create: { name: c },
        })
    }

    // 4. Root Causes
    const rootCauses = ['Hardware Failure', 'Software Bug', 'Network Issue', 'Human Error', 'Configuration Issue'];
    for (const rc of rootCauses) {
        await prisma.rootCause.upsert({
            where: { name: rc },
            update: {},
            create: { name: rc },
        })
    }

    // 5. Knowledge Base (seed a few starter articles; createdBy left null)
    const hardwareCategory = await prisma.category.findUnique({ where: { name: 'Hardware' } })
    const softwareCategory = await prisma.category.findUnique({ where: { name: 'Software' } })
    const kbSeeds = [
        hardwareCategory
            ? {
                title: 'Laptop will not turn on',
                issue: 'User reports the laptop does not power on (no lights, no fan).',
                solution:
                    'Check charger and power outlet. Try a known-good adapter. Perform a hard reset (hold power 15 seconds). If still dead, log asset details and escalate for hardware diagnostics.',
                categoryId: hardwareCategory.id,
            }
            : null,
        softwareCategory
            ? {
                title: 'Application keeps crashing on launch',
                issue: 'The app closes immediately after opening or shows a crash dialog.',
                solution:
                    'Reboot the device, then update the application to the latest version. If the issue persists, clear local cache/profile (if applicable) or reinstall. Capture error details and attach logs for escalation.',
                categoryId: softwareCategory.id,
            }
            : null,
    ].filter(Boolean) as Array<{ title: string; issue: string; solution: string; categoryId: number }>

    for (const kb of kbSeeds) {
        const existing = await prisma.knowledgeBase.findFirst({
            where: { title: kb.title, categoryId: kb.categoryId },
            select: { id: true },
        })

        if (existing) {
            await prisma.knowledgeBase.update({
                where: { id: existing.id },
                data: { issue: kb.issue, solution: kb.solution },
            })
        } else {
            await prisma.knowledgeBase.create({ data: kb })
        }
    }

    // 5. Operating Hours (Mon-Fri, 08:00 - 17:00)
    for (let day = 1; day <= 5; day++) {
        await prisma.operatingHours.upsert({
            where: { dayOfWeek: day },
            update: { startTime: '08:00', endTime: '17:00' },
            create: { dayOfWeek: day, startTime: '08:00', endTime: '17:00' },
        })
    }

    // Add a default admin if none exists so user isn't locked out immediately
    // Wait, the user table might already have records. We won't touch it to avoid wiping real data.

    console.log("Seed completed.");
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
