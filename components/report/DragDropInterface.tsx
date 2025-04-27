'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReportBlock, useReportConfig } from '@/contexts/report-config-context';
import { DraggableBlock } from './DraggableBlock';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";

// Create a separate component for the column header to avoid hook issues
function ColumnHeader({
    column,
    index,
    onRemoveBlock,
    onRemoveColumn
}: {
    column: ReportBlock | null;
    index: number;
    onRemoveBlock: (id: string) => void;
    onRemoveColumn: (index: number) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${index}`,
    });

    return (
        <th
            className={`p-2 border ${isOver ? 'bg-primary/5' : ''}`}
            ref={setNodeRef}
        >
            <ContextMenu>
                <ContextMenuTrigger className="w-full h-full">
                    {column ? (
                        <DraggableBlock
                            id={column.id}
                            name={column.type === 'metric'
                                ? `${column.metric} (${column.timeRange})`
                                : 'Intent Analysis'}
                            showCrossIcon={true}
                            onRemove={() => onRemoveBlock(column.id)}
                        />
                    ) : (
                        <div className="h-10 flex items-center justify-center text-muted-foreground">
                            Drop metric here
                        </div>
                    )}
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem
                        onClick={() => onRemoveColumn(index)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Column
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </th>
    );
}

export function DragDropInterface() {
    const { reportBlocks, removeReportBlock } = useReportConfig();

    // Initialize with 3 empty columns
    const [columns, setColumns] = useState<Array<ReportBlock | null>>([null, null, null]);

    // Update columns when reportBlocks change
    useEffect(() => {
        // Create a new array with the same length as columns
        const newColumns = new Array(columns.length).fill(null);

        // Place each block in its corresponding column based on its position in reportBlocks
        reportBlocks.forEach((block, index) => {
            if (index < newColumns.length) {
                newColumns[index] = block;
            }
        });

        setColumns(newColumns);
    }, [reportBlocks]);

    const addColumn = () => {
        setColumns([...columns, null]);
    };

    const handleRemoveBlock = (blockId: string) => {
        removeReportBlock(blockId);
    };

    const handleRemoveColumn = (index: number) => {
        // If there's a block in this column, remove it first
        const block = columns[index];
        if (block) {
            removeReportBlock(block.id);
        }

        // Remove the column
        const newColumns = [...columns];
        newColumns.splice(index, 1);
        setColumns(newColumns);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <ColumnHeader

                                    key={index}
                                    column={column}
                                    index={index}
                                    onRemoveBlock={handleRemoveBlock}
                                    onRemoveColumn={handleRemoveColumn}
                                />
                            ))}
                            <th className="p-2 border w-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={addColumn}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    );
} 