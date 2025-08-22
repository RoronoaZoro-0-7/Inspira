import type React from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// Mock user data - in real app this would come from authentication
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/diverse-user-avatars.png",
  credits: 125,
  reputation: 1250,
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={mockUser} />
        <SidebarInset className="flex flex-col">
          <AppHeader user={mockUser} />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
