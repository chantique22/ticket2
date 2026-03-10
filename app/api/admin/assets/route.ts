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

        const assets = await prisma.asset.findMany({
            include: {
                user: { select: { name: true, email: true } },
                location: { select: { name: true } }
            },
            orderBy: { id: 'asc' }
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error("Error fetching assets:", error);
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

        if (!data.assetCode || !data.pcName) {
            return NextResponse.json({ error: "Asset Code and PC Name are required" }, { status: 400 });
        }

        const asset = await prisma.asset.create({
            data: { 
                assetCode: data.assetCode,
                pcName: data.pcName,
                brand: data.brand || null,
                model: data.model || null,
                os: data.os || null,
                ram: data.ram || null,
                storage: data.storage || null,
                userId: data.userId || null,
                locationId: data.locationId ? parseInt(data.locationId) : null,
            }
        });

        return NextResponse.json(asset, { status: 201 });
    } catch (error) {
        console.error("Error creating asset:", error);
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

        await prisma.asset.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting asset:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
