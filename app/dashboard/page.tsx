'use client';

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { userId } = useAuth();

  // If not signed in, redirect to home page
  if (!userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 py-6 md:py-10">
        <DashboardShell>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">My Reports</h1>
            <SignedIn>
              <Link href="/report/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
          <div className="mt-8">
            <EmptyState
              title="No reports yet"
              description="Create your first report to get started"
              icon="chart"
              action={
                <SignedIn>
                  <Link href="/report/new">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Report
                    </Button>
                  </Link>
                </SignedIn>
              }
            />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}