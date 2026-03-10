import { prisma } from "@/lib/prisma";

/**
 * Calculates if a ticket has breached its SLA based on its priority definition.
 * Should be called periodically (e.g., via cron) or on demand when viewing tickets.
 */
export async function checkSlaBreach(ticketId: number) {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { priority: true, status: true }
    });

    if (!ticket) return null;

    // If already resolved or closed, we don't consider it actively breaching right now
    if (ticket.status?.name === 'Resolved' || ticket.status?.isClosed) {
        return ticket.slaBreached;
    }

    if (!ticket.slaDeadline) {
        // If SLA deadline not calculated yet, calculate it based on creation time + SLA hours
        const slaHours = ticket.priority?.slaHours || 24;
        const deadline = new Date(ticket.createdAt);
        deadline.setHours(deadline.getHours() + slaHours);

        // Save it to the DB
        await prisma.ticket.update({
            where: { id: ticket.id },
            data: { slaDeadline: deadline }
        });

        // Check if we already breached it
        const isBreached = new Date() > deadline;
        if (isBreached && !ticket.slaBreached) {
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: { slaBreached: true }
            });
            return true;
        }

        return isBreached;
    } else {
        // We already have a deadline, check against it
        const isBreached = new Date() > ticket.slaDeadline;

        if (isBreached && !ticket.slaBreached) {
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: { slaBreached: true }
            });
        }

        return isBreached;
    }
}

/**
 * Sweeps all open tickets to update their SLA breach status.
 */
export async function updateAllSLAStatuses() {
    const activeStatuses = await prisma.ticketStatus.findMany({
        where: { isClosed: false }
    });

    const activeStatusIds = activeStatuses.map(s => s.id);

    const activeTickets = await prisma.ticket.findMany({
        where: {
            statusId: { in: activeStatusIds },
            slaBreached: false, // only care about ones not already breached
        }
    });

    let breachCount = 0;
    for (const ticket of activeTickets) {
        const breached = await checkSlaBreach(ticket.id);
        if (breached) breachCount++;
    }

    return breachCount;
}
