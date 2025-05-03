'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ReportBlock, useReportConfig } from '@/contexts/report-config-context';
import { DraggableBlock } from './DraggableBlock';
import { formatTimeRange } from '@/lib/utils/date';
import { TimeRange, PredefinedTimeRange, Metric } from '@/lib/types';

interface AvailableBlock {
  id: string;
  name: string;
  metric?: Metric;
  timeRange?: PredefinedTimeRange;
  type?: 'intent';
}

// Define available metric blocks
const availableBlocks: AvailableBlock[] = [
  { id: 'clicks_l7d', name: 'Clicks', metric: 'clicks', timeRange: 'last7days' },
  { id: 'clicks_l28d', name: 'Clicks', metric: 'clicks', timeRange: 'last28days' },
  { id: 'clicks_l3m', name: 'Clicks', metric: 'clicks', timeRange: 'last3months' },
  { id: 'impressions_l7d', name: 'Impressions', metric: 'impressions', timeRange: 'last7days' },
  { id: 'impressions_l28d', name: 'Impressions', metric: 'impressions', timeRange: 'last28days' },
  { id: 'impressions_l3m', name: 'Impressions', metric: 'impressions', timeRange: 'last3months' },
  { id: 'ctr_l7d', name: 'CTR', metric: 'ctr', timeRange: 'last7days' },
  { id: 'ctr_l28d', name: 'CTR', metric: 'ctr', timeRange: 'last28days' },
  { id: 'ctr_l3m', name: 'CTR', metric: 'ctr', timeRange: 'last3months' },
  { id: 'position_l7d', name: 'Position', metric: 'position', timeRange: 'last7days' },
  { id: 'position_l28d', name: 'Position', metric: 'position', timeRange: 'last28days' },
  { id: 'position_l3m', name: 'Position', metric: 'position', timeRange: 'last3months' },
  { id: 'intent', name: 'Intent Analysis', type: 'intent' },
];

interface MetricSelectorProps {
  usedMetrics: Set<string>;
  onRemoveMetric: (metricId: string) => void;
}

export function MetricSelector({ usedMetrics, onRemoveMetric }: MetricSelectorProps) {
  const { reportBlocks } = useReportConfig();

  // Check if a block is used in the table
  const isBlockUsed = (blockId: string) => {
    return reportBlocks.some(block => block.id === blockId);
  };

  return (
    <div>
      <Tabs defaultValue="metrics">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="intent">Intent Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="flex w-full overflow-x-auto gap-2">
            {availableBlocks.filter(block => !block.type).map((block) => (
              <DraggableBlock
                key={block.id}
                id={block.id}
                name={`${block.name} (${formatTimeRange(block.timeRange!)})`}
                disabled={isBlockUsed(block.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intent">
          <div className="p-4 bg-muted/50 rounded-md">
            <p className="text-sm mb-4">
              Add AI-powered intent analysis to your report. This will analyze each search query to determine user intent and categorize it appropriately.
            </p>
            <DraggableBlock
              id="intent"
              name="Intent Analysis"
              disabled={isBlockUsed('intent')}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}