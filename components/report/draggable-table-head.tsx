import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import { Trash } from 'lucide-react';
import { ReportBlock } from '@/contexts/report-config-context';

interface DraggableTableHeadProps {
    block: ReportBlock;
    index: number;
    renderColumnHeader: (block: ReportBlock) => string;
    removeReportBlock: (id: string) => void;
}

export function DraggableTableHead({
    block,
    index,
    renderColumnHeader,
    removeReportBlock,
}: DraggableTableHeadProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: block.id,
    });

    return (
        <TableHead
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="min-w-[150px] cursor-move relative group"
            style={{
                transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            }}
        >
            <div className="flex items-center justify-between">
                {renderColumnHeader(block)}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => removeReportBlock(block.id)}
                >
                    <Trash className="h-3 w-3" />
                </Button>
            </div>
        </TableHead>
    );
}
