"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type Notification = {
    id: number
    title: string
    message: string
    isRead: boolean
    createdAt: string
    ticketId: number | null
}

export function NotificationDropdown() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)

    const { data: notifications = [] } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await fetch("/api/notifications")
            if (!res.ok) throw new Error("Failed to fetch")
            return res.json() as Promise<Notification[]>
        },
        // Refetch every 30 seconds
        refetchInterval: 30000 
    })

    const markAsReadMutation = useMutation({
        mutationFn: async (id?: number) => {
             await fetch("/api/notifications", {
                 method: "PATCH",
                 body: JSON.stringify({ id })
             })
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["notifications"] })
        }
    })

    const unreadCount = notifications.filter(n => !n.isRead).length
    const hasUnread = unreadCount > 0

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id)
        }
        setIsOpen(false)
        if (notification.ticketId) {
            // Determine route based on role? Or just universal ticket link
            // Assuming /ticket/[id] works for user, /admin/tickets/[id] for admin?
            // Actually, Users go to history? Users don't have a detail page yet?
            // Wait, create User Ticket Detail page or reuse existing?
            // For now, redirect to History for user, Sidebar for Admin
            // Let's just go to history for now if user.
            router.push("/ticket/history")
        }
    }

    const handleMarkAllRead = () => {
        markAsReadMutation.mutate(undefined) // undefined means all
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                         <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border-2 border-background"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 z-100" align="end" forceMount>
                <DropdownMenuLabel className="flex items-center justify-between border-b pb-2">
                    <span>Notifications</span>
                    {hasUnread && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-75">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <DropdownMenuItem 
                                key={item.id} 
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!item.isRead ? "bg-muted/50" : ""}`}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span className={`text-sm font-semibold ${!item.isRead ? "text-primary" : ""}`}>
                                        {item.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {item.message}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
