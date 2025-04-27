'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportBlock, useReportConfig } from '@/contexts/report-config-context';
import { TimeRange } from '@/lib/types';

interface MetricSelectorProps {
  onClose: () => void;
}

export function MetricSelector({ onClose }: MetricSelectorProps) {
  const { addReportBlock } = useReportConfig();
  const [selectedMetric, setSelectedMetric] = useState<string>('clicks');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last7days');

  const handleAddMetric = () => {
    const newBlock: ReportBlock = {
      id: '2',
      type: 'metric',
      metric: selectedMetric as any,
      timeRange: selectedTimeRange,
    };

    addReportBlock(newBlock);
    onClose();
  };

  const handleAddIntent = () => {
    const newBlock: ReportBlock = {
      id: '2',
      type: 'intent',
    };

    addReportBlock(newBlock);
    onClose();
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add to Report</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="intent">Intent Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div>
              <Label htmlFor="metric">Select Metric</Label>
              <RadioGroup
                id="metric"
                value={selectedMetric}
                onValueChange={setSelectedMetric}
                className="grid grid-cols-2 gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clicks" id="metric-clicks" />
                  <Label htmlFor="metric-clicks">Clicks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="impressions" id="metric-impressions" />
                  <Label htmlFor="metric-impressions">Impressions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ctr" id="metric-ctr" />
                  <Label htmlFor="metric-ctr">CTR</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="position" id="metric-position" />
                  <Label htmlFor="metric-position">Position</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="timerange">Time Range</Label>
              <RadioGroup
                id="timerange"
                value={selectedTimeRange as string}
                onValueChange={(value) => setSelectedTimeRange(value as TimeRange)}
                className="grid grid-cols-1 gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="last7days" id="timerange-7days" />
                  <Label htmlFor="timerange-7days">Last 7 Days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="last28days" id="timerange-28days" />
                  <Label htmlFor="timerange-28days">Last 28 Days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="last3months" id="timerange-3months" />
                  <Label htmlFor="timerange-3months">Last 3 Months</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="intent">
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm">
                Add AI-powered intent analysis to your report. This will analyze each search query to determine user intent and categorize it appropriately.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {selectedMetric && selectedTimeRange ? (
          <Button onClick={handleAddMetric}>Add Metric</Button>
        ) : (
          <Button onClick={handleAddIntent}>Add Intent Analysis</Button>
        )}
      </CardFooter>
    </Card>
  );
}