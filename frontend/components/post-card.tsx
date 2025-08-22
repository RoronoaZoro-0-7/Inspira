import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, ArrowUp, Clock, CheckCircle, Zap } from "lucide-react"
import Link from "next/link"

interface PostCardProps {
  post: {
    id: number
    title: string
    excerpt: string
    author: {
      name: string
      avatar?: string
      reputation: number
    }
    category: string
    upvotes: number
    comments: number
    timeAgo: string
    isHelpful: boolean
    credits: number
  }
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
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
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {post.credits} credits
            </Badge>
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
  )
}
