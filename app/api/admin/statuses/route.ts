import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const statuses = await prisma.ticketStatus.findMany({
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(statuses);
    } catch (error) {
        console.error("Error fetching statuses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, color, isClosed, order } = await req.json();

        if (!name || isClosed === undefined || order === undefined) {
            return NextResponse.json({ error: "Name, isClosed, and order are required" }, { status: 400 });
        }

        const status = await prisma.ticketStatus.create({
            data: { 
                name,
                color: color || "gray",
                isClosed: Boolean(isClosed),
                order: parseInt(order)
             }
        });

        return NextResponse.json(status, { status: 201 });
    } catch (error) {
        console.error("Error creating status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.ticketStatus.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
