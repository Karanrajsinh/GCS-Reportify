'use client';

import { useState } from 'react';
import { PlusCircle, Trash2, MoveHorizontal, Download } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
} from '@dnd-kit/core';
import { useDndSensors } from '@/hooks/use-dnd-sensors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useReportConfig } from '@/contexts/report-config-context';
import { ReportTable } from '@/components/report/report-table';
import { MetricSelector } from '@/components/report/metric-selector';
import { exportToCsv } from '@/lib/api/export';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { ReportBlock } from '@/contexts/report-config-context';
import { TimeRange } from '@/lib/types';
export default function ReportBuilder() {
  const { selectedProperty, reportBlocks, addReportBlock } = useReportConfig();
  const [showMetricSelector, setShowMetricSelector] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last7days');
  const sensors = useDndSensors();

  const handleMetricDrop = (metric: string) => {
    const newBlock: ReportBlock = {
      id: `123456`,
      type: 'metric',
      metric: metric as any,
      timeRange: selectedTimeRange,
    };

    addReportBlock(newBlock);
  };

  const handleExport = () => {
    if (reportBlocks.length === 0) {
      toast({
        title: "No data to export",
        description: "Add at least one metric to your report before exporting.",
        variant: "destructive",
      });
      return;
    }

    // This is a placeholder - in a real app, we would fetch and transform the actual data
    const mockData = [
      {
        query: "example query 1",
        metrics: { "clicks-last7days": 120, "impressions-last28days": 1500 },
        intent: { category: "Informational", description: "Looking for information about..." }
      },
      {
        query: "example query 2",
        metrics: { "clicks-last7days": 85, "impressions-last28days": 950 },
        intent: { category: "Transactional", description: "Intending to purchase..." }
      }
    ];

    exportToCsv(mockData, `gsc-report-${new Date().toISOString().slice(0, 10)}.csv`);

    toast({
      title: "Report exported",
      description: "Your report has been exported to CSV successfully.",
    });
  };

  if (!selectedProperty) {
    return (
      <Alert>
        <AlertTitle>Select a property</AlertTitle>
        <AlertDescription>
          Please select a Google Search Console property before building your report.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <DndContext sensors={sensors}>
      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
          <CardDescription>
            Drag and drop metrics to create your custom report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetricSelector(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Metric
            </Button>

            {reportBlocks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            )}
          </div>

          {showMetricSelector && (
            <MetricSelector onClose={() => setShowMetricSelector(false)} />
          )}

          <div className="min-h-60 mt-4">
            {reportBlocks.length > 0 ? (
              <ReportTable onMetricDrop={handleMetricDrop} />
            ) : (
              <div className="flex flex-col items-center justify-center h-60 border border-dashed rounded-md">
                <MoveHorizontal className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Add metrics to your report</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DndContext>
  );
}
