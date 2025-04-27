'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportBlock, useReportConfig } from '@/contexts/report-config-context';
import { fetchGscData } from '@/lib/api/gsc';
import { analyzeQueryIntent } from '@/lib/api/gemini';
import { formatTimeRange } from '@/lib/utils/date';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Trash } from 'lucide-react';
import {
  DndContext,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import { DraggableTableHead } from './draggable-table-head';

interface ReportTableProps {
  onMetricDrop: (metric: string) => void;
}

export function ReportTable({ onMetricDrop }: ReportTableProps) {
  const { selectedProperty, reportBlocks, removeReportBlock, reorderReportBlocks } = useReportConfig();

  const { setNodeRef } = useDroppable({
    id: 'report-table-drop-area',
  });

  // Mock data for demonstration purposes
  const mockData = [
    {
      query: "best doorbell camera",
      clicks: 1250,
      impressions: 15000,
      ctr: 0.083,
      position: 3.2,
      intent: "Find reviews and comparisons of high-quality doorbell cameras",
      category: "Commercial Investigation"
    },
    {
      query: "5ghz smart plug",
      clicks: 980,
      impressions: 12500,
      ctr: 0.078,
      position: 4.1,
      intent: "Purchase wifi smart plugs compatible with 5ghz networks",
      category: "Transactional"
    },
    {
      query: "is ring alarm insurance approved uk",
      clicks: 720,
      impressions: 9500,
      ctr: 0.076,
      position: 2.8,
      intent: "Find information about Alarm Insurance in the UK",
      category: "Informational"
    },
    {
      query: "how to install doorbell without existing wiring",
      clicks: 680,
      impressions: 8900,
      ctr: 0.076,
      position: 1.9,
      intent: "Find step-by-step installation guide for wireless doorbells",
      category: "Informational"
    },
    {
      query: "alexa compatible security camera outdoor",
      clicks: 510,
      impressions: 7200,
      ctr: 0.071,
      position: 5.4,
      intent: "Find outdoor security cameras that work with Alexa",
      category: "Commercial Investigation"
    }
  ];

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const sourceIndex = reportBlocks.findIndex(block => block.id === active.id);
      const destinationIndex = reportBlocks.findIndex(block => block.id === over?.id);

      if (sourceIndex !== -1 && destinationIndex !== -1) {
        reorderReportBlocks(sourceIndex, destinationIndex);
      }
    }
  };

  // Function to render column header based on block type
  const renderColumnHeader = (block: ReportBlock) => {
    if (block.type === "metric") {
      const { metric, timeRange } = block;
      const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);
      const timeRangeLabel = formatTimeRange(timeRange);
      return `${metricName} (${timeRangeLabel})`;
    } else if (block.type === "intent") {
      return "Intent Analysis";
    }
    return "";
  };

  // Function to render cell content based on block type and data
  const renderCellContent = (block: ReportBlock, item: any) => {
    if (block.type === 'metric') {
      const { metric } = block;

      // Format the value based on metric type
      if (metric === 'ctr') {
        return `${(item[metric] * 100).toFixed(2)}%`;
      } else if (metric === 'position') {
        return item[metric].toFixed(1);
      } else {
        return item[metric].toLocaleString();
      }
    } else if (block.type === 'intent') {
      return (
        <div>
          <div className="font-medium">{item.category}</div>
          <div className="text-sm text-muted-foreground">{item.intent}</div>
        </div>
      );
    }
    return '';
  };

  if (reportBlocks.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Query</TableHead>
              <DndContext onDragEnd={handleDragEnd}>
                {reportBlocks.map((block, index) => (
                  <DraggableTableHead
                    key={block.id}
                    block={block}
                    index={index}
                    renderColumnHeader={renderColumnHeader}
                    removeReportBlock={removeReportBlock}
                  />
                ))}
              </DndContext>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="font-medium">{item.query}</TableCell>
                {reportBlocks.map((block) => (
                  <TableCell key={block.id}>
                    {renderCellContent(block, item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
