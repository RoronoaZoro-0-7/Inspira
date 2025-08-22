"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Upload, X, AlertCircle, CheckCircle, Code, Palette, Briefcase, PenTool, TrendingUp } from "lucide-react"
import Link from "next/link"
import { postApi, type CreatePostData } from "@/lib/api"
import { useCredits } from "@/contexts/CreditsContext"
import { useCategories } from "@/contexts/CategoriesContext"
import { toast } from "sonner"

const categories = [
  { value: "coding", label: "Coding", icon: Code },
  { value: "design", label: "Design", icon: Palette },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "writing", label: "Writing", icon: PenTool },
  { value: "marketing", label: "Marketing", icon: TrendingUp },
]

const suggestedTags = [
  "nextjs",
  "react",
  "typescript",
  "javascript",
  "css",
  "html",
  "nodejs",
  "python",
  "design",
  "ui-ux",
  "figma",
  "business",
  "startup",
  "marketing",
  "writing",
  "content",
]

export default function CreatePostPage() {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const { credits, loading: isLoadingCredits, error: creditsError, refreshCredits } = useCredits()
  const { refreshCategories } = useCategories()
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const postCost = 5

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      toast.error("Please sign in to create a post")
      return
    }

    if (credits < postCost) {
      toast.error(`You need at least ${postCost} credits to create a post`)
      return
    }

    if (!canSubmit) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const postData: CreatePostData = {
        title: title.trim(),
        content: content.trim(),
        categoryIds: [category, ...tags], // Send category and tags as categoryIds array
      }

      const response = await postApi.create(postData)
      
      if (response.success) {
        toast.success("Post created successfully!")
        // Refresh credits and categories after post creation
        await Promise.all([refreshCredits(), refreshCategories()])
        // Redirect to the new post
        router.push(`/posts/${response.data.id}`)
      } else {
        throw new Error(response.message || 'Failed to create post')
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      const errorMessage = error.message || 'Failed to create post. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = title.trim() && content.trim() && category && 
    credits >= postCost && isSignedIn

  // Show loading state while fetching credits
  if (isLoadingCredits) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in to create a post</h2>
            <p className="text-muted mb-4">You need to be signed in to create posts and interact with the community.</p>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Create New Post</h1>
          <p className="text-muted mt-1">Share your question or knowledge with the community</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/feed">Cancel</Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Credit Warning */}
      {credits < postCost ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need at least {postCost} credits to create a post. You currently have {credits} credits.{" "}
            <Link href="/credits" className="underline">
              Learn how to earn more credits
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Creating a post costs {postCost} credits. You have {credits} credits available.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                  <CardDescription>Provide clear and detailed information to get the best responses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="What's your question or topic?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                        className="text-lg"
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-between text-sm text-muted">
                        <span>Be specific and clear about what you're asking</span>
                        <span>{title.length}/200</span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center space-x-2">
                                <cat.icon className="w-4 h-4" />
                                <span>{cat.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        placeholder="Provide details, context, and any relevant information..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-between text-sm text-muted">
                        <span>Use markdown for formatting. Be detailed and specific.</span>
                        <span>{content.length} characters</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                      <Label>Tags (optional)</Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                              disabled={isSubmitting}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddTag(newTag)
                            }
                          }}
                          maxLength={20}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddTag(newTag)}
                          disabled={!newTag || tags.length >= 5 || isSubmitting}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {suggestedTags
                          .filter((tag) => !tags.includes(tag))
                          .slice(0, 10)
                          .map((tag) => (
                            <Button
                              key={tag}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => handleAddTag(tag)}
                              disabled={tags.length >= 5 || isSubmitting}
                            >
                              {tag}
                            </Button>
                          ))}
                      </div>
                      <p className="text-xs text-muted">Maximum 5 tags. Tags help others find your post.</p>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label>Attachments (optional)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto text-muted mb-2" />
                        <p className="text-sm text-muted">
                          Drag and drop files here, or{" "}
                          <button type="button" className="text-primary hover:underline" disabled={isSubmitting}>
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-muted mt-1">Images, documents, and code files supported</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Submit */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted">
                        <Zap className="w-4 h-4" />
                        <span>This post will cost {postCost} credits</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                          <Link href="/feed">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={!canSubmit || isSubmitting}>
                          {isSubmitting ? "Publishing..." : "Publish Post"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    {category && (
                      <Badge variant="secondary">
                        {categories.find((c) => c.value === category)?.label || category}
                      </Badge>
                    )}
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-xl">{title || "Your post title will appear here"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {content || "Your post content will appear here..."}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Writing Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-1">Be Specific</h4>
                <p className="text-muted">Include relevant details, error messages, and context</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Show Your Work</h4>
                <p className="text-muted">Share what you've tried and what didn't work</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Use Formatting</h4>
                <p className="text-muted">Use code blocks, lists, and headers to organize content</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Tag Appropriately</h4>
                <p className="text-muted">Use relevant tags to help others find your post</p>
              </div>
            </CardContent>
          </Card>

          {/* Credit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Credit System</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Post cost:</span>
                <span className="font-medium">-{postCost} credits</span>
              </div>
              <div className="flex justify-between">
                <span>Your balance:</span>
                <span className="font-medium">
                  {isLoadingCredits ? 'Loading...' : `${credits} credits`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>After posting:</span>
                <span className="font-medium">
                  {isLoadingCredits ? '...' : `${credits - postCost} credits`}
                </span>
              </div>
              <div className="text-xs text-muted space-y-1">
                <p>• Earn credits when your answers are marked helpful</p>
                <p>• Get upvotes on your posts and comments</p>
                <p>• Quality content earns more rewards</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
