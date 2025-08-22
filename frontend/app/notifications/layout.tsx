import type React from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </div>
  )
}
