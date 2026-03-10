import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { suggestKnowledgeBase } from "@/lib/knowledge";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const statusId = searchParams.get("statusId");

        const whereClause: Prisma.TicketWhereInput = {};
        if (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN") {
            whereClause.userId = session.user.id;
        }

        if (statusId) {
            whereClause.statusId = parseInt(statusId);
        }

        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, department: { select: { name: true } } } },
                category: { select: { name: true } },
                subCategory: { select: { name: true } },
                status: { select: { name: true, color: true } },
                priority: { select: { name: true } },
                asset: { select: { pcName: true } },
                channel: { select: { name: true } },
                technician: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const formatted = tickets.map((t) => ({
            ...t,
            user: t.user?.name,
            division: t.user?.department?.name || 'Unknown',
            category: t.category?.name,
            subCategory: t.subCategory?.name,
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return NextResponse.json(
            { error: "Failed to fetch tickets" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { assetId, categoryId, subCategoryId, channelId, priorityId, details, reportBy } = body;

        if (!categoryId || !subCategoryId || !details || !reportBy) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const openStatus = await prisma.ticketStatus.findFirst({ where: { name: 'Open' }});
        const defaultPriority = await prisma.priority.findFirst({ where: { name: 'Normal' }});
        const defaultChannel = await prisma.channel.findFirst({ where: { name: 'Web Portal' }});

        const subjectStr = details.substring(0, 50) + "...";

        const ticket = await prisma.ticket.create({
            data: {
                userId: session.user.id,
                subject: subjectStr,
                description: details,
                assetId: assetId ? parseInt(assetId) : null,
                categoryId: parseInt(categoryId),
                subCategoryId: parseInt(subCategoryId),
                channelId: channelId ? parseInt(channelId) : (defaultChannel?.id || 1),
                priorityId: priorityId ? parseInt(priorityId) : (defaultPriority?.id || 1),
                statusId: openStatus?.id || 1, 
            },
        });

        // Trigger Knowledge Base Suggestion Search
        const knowledgeSuggestions = await suggestKnowledgeBase(subjectStr, details, parseInt(categoryId));

        return NextResponse.json({
            ticket,
            suggestions: knowledgeSuggestions
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating ticket:", error);
        return NextResponse.json(
            { error: "Failed to create ticket" },
            { status: 500 }
        );
    }
}
