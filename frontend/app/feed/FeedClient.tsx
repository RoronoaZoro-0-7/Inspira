'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MessageSquare, ArrowUp, Clock, CheckCircle, Filter, Plus, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { postApi } from "@/lib/api";
import { toast } from "sonner";

import type { Post } from "@/lib/api";

export default function FeedClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) setCategory(categoryParam);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postApi.getAll({
        category: category !== "all" ? category : undefined,
        sort: sortBy as 'newest' | 'trending'
      });
      if (response.success) setPosts(response.data.posts || []);
      else throw new Error("Failed to fetch posts");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts");
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [category, sortBy]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === "all") params.delete("category");
    else params.set("category", newCategory);
    router.push(`/feed?${params.toString()}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const filteredPosts = posts.filter(post => {
    if (!debouncedSearchQuery.trim()) return true;
    const query = debouncedSearchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query) ||
      post.categories.some(cat => cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query))
    );
  });

  // --- Loader ---
  if (loading) return (
    <div className="max-w-4xl mx-auto py-20 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted">Loading posts...</p>
    </div>
  );

  // --- Error ---
  if (error) return (
    <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
      <p className="text-muted">{error}</p>
      <Button onClick={fetchPosts} variant="outline">Try Again</Button>
    </div>
  );

  // --- Main Feed ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
        <Input
          placeholder="Search posts, topics, or authors..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={sortBy} onValueChange={setSortBy}>
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

        <Select value={category} onValueChange={handleCategoryChange}>
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

      {/* Posts Count */}
      {(debouncedSearchQuery.trim() || category !== "all") && (
        <p className="text-sm text-muted">
          {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
          {debouncedSearchQuery.trim() && ` for "${debouncedSearchQuery}"`}
          {category !== "all" && ` in ${category.charAt(0).toUpperCase() + category.slice(1)}`}
        </p>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-muted py-20">No posts found</p>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {post.categories.length > 0
                        ? post.categories.map(cat => <Badge key={cat.id} variant="secondary">{cat.name}</Badge>)
                        : <Badge variant="secondary">General</Badge>
                      }
                      {post.isResolved && (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Resolved
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                      <Link href={`/posts/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed text-foreground">
                      {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                    </CardDescription>
                  </div>

                  <div className="text-right text-sm text-muted">
                    <Badge variant="outline" className="text-xs">5 credits</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.imageUrl || "/placeholder.svg"} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.author.name}</p>
                        <p className="text-xs text-muted">Member</p>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="flex items-center space-x-1 text-muted text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
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
                        0
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <Button variant="outline" size="lg">Load More Posts</Button>
      </div>
    </div>
  );
}
