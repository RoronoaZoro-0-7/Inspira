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
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

// Mock user data - in real app this would come from API based on params.id
const mockUser = {
  id: "sarah@example.com",
  name: "Sarah Chen",
  email: "sarah@example.com",
  avatar: "/sarah-avatar.png",
  bio: "Full-stack developer passionate about React, Next.js, and building great user experiences. Always learning and sharing knowledge with the community.",
  location: "San Francisco, CA",
  joinDate: "2023-06-15",
  website: "https://sarahchen.dev",
  github: "sarahchen",
  twitter: "sarahchen_dev",
  reputation: 2450,
  credits: 180,
  badges: [
    { name: "Top Contributor", icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { name: "React Expert", icon: Star, color: "text-blue-600", bgColor: "bg-blue-100" },
    { name: "Helpful Helper", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
    { name: "Early Adopter", icon: Award, color: "text-purple-600", bgColor: "bg-purple-100" },
  ],
  skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "GraphQL"],
  stats: {
    postsCreated: 23,
    answersGiven: 87,
    helpfulAnswers: 45,
    upvotesReceived: 234,
    creditsEarned: 890,
    weeklyRank: 3,
  },
  isCurrentUser: false, // In real app, check if this is the current user's profile
}

const mockPosts = [
  {
    id: 1,
    title: "How to implement authentication in Next.js 14 with App Router?",
    excerpt: "I'm struggling with setting up authentication in my Next.js 14 project using the new App Router...",
    category: "Coding",
    upvotes: 24,
    comments: 8,
    timeAgo: "2 hours ago",
    isHelpful: false,
  },
  {
    id: 2,
    title: "Best practices for React state management in 2024",
    excerpt: "What are the current best practices for managing state in React applications?",
    category: "Coding",
    upvotes: 18,
    comments: 12,
    timeAgo: "1 day ago",
    isHelpful: true,
  },
]

const mockComments = [
  {
    id: 1,
    content: "Great question! I've been working with Next.js 14 authentication for a while now...",
    postTitle: "How to optimize database queries?",
    upvotes: 12,
    timeAgo: "3 hours ago",
    isHelpful: true,
  },
  {
    id: 2,
    content: "You should definitely check out the new React Server Components documentation...",
    postTitle: "Understanding React Server Components",
    upvotes: 8,
    timeAgo: "1 day ago",
    isHelpful: false,
  },
]

interface PageProps {
  params: {
    id: string
  }
}

export default function ProfilePage({ params }: PageProps) {
  // In real app, fetch user data based on params.id
  if (!mockUser) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                <AvatarFallback className="text-2xl">{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {!mockUser.isCurrentUser && (
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/chat?user=${mockUser.id}`}>
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
                <h1 className="text-3xl font-serif font-bold text-foreground">{mockUser.name}</h1>
                <p className="text-muted mt-1">{mockUser.bio}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted">
                {mockUser.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{mockUser.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(mockUser.joinDate)}</span>
                </div>
                {mockUser.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4" />
                    <a
                      href={mockUser.website}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {mockUser.website.replace("https://", "")}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {mockUser.github && (
                  <Button variant="outline" size="sm" className="bg-transparent" asChild>
                    <a href={`https://github.com/${mockUser.github}`} target="_blank" rel="noreferrer noopener">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {mockUser.twitter && (
                  <Button variant="outline" size="sm" className="bg-transparent" asChild>
                    <a href={`https://twitter.com/${mockUser.twitter}`} target="_blank" rel="noreferrer noopener">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {mockUser.website && (
                  <Button variant="outline" size="sm" className="bg-transparent" asChild>
                    <a href={mockUser.website} target="_blank" rel="noreferrer noopener">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {mockUser.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">{mockUser.reputation}</div>
            <div className="text-sm text-muted">Reputation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{mockUser.stats.helpfulAnswers}</div>
            <div className="text-sm text-muted">Helpful Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{mockUser.stats.upvotesReceived}</div>
            <div className="text-sm text-muted">Upvotes Received</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">#{mockUser.stats.weeklyRank}</div>
            <div className="text-sm text-muted">Weekly Rank</div>
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
            {mockUser.badges.map((badge) => (
              <div key={badge.name} className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.bgColor}`}>
                  <badge.icon className={`w-5 h-5 ${badge.color}`} />
                </div>
                <div>
                  <div className="font-medium text-foreground">{badge.name}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts ({mockUser.stats.postsCreated})</TabsTrigger>
          <TabsTrigger value="answers">Answers ({mockUser.stats.answersGiven})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {mockPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      {post.isHelpful && (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Helpful
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                      <Link href={`/posts/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed">{post.excerpt}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-muted text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{post.timeAgo}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-muted text-sm">
                      <ArrowUp className="w-4 h-4" />
                      <span>{post.upvotes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted text-sm">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="answers" className="space-y-4">
          {mockComments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted">Answer to:</span>
                      <Link href={`/posts/${comment.id}`} className="text-sm font-medium text-primary hover:underline">
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
                        <span>{comment.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-foreground leading-relaxed">{comment.content}</div>
                </div>
              </CardContent>
            </Card>
          ))}
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
