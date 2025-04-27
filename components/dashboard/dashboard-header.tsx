'use client';

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart3, Home, FileText } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const pathname = usePathname();
  const params = useParams();
  const website = params.website as string;

  // Determine if we're on a website-specific page
  const isWebsitePage = pathname?.includes('/website/');

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
        <div className="flex items-center space-x-4">
          <Link href="/websites" className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">GSC Reportify</span>
          </Link>

          {isWebsitePage && (
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
                <Link href="/websites">
                  <Home className="h-4 w-4 mr-1" />
                  Websites
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
                <Link href={`/website/${website}/reports`}>
                  <FileText className="h-4 w-4 mr-1" />
                  Reports
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}