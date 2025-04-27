'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  useDroppable,
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
import { TimeRange, PredefinedTimeRange, ReportData } from '@/lib/types';
import { DragDropInterface } from './DragDropInterface';
import { DraggableBlock } from './DraggableBlock';
import { fetchGscData } from '@/lib/api/gsc';

type MetricType = 'clicks' | 'impressions' | 'ctr' | 'position';

type AvailableBlock = ReportBlock;

export default function ReportBuilder() {
  const { selectedProperty, reportBlocks, addReportBlock, removeReportBlock } = useReportConfig();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last7days');
  const [usedMetrics, setUsedMetrics] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  // Fetch GSC data when property is selected
  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty) return;

      try {
        console.log('Fetching GSC data for property:', selectedProperty);
        const data = await fetchGscData(selectedProperty, selectedTimeRange);
        console.log('Received GSC data:', {
          property: selectedProperty,
          timeRange: selectedTimeRange,
          rowCount: data.length,
          sampleData: data.slice(0, 3) // Log first 3 rows as sample
        });
      } catch (error) {
        console.error('Error fetching GSC data:', error);
        toast({
          title: "Error fetching data",
          description: "Failed to fetch data from Google Search Console. Please try again.",
          variant: "destructive",
        });
      }
    }

    fetchData();
  }, [selectedProperty, selectedTimeRange]);

  // Update usedMetrics when reportBlocks change
  useEffect(() => {
    const newUsedMetrics = new Set<string>();
    reportBlocks.forEach((block: ReportBlock) => {
      if (block.type === 'metric') {
        newUsedMetrics.add(block.id);
      }
    });
    setUsedMetrics(newUsedMetrics);
  }, [reportBlocks]);

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
      metric: 'clicks',
      timeRange: 'last7days'
    },
    {
      id: 'impressions_l7d',
      type: 'metric',
      metric: 'impressions',
      timeRange: 'last7days'
    },
    {
      id: 'ctr_l7d',
      type: 'metric',
      metric: 'ctr',
      timeRange: 'last7days'
    },
    {
      id: 'position_l7d',
      type: 'metric',
      metric: 'position',
      timeRange: 'last7days'
    },
    // Last 28 days blocks
    {
      id: 'clicks_l28d',
      type: 'metric',
      metric: 'clicks',
      timeRange: 'last28days'
    },
    {
      id: 'impressions_l28d',
      type: 'metric',
      metric: 'impressions',
      timeRange: 'last28days'
    },
    {
      id: 'ctr_l28d',
      type: 'metric',
      metric: 'ctr',
      timeRange: 'last28days'
    },
    {
      id: 'position_l28d',
      type: 'metric',
      metric: 'position',
      timeRange: 'last28days'
    },
    // Last 3 months blocks
    {
      id: 'clicks_l3m',
      type: 'metric',
      metric: 'clicks',
      timeRange: 'last3months'
    },
    {
      id: 'impressions_l3m',
      type: 'metric',
      metric: 'impressions',
      timeRange: 'last3months'
    },
    {
      id: 'ctr_l3m',
      type: 'metric',
      metric: 'ctr',
      timeRange: 'last3months'
    },
    {
      id: 'position_l3m',
      type: 'metric',
      metric: 'position',
      timeRange: 'last3months'
    },
    // Intent block
    {
      id: 'intent',
      type: 'intent'
    }
  ];

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const activeBlock = availableBlocks.find(block => block.id === active.id);
      if (!activeBlock) return;

      // Check if we're dropping on a specific column
      if (typeof over.id === 'string' && over.id.startsWith('column-')) {
        const columnIndex = parseInt(over.id.split('-')[1], 10);

        // Create a new block with a unique ID to avoid conflicts
        const newBlock = {
          ...activeBlock,
          id: `${activeBlock.id}_${Date.now()}`
        };

        // Add the new block at the specific position
        addReportBlock(newBlock, columnIndex);
        return;
      }

      // For drops not on specific columns, just add the block
      addReportBlock(activeBlock);
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    removeReportBlock(metricId);
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
        metrics: { "clicks-last7days": 85, "impressions-last28days": 1200 },
        intent: { category: "Transactional", description: "Looking to purchase..." }
      }
    ];

    exportToCsv(mockData, "gsc-report.csv");
  };

  if (!selectedProperty) {
    return (
      <Alert>
        <AlertTitle>No property selected</AlertTitle>
        <AlertDescription>
          Please select a property from the sidebar to start building your report.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Report Builder</h2>
            <p className="text-muted-foreground">
              Build your report by adding metrics and analyzing search intent.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Available Metrics</h3>
            <MetricSelector
              usedMetrics={usedMetrics}
              onRemoveMetric={handleRemoveMetric}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Report Columns</h3>
            <DragDropInterface />
          </div>
        </div>

        {reportBlocks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                This is a preview of how your report will look. The actual data will be fetched when you export.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable onMetricDrop={() => { }} />
            </CardContent>
          </Card>
        )}
      </div>

      <DragOverlay>
        {activeId ? (
          <DraggableBlock
            id={activeId}
            name={(() => {
              const block = availableBlocks.find(block => block.id === activeId);
              if (!block) return 'Unknown Block';

              if (block.type === 'metric') {
                const timeRangeMap: Record<PredefinedTimeRange, string> = {
                  'last7days': '7d',
                  'last28days': '28d',
                  'last3months': '3m'
                };
                const timeRangeStr = typeof block.timeRange === 'string'
                  ? timeRangeMap[block.timeRange] || block.timeRange
                  : `${block.timeRange.startDate} to ${block.timeRange.endDate}`;
                return `${block.metric} (${timeRangeStr})`;
              }
              return 'Intent Analysis';
            })()}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
