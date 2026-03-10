"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Clock, CheckCircle, AlertCircle, PlayCircle, PauseCircle } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

export function StatsCards() {
    const { data: stats } = useQuery({ 
        queryKey: ['admin-stats'], 
        queryFn: () => fetch('/api/admin/stats').then(res => res.json()) 
    })

    const counts: Record<string, number> = stats?.counts || { open: 0, onGoing: 0, onHold: 0, resolved: 0 };
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/tickets">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">All time tickets</p>
                    </CardContent>
                </Card>
            </Link>
            
            <Link href="/admin/tickets?status=OPEN">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{counts.open}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/admin/tickets?status=ON_GOING">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Going</CardTitle>
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{counts.onGoing}</div>
                        <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/admin/tickets?status=ON_HOLD">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                        <PauseCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{counts.onHold}</div>
                        <p className="text-xs text-muted-foreground">Paused</p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/admin/tickets?status=RESOLVED">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{counts.resolved}</div>
                        <p className="text-xs text-muted-foreground">Completed tickets</p>
                    </CardContent>
                </Card>
            </Link>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                </CardContent>
            </Card>
        </div>
    )
}
