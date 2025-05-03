'use client';

import { DashboardHeader } from "@/app/components/dashboard/dashboard-header";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ReportBuilder from "@/app/components/report/report-builder";
import { useReportConfig } from "@/contexts/report-config-context";
import { useEffect } from "react";
import { MetricsSidebar } from "@/app/components/report/metrics-sidebar";

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
        <div className="flex h-screen flex-col">
            <DashboardHeader />
            <div className="flex">
                {/* Sidebar */}
                <div className="w-80 max-h-[calc(100vh-4.5rem)]">
                    <MetricsSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
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

                        <div className="mt-8">
                            <ReportBuilder />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
