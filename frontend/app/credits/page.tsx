import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  TrendingUp,
  Plus,
  MessageSquare,
  ArrowUp,
  CheckCircle,
  Gift,
  Search,
  CreditCard,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"

// Mock transaction data - in real app this would come from API
const mockTransactions = [
  {
    id: 1,
    type: "HELPFUL_REWARD",
    amount: 10,
    description: "Answer marked as helpful",
    relatedPost: "How to implement authentication in Next.js 14?",
    timestamp: "2024-01-15T10:30:00Z",
    balance: 125,
  },
  {
    id: 2,
    type: "POST_COST",
    amount: -5,
    description: "Created new post",
    relatedPost: "Best practices for React state management",
    timestamp: "2024-01-15T09:15:00Z",
    balance: 115,
  },
  {
    id: 3,
    type: "UPVOTE_REWARD",
    amount: 1,
    description: "Comment upvoted",
    relatedPost: "How to optimize database queries?",
    timestamp: "2024-01-15T08:45:00Z",
    balance: 120,
  },
  {
    id: 4,
    type: "HELPFUL_REWARD",
    amount: 10,
    description: "Answer marked as helpful",
    relatedPost: "CSS Grid vs Flexbox - when to use which?",
    timestamp: "2024-01-14T16:20:00Z",
    balance: 119,
  },
  {
    id: 5,
    type: "WELCOME_BONUS",
    amount: 50,
    description: "Welcome bonus for new users",
    relatedPost: null,
    timestamp: "2024-01-10T12:00:00Z",
    balance: 109,
  },
  {
    id: 6,
    type: "POST_COST",
    amount: -5,
    description: "Created new post",
    relatedPost: "How to handle errors in async JavaScript?",
    timestamp: "2024-01-14T14:30:00Z",
    balance: 59,
  },
  {
    id: 7,
    type: "UPVOTE_REWARD",
    amount: 1,
    description: "Post upvoted",
    relatedPost: "Understanding TypeScript generics",
    timestamp: "2024-01-14T11:15:00Z",
    balance: 64,
  },
  {
    id: 8,
    type: "HELPFUL_REWARD",
    amount: 10,
    description: "Answer marked as helpful",
    relatedPost: "Docker containerization best practices",
    timestamp: "2024-01-13T15:45:00Z",
    balance: 63,
  },
]

