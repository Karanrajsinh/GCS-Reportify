'use client';

import { useState } from 'react';
import {
  DragOverlay,
} from '@dnd-kit/core';
import { useReportConfig } from '@/contexts/report-config-context';
import { ReportTable } from '@/app/components/report/report-table';
import { DraggableBlock } from './DraggableBlock';

export default function ReportBuilder() {
  const { selectedProperty } = useReportConfig();
  const [activeId, setActiveId] = useState<string | null>(null);


  if (!selectedProperty) return;

  return (
    <div className="space-y-6">

      <ReportTable />

      <DragOverlay>
        {activeId && (
          <DraggableBlock
            id={activeId}
            name={activeId}
            isDragOverlay={true}
          />
        )}
      </DragOverlay>
    </div>
  );
}
