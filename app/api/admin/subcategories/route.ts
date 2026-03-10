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

        const subCategories = await prisma.subCategory.findMany({
            include: {
                category: true
            },
            orderBy: { id: 'asc' }
        });

        return NextResponse.json(subCategories);
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, categoryId } = await req.json();

        if (!name || !categoryId) {
            return NextResponse.json({ error: "Name and Category ID are required" }, { status: 400 });
        }

        const subCategory = await prisma.subCategory.create({
            data: { 
                name,
                categoryId: parseInt(categoryId) 
            },
            include: {
                category: true
            }
        });

        return NextResponse.json(subCategory, { status: 201 });
    } catch (error) {
        console.error("Error creating subcategory:", error);
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

        await prisma.subCategory.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
