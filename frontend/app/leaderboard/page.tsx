import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Award, TrendingUp, Zap, Crown, Star } from "lucide-react"
import Link from "next/link"

// Mock leaderboard data
const weeklyLeaders = [
  {
    rank: 1,
    user: {
      name: "Sarah Chen",
      email: "sarah@example.com",
      avatar: "/sarah-avatar.png",
    },
    score: 450,
    helpfulAnswers: 12,
    upvotes: 89,
    badge: "Top Helper",
  },
  {
    rank: 2,
    user: {
      name: "Marcus Rodriguez",
      email: "marcus@example.com",
      avatar: "/marcus-avatar.png",
    },
    score: 380,
    helpfulAnswers: 8,
    upvotes: 76,
    badge: "Rising Star",
  },
  {
    rank: 3,
    user: {
      name: "Emily Watson",
      email: "emily@example.com",
      avatar: "/emily-avatar.png",
    },
    score: 320,
    helpfulAnswers: 7,
    upvotes: 65,
    badge: "Knowledge Sharer",
  },
  {
    rank: 4,
    user: {
      name: "Alex Kim",
      email: "alex@example.com",
      avatar: "/placeholder.svg",
    },
    score: 280,
    helpfulAnswers: 6,
    upvotes: 54,
    badge: "Helpful Helper",
  },
  {
    rank: 5,
    user: {
      name: "Lisa Park",
      email: "lisa@example.com",
      avatar: "/placeholder.svg",
    },
    score: 250,
    helpfulAnswers: 5,
    upvotes: 48,
    badge: "Community Builder",
  },
]

const categoryLeaders = {
  coding: [
    { name: "Sarah Chen", score: 1250, avatar: "/sarah-avatar.png" },
    { name: "Alex Kim", score: 980, avatar: "/placeholder.svg" },
    { name: "Marcus Rodriguez", score: 850, avatar: "/marcus-avatar.png" },
  ],
  design: [
    { name: "Emily Watson", score: 890, avatar: "/emily-avatar.png" },
    { name: "Lisa Park", score: 720, avatar: "/placeholder.svg" },
    { name: "Sarah Chen", score: 650, avatar: "/sarah-avatar.png" },
  ],
  business: [
    { name: "Marcus Rodriguez", score: 780, avatar: "/marcus-avatar.png" },
    { name: "Emily Watson", score: 690, avatar: "/emily-avatar.png" },
    { name: "Alex Kim", score: 580, avatar: "/placeholder.svg" },
  ],
}

export default function LeaderboardPage() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800"
      case 2:
        return "bg-gray-100 text-gray-800"
      case 3:
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted mt-1">Top contributors and knowledge sharers in the community</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/feed">Back to Feed</Link>
        </Button>
      </div>

      {/* Top 3 Podium */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>This Week's Champions</span>
          </CardTitle>
          <CardDescription>Top 3 contributors based on helpful answers and community engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyLeaders.slice(0, 3).map((leader) => (
              <div
                key={leader.rank}
                className={`text-center p-6 rounded-lg border-2 ${
                  leader.rank === 1
                    ? "border-yellow-200 bg-yellow-50"
                    : leader.rank === 2
                      ? "border-gray-200 bg-gray-50"
                      : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex justify-center mb-4">{getRankIcon(leader.rank)}</div>
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={leader.user.avatar || "/placeholder.svg"} alt={leader.user.name} />
                  <AvatarFallback className="text-lg">{leader.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">{leader.user.name}</h3>
                <Badge className={getRankBadgeColor(leader.rank)}>{leader.badge}</Badge>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Score:</span>
                    <span className="font-medium">{leader.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Helpful Answers:</span>
                    <span className="font-medium">{leader.helpfulAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Upvotes:</span>
                    <span className="font-medium">{leader.upvotes}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
                  <Link href={`/profile/${leader.user.email}`}>View Profile</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="weekly" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          <Select defaultValue="all-time">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Rankings</CardTitle>
              <CardDescription>Based on helpful answers, upvotes, and community engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyLeaders.map((leader) => (
                  <div key={leader.rank} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8">{getRankIcon(leader.rank)}</div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={leader.user.avatar || "/placeholder.svg"} alt={leader.user.name} />
                        <AvatarFallback>{leader.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground">{leader.user.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {leader.badge}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-primary">{leader.score}</div>
                        <div className="text-muted">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">{leader.helpfulAnswers}</div>
                        <div className="text-muted">Helpful</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{leader.upvotes}</div>
                        <div className="text-muted">Upvotes</div>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent" asChild>
                        <Link href={`/profile/${leader.user.email}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(categoryLeaders).map(([category, leaders]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category}</CardTitle>
                  <CardDescription>Top contributors in {category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaders.map((leader, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 text-center font-bold text-muted">#{index + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={leader.avatar || "/placeholder.svg"} alt={leader.name} />
                          <AvatarFallback className="text-xs">{leader.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{leader.name}</span>
                      </div>
                      <span className="font-bold text-primary">{leader.score}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "First Answer",
                description: "Posted your first helpful answer",
                icon: Star,
                color: "text-blue-600",
                bgColor: "bg-blue-100",
                holders: 1250,
              },
              {
                title: "Top Helper",
                description: "Received 10+ helpful answer marks",
                icon: Trophy,
                color: "text-yellow-600",
                bgColor: "bg-yellow-100",
                holders: 89,
              },
              {
                title: "Community Builder",
                description: "Active for 30+ consecutive days",
                icon: TrendingUp,
                color: "text-green-600",
                bgColor: "bg-green-100",
                holders: 156,
              },
              {
                title: "Knowledge Sharer",
                description: "Created 25+ helpful posts",
                icon: Zap,
                color: "text-purple-600",
                bgColor: "bg-purple-100",
                holders: 67,
              },
              {
                title: "Rising Star",
                description: "Gained 500+ reputation in a week",
                icon: Medal,
                color: "text-orange-600",
                bgColor: "bg-orange-100",
                holders: 23,
              },
              {
                title: "Expert Contributor",
                description: "Reached 5000+ total reputation",
                icon: Crown,
                color: "text-red-600",
                bgColor: "bg-red-100",
                holders: 12,
              },
            ].map((achievement) => (
              <Card key={achievement.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.bgColor}`}>
                      <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{achievement.title}</h3>
                      <p className="text-sm text-muted">{achievement.description}</p>
                      <p className="text-xs text-muted mt-1">{achievement.holders} users earned this</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
