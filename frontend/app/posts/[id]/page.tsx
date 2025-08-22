import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  MessageSquare,
  ArrowUp,
  Clock,
  CheckCircle,
  Share,
  Bookmark,
  Flag,
  Reply,
  MoreHorizontal,
  Zap,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { notFound } from "next/navigation"

// Mock data - in real app this would come from API based on params.id
const mockPost = {
  id: 1,
  title: "How to implement authentication in Next.js 14 with App Router?",
  content: `I'm struggling with setting up authentication in my Next.js 14 project using the new App Router. I've tried several approaches but I'm running into issues with session management and protecting routes.

Here's what I've tried so far:

1. **NextAuth.js** - But I'm having trouble with the middleware configuration
2. **Clerk** - Works well but I want to understand the underlying concepts
3. **Custom JWT implementation** - Getting complex quickly

**Specific questions:**
- What's the best way to handle server-side authentication checks?
- How do I protect API routes in the app directory?
- Should I use middleware or layout-level protection?

Any guidance would be greatly appreciated! I'm particularly interested in understanding the security implications of different approaches.

**My current setup:**
- Next.js 14.0.3
- TypeScript
- Tailwind CSS
- Prisma with PostgreSQL`,
  author: {
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "/sarah-avatar.png",
    reputation: 2450,
    badges: ["Top Contributor", "React Expert"],
  },
  category: "Coding",
  tags: ["nextjs", "authentication", "app-router", "security"],
  upvotes: 24,
  comments: 8,
  timeAgo: "2 hours ago",
  isHelpful: false,
  credits: 5,
  isOwner: false, // In real app, check if current user is the post owner
}

const mockComments = [
  {
    id: 1,
    content: `Great question! I've been working with Next.js 14 authentication for a while now. Here's my recommended approach:

**For NextAuth.js with App Router:**

1. Install the latest version: \`npm install next-auth@beta\`
2. Create your auth configuration in \`app/api/auth/[...nextauth]/route.ts\`
3. Use middleware for route protection

Here's a basic setup:

\`\`\`typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add your middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"]
}
\`\`\`

The key is understanding that with App Router, you need to handle auth differently than with Pages Router.`,
    author: {
      name: "Marcus Rodriguez",
      email: "marcus@example.com",
      avatar: "/marcus-avatar.png",
      reputation: 1890,
    },
    upvotes: 12,
    timeAgo: "1 hour ago",
    isHelpful: true,
    replies: [
      {
        id: 2,
        content:
          "This is exactly what I was looking for! The middleware approach makes so much sense now. Thank you for the detailed example.",
        author: {
          name: "Sarah Chen",
          email: "sarah@example.com",
          avatar: "/sarah-avatar.png",
          reputation: 2450,
        },
        upvotes: 3,
        timeAgo: "45 minutes ago",
      },
    ],
  },
  {
    id: 3,
    content: `I'd also recommend checking out the official Next.js authentication documentation. They have some great examples for App Router.

One thing to keep in mind is that server components and client components handle auth differently. Make sure you're using the right approach for each case.

For server components, you can directly access the session in your component. For client components, you'll need to use the \`useSession\` hook.`,
    author: {
      name: "Emily Watson",
      email: "emily@example.com",
      avatar: "/emily-avatar.png",
      reputation: 3200,
    },
    upvotes: 8,
    timeAgo: "30 minutes ago",
    isHelpful: false,
    replies: [],
  },
]

interface PageProps {
  params: {
    id: string
  }
}

export default function PostDetailPage({ params }: PageProps) {
  // In real app, fetch post data based on params.id
  if (!mockPost) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted">
        <Link href="/feed" className="hover:text-foreground">
          Feed
        </Link>
        <span>/</span>
        <span className="text-foreground">Post #{params.id}</span>
      </div>

      {/* Main Post */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="secondary">{mockPost.category}</Badge>
                {mockPost.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {mockPost.isHelpful && (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Helpful
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl font-serif leading-tight">{mockPost.title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {mockPost.credits} credits
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mockPost.author.avatar || "/placeholder.svg"} alt={mockPost.author.name} />
                <AvatarFallback>{mockPost.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-foreground">{mockPost.author.name}</p>
                  {mockPost.author.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted">
                  <span>{mockPost.author.reputation} reputation</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{mockPost.timeAgo}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                {mockPost.upvotes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                {mockPost.comments}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">{mockPost.content}</div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>{mockComments.length} Answers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment Form */}
          <div className="space-y-3">
            <Label htmlFor="comment">Your Answer</Label>
            <Textarea
              id="comment"
              placeholder="Share your knowledge and help the community..."
              className="min-h-[120px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Be helpful and constructive. Quality answers earn more credits!</p>
              <Button>Post Answer</Button>
            </div>
          </div>

          <Separator />

          {/* Comments List */}
          <div className="space-y-6">
            {mockComments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Button variant="ghost" size="sm" className="p-1">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">{comment.upvotes}</span>
                    {comment.isHelpful && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 text-green-600 hover:text-green-700"
                        disabled={!mockPost.isOwner}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="prose prose-gray max-w-none">
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed">{comment.content}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{comment.author.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted">
                            <span>{comment.author.reputation} rep</span>
                            <span>•</span>
                            <span>{comment.timeAgo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {mockPost.isOwner && !comment.isHelpful && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 bg-transparent"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark Helpful
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-8 space-y-4 border-l-2 border-border pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="space-y-2">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                                {reply.content}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={reply.author.avatar || "/placeholder.svg"}
                                    alt={reply.author.name}
                                  />
                                  <AvatarFallback className="text-xs">{reply.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="text-xs font-medium text-foreground">{reply.author.name}</p>
                                <span className="text-xs text-muted">•</span>
                                <span className="text-xs text-muted">{reply.timeAgo}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="text-xs">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                {reply.upvotes}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Related Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "Best practices for Next.js 14 middleware configuration",
              "How to handle JWT tokens in App Router",
              "Server vs Client Components for authentication",
            ].map((title, index) => (
              <Link
                key={index}
                href={`/posts/${index + 10}`}
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <p className="text-sm font-medium text-foreground hover:text-primary">{title}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
