import { Button } from "@/app/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { HeroSection } from "@/app/components/animated-sections";
import { ModeToggle } from "@/app/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-3 md:py-4 md:px-6">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href={'/'} className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">GSC Reportify</span>
            </Link>
            <div className="flex items-center gap-3 md:hidden">
              <SignedOut>
                <ModeToggle />
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium bg-primary text-primary-foreground">
                    Login
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8",
                    },
                  }}
                />
              </SignedIn>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 mt-3 md:mt-0">
            <ModeToggle />
            <SignedOut>
              <Link href="/login">
                <Button variant="ghost" className="font-medium bg-primary text-primary-foreground">
                  Login
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/20">
          <HeroSection />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-semibold">GSC Reportify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your Google Search Console data into actionable insights with our powerful reporting platform.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold">Product</h3>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-3">
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
          <div className="mt-6 md:mt-8 border-t border-border/40 pt-4 md:pt-6">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 GSC Reportify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}