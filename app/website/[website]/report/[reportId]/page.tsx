'use client';

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ReportBuilder from "@/components/report/report-builder";
import { useReportConfig } from "@/contexts/report-config-context";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define the Report interface
interface Report {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export default function ReportPage() {
    const { userId } = useAuth();
    const router = useRouter();
    const params = useParams();
    const website = params.website as string;
    const reportId = params.reportId as string;
    const decodedWebsite = decodeURIComponent(website);
    const { setSelectedProperty } = useReportConfig();
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // If not signed in, redirect to home page
    if (!userId) {
        redirect("/");
    }

    // Set the selected property based on the website parameter
    useEffect(() => {
        setSelectedProperty(decodedWebsite);
    }, [decodedWebsite, setSelectedProperty]);

    // Fetch report data
    useEffect(() => {
        const fetchReport = async () => {
            try {
                setIsLoading(true);
                // In a real app, this would be an API call
                // const response = await fetch(`/api/reports/${reportId}`);
                // const data = await response.json();

                // Mock data for now
                const mockReport: Report = {
                    id: reportId,
                    name: "Sample Report",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                setReport(mockReport);
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <DashboardHeader />
                <div className="container flex-1 py-6 md:py-10">
                    <DashboardShell>
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    </DashboardShell>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex min-h-screen flex-col">
                <DashboardHeader />
                <div className="container flex-1 py-6 md:py-10">
                    <DashboardShell>
                        <Card>
                            <CardHeader>
                                <CardTitle>Report Not Found</CardTitle>
                                <CardDescription>
                                    The report you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => router.push(`/website/${website}/reports`)}>
                                    Back to Reports
                                </Button>
                            </CardContent>
                        </Card>
                    </DashboardShell>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader />
            <div className="container flex-1 py-6 md:py-10">
                <DashboardShell>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/website/${website}/reports`)}
                                className="flex items-center gap-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </Button>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{report.name}</h1>
                            <p className="text-muted-foreground">
                                Report for {decodedWebsite}
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
