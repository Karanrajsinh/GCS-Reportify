'use client';

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ReportBuilder from "@/components/report/report-builder";
import { useReportConfig } from "@/contexts/report-config-context";
import { useEffect } from "react";

export default function NewReportPage() {
    const { userId } = useAuth();
    const router = useRouter();
    const params = useParams();
    const website = params.website as string;
    const decodedWebsite = decodeURIComponent(website);
    const { setSelectedProperty } = useReportConfig();

    // If not signed in, redirect to home page
    if (!userId) {
        redirect("/");
    }

    // Set the selected property based on the website parameter
    useEffect(() => {
        setSelectedProperty(decodedWebsite);
    }, [decodedWebsite, setSelectedProperty]);

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader />
            <div className="container mx-auto flex-1 py-6 md:py-10 px-4 md:px-6 max-w-7xl">
                <DashboardShell>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/website/${website}/reports`)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </Button>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create New Report</h1>
                            <p className="text-muted-foreground mt-2">
                                Configure your custom Google Search Console report for {decodedWebsite}
                            </p>
                        </div>

                        <div className="mt-8 space-y-6">
                            <ReportBuilder />
                        </div>
                    </div>
                </DashboardShell>
            </div>
        </div>
    );
} 