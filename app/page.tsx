import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronRight, BarChart3, Database, LineChart, Share2, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">GSC Reportify</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="font-medium">Sign in</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="font-medium">Get Started</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/websites">
                <Button className="font-medium">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none text-center lg:text-left">
                    Transform Your{" "}
                    <span className="text-primary">Search Console</span>{" "}
                    Data Into Actionable Insights
                  </h1>
                  <p className="max-w-[600px] text-lg text-muted-foreground text-center lg:text-left mx-auto lg:mx-0">
                    Create customized reports from your Google Search Console data with our intuitive
                    drag-and-drop interface, enhanced with AI-powered intent analysis.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="lg" className="group h-12 px-8">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/websites">
                      <Button size="lg" className="group h-12 px-8">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Free forever plan</span>
                  </div>
                </div>
              </div>
              <div className="relative mx-auto lg:mx-0 max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl" />
                <div className="relative rounded-2xl border bg-card/50 shadow-xl overflow-hidden backdrop-blur-sm">
                  <div className="p-8">
                    <div className="w-full h-[400px] bg-card/40 rounded-lg border border-border/40 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 text-primary/80" />
                        <p className="text-lg font-medium">Interactive Report Preview</p>
                        <p className="text-sm text-center max-w-[300px]">
                          Drag and drop metrics to create custom reports
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-2 max-w-3xl mx-auto">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Everything you need to build powerful GSC reports
                </h2>
                <p className="text-muted-foreground text-lg">
                  Our platform streamlines the process of creating comprehensive Google Search Console reports,
                  saving you time and providing deeper insights.
                </p>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>GSC Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Seamlessly connect to your Google Search Console data through secure OAuth authentication.
                  </p>
                </CardContent>
              </Card>
              <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Custom Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Drag and drop metrics like Clicks, Impressions, CTR, and Position with flexible time ranges.
                  </p>
                </CardContent>
              </Card>
              <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Export your reports to CSV format with a single click for further analysis and sharing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-semibold">GSC Reportify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your Google Search Console data into actionable insights with our powerful reporting platform.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold">Product</h3>
              <nav className="flex flex-col gap-2">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold">Legal</h3>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold">Contact</h3>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </nav>
            </div>
          </div>
          <div className="mt-12 border-t border-border/40 pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 GSC Reportify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}