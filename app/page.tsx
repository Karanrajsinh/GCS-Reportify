import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronRight, BarChart3, Database, LineChart, Share2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>GSC Reportify</span>
          </div>
          <nav className="hidden md:flex gap-6 ml-auto">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
          <div className="ml-auto md:ml-0">
            <SignedOut>
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl/none">
                    Build Custom GSC Reports Effortlessly
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Create customized reports from your Google Search Console data with our intuitive
                    drag-and-drop interface, enhanced with AI-powered intent analysis.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="lg" className="group">
                        Get Started
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button size="lg" className="group">
                        Go to Dashboard
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative rounded-lg border bg-background shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                <div className="relative p-6">
                  <div className="w-full h-[300px] bg-card/40 rounded-lg border border-border/40 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-10 w-10" />
                      <p>Interactive Report Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need to build powerful GSC reports
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform streamlines the process of creating comprehensive Google Search Console reports,
                  saving you time and providing deeper insights.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>GSC Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly connect to your Google Search Console data through secure OAuth authentication.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Custom Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop metrics like Clicks, Impressions, CTR, and Position with flexible time ranges.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Export your reports to CSV format with a single click for further analysis and sharing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:flex-row md:gap-8 md:px-6">
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="font-medium">GSC Reportify</span>
          </div>
          <p className="text-center text-xs text-muted-foreground md:text-sm">
            © 2025 GSC Reportify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}