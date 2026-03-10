import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AdminHeader } from "@/components/admin-header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="min-w-0 bg-background overflow-x-hidden">
                <AdminHeader />
                <main className="flex-1 p-4 md:p-6 space-y-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
