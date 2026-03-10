import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get Status Counts dynamically from TicketStatus relations
        const openStatus = await prisma.ticketStatus.findFirst({ where: { name: 'Open' } })
        const ongoingStatus = await prisma.ticketStatus.findFirst({ where: { name: 'On-Going' } })
        const holdStatus = await prisma.ticketStatus.findFirst({ where: { name: 'On-Hold' } })
        const resolvedStatus = await prisma.ticketStatus.findFirst({ where: { name: 'Resolved' } })

        const [open, onGoing, onHold, resolved] = await Promise.all([
            openStatus ? prisma.ticket.count({ where: { statusId: openStatus.id } }) : 0,
            ongoingStatus ? prisma.ticket.count({ where: { statusId: ongoingStatus.id } }) : 0,
            holdStatus ? prisma.ticket.count({ where: { statusId: holdStatus.id } }) : 0,
            resolvedStatus ? prisma.ticket.count({ where: { statusId: resolvedStatus.id } }) : 0,
        ]);

        // 2. Get Monthly Counts (Last 12 Months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1); 
        
        const monthlyTickets = await prisma.ticket.findMany({
            where: {
                createdAt: {
                    gte: twelveMonthsAgo,
                },
            },
            select: {
                createdAt: true,
            },
        });

        const monthlyData = new Map<string, number>();
        
        // Initialize last 12 months with 0
        for (let i = 0; i < 12; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('default', { month: 'short' });
            monthlyData.set(key, 0);
        }

        monthlyTickets.forEach(t => {
            const key = new Date(t.createdAt).toLocaleString('default', { month: 'short' });
            if (monthlyData.has(key)) {
                monthlyData.set(key, monthlyData.get(key)! + 1);
            }
        });

        const chartData = Array.from(monthlyData.entries()).map(([name, total]) => ({ name, total })).reverse();

        // 3. Get PIC Performance (Top 5 PICs by resolved tickets)
        const picStatsRaw = await prisma.ticket.groupBy({
            by: ['technicianId'],
            where: {
                statusId: resolvedStatus?.id,
                technicianId: { not: null }
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });

        // Map technician IDs to names
        const techIds = picStatsRaw.map(t => t.technicianId).filter(Boolean) as string[];
        const technicians = await prisma.user.findMany({
            where: { id: { in: techIds } },
            select: { id: true, name: true, department: { select: { name: true } } }
        });

        const picStats = picStatsRaw.map(stat => {
            const tech = technicians.find(t => t.id === stat.technicianId)
            return {
                name: tech?.name || 'Unknown',
                role: tech?.department?.name || 'Technician',
                resolved: stat._count.id,
                rating: "N/A" 
            }
        });

        return NextResponse.json({
            counts: { open, onGoing, onHold, resolved },
            chartData,
            picStats
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
