import { Search, Filter, TrendingUp, MessageSquare, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Search Inspira</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search posts, users, topics..." className="pl-10" defaultValue="machine learning" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Results */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="answers">Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">Found 127 posts for "machine learning"</div>

            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        How to get started with machine learning in 2024?
                      </h3>
                      <Badge variant="secondary">Technology</Badge>
                    </div>
                    <p className="text-gray-600 line-clamp-2">
                      I'm a complete beginner looking to learn machine learning. What are the best resources, courses,
                      and practical projects to start with?
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>24 upvotes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>8 answers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>3 helpful</span>
                        </div>
                      </div>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">Found 23 users related to "machine learning"</div>

            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/sarah-avatar.png`} />
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Dr. Sarah Chen</h3>
                      <p className="text-gray-600">Machine Learning Engineer at Google</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>1,247 credits</span>
                        <span>89 posts</span>
                        <span>156 helpful answers</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">Related topics and categories</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Machine Learning", posts: 1247, followers: 5600 },
                { name: "Deep Learning", posts: 892, followers: 3400 },
                { name: "Neural Networks", posts: 567, followers: 2100 },
                { name: "AI Ethics", posts: 234, followers: 1800 },
              ].map((topic) => (
                <Card key={topic.name} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{topic.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{topic.posts} posts</span>
                      <span>{topic.followers} followers</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="answers" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">Found 89 answers for "machine learning"</div>

            {[1, 2].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Answer to: "What are the prerequisites for machine learning?"
                    </div>
                    <p className="text-gray-700">
                      The most important prerequisites are: 1) Strong foundation in mathematics (linear algebra,
                      calculus, statistics), 2) Programming skills in Python or R, 3) Understanding of data structures
                      and algorithms...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>15 upvotes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>Marked as helpful</span>
                        </div>
                      </div>
                      <span>by Dr. Sarah Chen • 1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
