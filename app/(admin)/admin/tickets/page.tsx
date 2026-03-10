"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TicketDialog } from "@/components/admin/tickets/ticket-dialog"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { Ticket } from "@/types/ticket"

import { useSearchParams } from "next/navigation"

async function fetchTickets(status: string | null) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    
    const res = await fetch(`/api/tickets?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Network response was not ok");
    }
    return res.json();
}

export default function AdminTicketsPage() {
    const searchParams = useSearchParams()
    const status = searchParams.get("status")

    const { data: tickets, isLoading, isError } = useQuery({
        queryKey: ['tickets', status],
        queryFn: () => fetchTickets(status)
    })

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    if (isError) {
        return <div className="text-red-500">Failed to load tickets.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Tickets Management</h2>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">ID</TableHead>
                            <TableHead>Subject (Details)</TableHead>
                            <TableHead>Perbaikan</TableHead>
                            <TableHead>User / PC</TableHead>
                            <TableHead>Category / Sub</TableHead>
                            <TableHead>Report By</TableHead>
                            <TableHead>PIC</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>Finish</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map((ticket: any) => (
                            <TableRow key={ticket.id} className="hover:bg-muted/30">
                                <TableCell className="font-medium text-sm">#{ticket.id}</TableCell>
                                <TableCell className="truncate max-w-50 text-sm" title={ticket.description}>{ticket.description}</TableCell>
                                <TableCell className="truncate max-w-40 text-sm">{ticket.solution || "-"}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{ticket.user?.name || ticket.user}</span>
                                        <span className="text-xs text-muted-foreground">{ticket.asset?.pcName || '-'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{ticket.category?.name || ticket.category}</span>
                                        <span className="text-xs text-muted-foreground">{ticket.subCategory?.name || ticket.subCategory}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{ticket.channel?.name || "-"}</TableCell>
                                <TableCell className="text-sm font-bold text-primary">{ticket.technician?.name || "-"}</TableCell>
                                <TableCell className="text-xs whitespace-nowrap">
                                    {ticket.startTime ? new Date(ticket.startTime).toLocaleString() : "-"}
                                </TableCell>
                                <TableCell className="text-xs whitespace-nowrap">
                                    {ticket.finishTime ? new Date(ticket.finishTime).toLocaleString() : "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        ticket.status?.name === 'Open' ? 'destructive' :
                                            ticket.status?.name === 'Resolved' ? 'outline' :
                                                ticket.status?.name === 'On-Going' ? 'default' : 'secondary'
                                    } className="text-xs px-2 py-0.5">
                                        {ticket.status?.name || 'Unknown'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <TicketDialog ticket={ticket} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {tickets.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={11} className="h-24 text-center">
                                    No tickets found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
