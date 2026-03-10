"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { Home, Ticket, FileText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Menu items.
const items = [
    {
        title: "Overview",
        url: "/admin",
        icon: Home,
    },
    {
        title: "Tickets",
        url: "/admin/tickets",
        icon: Ticket,
    },
    // {
    //     title: "Reports",
    //     url: "/admin/reports",
    //     icon: FileText,
    // },
    // {
    //     title: "Advanced Analytics",
    //     url: "/admin/analytics",
    //     icon: BarChart2,
    // },
    // {
    //     title: "Settings",
    //     url: "/admin/settings",
    //     icon: Settings,
    // },
    {
        title: "Master Data",
        url: "#",
        icon: FileText,
        items: [
            { title: "Departments", url: "/admin/master-data/departments" },
            // { title: "Locations", url: "/admin/master-data/locations" },
            // { title: "Assets", url: "/admin/master-data/assets" },
            { title: "Categories", url: "/admin/master-data/categories" },
            { title: "SubCategories", url: "/admin/master-data/subcategories" },
            // { title: "Statuses", url: "/admin/master-data/statuses" },
            // { title: "Priorities", url: "/admin/master-data/priorities" },
            // { title: "Channels", url: "/admin/master-data/channels" },
            // { title: "Root Causes", url: "/admin/master-data/root-causes" },
            // { title: "Knowledge Base", url: "/admin/master-data/knowledge-base" },
        ]
    },
]

import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"

// Helper for Ticket Views
function TicketViewItem({ title, status, icon: Icon, variant }: { title: string, status: string, icon: React.ElementType, variant: "default" | "secondary" | "destructive" | "outline" }) {
    const { data: stats } = useQuery({ 
        queryKey: ['admin-stats'], 
        queryFn: () => fetch('/api/admin/stats').then(res => res.json()) 
    })
    
    // Map status to count key
    const countKey = status === 'ON_GOING' ? 'onGoing' : status === 'ON_HOLD' ? 'onHold' : status.toLowerCase();
    const count = stats?.counts?.[countKey] || 0;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link href={`/admin/tickets?status=${status}`} className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{title}</span>
                    </div>
                    {count > 0 && (
                        <Badge variant={variant} className="px-1.5 py-0.5 text-[10px] h-5 min-w-5 justify-center">
                            {count}
                        </Badge>
                    )}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-3 py-3 border-b">
                    {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                        Helpdesk
                    </div> */}
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">Helpdesk Admin</span>
                        <span className="truncate text-xs text-muted-foreground">v1.0.0</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items ? (
                                        <>
                                            <SidebarMenuButton className="font-semibold text-primary/80 pointer-events-none">
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                            <div className="pl-6 space-y-1 mt-1">
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuButton key={subItem.title} asChild isActive={pathname === subItem.url} size="sm" className="h-7">
                                                        <Link href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Ticket Views</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                           <TicketViewItem title="Open" status="OPEN" icon={Ticket} variant="destructive" />
                           <TicketViewItem title="On-Going" status="ON_GOING" icon={Ticket} variant="default" />
                           <TicketViewItem title="On-Hold" status="ON_HOLD" icon={Ticket} variant="secondary" />
                           <TicketViewItem title="Resolved" status="RESOLVED" icon={Ticket} variant="outline" />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {/* Footer content if needed */}
            </SidebarFooter>
        </Sidebar>
    )
}
