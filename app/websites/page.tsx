'use client';

import { DashboardHeader } from "@/app/components/dashboard/dashboard-header";
import { DashboardShell } from "@/app/components/dashboard/dashboard-shell";
import { useQuery } from '@tanstack/react-query';
import { fetchGscProperties } from '@/lib/api/gsc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WebsitesPage() {
    const router = useRouter();
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

    const { data: properties, isLoading, error } = useQuery({
        queryKey: ['gscProperties'],
        queryFn: fetchGscProperties,
    });

    // If not signed in, redirect to home page

    const handleContinue = () => {
        if (selectedProperty) {
            // Navigate to the reports page for the selected website
            router.push(`/website/${encodeURIComponent(selectedProperty)}/reports`);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader />
            <div className="container mx-auto flex-1 py-6 md:py-10 px-4 md:px-6 max-w-7xl">
                <DashboardShell>
                    <div className="space-y-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold tracking-tight">Select Website</h1>
                            <p className="text-muted-foreground mt-2">
                                Choose the Google Search Console property you want to analyze
                            </p>
                        </div>

                        <div className="mt-8 max-w-2xl mx-auto">
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle>Google Search Console Properties</CardTitle>
                                    <CardDescription>
                                        Select a property to view or create reports
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2 py-8">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            <p className="text-muted-foreground">Loading properties...</p>
                                        </div>
                                    ) : error ? (
                                        <Alert variant="destructive" className="my-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>
                                                Failed to load Google Search Console properties. Please try refreshing the page.
                                            </AlertDescription>
                                        </Alert>
                                    ) : properties && properties.length > 0 ? (
                                        <div className="space-y-6 py-4">
                                            <Select
                                                value={selectedProperty || undefined}
                                                onValueChange={setSelectedProperty}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a property" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {properties.map((property) => (
                                                        <SelectItem key={property.siteUrl} value={property.siteUrl}>
                                                            {property.siteUrl}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="flex justify-center md:justify-start">
                                                <Button
                                                    onClick={handleContinue}
                                                    disabled={!selectedProperty}
                                                    className="w-full md:w-auto"
                                                >
                                                    Continue
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Alert className="my-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>No properties found</AlertTitle>
                                            <AlertDescription>
                                                You don&apos;t have any Google Search Console properties. Please add a property to your Google Search Console account.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </DashboardShell>
            </div>
        </div>
    );
} 