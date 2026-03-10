"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Edit } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Ticket } from "@/types/ticket"

// Schema matching the Ticket Analysis requirement
const ticketFormSchema = z.object({
    statusId: z.string().optional(),
    analysis: z.string().optional(),
    solution: z.string().optional(),
    prevention: z.string().optional(),
    technicianId: z.string().optional(),
    rootCauseId: z.string().optional(),
    startTime: z.string().optional(),
    finishTime: z.string().optional(),
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

interface TicketDialogProps {
    ticket: Ticket
}

export function TicketDialog({ ticket }: TicketDialogProps) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const [statuses, setStatuses] = useState<any[]>([])
    const [technicians, setTechnicians] = useState<any[]>([])
    const [rootCauses, setRootCauses] = useState<any[]>([])

    // Only load once when dialog opens
    useState(() => {
        if (!open) return;
        Promise.all([
            fetch("/api/admin/statuses").then(res => res.json()),
            fetch("/api/admin/users").then(res => res.json()),
            fetch("/api/admin/root-causes").then(res => res.json()),
        ]).then(([sts, usrs, causes]) => {
            if (Array.isArray(sts)) setStatuses(sts)
            if (Array.isArray(causes)) setRootCauses(causes)
            if (Array.isArray(usrs)) {
                setTechnicians(usrs.filter((u: any) => u.role === "TECHNICIAN" || u.role === "ADMIN"))
            }
        }).catch(err => console.error(err))
    })

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(ticketFormSchema),
        defaultValues: {
            statusId: ticket.statusId?.toString() || "",
            analysis: ticket.analysis || "",
            solution: ticket.solution || "",
            prevention: ticket.prevention || "",
            technicianId: ticket.technicianId?.toString() || "",
            rootCauseId: ticket.rootCauseId?.toString() || "",
            startTime: ticket.startTime ? new Date(ticket.startTime).toISOString().slice(0, 16) : "",
            finishTime: ticket.finishTime ? new Date(ticket.finishTime).toISOString().slice(0, 16) : "",
        },
    })

    const mutation = useMutation({
        mutationFn: async (values: TicketFormValues) => {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            if (!res.ok) throw new Error("Failed to update")
            return res.json()
        },
        onSuccess: () => {
            toast.success("Ticket updated successfully")
            queryClient.invalidateQueries({ queryKey: ["tickets"] })
            setOpen(false)
        },
        onError: () => {
            toast.error("Failed to update ticket")
        }
    })

    function onSubmit(data: TicketFormValues) {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Process
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Handle Ticket #{ticket.id}</DialogTitle>
                    <DialogDescription>
                        Update status and provide technical analysis.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted rounded-md text-sm">
                    <div><span className="font-semibold block">User:</span> {ticket.user}</div>
                    <div><span className="font-semibold block">PC Name:</span> {ticket.pcName}</div>
                    <div><span className="font-semibold block">Category:</span> {ticket.category}</div>
                    <div className="col-span-2"><span className="font-semibold block">Problem Detail:</span> {ticket.details}</div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="statusId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {statuses.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Analysis Fields */}
                        <FormField control={form.control} name="analysis" render={({ field }) => (
                            <FormItem><FormLabel>Analisa (Analysis)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="solution" render={({ field }) => (
                            <FormItem><FormLabel>Perbaikan (Resolution)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="prevention" render={({ field }) => (
                            <FormItem><FormLabel>Preventif (Prevention)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField
                            control={form.control}
                            name="rootCauseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Root Cause</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select root cause" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None / Not classified</SelectItem>
                                            {rootCauses.map(rc => <SelectItem key={rc.id} value={rc.id.toString()}>{rc.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="finishTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Finish</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="technicianId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PIC / Technician</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select PIC" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {technicians.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name || t.email}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
