'use client';

import PropertySelector from "@/components/report/property-selector";
import ReportBuilder from "@/components/report/report-builder";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function NewReportPage() {
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
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Create New Report</h1>
            <p className="text-muted-foreground">
              Configure your custom Google Search Console report by selecting a property and adding the metrics you want to analyze.
            </p>
            
            <div className="mt-8 space-y-6">
              <PropertySelector />
              <ReportBuilder />
            </div>
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}