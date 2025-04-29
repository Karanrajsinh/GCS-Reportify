import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { HeroSection, FeaturesSection } from "@/components/animated-sections";
import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href={'/'} className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">GSC Reportify</span>
          </Link>
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
            <ModeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="font-medium hover:scale-105 transition-transform">Sign in</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="font-medium hover:scale-105 transition-transform">Get Started</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/websites">
                <Button className="font-medium hover:scale-105 transition-transform">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-background to-secondary/20">
          <HeroSection />
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-muted/30">
          <FeaturesSection />
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