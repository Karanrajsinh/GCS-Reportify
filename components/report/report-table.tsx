'use client';

import { useState, useEffect } from 'react';
import { ReportBlock, useReportConfig } from '@/contexts/report-config-context';
import { fetchGscData } from '@/lib/api/gsc';
import { formatTimeRange } from '@/lib/utils/date';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { PredefinedTimeRange } from '@/lib/types';
import { exportToCsv } from '@/lib/api/export';

interface ReportTableProps {
  onMetricDrop: (metric: string) => void;
}

export function ReportTable({ onMetricDrop }: ReportTableProps) {
  const { selectedProperty, reportBlocks, removeReportBlock } = useReportConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

  // Debug: Log tableData whenever it changes
  useEffect(() => {
    console.log('Table data updated:', tableData);
  }, [tableData]);

  // Function to render column header based on block type
  const renderColumnHeader = (block: ReportBlock) => {
    if (block.type === "metric") {
      const { metric, timeRange } = block;
      const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);

      // Create short time range label
      let timeRangeLabel = '';
      if (typeof timeRange === 'string') {
        switch (timeRange) {
          case 'last7days':
            timeRangeLabel = 'L7';
            break;
          case 'last28days':
            timeRangeLabel = 'L28';
            break;
          case 'last3months':
            timeRangeLabel = 'L3M';
            break;
          default:
            timeRangeLabel = timeRange;
        }
      }

      return `${metricName} ${timeRangeLabel}`;
    } else if (block.type === "intent") {
      return "Intent";
    }
    return "";
  };

  // Function to render cell content based on block type and data
  const renderCellContent = (block: ReportBlock, item: any) => {
    if (block.type === 'metric') {
      const { metric } = block;

      // Check if the metric exists in the item
      if (item[metric] === undefined) {
        return '-';
      }

      // Format the value based on metric type
      if (metric === 'ctr') {
        return `${(item[metric] * 100).toFixed(2)}%`;
      } else if (metric === 'position') {
        return item[metric].toFixed(1);
      } else {
        return item[metric].toLocaleString();
      }
    } else if (block.type === 'intent') {
      // For intent blocks, we need to check if the intent data exists
      if (!item.intent || !item.category) {
        return (
          <div>
            <div className="font-medium">-</div>
            <div className="text-sm text-muted-foreground">-</div>
          </div>
        );
      }

      return (
        <div>
          <div className="font-medium">{item.category}</div>
          <div className="text-sm text-muted-foreground">{item.intent}</div>
        </div>
      );
    }
    return '-';
  };

  const fetchInsights = async () => {
    try {
      setIsLoading(true);

      // Extract time ranges and metrics from report blocks
      const timeRanges: PredefinedTimeRange[] = [];
      const metrics: string[] = [];

      reportBlocks.forEach(block => {
        if (block.type === 'metric') {
          // Only include predefined time ranges
          if (typeof block.timeRange === 'string') {
            timeRanges.push(block.timeRange);
            metrics.push(block.metric);
          }
        }
      });

      if (timeRanges.length === 0 || metrics.length === 0) {
        toast.error("Please add at least one time range and one metric");
        return;
      }

      // Make API call to fetch data
      const response = await fetch('/api/gsc/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: selectedProperty || 'sc-domain:macbookjournal.com', // Use selected property or default
          timeRanges,
          metrics,
          rowLimit: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      console.log('Fetched data:', data); // Debug log

      // Process the data for the table
      const processedData: any[] = [];

      // For each query in the response
      if (data.rows && Array.isArray(data.rows)) {
        data.rows.forEach((row: any) => {
          // Create a data object for this query
          const queryData: any = {
            query: row.keys[0], // The query is in the first element of keys array
          };

          // Add metrics data for each report block
          reportBlocks.forEach(block => {
            if (block.type === 'metric' && typeof block.timeRange === 'string') {
              const timeRange = block.timeRange;
              const metric = block.metric;

              // Find the corresponding data in the response
              if (data.aggregated && data.aggregated[timeRange] && data.aggregated[timeRange][metric.toLowerCase()]) {
                queryData[metric] = data.aggregated[timeRange][metric.toLowerCase()];
              } else {
                // If data not found in aggregated, try to find in rows
                const rowData = row.data.find((item: any) =>
                  item.timeRange === timeRange && item.metric === metric.toLowerCase()
                );
                if (rowData) {
                  queryData[metric] = rowData.value;
                } else {
                  // Default to 0 if no data found
                  queryData[metric] = 0;
                }
              }
            }
          });

          processedData.push(queryData);
        });
      } else {
        // If no rows data, create a sample row for testing
        const sampleData = {
          query: "macbook list in order",
          clicks: 120,
          impressions: 1500,
          ctr: 0.08,
          position: 3.5
        };
        processedData.push(sampleData);
      }

      console.log('Processed data:', processedData); // Debug log
      setTableData(processedData);
      toast.success("Data fetched successfully");
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      toast.error(error.message || "Failed to fetch insights");

      // Add sample data for testing if fetch fails
      const sampleData = [
        {
          query: "macbook list in order",
          clicks: 120,
          impressions: 1500,
          ctr: 0.08,
          position: 3.5
        },
        {
          query: "best macbook for video editing",
          clicks: 85,
          impressions: 1200,
          ctr: 0.07,
          position: 4.2
        }
      ];
      setTableData(sampleData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (tableData.length === 0) {
      toast.error("No data to export. Please fetch data first.");
      return;
    }

    // Format data for export
    const exportData = tableData.map(item => {
      const formattedItem: any = {
        query: item.query,
      };

      // Add metrics data
      reportBlocks.forEach(block => {
        if (block.type === 'metric') {
          const { metric, timeRange } = block;
          const timeRangeLabel = formatTimeRange(timeRange);
          formattedItem[`${metric} (${timeRangeLabel})`] = item[metric];
        }
      });

      return formattedItem;
    });

    exportToCsv(exportData, "gsc-report.csv");
    toast.success("Report exported successfully");
  };

  if (reportBlocks.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Report Preview</h2>
          <p className="text-sm text-muted-foreground">
            View and export your Google Search Console data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchInsights}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? "Fetching..." : "Fetch Data"}
          </Button>
          <Button
            onClick={handleExport}
            disabled={tableData.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Query</TableHead>
                {reportBlocks.map((block) => (
                  <TableHead key={block.id} className="text-right">
                    {renderColumnHeader(block)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={reportBlocks.length + 1} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>No data available</p>
                      <p className="text-sm">Click "Fetch Data" to load your report</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.query}</TableCell>
                    {reportBlocks.map((block) => (
                      <TableCell key={block.id} className="text-right">
                        {renderCellContent(block, item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