const transactionTypes = {
  HELPFUL_REWARD: {
    label: "Helpful Answer",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  POST_COST: {
    label: "Post Created",
    icon: MessageSquare,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  UPVOTE_REWARD: {
    label: "Upvote Received",
    icon: ArrowUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  WELCOME_BONUS: {
    label: "Welcome Bonus",
    icon: Gift,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
}

const currentBalance = 125
const weeklyEarned = 25
const weeklySpent = 15

export default function CreditsPage() {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type: keyof typeof transactionTypes) => {
    const config = transactionTypes[type]
    const Icon = config.icon
    return <Icon className={`w-4 h-4 ${config.color}`} />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Credits & Transactions</h1>
          <p className="text-muted mt-1">Manage your credits and view transaction history</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/feed">Back to Feed</Link>
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-primary" />
              <span>Current Balance</span>
            </CardTitle>
            <CardDescription>Your available credits for posting and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-serif font-bold text-primary mb-4">{currentBalance}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-muted">Earned this week:</span>
                <span className="font-medium text-green-600">+{weeklyEarned}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-muted">Spent this week:</span>
                <span className="font-medium text-red-600">-{weeklySpent}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Net Change</span>
                <span className="font-medium text-green-600">+{weeklyEarned - weeklySpent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Transactions</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Helpful Answers</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" size="sm" asChild>
              <Link href="/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Post (-5)
              </Link>
            </Button>
            <Button variant="outline" className="w-full bg-transparent" size="sm" asChild>
              <Link href="/feed">
                <MessageSquare className="w-4 h-4 mr-2" />
                Answer Questions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="earn">How to Earn</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Credits</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                    <Input placeholder="Search transactions..." className="pl-10" />
                  </div>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="HELPFUL_REWARD">Helpful Rewards</SelectItem>
                    <SelectItem value="POST_COST">Post Costs</SelectItem>
                    <SelectItem value="UPVOTE_REWARD">Upvote Rewards</SelectItem>
                    <SelectItem value="WELCOME_BONUS">Welcome Bonus</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all-time">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your complete credit transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transactionTypes[transaction.type as keyof typeof transactionTypes].bgColor
                          }`}
                        >
                          {getTransactionIcon(transaction.type as keyof typeof transactionTypes)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-foreground">{transaction.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {transactionTypes[transaction.type as keyof typeof transactionTypes].label}
                            </Badge>
                          </div>
                          {transaction.relatedPost && (
                            <p className="text-sm text-muted mt-1">
                              Related to: <span className="text-foreground">{transaction.relatedPost}</span>
                            </p>
                          )}
                          <p className="text-xs text-muted mt-1">{formatDate(transaction.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-medium ${
                            transaction.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount}
                        </div>
                        <div className="text-xs text-muted">Balance: {transaction.balance}</div>
                      </div>
                    </div>
                    {index < mockTransactions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center pt-6">
                <Button variant="outline">Load More Transactions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earn" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Answer Questions</span>
                </CardTitle>
                <CardDescription>Help others and earn credits for your expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Answer marked as helpful</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +10 credits
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Comment receives upvote</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +1 credit
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Post receives upvote</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +1 credit
                    </Badge>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/feed">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Answering
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Quality Content</span>
                </CardTitle>
                <CardDescription>Create valuable posts and build your reputation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weekly top contributor</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      +25 credits
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly achievement badge</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      +50 credits
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Referral bonus</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      +20 credits
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/leaderboard">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Leaderboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span>Daily Activities</span>
                </CardTitle>
                <CardDescription>Consistent engagement rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily login streak (7 days)</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      +5 credits
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Complete profile setup</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +15 credits
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">First helpful answer</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +20 credits
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/profile/john@example.com">
                    <Gift className="w-4 h-4 mr-2" />
                    Complete Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <span>Tips for Earning</span>
                </CardTitle>
                <CardDescription>Maximize your credit earning potential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Be Helpful</h4>
                  <p className="text-muted">Provide detailed, accurate answers that solve real problems</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Stay Active</h4>
                  <p className="text-muted">Regular participation increases your chances of earning credits</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Quality Over Quantity</h4>
                  <p className="text-muted">One great answer is worth more than many mediocre ones</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Engage with Community</h4>
                  <p className="text-muted">Upvote good content and participate in discussions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>Purchase Credits</span>
              </CardTitle>
              <CardDescription>Buy credits to continue posting and engaging with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-border">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">Starter Pack</CardTitle>
                    <div className="text-3xl font-bold text-primary">50</div>
                    <CardDescription>credits</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-2xl font-bold">$4.99</div>
                    <div className="text-sm text-muted">$0.10 per credit</div>
                    <Button className="w-full bg-transparent" variant="outline">
                      Purchase
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">Value Pack</CardTitle>
                    <div className="text-3xl font-bold text-primary">150</div>
                    <CardDescription>credits</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-2xl font-bold">$12.99</div>
                    <div className="text-sm text-muted">$0.087 per credit</div>
                    <div className="text-xs text-green-600 font-medium">Save 13%</div>
                    <Button className="w-full">Purchase</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-border">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">Pro Pack</CardTitle>
                    <div className="text-3xl font-bold text-primary">300</div>
                    <CardDescription>credits</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-2xl font-bold">$19.99</div>
                    <div className="text-sm text-muted">$0.067 per credit</div>
                    <div className="text-xs text-green-600 font-medium">Save 33%</div>
                    <Button className="w-full bg-transparent" variant="outline">
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Why Purchase Credits?</h3>
                <ul className="text-sm text-muted space-y-1">
                  <li>• Continue asking questions when you run low on earned credits</li>
                  <li>• Support the community and platform development</li>
                  <li>• Get instant access to post without waiting to earn credits</li>
                  <li>• All purchases are secure and processed through Stripe</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
