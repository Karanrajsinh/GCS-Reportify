'use client';

import { useState, useEffect } from 'react';
import { Download, Plus, Trash2, X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  useDroppable,
  DragStartEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReportConfig, type ReportBlock } from '@/contexts/report-config-context';
import { ReportTable } from '@/components/report/report-table';
import { MetricSelector } from './metric-selector';
import { exportToCsv } from '@/lib/api/export';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { PredefinedTimeRange, Metric } from '@/lib/types';
import { DragDropInterface } from './DragDropInterface';
import { DraggableBlock } from './DraggableBlock';
import { fetchGscData } from '@/lib/api/gsc';
import { useParams, useRouter } from 'next/navigation';

type AvailableBlock = ReportBlock;

interface ReportTableProps {
  onMetricDrop: (metric: string) => void;
  reportBlocks?: ReportBlock[];
  selectedProperty?: string;
}

export default function ReportBuilder() {
  const { selectedProperty, reportBlocks, addReportBlock, removeReportBlock } = useReportConfig();
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const website = params.website as string;
  const reportId = params.reportId as string;

  // Fetch GSC data when property is selected
  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty) return;

      try {
        console.log('Fetching GSC data for property:', selectedProperty);
        // Use the first time range if available, otherwise use a default
        const timeRange = reportBlocks.length > 0 && reportBlocks[0].type === 'metric'
          ? (reportBlocks[0].timeRange as PredefinedTimeRange)
          : 'last7days';
        const data = await fetchGscData(selectedProperty, timeRange);
        console.log('Received GSC data:', {
          property: selectedProperty,
          timeRange,
          rowCount: data.length,
          sampleData: data.slice(0, 3) // Log first 3 rows as sample
        });
      } catch (error) {
        console.error('Error fetching GSC data:', error);
      }
    }

    fetchData();
  }, [selectedProperty, reportBlocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const availableBlocks: AvailableBlock[] = [
    // Last 7 days blocks
    {
      id: 'clicks_l7d',
      type: 'metric',
      metric: 'clicks' as Metric,
      timeRange: 'last7days'
    },
    {
      id: 'impressions_l7d',
      type: 'metric',
      metric: 'impressions' as Metric,
      timeRange: 'last7days'
    },
    {
      id: 'ctr_l7d',
      type: 'metric',
      metric: 'ctr' as Metric,
      timeRange: 'last7days'
    },
    {
      id: 'position_l7d',
      type: 'metric',
      metric: 'position' as Metric,
      timeRange: 'last7days'
    },
    // Last 28 days blocks
    {
      id: 'clicks_l28d',
      type: 'metric',
      metric: 'clicks' as Metric,
      timeRange: 'last28days'
    },
    {
      id: 'impressions_l28d',
      type: 'metric',
      metric: 'impressions' as Metric,
      timeRange: 'last28days'
    },
    {
      id: 'ctr_l28d',
      type: 'metric',
      metric: 'ctr' as Metric,
      timeRange: 'last28days'
    },
    {
      id: 'position_l28d',
      type: 'metric',
      metric: 'position' as Metric,
      timeRange: 'last28days'
    },
    // Last 3 months blocks
    {
      id: 'clicks_l3m',
      type: 'metric',
      metric: 'clicks' as Metric,
      timeRange: 'last3months'
    },
    {
      id: 'impressions_l3m',
      type: 'metric',
      metric: 'impressions' as Metric,
      timeRange: 'last3months'
    },
    {
      id: 'ctr_l3m',
      type: 'metric',
      metric: 'ctr' as Metric,
      timeRange: 'last3months'
    },
    {
      id: 'position_l3m',
      type: 'metric',
      metric: 'position' as Metric,
      timeRange: 'last3months'
    }
  ];

  // Group blocks by time range
  const groupedBlocks = availableBlocks.reduce((acc, block) => {
    if (block.type === 'metric' && 'timeRange' in block) {
      const timeRange = block.timeRange as string;
      if (!acc[timeRange]) {
        acc[timeRange] = [];
      }
      acc[timeRange].push(block);
    }
    return acc;
  }, {} as Record<string, ReportBlock[]>);

  // Format time range labels
  const timeRangeLabels: Record<string, string> = {
    'last7days': 'Last 7 Days',
    'last28days': 'Last 28 Days',
    'last3months': 'Last 3 Months'
  };

  // Format metric labels
  const metricLabels: Record<string, string> = {
    'clicks': 'Clicks',
    'impressions': 'Impressions',
    'ctr': 'CTR',
    'position': 'Position'
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active && active.id) {
      setActiveId(active.id as string);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const blockId = event.dataTransfer.getData('text/plain');
    if (!blockId) return;

    const block = availableBlocks.find(b => b.id === blockId);
    if (block) {
      // Create a new block with a unique ID to avoid conflicts
      const newBlock = {
        ...block,
        id: `${block.id}_${Date.now()}`
      };
      addReportBlock(newBlock);
    }
  };

  const handleMetricDrop = (metric: string) => {
    // Handle metric drop logic
  };

  const handleRemoveBlock = (blockId: string) => {
    removeReportBlock(blockId);
  };

  const handleClearAll = () => {
    // Clear all blocks from the context
    reportBlocks.forEach(block => {
      removeReportBlock(block.id);
    });
  };

  const handleExport = () => {
    if (reportBlocks.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please add at least one metric to your report before exporting.",
        variant: "destructive",
      });
      return;
    }

    // Get the data from the ReportTable component
    const tableData = document.querySelector('table')?.querySelectorAll('tbody tr');
    if (!tableData || tableData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please fetch data before exporting.",
        variant: "destructive",
      });
      return;
    }

    // Convert table data to CSV format
    const headers = ['Query', ...reportBlocks.map(block =>
      block.type === 'metric'
        ? `${block.metric} (${typeof block.timeRange === 'string' ? block.timeRange : 'Custom Range'})`
        : 'Intent Analysis'
    )];

    const rows = Array.from(tableData).map(row => {
      const cells = row.querySelectorAll('td');
      return Array.from(cells).map(cell => cell.textContent || '');
    });

    // Combine headers and rows
    const csvData = [headers, ...rows] as string[][];

    // Create a filename with the current date
    const filename = `gsc-report-${selectedProperty}-${new Date().toISOString().split('T')[0]}.csv`;

    // Use the browser's built-in download functionality
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Your report has been exported to CSV.",
    });
  };

  const handleSaveReport = () => {
    // In a real app, this would save the report to a database
    toast({
      title: "Report saved",
      description: "Your report has been saved successfully.",
    });

    // Navigate back to the reports page
    router.push(`/website/${website}/reports`);
  };

  if (!selectedProperty) {
    return (
      <Alert>
        <AlertTitle>No property selected</AlertTitle>
        <AlertDescription>
          Please select a Google Search Console property to continue.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Report Builder</h2>
              <p className="text-sm text-muted-foreground">
                Drag and drop metrics to build your report
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={reportBlocks.length === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={handleExport}
                disabled={reportBlocks.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            {Object.entries(groupedBlocks).map(([timeRange, blocks]) => (
              <div key={timeRange} className="space-y-3">
                <h3 className="text-lg font-medium text-muted-foreground">
                  {timeRangeLabels[timeRange]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', block.id);
                        handleDragStart(e as unknown as DragStartEvent);
                      }}
                      className="p-4 border rounded-lg cursor-move hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">
                            {block.type === 'metric' && 'metric' in block
                              ? metricLabels[block.metric]
                              : ''}
                          </h3>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div
        className="min-h-[200px] p-6 border-2 border-dashed rounded-lg"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Selected Metrics</h3>
              <p className="text-sm text-muted-foreground">
                {reportBlocks.length === 0
                  ? "Drag metrics here to build your report"
                  : `${reportBlocks.length} metric${reportBlocks.length === 1 ? "" : "s"} selected`}
              </p>
            </div>
            {reportBlocks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportBlocks.map((block) => (
              <div
                key={block.id}
                className="p-4 border rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">
                      {block.type === 'metric' && 'metric' in block && 'timeRange' in block
                        ? `${metricLabels[block.metric]} (${timeRangeLabels[block.timeRange as string] || 'Custom Range'})`
                        : ''}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBlock(block.id)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReportTable
        onMetricDrop={handleMetricDrop}
      />

      <DragOverlay>
        {activeId ? (
          <DraggableBlock
            id={activeId}
            name={(() => {
              const block = availableBlocks.find(block => block.id === activeId);
              if (!block) return 'Unknown Block';

              if (block.type === 'metric') {
                const timeRangeStr = typeof block.timeRange === 'string'
                  ? block.timeRange
                  : `${block.timeRange.startDate} to ${block.timeRange.endDate}`;
                return `${block.metric} (${timeRangeStr})`;
              }
              return 'Intent Analysis';
            })()}
          />
        ) : null}
      </DragOverlay>
    </div>
  );
}
