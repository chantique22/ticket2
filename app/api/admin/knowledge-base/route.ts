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

        const items = await prisma.knowledgeBase.findMany({
            include: { category: true },
            orderBy: { id: 'desc' }
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching kb:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        if (!data.title || !data.issue || !data.solution || !data.categoryId) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const item = await prisma.knowledgeBase.create({
            data: { 
                title: data.title,
                issue: data.issue,
                solution: data.solution,
                categoryId: parseInt(data.categoryId),
                createdById: session.user.id
             }
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Error creating kb:", error);
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

        await prisma.knowledgeBase.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting kb:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
