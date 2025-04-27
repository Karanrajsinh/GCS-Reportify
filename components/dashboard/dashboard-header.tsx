'use client';

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart3 } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <span className="text-lg font-bold">GSC Reportify</span>
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}