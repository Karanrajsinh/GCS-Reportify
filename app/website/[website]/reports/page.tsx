'use client';

import { DashboardHeader } from "@/app/components/dashboard/dashboard-header";
import { DashboardShell } from "@/app/components/dashboard/dashboard-shell";
import { EmptyState } from "@/app/components/dashboard/empty-state";
import { Button } from "@/app/components/ui/button";
import { PlusCircle, ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/app/components/ui/dialog";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/app/components/ui/context-menu";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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

export default function WebsiteReportsPage() {
    const router = useRouter();
    const params = useParams();
    const website = params.website as string;
    const decodedWebsite = decodeURIComponent(website);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newReportName, setNewReportName] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [editedName, setEditedName] = useState('');

    const { data: properties, isLoading: isPropertiesLoading, error: propertiesError } = useQuery<GscProperty[]>({ // Fetch GSC properties
        queryKey: ['gscProperties'],
        queryFn: fetchGscProperties,
    });

    const [isValidWebsite, setIsValidWebsite] = useState(false);

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

    async function fetchReports() {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/reports?website=${encodeURIComponent(decodedWebsite)}`);

            if (!response.ok) {
                throw new Error("Failed to fetch reports");
            }

            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Failed to fetch reports");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (isValidWebsite) {
            fetchReports();
        }
    }, [decodedWebsite, isValidWebsite]);

    const handleCreateReport = async () => {
        if (!newReportName.trim()) {
            toast.error("Please enter a report name");
            return;
        }

        try {
            setIsCreating(true);
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newReportName,
                    websiteUrl: decodedWebsite,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create report");
            }

            await fetchReports();
            setCreateDialogOpen(false);
            setNewReportName('');
            toast.success("Report created successfully");
        } catch (error) {
            console.error("Error creating report:", error);
            toast.error("Failed to create report");
        } finally {
            setIsCreating(false);
        }
    };

    const handleRenameReport = async () => {
        if (!selectedReport || !editedName.trim()) return;

        try {
            const response = await fetch(`/api/reports/${selectedReport.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editedName }),
            });

            if (!response.ok) {
                throw new Error('Failed to rename report');
            }

            await fetchReports();
            setRenameDialogOpen(false);
            toast.success('Report renamed successfully');
        } catch (error) {
            console.error('Error renaming report:', error);
            toast.error('Failed to rename report');
        }
    };

    const handleDeleteReport = async () => {
        if (!selectedReport) return;
        try {
            const response = await fetch(`/api/reports/${selectedReport.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete report');
            }

            await fetchReports();
            toast.success('Report deleted successfully');
        } catch (error) {
            console.error('Error deleting report:', error);
            toast.error('Failed to delete report');
        }
    };

    // Loading state
    if (isPropertiesLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (propertiesError) {
        return (
            <Alert variant="destructive" className="my-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load Google Search Console properties. Please try refreshing the page.
                </AlertDescription>
            </Alert>
        );
    }

    if (!isValidWebsite) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader />
            <div className="container mx-auto flex-1 px-4 md:px-6 max-w-7xl">
                <DashboardShell className="py-6 md:py-10">
                    <div className="space-y-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/websites')}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary -ml-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Websites
                        </Button>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border/40 pb-6">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-semibold text-foreground">GSC Reports</h1>
                                <p className="text-base text-muted-foreground">{decodedWebsite}</p>
                            </div>
                            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="h-9">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        New Report
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Report</DialogTitle>
                                        <DialogDescription>
                                            Enter a name for your new report.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Report Name</Label>
                                            <Input
                                                id="name"
                                                value={newReportName}
                                                onChange={(e) => setNewReportName(e.target.value)}
                                                placeholder="Enter report name..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={handleCreateReport}
                                            disabled={isCreating || !newReportName.trim()}
                                        >
                                            {isCreating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Report'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="mt-6">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : reports.length > 0 ? (
                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {reports.map((report) => (
                                        <ContextMenu key={report.id}>
                                            <ContextMenuTrigger>
                                                <Card
                                                    onClick={() => router.push(`/website/${encodeURIComponent(report.property)}/report/${report.id}`)}
                                                    className="group relative overflow-hidden hover:border-primary/30 transition-all hover:shadow-md min-h-[140px]"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.075] to-transparent opacity-100" />
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                                    <CardHeader className="px-6 py-6 space-y-3 relative">
                                                        <CardTitle className="text-base font-medium text-foreground/90 group-hover:text-primary">
                                                            {report.name}
                                                        </CardTitle>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </CardHeader>
                                                </Card>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent>
                                                <ContextMenuItem
                                                    onClick={() => {
                                                        setSelectedReport(report);
                                                        setEditedName(report.name);
                                                        setRenameDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Rename
                                                </ContextMenuItem>
                                                <ContextMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteReport()}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </ContextMenuItem>
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No reports yet"
                                    description="Create your first report to get started"
                                    icon="chart"
                                    action={
                                        <Button onClick={() => setCreateDialogOpen(true)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            New Report
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </DashboardShell>
            </div>

            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Report</DialogTitle>
                        <DialogDescription>
                            Enter a new name for your report.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editName">Report Name</Label>
                            <Input
                                id="editName"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="Enter new name..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleRenameReport} disabled={!editedName.trim()}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
