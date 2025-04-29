'use client';

import { useState, useEffect } from 'react';
import { ReportBlock, useReportConfig } from '@/contexts/report-config-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Download, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PredefinedTimeRange } from '@/lib/types';
import { exportToCsv } from '@/lib/api/export';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useDroppable } from '@dnd-kit/core';
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
  onAddColumn: (block: ReportBlock, index: number) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${index}`,
  });

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('bg-primary/10');

    let block: ReportBlock | undefined;

    try {
      const jsonData = event.dataTransfer.getData('application/json');
      if (jsonData) {
        block = JSON.parse(jsonData);
      } else {
        const blockId = event.dataTransfer.getData('text/plain');
        if (blockId) {
          block = availableBlocks.find(b => b.id === blockId);
        }
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }

    if (!block) return;

    onAddColumn(block, index);
  };

  const getColumnHeaderText = () => {
    if (!block) return "Drop metric here";

    if (block.type === 'metric') {
      const { metric, timeRange } = block;
      const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);

      if (typeof timeRange === 'object' && timeRange.startDate && timeRange.endDate) {
        return `${metricName} (custom)`;
      }

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
    }

    return "Unknown";
  };

  const getTooltipContent = () => {
    if (!block || block.type !== 'metric') return null;
    const { timeRange } = block;

    if (typeof timeRange === 'object' && timeRange.startDate && timeRange.endDate) {
      return `${timeRange.startDate} - ${timeRange.endDate}`;
    }

    return null;
  };

  return (
    <TableHead
      className={`w-[150px] border-x border-border text-center ${isOver ? 'bg-primary/5' : ''}`}
      ref={setNodeRef}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-primary/10');
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-primary/10');
      }}
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
                {getTooltipContent() && (
                  <TooltipContent>
                    <p>{getTooltipContent()}</p>
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

// Available blocks for drag and drop
const availableBlocks: ReportBlock[] = [
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
  // ... other blocks
];

export function ReportTable() {
  const { selectedProperty, reportBlocks, addReportBlock, removeReportBlock } = useReportConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFromDb, setIsFetchingFromDb] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columns, setColumns] = useState<Array<ReportBlock | null>>([null, null, null]); // 3 droppable columns
  const [exportOption, setExportOption] = useState('current');
  const params = useParams();
  const reportId = params.reportId as string;

  // Function to fetch data from database
  const fetchFromDatabase = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) throw new Error('Failed to fetch report data');

      const data = await response.json();

      // Load blocks from database
      if (data.blocks?.length > 0) {
        data.blocks.forEach((block: any) => {
          const reportBlock: ReportBlock = {
            id: block.id,
            type: block.type,
            metric: block.metric,
            timeRange: block.timeRange
          };
          addReportBlock(reportBlock, block.position);
        });
      }

      // Load query data
      if (data.queries?.length > 0) {
        setTableData(data.queries.map((q: any) => ({
          ...q.metrics,
          query: q.metrics.query,
          intent: q.intent || '-',
          category: q.category || '-'
        })));
      }
    } catch (error) {
      console.error('Error fetching from database:', error);
      toast.error('Failed to load saved report data');
    } finally {
      setIsFetchingFromDb(false);
    }
  };

  // Fetch data from database on mount
  useEffect(() => {
    fetchFromDatabase();
  }, [reportId]);

  // Handle removing a block
  const handleRemoveBlock = (blockId: string) => {
    removeReportBlock(blockId);
  };

  // Fetch data from GSC API
  const fetchInsights = async () => {
    try {
      setIsLoading(true);

      const timeRanges: PredefinedTimeRange[] = [];
      const metrics: string[] = [];
      const customTimeRanges: { startDate: string; endDate: string }[] = [];

      reportBlocks.forEach(block => {
        if (block.type === 'metric') {
          if (typeof block.timeRange === 'string') {
            timeRanges.push(block.timeRange);
            metrics.push(block.metric);
          } else if (typeof block.timeRange === 'object' && block.timeRange.startDate && block.timeRange.endDate) {
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

      const response = await fetch('/api/gsc/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: selectedProperty,
          timeRanges,
          customTimeRanges,
          rowLimit: 100,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      const processedData: any[] = [];

      if (data.searchQueries) {
        const allQueries = new Set<string>();

        Object.values(data.searchQueries).forEach((timeRangeData: any) => {
          if (timeRangeData.queries && Array.isArray(timeRangeData.queries)) {
            timeRangeData.queries.forEach((query: any) => {
              allQueries.add(query.query);
            });
          }
        });

        allQueries.forEach(query => {
          // Find query data with intent from any time range
          const timeRangeKey = Object.keys(data.searchQueries)[0];
          const queryInfo = data.searchQueries[timeRangeKey].queries.find(
            (q: any) => q.query === query
          );

          const queryData: any = {
            query,
            intent: queryInfo?.intent || '-',
            category: queryInfo?.category || '-'
          };

          reportBlocks.forEach(block => {
            if (block.type === 'metric') {
              const { metric, timeRange } = block;
              let timeRangeKey;
              let dataKey;

              if (typeof timeRange === 'string') {
                timeRangeKey = timeRange;
                dataKey = `${metric}_${timeRange}`;
              } else if (typeof timeRange === 'object' && timeRange.startDate && timeRange.endDate) {
                timeRangeKey = `custom_${timeRange.startDate}_${timeRange.endDate}`;
                dataKey = `${metric}_${timeRangeKey}`;
              }

              if (timeRangeKey) {
                const timeRangeData = data.searchQueries[timeRangeKey];
                if (timeRangeData && timeRangeData.queries) {
                  const queryDataFromTimeRange = timeRangeData.queries.find(
                    (q: any) => q.query === query
                  );
                  if (queryDataFromTimeRange) {
                    queryData[dataKey] = queryDataFromTimeRange[metric];
                  }
                }
              }
            }
          });

          processedData.push(queryData);
        });

        setTableData(processedData);

        // Save blocks and table data to database
        try {
          await fetch(`/api/reports/${reportId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tableData: processedData,
              blocks: reportBlocks.map((block, index) => ({
                type: block.type,
                metric: block.type === 'metric' ? block.metric : null,
                timeRange: block.type === 'metric' ? block.timeRange : null,
                position: index
              }))
            }),
          });
        } catch (error) {
          console.error('Error saving to database:', error);
          toast.error('Failed to save report data');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch data from Google Search Console');
    } finally {
      setIsLoading(false);
    }
  };

  // Update columns when reportBlocks change
  useEffect(() => {
    const newColumns = new Array(3).fill(null); // Always maintain 3 droppable columns
    reportBlocks.forEach((block, index) => {
      if (index < newColumns.length) {
        newColumns[index] = block;
      }
    });
    setColumns(newColumns);
  }, [reportBlocks]);

  // Handle adding a new column
  const handleAddColumn = (block: ReportBlock, index: number) => {
    const isDuplicate = reportBlocks.some(existingBlock => {
      if (block.type !== 'metric' || existingBlock.type !== 'metric') return false;
      return existingBlock.metric === block.metric &&
        existingBlock.timeRange === block.timeRange;
    });

    if (isDuplicate) {
      toast.error("This metric is already in the table");
      return;
    }

    // Only allow adding to empty slots
    if (columns[index] !== null) {
      toast.error("This slot is already taken");
      return;
    }

    const newBlock = {
      ...block,
      id: `${block.id}_${Date.now()}`
    };

    addReportBlock(newBlock, index);
  };

  // Handle export
  const handleExport = () => {
    // Set data based on selected export option
    const data = exportOption === 'all' ? tableData : currentPageData;

    // Convert data to CSV format
    const formattedData = data.map(item => {
      // Start with basic fields
      const row: Record<string, any> = {
        Query: item.query,
        Intent: item.intent || '-',
        Category: item.category || '-'
      };

      // Add metric columns
      columns.forEach(block => {
        if (block?.type === 'metric') {
          const { metric, timeRange } = block;
          const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);
          let timeRangeLabel = '';
          let dataKey = '';

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
            dataKey = `${metric}_${timeRange}`;
          } else if (timeRange.startDate && timeRange.endDate) {
            timeRangeLabel = 'Custom';
            dataKey = `${metric}_custom_${timeRange.startDate}_${timeRange.endDate}`;
          }

          const columnName = `${metricName} (${timeRangeLabel})`;

          // Get and format the value using the same logic as renderCellContent
          let value = item[dataKey];
          if (value === undefined || value === null) {
            row[columnName] = '-';
          } else if (metric === 'ctr') {
            row[columnName] = `${(value * 100).toFixed(2)}%`;
          } else if (metric === 'position') {
            row[columnName] = value.toFixed(1);
          } else {
            row[columnName] = value.toLocaleString();
          }
        }
      });

      return row;
    });

    exportToCsv(formattedData, 'gsc-report.csv');
  };

  // Render cell content
  const renderCellContent = (block: ReportBlock, item: any) => {
    if (block.type !== 'metric') return '-';

    const { metric, timeRange } = block;
    const dataKey = typeof timeRange === 'string'
      ? `${metric}_${timeRange}`
      : `${metric}_custom_${timeRange.startDate}_${timeRange.endDate}`;

    if (item[dataKey] === undefined || item[dataKey] === null) return '-';

    if (metric === 'ctr') {
      return `${(item[dataKey] * 100).toFixed(2)}%`;
    }
    if (metric === 'position') {
      return item[dataKey].toFixed(1);
    }
    return item[dataKey].toLocaleString();
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageData = tableData.slice(startIndex, endIndex);
  const currentPageRange = Math.floor((currentPage - 1) / 5) * 5;
  const startPageInRange = currentPageRange + 1;
  const endPageInRange = Math.min(startPageInRange + 4, totalPages);
  const pageRanges = Array.from({ length: Math.ceil(totalPages / 5) }, (_, i) => {
    const start = i * 5 + 1;
    const end = Math.min((i + 1) * 5, totalPages);
    return { start, end, label: `${start}-${end}` };
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report Table</h2>
          <div className="flex items-center gap-4">
            <Select
              value={`${rowsPerPage}`}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows per page</SelectItem>
                <SelectItem value="20">20 rows per page</SelectItem>
                <SelectItem value="50">50 rows per page</SelectItem>
                <SelectItem value="100">100 rows per page</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={tableData.length === 0}
                    className="flex items-center gap-2"
                  >
                    Export
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setExportOption('current');
                    handleExport();
                  }}>
                    Export Current Page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setExportOption('all');
                    handleExport();
                  }}>
                    Export All Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                onClick={fetchInsights}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Fetch Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative  h-[calc(80vh-15rem)]">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] border-r border-border">Query</TableHead>
                <TableHead className="w-[250px] border-r border-border">Intent</TableHead>
                <TableHead className="w-[150px] text-center border-r border-border">Category</TableHead>
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
                  <div className="h-10 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const emptySlot = columns.findIndex(col => col === null);
                        if (emptySlot === -1) {
                          toast.error("All slots are taken. Remove a metric first.");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetchingFromDb ? (
                // Loading skeleton state
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 4} className="h-[calc(80vh-18rem)] text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="border-r border-border font-medium">
                      {item.query}
                    </TableCell>
                    <TableCell className="border-r border-border">
                      {item.intent || '-'}
                    </TableCell>
                    <TableCell className="border-r text-center border-border">
                      {item.category || '-'}
                    </TableCell>
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className="border-x border-border text-center">
                        {column ? renderCellContent(column, item) : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Pagination */}
      {currentPageData.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, tableData.length)} of {tableData.length} entries
            </div>
            <div className="flex items-center space-x-2 min-w-[400px] justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select
                value={`${startPageInRange}-${endPageInRange}`}
                onValueChange={(value) => {
                  const [start] = value.split('-').map(Number);
                  goToPage(start);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      Pages {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {Array.from(
                { length: endPageInRange - startPageInRange + 1 },
                (_, i) => startPageInRange + i
              ).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => goToPage(pageNum)}
                  size="sm"
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
