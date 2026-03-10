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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssetsPage() {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        assetCode: "", pcName: "", brand: "", model: "", os: "", ram: "", storage: "", userId: "", locationId: ""
    })

    const { data: items, isLoading } = useQuery({
        queryKey: ['assets'],
        queryFn: async () => {
            const res = await fetch('/api/admin/assets')
            if (!res.ok) throw new Error('Failed to fetch')
            return res.json()
        }
    })

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await fetch('/api/admin/users') // Will create standard users route if needed
            if (!res.ok) return []
            return res.json()
        }
    })

    const { data: locations } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const res = await fetch('/api/admin/locations')
            if (!res.ok) return []
            return res.json()
        }
    })

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/admin/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to create')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] })
            setFormData({ assetCode: "", pcName: "", brand: "", model: "", os: "", ram: "", storage: "", userId: "", locationId: "" })
            toast.success('Asset created')
        },
        onError: () => toast.error('Failed to create')
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/assets?id=${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] })
            toast.success('Asset deleted')
        },
        onError: () => toast.error('Failed to delete')
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.assetCode.trim() || !formData.pcName.trim()) return
        createMutation.mutate(formData)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Master Data: Assets</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Asset</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="assetCode">Asset Code *</Label>
                            <Input 
                                id="assetCode" 
                                value={formData.assetCode}
                                onChange={(e) => setFormData({...formData, assetCode: e.target.value})}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="pcName">PC Name *</Label>
                            <Input 
                                id="pcName" 
                                value={formData.pcName}
                                onChange={(e) => setFormData({...formData, pcName: e.target.value})}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="brand">Brand</Label>
                            <Input 
                                id="brand" 
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="model">Model</Label>
                            <Input 
                                id="model" 
                                value={formData.model}
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="os">OS</Label>
                            <Input 
                                id="os" 
                                value={formData.os}
                                onChange={(e) => setFormData({...formData, os: e.target.value})}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="ram">RAM</Label>
                            <Input 
                                id="ram" 
                                value={formData.ram}
                                onChange={(e) => setFormData({...formData, ram: e.target.value})}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="locationId">Location</Label>
                            <Select value={formData.locationId} onValueChange={(v) => setFormData({...formData, locationId: v})} disabled={createMutation.isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations?.map((loc: any) => (
                                        <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="userId">Assign to User</Label>
                            <Select value={formData.userId} onValueChange={(v) => setFormData({...formData, userId: v})} disabled={createMutation.isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select User" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users?.map((user: any) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>{user.name || user.email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" className="w-full" disabled={createMutation.isPending || !formData.assetCode.trim() || !formData.pcName.trim()}>
                                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                Add Asset
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>PC Name</TableHead>
                            <TableHead>Brand/Model</TableHead>
                            <TableHead>Specs</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-sm">{item.assetCode}</TableCell>
                                    <TableCell>{item.pcName}</TableCell>
                                    <TableCell>{item.brand} {item.model}</TableCell>
                                    <TableCell>{item.os} / {item.ram}</TableCell>
                                    <TableCell>{item.user?.name || '-'}</TableCell>
                                    <TableCell>{item.location?.name || '-'}</TableCell>
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
