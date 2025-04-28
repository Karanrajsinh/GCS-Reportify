'use client';

import { useState } from 'react';
import {
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { useReportConfig } from '@/contexts/report-config-context';
import { ReportTable } from '@/components/report/report-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { DraggableBlock } from './DraggableBlock';
import { useParams, useRouter } from 'next/navigation';

export default function ReportBuilder() {
  const { selectedProperty } = useReportConfig();
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const website = params.website as string;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleSaveReport = () => {
    toast({
      title: "Report saved",
      description: "Your report has been saved successfully.",
    });

    router.push(`/website/${website}/reports`);
  };

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
