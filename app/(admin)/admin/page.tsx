"use client"

import { StatsCards } from "@/components/admin/stats-cards"
import { OverviewChart } from "@/components/admin/overview-chart"
import { PicPerformance } from "@/components/admin/pic-performance"

export default function AdminOverviewPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            </div>

            <StatsCards />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <OverviewChart />
                </div>
                <div className="col-span-3">
                    <PicPerformance />
                </div>
            </div>
        </div>
    )
}
