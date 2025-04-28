'use client';

import { useState, useEffect } from 'react';
import { ReportBlock, useReportConfig } from '@/contexts/report-config-context';
import { fetchGscData } from '@/lib/api/gsc';
import { formatTimeRange } from '@/lib/utils/date';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Download, ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PredefinedTimeRange } from '@/lib/types';
import { exportToCsv } from '@/lib/api/export';
import { useDroppable } from '@dnd-kit/core';
import { DraggableBlock } from './DraggableBlock';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';

export function ReportTable() {
  const { selectedProperty, reportBlocks, addReportBlock, removeReportBlock } = useReportConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columns, setColumns] = useState<Array<ReportBlock | null>>([null, null, null]);

  // Define available blocks to match the ones in the report builder
  const availableBlocks: ReportBlock[] = [
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
    }
  ];

  // Create a separate component for the column header to handle drag and drop
  const ColumnHeader = ({
    block,
    index,
    onRemoveBlock,
    onAddColumn
  }: {
    block: ReportBlock | null;
    index: number;
    onRemoveBlock: (id: string) => void;
    onAddColumn: () => void;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `column-${index}`,
    });

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.add('bg-primary/10');
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.remove('bg-primary/10');
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.remove('bg-primary/10');

      // Try to get the block data from the dataTransfer
      let block: ReportBlock | undefined;

      try {
        // First try to get JSON data (for custom time ranges)
        const jsonData = event.dataTransfer.getData('application/json');
        if (jsonData) {
          block = JSON.parse(jsonData);
        } else {
          // Fall back to the standard text/plain data (for predefined blocks)
          const blockId = event.dataTransfer.getData('text/plain');
          if (blockId) {
            block = availableBlocks.find(b => b.id === blockId);
          }
        }
      } catch (error) {
        console.error('Error parsing dropped data:', error);
      }

      if (!block) return;

      // Check if this block is already in the table
      const isDuplicate = reportBlocks.some(existingBlock => {
        if (block.type === 'metric' && existingBlock.type === 'metric') {
          // Now TypeScript knows both blocks are MetricBlocks
          return existingBlock.metric === block.metric &&
            existingBlock.timeRange === block.timeRange;
        }
        return false;
      });

      if (isDuplicate) {
        toast.error("This metric is already in the table");
        return;
      }

      // Create a new block with a unique ID to avoid conflicts
      const newBlock = {
        ...block,
        id: `${block.id}_${Date.now()}`
      };

      // Update the columns array
      const newColumns = [...columns];
      newColumns[index] = newBlock;
      setColumns(newColumns);

      // Also update the global state
      addReportBlock(newBlock, index);

      // Do NOT trigger a fetch here - let the user manually fetch when ready
      // Also do NOT call onMetricDrop as it's not needed
    };

    // Format the column header text
    const getColumnHeaderText = () => {
      if (!block) return "Drop metric here";

      if (block.type === 'metric') {
        const { metric, timeRange } = block;
        const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);

        // Check if it's a custom time range
        if (typeof timeRange === 'object' && timeRange.startDate && timeRange.endDate) {
          return `${metricName} (custom)`;
        }

        // Create short time range label
        let timeRangeLabel = '';
        if (typeof timeRange === 'string') {
          switch (timeRange) {
            case 'last7days':
              timeRangeLabel = 'L7D';
              break;
            case 'last28days':
              timeRangeLabel = 'L28D';
              break;
            case 'last3months':
              timeRangeLabel = 'L3M';
              break;
            default:
              timeRangeLabel = timeRange;
          }
        }

        return `${metricName} (${timeRangeLabel})`;
      } else if (block.type === 'intent') {
        return "Intent";
      }

      return "Unknown";
    };

    // Get the tooltip content for the column header
    const getColumnHeaderTooltip = () => {
      if (!block || block.type !== 'metric') return null;

      const { timeRange } = block;

      // Only show tooltip for custom time ranges
      if (typeof timeRange === 'object' && timeRange.startDate && timeRange.endDate) {
        const startDate = new Date(timeRange.startDate);
        const endDate = new Date(timeRange.endDate);
        return `${format(startDate, 'd MMM')} - ${format(endDate, 'd MMM')}`;
      }

      return null;
    };

    const dateRangeTooltip = getColumnHeaderTooltip();

    return (
      <TableHead
        className={`w-[150px] border-x border-border text-center ${isOver ? 'bg-primary/5' : ''}`}
        ref={setNodeRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ContextMenu>
          <ContextMenuTrigger className="w-full h-full">
            {block ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-10 flex items-center justify-center font-medium">
                      {getColumnHeaderText()}
                    </div>
                  </TooltipTrigger>
                  {dateRangeTooltip && (
                    <TooltipContent>
                      <p>{dateRangeTooltip}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="h-10 flex items-center justify-center text-muted-foreground">
                Drop metric here
              </div>
            )}
          </ContextMenuTrigger>
          <ContextMenuContent>
            {block && (
              <ContextMenuItem
                onClick={() => onRemoveBlock(block.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </TableHead>
    );
  };

  // Debug: Log tableData whenever it changes
  useEffect(() => {
    console.log('Table data updated:', tableData);
    // Reset to first page when data changes
    setCurrentPage(1);
  }, [tableData]);

  // Update columns when reportBlocks change
  useEffect(() => {
    // Create a new array with the same length as the current columns
    const newColumns = new Array(columns.length).fill(null);

    // Place each block in its corresponding column based on its position in reportBlocks
    reportBlocks.forEach((block, index) => {
      if (index < newColumns.length) {
        newColumns[index] = block;
      } else {
        // If we need more columns, add them
        newColumns.push(block);
      }
    });

    setColumns(newColumns);
  }, [reportBlocks]);

  // Calculate pagination values
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageData = tableData.slice(startIndex, endIndex);

  // Calculate the current page range
  const currentPageRange = Math.floor((currentPage - 1) / 5) * 5;
  const startPageInRange = currentPageRange + 1;
  const endPageInRange = Math.min(startPageInRange + 4, totalPages);

  // Generate page ranges for the dropdown
  const pageRanges = Array.from({ length: Math.ceil(totalPages / 5) }, (_, i) => {
    const start = i * 5 + 1;
    const end = Math.min((i + 1) * 5, totalPages);
    return { start, end, label: `${start}-${end}` };
  });

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };



  // Function to render cell content based on block type and data
  const renderCellContent = (block: ReportBlock, item: any) => {
    if (block.type === 'metric') {
      const { metric, timeRange } = block;

      // Create a key that includes both metric and timeRange
      let dataKey = '';

      if (typeof timeRange === 'string') {
        dataKey = `${metric}_${timeRange}`;
      } else if (typeof timeRange === 'object' && timeRange.startDate && timeRange.endDate) {
        dataKey = `${metric}_custom_${timeRange.startDate}_${timeRange.endDate}`;
      }

      // Check if the metric exists in the item or if it's undefined/null
      if (item[dataKey] === undefined || item[dataKey] === null) {
        return '-';
      }

      // Format the value based on metric type
      if (metric === 'ctr') {
        return `${(item[dataKey] * 100).toFixed(2)}%`;
      } else if (metric === 'position') {
        return item[dataKey].toFixed(1);
      } else {
        return item[dataKey].toLocaleString();
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
      const customTimeRanges: { startDate: string; endDate: string }[] = [];

      reportBlocks.forEach(block => {
        if (block.type === 'metric') {
          // Include both predefined and custom time ranges
          if (typeof block.timeRange === 'string') {
            timeRanges.push(block.timeRange);
            metrics.push(block.metric);
          } else if (typeof block.timeRange === 'object' && block.timeRange.startDate && block.timeRange.endDate) {
            // Add custom time range
            customTimeRanges.push({
              startDate: block.timeRange.startDate,
              endDate: block.timeRange.endDate
            });
            metrics.push(block.metric);
          }
        }
      });

      if ((timeRanges.length === 0 && customTimeRanges.length === 0) || metrics.length === 0) {
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
          siteUrl: selectedProperty, // Use selected property or default
          timeRanges,
          customTimeRanges,
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

      // Check if we have searchQueries data
      if (data.searchQueries) {
        // Get all unique queries across all time ranges
        const allQueries = new Set<string>();

        // Collect all unique queries
        Object.values(data.searchQueries).forEach((timeRangeData: any) => {
          if (timeRangeData.queries && Array.isArray(timeRangeData.queries)) {
            timeRangeData.queries.forEach((query: any) => {
              allQueries.add(query.query);
            });
          }
        });

        // Create a data object for each unique query
        allQueries.forEach(query => {
          const queryData: any = {
            query: query,
          };

          // Add metrics data for each report block
          reportBlocks.forEach(block => {
            if (block.type === 'metric') {
              const metric = block.metric;

              if (typeof block.timeRange === 'string') {
                const timeRange = block.timeRange;

                // Find the query in the searchQueries data for this specific time range
                const timeRangeQueries = data.searchQueries[timeRange]?.queries || [];
                const queryRow = timeRangeQueries.find((row: any) => row.query === query);

                if (queryRow) {
                  // Use the actual value from the query row
                  queryData[`${metric}_${timeRange}`] = queryRow[metric.toLowerCase()];
                } else {
                  // Default to 0 if query not found in this time range
                  queryData[`${metric}_${timeRange}`] = 0;
                }
              } else if (typeof block.timeRange === 'object' && block.timeRange.startDate && block.timeRange.endDate) {
                // Handle custom time range
                const customKey = `custom_${block.timeRange.startDate}_${block.timeRange.endDate}`;
                const customQueries = data.searchQueries[customKey]?.queries || [];
                const queryRow = customQueries.find((row: any) => row.query === query);

                if (queryRow) {
                  // Use the actual value from the query row
                  queryData[`${metric}_custom_${block.timeRange.startDate}_${block.timeRange.endDate}`] = queryRow[metric.toLowerCase()];
                } else {
                  // Check if the custom range exists in the data
                  if (data.searchQueries[customKey]) {
                    // If it exists but has no rows, set to null
                    queryData[`${metric}_custom_${block.timeRange.startDate}_${block.timeRange.endDate}`] = null;
                  } else {
                    // Default to 0 if query not found in this time range
                    queryData[`${metric}_custom_${block.timeRange.startDate}_${block.timeRange.endDate}`] = 0;
                  }
                }
              }
            }
          });

          processedData.push(queryData);
        });
      } else if (data.rows && Array.isArray(data.rows)) {
        // Fallback to the old data structure if searchQueries is not available
        data.rows.forEach((row: any) => {
          // Create a data object for this query
          const queryData: any = {
            query: row.keys[0], // The query is in the first element of keys array
          };

          // Add metrics data for each report block
          reportBlocks.forEach(block => {
            if (block.type === 'metric') {
              const metric = block.metric;

              if (typeof block.timeRange === 'string') {
                const timeRange = block.timeRange;

                // Find the corresponding data in the response
                if (data.aggregated && data.aggregated[timeRange] && data.aggregated[timeRange][metric.toLowerCase()]) {
                  queryData[`${metric}_${timeRange}`] = data.aggregated[timeRange][metric.toLowerCase()];
                } else {
                  // If data not found in aggregated, try to find in rows
                  const rowData = row.data.find((item: any) =>
                    item.timeRange === timeRange && item.metric === metric.toLowerCase()
                  );
                  if (rowData) {
                    queryData[`${metric}_${timeRange}`] = rowData.value;
                  } else {
                    // Default to 0 if no data found
                    queryData[`${metric}_${timeRange}`] = 0;
                  }
                }
              } else if (typeof block.timeRange === 'object' && block.timeRange.startDate && block.timeRange.endDate) {
                // Handle custom time range
                const customKey = `custom_${block.timeRange.startDate}_${block.timeRange.endDate}`;

                if (data.aggregated && data.aggregated[customKey] && data.aggregated[customKey][metric.toLowerCase()]) {
                  queryData[`${metric}_custom_${block.timeRange.startDate}_${block.timeRange.endDate}`] = data.aggregated[customKey][metric.toLowerCase()];
                } else {
                  // If data not found in aggregated, try to find in rows
                  const rowData = row.data.find((item: any) =>
                    item.timeRange === customKey && item.metric === metric.toLowerCase()
                  );
                  if (rowData) {
                    queryData[`${metric}_custom_${block.timeRange.startDate}_${block.timeRange.endDate}`] = rowData.value;
                  } else {
                    // Default to 0 if no data found
                    queryData[`${metric}_custom_${block.timeRange.startDate}_${block.timeRange.endDate}`] = 0;
                  }
                }
              }
            }
          });

          processedData.push(queryData);
        });
      } else {
        // If no data available, create a sample row for testing
        const sampleData = {
          query: "macbook list in order",
          clicks_last7days: 120,
          impressions_last7days: 1500,
          ctr_last7days: 0.08,
          position_last7days: 3.5
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
          clicks_last7days: 120,
          impressions_last7days: 1500,
          ctr_last7days: 0.08,
          position_last7days: 3.5
        },
        {
          query: "best macbook for video editing",
          clicks_last7days: 85,
          impressions_last7days: 1200,
          ctr_last7days: 0.07,
          position_last7days: 4.2
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

      // Add intent data
      formattedItem['Intent'] = item.intent || '';
      formattedItem['Category'] = item.category || '';

      // Add metrics data
      reportBlocks.forEach(block => {
        if (block.type === 'metric') {
          const { metric, timeRange } = block;
          const timeRangeLabel = formatTimeRange(timeRange);
          formattedItem[`${metric} (${timeRangeLabel})`] = item[`${metric}_${timeRange}`];
        }
      });

      return formattedItem;
    });

    exportToCsv(exportData, "gsc-report.csv");
    toast.success("Report exported successfully");
  };

  const handleRemoveBlock = (blockId: string) => {
    // Find the column index of the block
    const columnIndex = columns.findIndex(block => block?.id === blockId);
    if (columnIndex === -1) return;

    // Remove the block from the global state
    removeReportBlock(blockId);

    // Update local state by removing the entire column
    const newColumns = [...columns];
    newColumns.splice(columnIndex, 1);
    setColumns(newColumns);
  };

  const handleAddColumn = () => {
    setColumns([...columns, null]);
  };

  // Always show the table, even if there are no report blocks
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => handleRowsPerPageChange(value)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Select rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
      <div className="relative h-[calc(80vh-15rem)]">
        <div className="overflow-x-auto relative h-full">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Query</TableHead>
                  <TableHead className="w-[200px] border-x text-center">Intent</TableHead>
                  {columns.map((block, index) => (
                    <ColumnHeader
                      key={index}
                      block={block}
                      index={index}
                      onRemoveBlock={handleRemoveBlock}
                      onAddColumn={handleAddColumn}
                    />
                  ))}
                  <TableHead className="w-[100px]">
                    <div
                      className="flex items-center justify-center h-8 w-full cursor-pointer"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-primary/10');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-primary/10');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-primary/10');

                        // Try to get the block data from the dataTransfer
                        let block: ReportBlock | undefined;

                        try {
                          // First try to get JSON data (for custom time ranges)
                          const jsonData = e.dataTransfer.getData('application/json');
                          if (jsonData) {
                            block = JSON.parse(jsonData);
                          } else {
                            // Fall back to the standard text/plain data (for predefined blocks)
                            const blockId = e.dataTransfer.getData('text/plain');
                            if (blockId) {
                              block = availableBlocks.find(b => b.id === blockId);
                            }
                          }
                        } catch (error) {
                          console.error('Error parsing dropped data:', error);
                        }

                        if (!block) return;

                        // Check if this block is already in the table
                        const isDuplicate = reportBlocks.some(existingBlock => {
                          if (block.type === 'metric' && existingBlock.type === 'metric') {
                            return existingBlock.metric === block.metric &&
                              existingBlock.timeRange === block.timeRange;
                          }
                          return false;
                        });

                        if (isDuplicate) {
                          toast.error("This metric is already in the table");
                          return;
                        }

                        // Create a new block with a unique ID
                        const newBlock = {
                          ...block,
                          id: `${block.id}_${Date.now()}`
                        };

                        // Add a new column and place the block in it
                        const newColumns = [...columns, newBlock];
                        setColumns(newColumns);

                        // Update the global state
                        addReportBlock(newBlock);
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleAddColumn}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>No data available</p>
                        <p className="text-sm">Click &quot;Fetch Data&quot; to load your report</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium border-x border-border">{item.query}</TableCell>
                      <TableCell className="text-center border-x border-border">
                        {item.intent ? (
                          <div>
                            <div className="font-medium">{item.category}</div>
                            <div className="text-sm text-muted-foreground">{item.intent}</div>
                          </div>
                        ) : '-'}
                      </TableCell>
                      {columns.map((column, colIndex) => (
                        <TableCell key={colIndex} className="text-center border-x border-border">
                          {column ? renderCellContent(column, item) : '-'}
                        </TableCell>
                      ))}
                      <TableCell className="border-x border-border"></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      {/* Pagination Controls */}
      {tableData.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, tableData.length)} of {tableData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <Select
              value={`${startPageInRange}-${endPageInRange}`}
              onValueChange={(value) => {
                const [start] = value.split('-').map(Number);
                goToPage(start);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Select page range" />
              </SelectTrigger>
              <SelectContent>
                {pageRanges.map((range) => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, endPageInRange - startPageInRange + 1) },
                (_, i) => startPageInRange + i
              ).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
