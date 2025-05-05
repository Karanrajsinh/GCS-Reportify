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
import { useQuery } from '@tanstack/react-query';
import { fetchGscProperties } from '@/lib/api/gsc'; // Import fetchGscProperties
import { Alert, AlertTitle, AlertDescription } from "@/app/components/ui/alert"; // Import Alert components

interface Report {
    id: string;
    name: string;
    property: string;
    createdAt: string;
}

interface GscProperty {
    siteUrl: string;
}

export default function ReportPage() {
    const router = useRouter();
    const params = useParams();
    const website = params.website as string;
    const reportId = params.reportId as string;
    const decodedWebsite = decodeURIComponent(website);
    const { setSelectedProperty, addReportBlock, clearReportBlocks } = useReportConfig();
    const [isLoading, setIsLoading] = useState(true);

    const { data: properties, isLoading: isPropertiesLoading, error: propertiesError } = useQuery<GscProperty[]>({ // Fetch GSC properties
        queryKey: ['gscProperties'],
        queryFn: fetchGscProperties,
    });

    const [isValidWebsite, setIsValidWebsite] = useState(false);
    const [reportData, setReportData] = useState<Report | null>(null);

    useEffect(() => {
        if (properties && !isPropertiesLoading && !propertiesError) {
            const isValid = properties.some(property => property.siteUrl === decodedWebsite);
            setIsValidWebsite(isValid);
            if (!isValid) {
                toast.error("Invalid website URL, select a website again");
                router.push('/websites');
            }
        }
    }, [properties, decodedWebsite, router]);

    useEffect(() => {
        async function fetchReportData() {
            try {
                if (!isValidWebsite) return;

                // Clear existing blocks before loading new ones
                clearReportBlocks();

                const response = await fetch(`/api/reports/${reportId}`);
                if (!response.ok) {
                    toast.error("Invalid report");
                    router.push(`/website/${website}/reports`);
                    return;
                }

                const data = await response.json();
                setReportData(data);

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
                toast.error("Invalid report");
                router.push(`/website/${website}/reports`);
            } finally {
                setIsLoading(false);
            }
        }

        if (isValidWebsite) {
            fetchReportData();
        }
    }, [reportId, decodedWebsite, setSelectedProperty, addReportBlock, clearReportBlocks, isValidWebsite, router, website]);

    // Loading state
    if (isLoading || isPropertiesLoading) {
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

    if (propertiesError) {
        return (
            <div className="flex h-screen flex-col">
                <DashboardHeader />
                <div className="flex">
                    <div className="w-80 max-h-[calc(100vh-4.5rem)]">
                        <MetricsSidebar />
                    </div>
                    <div className="flex-1 p-6 md:p-10">
                        <Alert variant="destructive" className="my-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                Failed to load Google Search Console properties. Please try refreshing the page.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        );
    }

    if (!isValidWebsite) {
        return null;
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
