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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SubCategoriesPage() {
    const queryClient = useQueryClient()
    const [newName, setNewName] = useState("")
    const [selectedCategoryId, setSelectedCategoryId] = useState("")

    const { data: subCategories, isLoading } = useQuery({
        queryKey: ['subcategories'],
        queryFn: async () => {
            const res = await fetch('/api/admin/subcategories')
            if (!res.ok) throw new Error('Failed to fetch subcategories')
            return res.json()
        }
    })

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/admin/categories')
            if (!res.ok) throw new Error('Failed to fetch categories')
            return res.json()
        }
    })

    const createMutation = useMutation({
        mutationFn: async (data: { name: string, categoryId: string }) => {
            const res = await fetch('/api/admin/subcategories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to create subcategory')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories'] })
            setNewName("")
            toast.success('SubCategory created')
        },
        onError: () => toast.error('Failed to create subcategory')
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/subcategories?id=${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete subcategory')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories'] })
            toast.success('SubCategory deleted')
        },
        onError: () => toast.error('Failed to delete subcategory')
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim() || !selectedCategoryId) return
        createMutation.mutate({ name: newName, categoryId: selectedCategoryId })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Master Data: SubCategories</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New SubCategory</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="flex gap-4 items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="category">Parent Category</Label>
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={createMutation.isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat: { id: number, name: string }) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="name">SubCategory Name</Label>
                            <Input 
                                id="name" 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Printer Issue" 
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <Button type="submit" disabled={createMutation.isPending || !newName.trim() || !selectedCategoryId}>
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
                            <TableHead>Category</TableHead>
                            <TableHead>SubCategory Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : subCategories?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No subcategories found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subCategories?.map((subCat: { id: number, name: string, category: { name: string } }) => (
                                <TableRow key={subCat.id}>
                                    <TableCell className="font-medium text-sm">#{subCat.id}</TableCell>
                                    <TableCell>
                                        <span className="font-medium">{subCat.category.name}</span>
                                    </TableCell>
                                    <TableCell>{subCat.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => deleteMutation.mutate(subCat.id)}
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
