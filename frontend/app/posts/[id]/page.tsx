"use client"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { notFound } from "next/navigation"
import { postApi, commentApi } from "@/lib/api"
import { toast } from "sonner"
import type { Post } from "@/lib/api"
import { useUser } from "@clerk/nextjs"

interface PageProps {
  params: {
    id: string
  }
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  author: {
    name: string;
    imageUrl?: string;
  };
  replies: Array<{
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
    author: {
      name: string;
      imageUrl?: string;
    };
    _count: {
      upvotes: number;
    };
  }>;
  _count: {
    upvotes: number;
    replies: number;
  };
}

export default function PostDetailPage({ params }: PageProps) {
  const { isSignedIn, user } = useUser()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentContent, setCommentContent] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpvotingPost, setIsUpvotingPost] = useState(false)
  const [upvotedComments, setUpvotedComments] = useState<Set<string>>(new Set())
  
  // Reply state management
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  // Fetch post data from API
  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await postApi.getById(params.id)
      if (response.success) {
        setPost(response.data)
      } else {
        setError("Failed to fetch post")
        toast.error("Failed to load post")
      }
    } catch (err) {
      console.error("Error fetching post:", err)
      setError("Failed to fetch post")
      toast.error("Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  // Fetch comments for the post
  const fetchComments = async () => {
    try {
      const response = await commentApi.getByPostId(params.id)
      if (response.success) {
        setComments(response.data)
      }
    } catch (err) {
      console.error("Error fetching comments:", err)
    }
  }

  // Handle post upvote
  const handlePostUpvote = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to upvote")
      return
    }

    try {
      setIsUpvotingPost(true)
      const response = await postApi.upvote(params.id)
      if (response.success) {
        // Update the post's upvote count
        setPost(prev => prev ? { ...prev, upvotes: response.data.upvotes } : null)
        toast.success("Post upvoted!")
      }
    } catch (err) {
      console.error("Error upvoting post:", err)
      toast.error("Failed to upvote post")
    } finally {
      setIsUpvotingPost(false)
    }
  }

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to comment")
      return
    }

    if (!commentContent.trim()) {
      toast.error("Please enter a comment")
      return
    }

    try {
      setIsSubmittingComment(true)
      const response = await commentApi.create(params.id, commentContent.trim())
      if (response.success) {
        setCommentContent("")
        toast.success("Comment posted!")
        // Refresh comments
        await fetchComments()
      }
    } catch (err) {
      console.error("Error posting comment:", err)
      toast.error("Failed to post comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Handle comment upvote
  const handleCommentUpvote = async (commentId: string) => {
    if (!isSignedIn) {
      toast.error("Please sign in to upvote")
      return
    }

    try {
      const response = await commentApi.upvote(commentId)
      if (response.success) {
        // Update the comment's upvote count
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              _count: {
                ...comment._count,
                upvotes: response.data.upvotes
              }
            }
          }
          return comment
        }))
        toast.success("Comment upvoted!")
      }
    } catch (err) {
      console.error("Error upvoting comment:", err)
      toast.error("Failed to upvote comment")
    }
  }

  // Handle reply submission
  const handleSubmitReply = async (commentId: string) => {
    if (!isSignedIn) {
      toast.error("Please sign in to reply")
      return
    }

    if (!replyContent.trim()) {
      toast.error("Please enter a reply")
      return
    }

    try {
      setIsSubmittingReply(true)
      const response = await commentApi.reply(commentId, replyContent.trim())
      if (response.success) {
        setReplyContent("")
        setReplyingTo(null)
        toast.success("Reply posted!")
        // Refresh comments to show the new reply
        await fetchComments()
      }
    } catch (err) {
      console.error("Error posting reply:", err)
      toast.error("Failed to post reply")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Handle starting a reply
  const handleStartReply = (commentId: string) => {
    if (!isSignedIn) {
      toast.error("Please sign in to reply")
      return
    }
    setReplyingTo(commentId)
    setReplyContent("")
  }

  // Handle canceling a reply
  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyContent("")
  }

  // Fetch post and comments on component mount
  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [params.id])

  // Format date to relative time
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted">Loading post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-muted mb-4">{error || "Post not found"}</p>
            <Button onClick={fetchPost} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted">
        <Link href="/feed" className="hover:text-foreground">
          Feed
        </Link>
        <span>/</span>
        <span className="text-foreground">{post.title}</span>
      </div>

      {/* Main Post */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="secondary">
                  {post.categoryIds.length > 0 ? post.categoryIds[0] : "General"}
                </Badge>
                {post.isResolved && (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolved
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl font-serif leading-tight">{post.title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                5 credits
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
                <AvatarImage src={post.author.imageUrl || "/placeholder.svg"} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    Member
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePostUpvote}
                disabled={isUpvotingPost}
              >
                {isUpvotingPost ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 mr-1" />
                )}
                {post.upvotes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                {comments.length}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">{post.content}</div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>{comments.length} Answers</span>
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
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={!isSignedIn || isSubmittingComment}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Be helpful and constructive. Quality answers earn more credits!</p>
              <Button 
                onClick={handleSubmitComment}
                disabled={!isSignedIn || isSubmittingComment || !commentContent.trim()}
              >
                {isSubmittingComment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Answer"
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted">No answers yet. Be the first to help!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  <div className="flex space-x-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={comment.author.imageUrl || "/placeholder.svg"} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm text-foreground">{comment.author.name}</p>
                        <span className="text-xs text-muted">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {comment.content}
                      </div>
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted hover:text-foreground"
                          onClick={() => handleCommentUpvote(comment.id)}
                        >
                          <ArrowUp className="w-3 h-3 mr-1" />
                          {comment._count.upvotes}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted hover:text-foreground"
                          onClick={() => handleStartReply(comment.id)}
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                      
                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div className="mt-4 space-y-3">
                          <Textarea
                            placeholder="Write your reply..."
                            className="min-h-[80px] text-sm"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            disabled={isSubmittingReply}
                          />
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm"
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={isSubmittingReply || !replyContent.trim()}
                            >
                              {isSubmittingReply ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                "Post Reply"
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={handleCancelReply}
                              disabled={isSubmittingReply}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="ml-6 space-y-3 mt-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-3">
                              <Avatar className="h-6 w-6 mt-1">
                                <AvatarImage src={reply.author.imageUrl || "/placeholder.svg"} alt={reply.author.name} />
                                <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-xs text-foreground">{reply.author.name}</p>
                                  <span className="text-xs text-muted">{formatTimeAgo(reply.createdAt)}</span>
                                </div>
                                <div className="text-xs text-foreground leading-relaxed">
                                  {reply.content}
                                </div>
                                <div className="flex items-center space-x-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-muted hover:text-foreground h-6 px-2"
                                    onClick={() => handleCommentUpvote(reply.id)}
                                  >
                                    <ArrowUp className="w-2 h-2 mr-1" />
                                    {reply._count.upvotes}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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
