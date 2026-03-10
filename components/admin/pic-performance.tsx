"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

interface PicStat {
    name: string;
    role: string;
    resolved: number;
    rating: string;
}

export function PicPerformance() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    const pics: PicStat[] = data?.picStats || [];

    if (isLoading) {
        return (
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Performance Metrics (PIC)</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Performance Metrics (PIC)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-500">Failed to load performance metrics.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Performance Metrics (PIC)</CardTitle>
            </CardHeader>
            <CardContent>
                {pics.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No data available.</p>
                ) : (
                    <div className="space-y-8">
                        {pics.map((pic) => (
                            <div className="flex items-center" key={pic.name}>
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{pic.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{pic.name}</p>
                                    <p className="text-xs text-muted-foreground">{pic.role}</p>
                                </div>
                                <div className="ml-auto font-medium flex flex-col items-end">
                                    <span>{pic.resolved} Resolved</span>
                                    {pic.rating !== "N/A" && (
                                        <span className="text-xs text-muted-foreground">Rating: {pic.rating}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
