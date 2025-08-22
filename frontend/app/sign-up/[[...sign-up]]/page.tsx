import { SignUp } from "@clerk/nextjs"
import { Zap, ArrowLeft, Gift } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-muted hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Inspira</h1>
          </div>
          <p className="text-muted">Join the knowledge sharing community</p>
        </div>

        {/* Welcome bonus */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Welcome Bonus</div>
                <div className="text-sm text-muted">Get 50 credits to start sharing knowledge</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg border border-border",
                headerTitle: "font-serif text-foreground",
                headerSubtitle: "text-muted",
                socialButtonsBlockButton: "border-border hover:bg-accent",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
            redirectUrl="/feed"
          />
        </div>

        {/* Trust indicators */}
        <div className="mt-8 text-center text-sm text-muted">
          <p>Join 10,000+ professionals sharing knowledge</p>
        </div>
      </div>
    </div>
  )
}
