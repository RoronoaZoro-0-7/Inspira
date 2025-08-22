import { SignIn } from "@clerk/nextjs"
import { Zap, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
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
          <p className="text-muted">Welcome back to the knowledge community</p>
        </div>

        <div className="flex justify-center">
          <SignIn
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
          <p>Trusted by 10,000+ knowledge sharers worldwide</p>
        </div>
      </div>
    </div>
  )
}
