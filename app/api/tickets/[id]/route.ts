import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
    try {
        const session = await getServerSession(authOptions);
        // Only Admin can update
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Fields to update from new Form mappings
        const {
            statusId,
            analysis,
            solution,
            prevention,
            technicianId,
            rootCauseId,
            startTime,
            finishTime
        } = body;

        const updatedTicket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: {
                statusId: statusId ? parseInt(statusId) : undefined,
                technicianId: technicianId || undefined,
                rootCauseId: rootCauseId && rootCauseId !== "none" ? parseInt(rootCauseId) : undefined,
                analysis,
                solution,
                prevention,
                startTime: startTime ? new Date(startTime) : undefined,
                finishTime: finishTime ? new Date(finishTime) : undefined,
            },
            include: {
                status: true
            }
        });

        // Create Notification if Resolved
        if (updatedTicket.status?.name === "Resolved") {
            await prisma.notification.create({
                data: {
                    userId: updatedTicket.userId,
                    ticketId: updatedTicket.id,
                    title: "Ticket Resolved",
                    message: `Your ticket #${updatedTicket.id} has been marked as RESOLVED. Check details for analysis.`,
                }
            })
        }

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error("Error updating ticket:", error);
        return NextResponse.json(
            { error: "Failed to update ticket" },
            { status: 500 }
        );
    }
}
