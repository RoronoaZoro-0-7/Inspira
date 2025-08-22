import { Badge } from "@/components/ui/badge"
import { CheckCircle, MessageSquare, ArrowUp, Gift, Zap } from "lucide-react"

interface CreditTransactionProps {
  transaction: {
    id: number
    type: string
    amount: number
    description: string
    relatedPost?: string | null
    timestamp: string
    balance: number
  }
  showBalance?: boolean
}

const transactionConfig = {
  HELPFUL_REWARD: {
    label: "Helpful Answer",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    badgeColor: "bg-green-100 text-green-800",
  },
  POST_COST: {
    label: "Post Created",
    icon: MessageSquare,
    color: "text-red-600",
    bgColor: "bg-red-100",
    badgeColor: "bg-red-100 text-red-800",
  },
  UPVOTE_REWARD: {
    label: "Upvote Received",
    icon: ArrowUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  WELCOME_BONUS: {
    label: "Welcome Bonus",
    icon: Gift,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  ACHIEVEMENT_REWARD: {
    label: "Achievement",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
}

export function CreditTransaction({ transaction, showBalance = true }: CreditTransactionProps) {
  const config = transactionConfig[transaction.type as keyof typeof transactionConfig]
  const Icon = config?.icon || Zap

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config?.bgColor || "bg-gray-100"}`}>
          <Icon className={`w-4 h-4 ${config?.color || "text-gray-600"}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-foreground">{transaction.description}</p>
            {config && (
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
            )}
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
        <div className={`text-lg font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
          {transaction.amount > 0 ? "+" : ""}
          {transaction.amount}
        </div>
        {showBalance && <div className="text-xs text-muted">Balance: {transaction.balance}</div>}
      </div>
    </div>
  )
}
