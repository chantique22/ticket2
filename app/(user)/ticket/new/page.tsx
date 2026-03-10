"use client"

import { useSession } from "next-auth/react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Category, SubCategory } from "@/types/ticket"


const ticketFormSchema = z.object({
    // Section A
    assetId: z.string().min(1, "Asset is required"),
    channelId: z.string().min(1, "Report Method is required"),

    // Section B
    categoryId: z.string().min(1, "Category is required"),
    subCategoryId: z.string().min(1, "Sub-category is required"),
    details: z.string().min(10, "Please provide more details"),
})

export default function NewTicketPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [channels, setChannels] = useState<{id: number, name: string}[]>([])
    const [assets, setAssets] = useState<{id: number, pcName: string, assetCode: string}[]>([])

    const form = useForm<z.infer<typeof ticketFormSchema>>({
        resolver: zodResolver(ticketFormSchema),
        defaultValues: {
            assetId: "",
            channelId: "",
            categoryId: "",
            subCategoryId: "",
            details: "",
        },
    })

    // Fetch Master Data
    useEffect(() => {
        Promise.all([
            fetch("/api/admin/categories").then(res => res.json()),
            fetch("/api/admin/channels").then(res => res.json()),
            fetch("/api/admin/assets").then(res => res.json())
        ]).then(([cats, chans, asts]) => {
            if (Array.isArray(cats)) setCategories(cats)
            if (Array.isArray(chans)) setChannels(chans)
            
            // Filter assets to only those belonging to the current user
            if (Array.isArray(asts) && session?.user?.id) {
                 setAssets(asts.filter((a: any) => a.userId === session.user.id))
            }
        }).catch(err => console.error(err))
    }, [session])

    // Watch for category changes
    const categoryId = useWatch({
        control: form.control,
        name: "categoryId",
    })

    // Pre-fill PC name if available (mock logic or from session if we stored it)
    useEffect(() => {
        // In a real scenario, we might fetch the user's last known PC name
        if (session?.user) {
            // Mock pre-fill
            // form.setValue("pcName", "PC-001") 
        }
    }, [session, form])

    async function onSubmit(values: z.infer<typeof ticketFormSchema>) {
        console.log("Submitting ticket with values:", values);
        toast.promise(
            fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            }).then(async (res) => {
                if (!res.ok) throw new Error("Failed to submit");
                return res.json();
            }),
            {
                loading: 'Submitting ticket...',
                success: (data) => {
                    const ticketId = data?.ticket?.id || data?.id; // Handle both old and new response formats
                    router.push(`/ticket/success${ticketId ? `?id=${ticketId}` : ''}`);
                    return `Ticket submitted successfully!`;
                },
                error: 'Error submitting ticket',
            }
        );
    }

    const selectedCategoryData = categories.find(c => c.id.toString() === categoryId);

    return (
        <div className="flex justify-center items-start min-h-screen bg-muted/30 py-10">
            <div className="w-full max-w-3xl px-4">
                <Card className="shadow-lg border-2">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Submit a Support Ticket</CardTitle>
                        <CardDescription>
                            Please fill out the form below. Required fields are marked with an asterisk (*).
                        </CardDescription>
                    </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* SECTION A: User Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Part A: User Information</h3>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={session?.user?.name || ""} disabled readOnly className="bg-muted" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Division</Label>
                                        <Input value={session?.user?.division || "N/A"} disabled readOnly className="bg-muted" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input value={new Date().toLocaleDateString()} disabled readOnly className="bg-muted" />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="assetId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Asset / PC Name *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Asset" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {assets.length === 0 && (
                                                            <SelectItem value="none" disabled>No assets assigned to you.</SelectItem>
                                                        )}
                                                        {assets.map(asset => (
                                                            <SelectItem key={asset.id} value={asset.id.toString()}>
                                                                {asset.pcName} ({asset.assetCode})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="channelId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Report Method *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Method" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {channels.map(channel => (
                                                            <SelectItem key={channel.id} value={channel.id.toString()}>
                                                                {channel.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* SECTION B: Problem Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Part B: Problem Details</h3>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category *</FormLabel>
                                                <Select 
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        form.setValue("subCategoryId", "");
                                                    }} 
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map(cat => (
                                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subCategoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sub-Category *</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={!categoryId}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={categoryId ? "Select Sub-Category" : "Select Category first"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {selectedCategoryData?.subCategories.map((sub: SubCategory) => (
                                                            <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="details"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Problem Detail *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the issue in detail..."
                                                    className="min-h-30"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" size="lg">Submit Ticket</Button>
                            </div>

                        </form>
                    </Form>
                </CardContent>
                </Card>
            </div>
        </div>
    )
}
