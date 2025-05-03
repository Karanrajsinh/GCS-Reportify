'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchGscProperties } from '@/lib/api/gsc';
import { useReportConfig } from '@/contexts/report-config-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { useParams, useRouter } from 'next/navigation';

export default function PropertySelector() {
  const { selectedProperty, setSelectedProperty } = useReportConfig();
  const router = useRouter();
  const params = useParams();
  const website = params.website as string;

  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['gscProperties'],
    queryFn: fetchGscProperties,
  });

  // If we're on a website-specific page, we don't need to show the property selector
  if (website) {
    return null;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load Google Search Console properties. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select GSC Property</CardTitle>
        <CardDescription>
          Choose the Google Search Console property you want to analyze
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading properties...</p>
          </div>
        ) : properties && properties.length > 0 ? (
          <Select
            value={selectedProperty || undefined}
            onValueChange={setSelectedProperty}
          >
            <SelectTrigger className="w-full md:w-[450px]">
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
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No properties found</AlertTitle>
            <AlertDescription>
              No Google Search Console properties were found for your account. Make sure you have access to at least one property in Google Search Console.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}