"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Plus,
  Trophy,
  MessageSquare,
  User,
  CreditCard,
  Settings,
  Code,
  Palette,
  Briefcase,
  PenTool,
  TrendingUp,
  Zap,
  Bell,
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

const categories = [
  { name: "Coding", icon: Code, count: "5.2k", href: "/feed?category=coding" },
  { name: "Design", icon: Palette, count: "3.1k", href: "/feed?category=design" },
  { name: "Business", icon: Briefcase, count: "2.8k", href: "/feed?category=business" },
  { name: "Writing", icon: PenTool, count: "1.9k", href: "/feed?category=writing" },
  { name: "Marketing", icon: TrendingUp, count: "1.5k", href: "/feed?category=marketing" },
]

export function AppSidebar() {
  const { user, isSignedIn } = useUser()

  // Mock data - in real app this would come from your database
  const userCredits = 125
  const userReputation = 1250

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/feed" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-serif font-bold text-foreground">Inspira</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/feed">
                    <Home className="w-4 h-4" />
                    Home Feed
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/notifications">
                    <Bell className="w-4 h-4" />
                    Notifications
                    <Badge variant="secondary" className="ml-auto text-xs bg-red-100 text-red-600">
                      3
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/create">
                    <Plus className="w-4 h-4" />
                    Create Post
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/leaderboard">
                    <Trophy className="w-4 h-4" />
                    Leaderboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chat">
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Categories */}
        <SidebarGroup>
          <SidebarGroupLabel>Popular Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <SidebarMenuItem key={category.name}>
                  <SidebarMenuButton asChild>
                    <Link href={category.href}>
                      <category.icon className="w-4 h-4" />
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {category.count}
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSignedIn && (
          <>
            <SidebarSeparator />

            {/* User Section */}
            <SidebarGroup>
              <SidebarGroupLabel>Your Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href={`/profile/${user?.id}`}>
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/credits">
                        <CreditCard className="w-4 h-4" />
                        Credits
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {isSignedIn && (
        <SidebarFooter className="p-4">
          <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={user?.fullName || ""} />
              <AvatarFallback>
                {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.fullName || user?.firstName}</p>
              <div className="flex items-center space-x-2 text-xs text-muted">
                <span>{userCredits} credits</span>
                <span>•</span>
                <span>{userReputation} rep</span>
              </div>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
