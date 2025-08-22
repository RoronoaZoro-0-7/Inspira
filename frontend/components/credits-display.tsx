"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, Plus, TrendingUp, TrendingDown, Target } from "lucide-react"
import Link from "next/link"

interface CreditsDisplayProps {
  credits: number
  showDetails?: boolean
  showProgress?: boolean
  className?: string
  weeklyEarned?: number
  weeklySpent?: number
  weeklyGoal?: number
}

export function CreditsDisplay({
  credits,
  showDetails = false,
  showProgress = false,
  className,
  weeklyEarned = 0,
  weeklySpent = 0,
  weeklyGoal = 50,
}: CreditsDisplayProps) {
  if (!showDetails) {
    return (
      <Badge variant="secondary" className={`bg-primary/10 text-primary hover:bg-primary/20 ${className}`}>
        <Zap className="w-3 h-3 mr-1" />
        {credits}
      </Badge>
    )
  }

  const weeklyProgress = Math.min((weeklyEarned / weeklyGoal) * 100, 100)

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <span>Credits Balance</span>
        </CardTitle>
        <CardDescription>Your current credits for posting and interactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-serif font-bold text-primary">{credits}</div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+{weeklyEarned} this week</span>
          </div>
          <div className="flex items-center space-x-2 text-red-600">
            <TrendingDown className="w-4 h-4" />
            <span>-{weeklySpent} spent</span>
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>Weekly Goal</span>
              </span>
              <span className="text-muted">
                {weeklyEarned}/{weeklyGoal}
              </span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
          </div>
        )}

        <div className="space-y-2">
          <Button asChild className="w-full" size="sm">
            <Link href="/credits">
              <Plus className="w-4 h-4 mr-2" />
              View Transactions
            </Link>
          </Button>
        </div>

        <div className="text-xs text-muted space-y-1">
          <p>• Post a question: 5 credits</p>
          <p>• Helpful answer marked: +10 credits</p>
          <p>• Comment upvoted: +1 credit</p>
        </div>
      </CardContent>
    </Card>
  )
}
