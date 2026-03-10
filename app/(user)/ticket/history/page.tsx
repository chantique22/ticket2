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
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { Ticket } from "@/types/ticket"

async function fetchMyTickets() {
    const res = await fetch("/api/tickets");
    if (!res.ok) {
        throw new Error("Network response was not ok");
    }
    return res.json();
}

export default function TicketHistoryPage() {
  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: fetchMyTickets
  })

  if (isLoading) {
      return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
  }

  if (isError) {
      return <div className="text-red-500 container py-6">Failed to load tickets.</div>
  }

  return (
    <div className="container py-10 space-y-6">
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Sub-Category</TableHead>
              <TableHead>Report By</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resolution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket: Ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">#{ticket.id}</TableCell>
                <TableCell className="truncate max-w-50 text-xs" title={ticket.details}>{ticket.details}</TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>{ticket.subCategory}</TableCell>
                <TableCell>{ticket.reportBy}</TableCell>
                <TableCell className="font-bold text-primary">{ticket.pic || "-"}</TableCell>
                <TableCell className="text-xs">{ticket.startTime ? new Date(ticket.startTime).toLocaleString() : "-"}</TableCell>
                <TableCell>
                    <Badge variant={
                        ticket.status === 'OPEN' ? 'destructive' : 
                        ticket.status === 'RESOLVED' ? 'outline' : 
                        ticket.status === 'ON_GOING' ? 'default' : 'secondary'
                    }>
                        {ticket.status.replace('_', ' ')}
                    </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-50">
                    {ticket.action || ticket.analysis || "-"}
                </TableCell>
              </TableRow>
            ))}
             {tickets.length === 0 && (
                <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
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
