import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suggestKnowledgeBase } from "@/lib/knowledge";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Next.js 15+ needs Promise
) {
    try {
        const { id } = await params;

        // Find the ticket to extract text to search
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) }
        });

        if (!ticket) {
           return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const suggestions = await suggestKnowledgeBase(ticket.subject, ticket.description, ticket.categoryId);

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return NextResponse.json(
            { error: "Failed to fetch suggestions" },
            { status: 500 }
        );
    }
}
