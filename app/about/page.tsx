import { Card, CardContent } from "@/components/ui/card"
import { FountainLogo } from "@/components/fountain-logo"
import { Info, Sparkles, Shield, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="container px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Info className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">About FountainHome</h1>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <FountainLogo className="w-32 h-32" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">Your Gateway to Unlimited Entertainment</h2>
              <p className="text-muted-foreground text-center leading-relaxed">
                FountainHome is a modern streaming platform that brings together the best content from around the world.
                With our cyber fountain theme and cutting-edge technology, we provide a seamless viewing experience
                across all your devices.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Vast Library</h3>
                <p className="text-sm text-muted-foreground">
                  Access thousands of movies and TV shows from multiple genres
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Multiple Servers</h3>
                <p className="text-sm text-muted-foreground">
                  Switch between servers for the best streaming experience
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Safe & Secure</h3>
                <p className="text-sm text-muted-foreground">Your privacy and security are our top priorities</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Features</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Continue watching from where you left off</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Rate and comment on your favorite content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Personalized recommendations based on your viewing history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Multiple streaming sources for reliability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Beautiful cyber fountain themed interface</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Light and dark mode support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
