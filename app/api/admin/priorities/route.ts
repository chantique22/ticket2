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

        const priorities = await prisma.priority.findMany({
            orderBy: { id: 'asc' }
        });

        return NextResponse.json(priorities);
    } catch (error) {
        console.error("Error fetching priorities:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, slaHours } = await req.json();

        if (!name || !slaHours) {
            return NextResponse.json({ error: "Name and slaHours are required" }, { status: 400 });
        }

        const priority = await prisma.priority.create({
            data: { 
                name,
                slaHours: parseInt(slaHours)
            }
        });

        return NextResponse.json(priority, { status: 201 });
    } catch (error) {
        console.error("Error creating priority:", error);
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

        await prisma.priority.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting priority:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
