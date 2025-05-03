'use client';

import { TimeRange, Metric } from '@/lib/types';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type MetricBlock = {
  id: string;
  type: 'metric';
  metric: Metric;
  timeRange: TimeRange;
};

type IntentBlock = {
  id: string;
  type: 'intent';
};

export type ReportBlock = MetricBlock | IntentBlock;

interface ReportConfigContextType {
  selectedProperty: string | null;
  reportBlocks: ReportBlock[];
  setSelectedProperty: (property: string | null) => void;
  addReportBlock: (block: ReportBlock, position?: number) => void;
  removeReportBlock: (blockId: string) => void;
  reorderReportBlocks: (startIndex: number, endIndex: number) => void;
  clearReportBlocks: () => void; // Add clear function
}

const ReportConfigContext = createContext<ReportConfigContextType | undefined>(undefined);

export function ReportConfigProvider({ children }: { children: React.ReactNode }) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [reportBlocks, setReportBlocks] = useState<ReportBlock[]>([]);

  const addReportBlock = useCallback((block: ReportBlock, position?: number) => {
    setReportBlocks((prev) => {
      // If position is provided, insert at that position
      if (position !== undefined) {
        const newBlocks = [...prev];
        newBlocks[position] = block;
        return newBlocks;
      }
      // Otherwise, append to the end
      return [...prev, block];
    });
  }, []);

  const removeReportBlock = useCallback((blockId: string) => {
    setReportBlocks((prev) => prev.filter((block) => block.id !== blockId));
  }, []);

  const reorderReportBlocks = useCallback((startIndex: number, endIndex: number) => {
    setReportBlocks((blocks) => {
      const result = Array.from(blocks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const clearReportBlocks = useCallback(() => {
    setReportBlocks([]);
  }, []);

  const value = useMemo(
    () => ({
      selectedProperty,
      reportBlocks,
      setSelectedProperty,
      addReportBlock,
      removeReportBlock,
      reorderReportBlocks,
      clearReportBlocks,
    }),
    [selectedProperty, reportBlocks, addReportBlock, removeReportBlock, reorderReportBlocks, clearReportBlocks]
  );

  return (
    <ReportConfigContext.Provider value={value}>
      {children}
    </ReportConfigContext.Provider>
  );
}

export function useReportConfig() {
  const context = useContext(ReportConfigContext);
  if (context === undefined) {
    throw new Error('useReportConfig must be used within a ReportConfigProvider');
  }
  return context;
}