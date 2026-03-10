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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2, Search } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function KnowledgeBasePage() {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({ title: "", issue: "", solution: "", categoryId: "" })
    const [search, setSearch] = useState("")

    const { data: items, isLoading } = useQuery({
        queryKey: ['kb'],
        queryFn: async () => {
            const res = await fetch('/api/admin/knowledge-base')
            if (!res.ok) throw new Error('Failed to fetch')
            return res.json()
        }
    })

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/admin/categories')
            if (!res.ok) return []
            return res.json()
        }
    })

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/admin/knowledge-base', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to create')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kb'] })
            setFormData({ title: "", issue: "", solution: "", categoryId: "" })
            toast.success('KB Article created')
        },
        onError: () => toast.error('Failed to create')
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/knowledge-base?id=${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kb'] })
            toast.success('KB Article deleted')
        },
        onError: () => toast.error('Failed to delete')
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim() || !formData.issue.trim() || !formData.solution.trim() || !formData.categoryId) return
        createMutation.mutate(formData)
    }

    const filteredItems = items?.filter((item: any) => 
        item.title.toLowerCase().includes(search.toLowerCase()) || 
        item.issue.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
                    <p className="text-muted-foreground mt-2">Manage standard solutions for common problems.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Article</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input 
                                    id="title" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g. Printer Offline Fix" 
                                    disabled={createMutation.isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={formData.categoryId} onValueChange={(v) => setFormData({...formData, categoryId: v})} disabled={createMutation.isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((cat: any) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="issue">Symptoms / Issue Description</Label>
                            <Textarea 
                                id="issue" 
                                value={formData.issue}
                                onChange={(e) => setFormData({...formData, issue: e.target.value})}
                                placeholder="Describe the problem users face..." 
                                disabled={createMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="solution">Standard Solution</Label>
                            <Textarea 
                                id="solution" 
                                value={formData.solution}
                                onChange={(e) => setFormData({...formData, solution: e.target.value})}
                                placeholder="Steps to resolve the issue..." 
                                disabled={createMutation.isPending}
                            />
                        </div>

                        <Button type="submit" disabled={createMutation.isPending || !formData.title.trim() || !formData.categoryId}>
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Publish Article
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Search titles or issues..." 
                    className="max-w-sm" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full h-24 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredItems?.length === 0 ? (
                    <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground border rounded-md border-dashed">
                        No articles found.
                    </div>
                ) : (
                    filteredItems?.map((item: any) => (
                        <Card key={item.id} className="relative group">
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteMutation.mutate(item.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">{item.title}</CardTitle>
                                <CardDescription>{item.category?.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-semibold text-red-500">Issue:</span> {item.issue}</p>
                                    <p className="border-t pt-2 mt-2"><span className="font-semibold text-green-600">Solution:</span> {item.solution}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
