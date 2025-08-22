import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Trophy, ArrowRight, Star, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-serif font-bold text-foreground">Inspira</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#how-it-works" className="text-muted hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="#features" className="text-muted hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#community" className="text-muted hover:text-foreground transition-colors">
              Community
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            <Star className="w-4 h-4 mr-2" />
            Join 10,000+ Knowledge Sharers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            Share Knowledge,
            <span className="text-primary"> Earn Credits</span>
          </h1>
          <p className="text-xl text-muted mb-8 leading-relaxed">
            A modern community platform where your expertise matters. Ask questions, share insights, and build your
            reputation through our innovative credits-based economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/sign-up">
                Start Sharing <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/feed">Explore Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-serif font-bold text-primary">25,000+</div>
              <div className="text-muted">Questions Answered</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-serif font-bold text-primary">10,000+</div>
              <div className="text-muted">Active Members</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-serif font-bold text-primary">500K+</div>
              <div className="text-muted">Credits Earned</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">How Inspira Works</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Three simple steps to start building your knowledge-sharing reputation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-serif">Ask & Share</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Post questions or share your expertise. Every post costs 5 credits, encouraging quality content.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-serif">Engage & Help</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Comment on posts, provide helpful answers, and engage with the community through upvotes and
                  discussions.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-serif">Earn & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get rewarded with credits when your answers are marked as helpful. Build reputation and climb the
                  leaderboards.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Popular Categories</h2>
            <p className="text-xl text-muted">Explore knowledge across diverse topics</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Coding", count: "5.2k posts", color: "bg-blue-500" },
              { name: "Design", count: "3.1k posts", color: "bg-purple-500" },
              { name: "Business", count: "2.8k posts", color: "bg-green-500" },
              { name: "Writing", count: "1.9k posts", color: "bg-orange-500" },
              { name: "Marketing", count: "1.5k posts", color: "bg-pink-500" },
              { name: "Technology", count: "4.3k posts", color: "bg-indigo-500" },
              { name: "Career", count: "2.1k posts", color: "bg-teal-500" },
              { name: "Freelancing", count: "1.2k posts", color: "bg-red-500" },
            ].map((category) => (
              <Card key={category.name} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  <div>
                    <div className="font-medium text-foreground">{category.name}</div>
                    <div className="text-sm text-muted">{category.count}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-2xl font-serif font-bold text-foreground">Trusted by Knowledge Seekers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted mb-4">
                  "Inspira transformed how I share knowledge. The credit system ensures quality discussions and I've
                  learned so much from the community."
                </p>
                <div className="text-sm font-medium text-foreground">Sarah Chen, Software Engineer</div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted mb-4">
                  "The real-time chat feature makes collaboration seamless. I've built lasting professional
                  relationships through this platform."
                </p>
                <div className="text-sm font-medium text-foreground">Marcus Rodriguez, Designer</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
            Ready to Share Your Knowledge?
          </h2>
          <p className="text-xl text-muted mb-8">
            Join thousands of professionals building their reputation through knowledge sharing
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/sign-up">
              Create Your Account <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-serif font-bold text-foreground">Inspira</span>
              </div>
              <p className="text-muted text-sm">Empowering knowledge sharing through community and credits.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/feed" className="hover:text-foreground transition-colors">
                    Browse Posts
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-foreground transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-foreground transition-colors">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/guidelines" className="hover:text-foreground transition-colors">
                    Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted">
            <p>&copy; 2024 Inspira. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
