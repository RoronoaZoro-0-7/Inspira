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
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useCredits } from "@/contexts/CreditsContext"
import { useCategories } from "@/contexts/CategoriesContext"
import Link from "next/link"

// Category configuration with icons
const categoryConfig = {
  coding: { name: "Coding", icon: Code, href: "/feed?category=coding" },
  design: { name: "Design", icon: Palette, href: "/feed?category=design" },
  business: { name: "Business", icon: Briefcase, href: "/feed?category=business" },
  writing: { name: "Writing", icon: PenTool, href: "/feed?category=writing" },
  marketing: { name: "Marketing", icon: TrendingUp, href: "/feed?category=marketing" },
}

export function AppSidebar() {
  const { user, isSignedIn } = useUser()
  const { credits, loading } = useCredits()
  const { categories, loading: categoriesLoading } = useCategories()

  // Mock reputation data - in real app this would come from your database
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
              {categories.map((category) => {
                const config = categoryConfig[category.name as keyof typeof categoryConfig];
                if (!config) return null;
                
                return (
                  <SidebarMenuItem key={category.name}>
                    <SidebarMenuButton asChild>
                      <Link href={config.href}>
                        <config.icon className="w-4 h-4" />
                        <span>{config.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {categoriesLoading ? "..." : category.count}
                        </Badge>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
                <span>{loading ? "..." : credits} credits</span>
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
