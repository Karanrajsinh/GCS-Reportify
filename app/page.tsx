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
              <ModeToggle />
              <SignedOut>
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
        <p className="text-center text-sm text-muted-foreground">
          © 2024 GSC Reportify. All rights reserved.
        </p>
      </footer>
    </div>
  );
}