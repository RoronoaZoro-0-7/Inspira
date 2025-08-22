"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  ArrowUp,
  Clock,
  CheckCircle,
  Trophy,
  MapPin,
  Calendar,
  LinkIcon,
  Github,
  Twitter,
  Globe,
  Star,
  Award,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { userApi, postApi, commentApi } from "@/lib/api"
import { toast } from "sonner"
import type { Post, Category } from "@/lib/api"

// Interfaces for user profile data
interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  credits: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UserStats {
  postsCreated: number;
  answersGiven: number;
  helpfulAnswers: number;
  upvotesReceived: number;
  creditsEarned: number;
  weeklyRank?: number;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  postTitle: string;
  upvotes: number;
  createdAt: string;
  isHelpful: boolean;
}

export default function ProfilePage() {
  const params = useParams()
  const { user: currentUser } = useUser()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userComments, setUserComments] = useState<Comment[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    postsCreated: 0,
    answersGiven: 0,
    helpfulAnswers: 0,
    upvotesReceived: 0,
    creditsEarned: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, we'll fetch the current user's profile
      // In a real app, you'd fetch by params.id
      const response = await userApi.getProfile()
      if (response.success) {
        setUserProfile(response.data)
      } else {
        setError("Failed to fetch user profile")
        toast.error("Failed to load profile")
      }
    } catch (err) {
      console.error("Error fetching user profile:", err)
      setError("Failed to fetch user profile")
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  // Fetch user's posts
  const fetchUserPosts = async () => {
    try {
      const response = await userApi.getPosts()
      if (response.success) {
        setUserPosts(response.data || [])
        setUserStats(prev => ({ ...prev, postsCreated: response.data?.length || 0 }))
      }
    } catch (err) {
      console.error("Error fetching user posts:", err)
    }
  }

  // Fetch user's comments
  const fetchUserComments = async () => {
    try {
      // For now, we'll skip comments fetching as we need a proper endpoint
      // In a real app, you'd have a specific endpoint for user comments
      setUserStats(prev => ({ 
        ...prev, 
        answersGiven: 0,
        helpfulAnswers: 0
      }))
    } catch (err) {
      console.error("Error fetching user comments:", err)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchUserProfile()
  }, [params?.id])

  useEffect(() => {
    if (userProfile) {
      fetchUserPosts()
      fetchUserComments()
    }
  }, [userProfile])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-muted mb-4">{error || "Profile not found"}</p>
            <Button onClick={fetchUserProfile} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isCurrentUser = currentUser?.id === userProfile?.id

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={userProfile?.imageUrl || "/placeholder.svg"} alt={userProfile?.name || "User"} />
                <AvatarFallback className="text-2xl">{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {!isCurrentUser && (
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/chat?user=${userProfile?.id || ""}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    Follow
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">{userProfile?.name || "User"}</h1>
                <p className="text-muted mt-1">{userProfile?.bio || "No bio available"}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted">
                {userProfile?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userProfile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {userProfile?.createdAt ? formatDate(userProfile.createdAt) : "Recently"}</span>
                </div>
                {userProfile?.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4" />
                    <a
                      href={userProfile.website}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {userProfile.website.replace("https://", "")}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {userProfile?.github && (
                  <Button variant="outline" size="sm" className="bg-transparent" asChild>
                    <a href={`https://github.com/${userProfile.github}`} target="_blank" rel="noreferrer noopener">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {userProfile?.twitter && (
                  <Button variant="outline" size="sm" className="bg-transparent" asChild>
                    <a href={`https://twitter.com/${userProfile.twitter}`} target="_blank" rel="noreferrer noopener">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {userProfile?.website && (
                  <Button variant="outline" size="sm" className="bg-transparent" asChild>
                    <a href={userProfile.website} target="_blank" rel="noreferrer noopener">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Skills section - for now showing credits as main skill */}
                <Badge variant="secondary">
                  {userProfile?.credits || 0} Credits
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">{userProfile?.credits || 0}</div>
            <div className="text-sm text-muted">Credits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{userStats.helpfulAnswers}</div>
            <div className="text-sm text-muted">Helpful Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{userStats.upvotesReceived}</div>
            <div className="text-sm text-muted">Upvotes Received</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{userStats.postsCreated}</div>
            <div className="text-sm text-muted">Posts Created</div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Achievements & Badges</span>
          </CardTitle>
          <CardDescription>Recognition for contributions to the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* For now, showing basic badges based on user stats */}
            {userStats.postsCreated > 0 && (
              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Post Creator</div>
                </div>
              </div>
            )}
            {userProfile?.credits && userProfile.credits > 100 && (
              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Credit Collector</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts ({userStats.postsCreated})</TabsTrigger>
          <TabsTrigger value="answers">Answers ({userStats.answersGiven})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted">No posts created yet.</p>
            </div>
          ) : (
                        userPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {post.categories.length > 0 && (
                          <Badge variant="secondary">{post.categories[0].name}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                        <Link href={`/posts/${post.id}`}>{post.title}</Link>
                      </CardTitle>
                      <CardDescription className="mt-2 text-base leading-relaxed">
                        {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-muted text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-muted text-sm">
                        <ArrowUp className="w-4 h-4" />
                        <span>{post.upvotes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                         ))
           )}
          </TabsContent>

          <TabsContent value="answers" className="space-y-4">
            {userComments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted">No answers given yet.</p>
              </div>
            ) : (
                            userComments.map((comment) => (
                <Card key={comment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted">Answer to:</span>
                          <Link href={`/posts/${comment.postId}`} className="text-sm font-medium text-primary hover:underline">
                            {comment.postTitle}
                          </Link>
                          {comment.isHelpful && (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Helpful
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted">
                          <div className="flex items-center space-x-1">
                            <ArrowUp className="w-4 h-4" />
                            <span>{comment.upvotes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(comment.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-foreground leading-relaxed">{comment.content}</div>
                    </div>
                  </CardContent>
                </Card>
                             ))
             )}
          </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest contributions and interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      Answer marked as helpful on{" "}
                      <Link href="/posts/1" className="text-primary hover:underline">
                        "How to implement authentication in Next.js 14?"
                      </Link>
                    </p>
                    <p className="text-xs text-muted">2 hours ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +10 credits
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ArrowUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Received upvote on comment</p>
                    <p className="text-xs text-muted">4 hours ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    +1 credit
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      Created new post:{" "}
                      <Link href="/posts/2" className="text-primary hover:underline">
                        "Best practices for React state management"
                      </Link>
                    </p>
                    <p className="text-xs text-muted">1 day ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    -5 credits
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
