'use client';

import { DashboardHeader } from "@/app/components/dashboard/dashboard-header";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ReportBuilder from "@/app/components/report/report-builder";
import { useReportConfig } from "@/contexts/report-config-context";
import { useEffect, useState } from "react";
import { MetricsSidebar } from "@/app/components/report/metrics-sidebar";
import { toast } from "sonner";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function ReportPage() {
    const router = useRouter();
    const params = useParams();
    const website = params.website as string;
    const reportId = params.reportId as string;
    const decodedWebsite = decodeURIComponent(website);
    const { setSelectedProperty, addReportBlock } = useReportConfig();
    const [isLoading, setIsLoading] = useState(true);

    // Fetch report data on mount
    useEffect(() => {
        async function fetchReportData() {
            try {
                const response = await fetch(`/api/reports/${reportId}`);
                if (!response.ok) throw new Error('Failed to fetch report');

                const data = await response.json();

                // Set the selected property
                setSelectedProperty(decodedWebsite);

                // Add blocks to report config
                if (data.blocks) {
                    data.blocks.forEach((block: any, index: number) => {
                        // Create a new block with the same data but ensuring unique ID
                        const newBlock = {
                            ...block,
                            id: `${block.id}_${Date.now()}_${index}`, // Ensure unique ID
                        };
                        addReportBlock(newBlock, index);
                    });
                }

            } catch (error) {
                console.error('Error fetching report:', error);
                toast.error('Failed to load report');
            } finally {
                setIsLoading(false);
            }
        }

        fetchReportData();
    }, [reportId, decodedWebsite, setSelectedProperty, addReportBlock]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-screen flex-col">
                <DashboardHeader />
                <div className="flex">
                    <div className="w-80 max-h-[calc(100vh-4.5rem)]">
                        <MetricsSidebar />
                    </div>
                    <div className="flex-1 p-6 md:p-10">
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-[60vh] w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
