import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ArrowUp, Clock, CheckCircle, Filter, Plus } from "lucide-react"
import Link from "next/link"

// Mock data - in real app this would come from API
const mockPosts = [
  {
    id: 1,
    title: "How to implement authentication in Next.js 14 with App Router?",
    excerpt:
      "I'm struggling with setting up authentication in my Next.js 14 project using the new App Router. What's the best approach for handling user sessions?",
    author: {
      name: "Sarah Chen",
      avatar: "/sarah-avatar.png",
      reputation: 2450,
    },
    category: "Coding",
    upvotes: 24,
    comments: 8,
    timeAgo: "2 hours ago",
    isHelpful: false,
    credits: 5,
  },
  {
    id: 2,
    title: "Best practices for designing mobile-first responsive layouts",
    excerpt:
      "Looking for advice on creating responsive designs that work well across all devices. What are the key principles I should follow?",
    author: {
      name: "Marcus Rodriguez",
      avatar: "/marcus-avatar.png",
      reputation: 1890,
    },
    category: "Design",
    upvotes: 18,
    comments: 12,
    timeAgo: "4 hours ago",
    isHelpful: true,
    credits: 5,
  },
  {
    id: 3,
    title: "How to validate startup ideas before building an MVP?",
    excerpt:
      "I have several startup ideas but want to validate them properly before investing time and money. What's the most effective validation process?",
    author: {
      name: "Emily Watson",
      avatar: "/emily-avatar.png",
      reputation: 3200,
    },
    category: "Business",
    upvotes: 31,
    comments: 15,
    timeAgo: "6 hours ago",
    isHelpful: false,
    credits: 5,
  },
]

export default function FeedPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Knowledge Feed</h1>
          <p className="text-muted mt-1">Discover questions, share insights, and build your reputation</p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select defaultValue="newest">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="most-comments">Most Comments</SelectItem>
            <SelectItem value="most-upvotes">Most Upvotes</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="coding">Coding</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="writing">Writing</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
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
                <div className="text-right text-sm text-muted">
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {post.credits} credits
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.author.name}</p>
                      <p className="text-xs text-muted">{post.author.reputation} reputation</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="flex items-center space-x-1 text-muted text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{post.timeAgo}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="text-muted hover:text-foreground">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    {post.upvotes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted hover:text-foreground" asChild>
                    <Link href={`/posts/${post.id}`}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <Button variant="outline" size="lg">
          Load More Posts
        </Button>
      </div>
    </div>
  )
}
