'use client';

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define the Report interface
interface Report {
    id: string;
    name: string;
    createdAt: string;
}

export default function WebsiteReportsPage() {
    const { userId } = useAuth();
    const router = useRouter();
    const params = useParams();
    const website = params.website as string;
    const decodedWebsite = decodeURIComponent(website);

    // If not signed in, redirect to home page
    if (!userId) {
        redirect("/");
    }

    // Mock data for reports - in a real app, this would come from an API
    const reports: Report[] = [];

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
                                onClick={() => router.push('/websites')}
                                className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Websites
                            </Button>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Reports for {decodedWebsite}</h1>
                                <p className="text-muted-foreground mt-2">
                                    View and manage your reports for this website
                                </p>
                            </div>
                            <Link href={`/website/${website}/report/new`}>
                                <Button className="w-full md:w-auto">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Report
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-8">
                            {reports.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {reports.map((report) => (
                                        <Card key={report.id} className="shadow-sm hover:shadow-md transition-shadow">
                                            <CardHeader>
                                                <CardTitle>{report.name}</CardTitle>
                                                <CardDescription>
                                                    Created on {new Date(report.createdAt).toLocaleDateString()}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-end">
                                                    <Link href={`/website/${website}/report/${report.id}`}>
                                                        <Button variant="outline">View Report</Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No reports yet"
                                    description="Create your first report to get started"
                                    icon="chart"
                                    action={
                                        <Link href={`/website/${website}/report/new`}>
                                            <Button>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                New Report
                                            </Button>
                                        </Link>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </DashboardShell>
            </div>
        </div>
    );
} 