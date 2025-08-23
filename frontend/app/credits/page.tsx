"use client"

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
import { useCredits } from "@/contexts/CreditsContext"
import { userApi, paymentApi } from "@/lib/api"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// Interface for transaction data
interface Transaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string;
  createdAt: string;
}

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

export default function CreditsPage() {
  const { credits, loading, refreshCredits } = useCredits()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)
  const [packages, setPackages] = useState<Array<{
    id: string;
    name: string;
    credits: number;
    price: number;
    priceInRupees: string;
    pricePerCredit: string;
  }>>([])
  const [packagesLoading, setPackagesLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  
  const currentBalance = credits || 0
  const weeklyEarned = 25 // This would be calculated from real data
  const weeklySpent = 15 // This would be calculated from real data

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true)
      setTransactionsError(null)
      const response = await userApi.getCredits()
      if (response.success) {
        setTransactions(response.data.transactions || [])
      } else {
        setTransactionsError("Failed to fetch transactions")
        toast.error("Failed to load transaction history")
      }
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setTransactionsError("Failed to fetch transactions")
      toast.error("Failed to load transaction history")
    } finally {
      setTransactionsLoading(false)
    }
  }

  // Fetch packages
  const fetchPackages = async () => {
    try {
      setPackagesLoading(true)
      const response = await paymentApi.getPackages()
      if (response.success) {
        setPackages(response.data)
      } else {
        toast.error("Failed to load packages")
      }
    } catch (err) {
      console.error("Error fetching packages:", err)
      toast.error("Failed to load packages")
    } finally {
      setPackagesLoading(false)
    }
  }

  // Handle payment
  const handlePayment = async (packageType: string) => {
    try {
      setProcessingPayment(true)
      
      // Create order
      const orderResponse = await paymentApi.createOrder(packageType)
      if (!orderResponse.success) {
        toast.error("Failed to create order")
        return
      }

      const order = orderResponse.data

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: 'rzp_test_6rL5AjtWiQh42x', // Your Razorpay key
          amount: order.amount,
          currency: order.currency,
          name: 'Inspira',
          description: `${order.packageName} - ${order.credits} Credits`,
          order_id: order.orderId,
          handler: async function (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) {
            try {
              // Verify payment
              const verifyResponse = await paymentApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                packageType: packageType,
              })

              if (verifyResponse.success) {
                toast.success(`Payment successful! ${verifyResponse.data.creditsAdded} credits added to your account.`)
                refreshCredits() // Refresh credits
                fetchTransactions() // Refresh transactions
              } else {
                toast.error("Payment verification failed")
              }
            } catch (err) {
              console.error("Payment verification error:", err)
              toast.error("Payment verification failed")
            }
          },
          prefill: {
            name: 'User Name',
            email: 'user@example.com',
          },
          theme: {
            color: '#3b82f6',
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (err) {
      console.error("Payment error:", err)
      toast.error("Payment failed")
    } finally {
      setProcessingPayment(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchTransactions()
    fetchPackages()
  }, [])

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
            <div className="text-4xl font-serif font-bold text-primary mb-4">
              {loading ? "..." : currentBalance}
            </div>
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
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted">Loading transactions...</p>
                </div>
              ) : transactionsError ? (
                <div className="text-center py-8">
                  <p className="text-muted mb-4">{transactionsError}</p>
                  <Button onClick={fetchTransactions} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted">No transactions found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <div key={transaction.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            {transaction.type === 'earned' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-foreground">{transaction.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.type === 'earned' ? 'Earned' : 'Spent'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted mt-1">{formatDate(transaction.createdAt)}</p>
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
                        </div>
                      </div>
                      {index < transactions.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}

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
              {packagesLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted">Loading packages...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg, index) => (
                    <Card 
                      key={pkg.id} 
                      className={`border-2 ${pkg.id === 'value' ? 'border-primary relative' : 'border-border'}`}
                    >
                      {pkg.id === 'value' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <div className="text-3xl font-bold text-primary">{pkg.credits}</div>
                        <CardDescription>credits</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center space-y-4">
                        <div className="text-2xl font-bold">₹{pkg.priceInRupees}</div>
                        <div className="text-sm text-muted">₹{pkg.pricePerCredit} per credit</div>
                        {pkg.id === 'value' && (
                          <div className="text-xs text-green-600 font-medium">Save 13%</div>
                        )}
                        {pkg.id === 'pro' && (
                          <div className="text-xs text-green-600 font-medium">Save 33%</div>
                        )}
                        <Button 
                          className={`w-full ${pkg.id === 'value' ? '' : 'bg-transparent'}`}
                          variant={pkg.id === 'value' ? 'default' : 'outline'}
                          onClick={() => handlePayment(pkg.id)}
                          disabled={processingPayment}
                        >
                          {processingPayment ? 'Processing...' : 'Purchase'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Why Purchase Credits?</h3>
                <ul className="text-sm text-muted space-y-1">
                  <li>• Continue asking questions when you run low on earned credits</li>
                  <li>• Support the community and platform development</li>
                  <li>• Get instant access to post without waiting to earn credits</li>
                  <li>• All purchases are secure and processed through Razorpay</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
