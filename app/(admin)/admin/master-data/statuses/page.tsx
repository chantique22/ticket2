"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function StatusesPage() {
    const queryClient = useQueryClient()
    const [newName, setNewName] = useState("")
    const [newColor, setNewColor] = useState("gray")
    const [newIsClosed, setNewIsClosed] = useState("false")
    const [newOrder, setNewOrder] = useState("0")

    const { data: items, isLoading } = useQuery({
        queryKey: ['statuses'],
        queryFn: async () => {
            const res = await fetch('/api/admin/statuses')
            if (!res.ok) throw new Error('Failed to fetch')
            return res.json()
        }
    })

    const createMutation = useMutation({
        mutationFn: async (data: { name: string, color: string, isClosed: boolean, order: number }) => {
            const res = await fetch('/api/admin/statuses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to create')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['statuses'] })
            setNewName("")
            setNewOrder("0")
            toast.success('Status created')
        },
        onError: () => toast.error('Failed to create')
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/statuses?id=${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['statuses'] })
            toast.success('Status deleted')
        },
        onError: () => toast.error('Failed to delete')
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return
        createMutation.mutate({ 
            name: newName, 
            color: newColor, 
            isClosed: newIsClosed === "true", 
            order: parseInt(newOrder) || 0 
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Master Data: Ticket Statuses</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="grid gap-1.5">
                            <Label htmlFor="name">Status Name</Label>
                            <Input 
                                id="name" 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. In Progress" 
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="color">Color</Label>
                            <Input 
                                id="color" 
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                placeholder="e.g. blue" 
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="order">Sort Order</Label>
                            <Input 
                                id="order" 
                                type="number"
                                value={newOrder}
                                onChange={(e) => setNewOrder(e.target.value)}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="isClosed">Counts as Closed?</Label>
                            <select 
                                id="isClosed"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={newIsClosed}
                                onChange={(e) => setNewIsClosed(e.target.value)}
                                disabled={createMutation.isPending}
                            >
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                        </div>
                        <Button type="submit" disabled={createMutation.isPending || !newName.trim()}>
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">Order</TableHead>
                            <TableHead>Status Name</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Is Closed</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items?.map((item: { id: number, name: string, color: string, isClosed: boolean, order: number }) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-sm">{item.order}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.color}</TableCell>
                                    <TableCell>{item.isClosed ? "Yes" : "No"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => deleteMutation.mutate(item.id)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
