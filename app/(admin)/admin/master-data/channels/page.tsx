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

export default function ChannelsPage() {
    const queryClient = useQueryClient()
    const [newName, setNewName] = useState("")

    const { data: items, isLoading } = useQuery({
        queryKey: ['channels'],
        queryFn: async () => {
            const res = await fetch('/api/admin/channels')
            if (!res.ok) throw new Error('Failed to fetch')
            return res.json()
        }
    })

    const createMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await fetch('/api/admin/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })
            if (!res.ok) throw new Error('Failed to create')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channels'] })
            setNewName("")
            toast.success('Channel created')
        },
        onError: () => toast.error('Failed to create')
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/channels?id=${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channels'] })
            toast.success('Channel deleted')
        },
        onError: () => toast.error('Failed to delete')
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return
        createMutation.mutate(newName)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Master Data: Communication Channels</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Channel</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="flex gap-4 items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="name">Channel Name</Label>
                            <Input 
                                id="name" 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. WhatsApp" 
                                disabled={createMutation.isPending}
                            />
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
                            <TableHead className="w-20">ID</TableHead>
                            <TableHead>Channel Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <Loader2 className="animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items?.map((item: { id: number, name: string }) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-sm">#{item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
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
