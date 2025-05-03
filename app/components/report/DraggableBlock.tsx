'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';

interface DraggableBlockProps {
    id: string;
    name: string;
    showCrossIcon?: boolean;
    onRemove?: () => void;
    className?: string;
    disabled?: boolean;
    isDragOverlay?: boolean;
    onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function DraggableBlock({
    id,
    name,
    showCrossIcon = false,
    onRemove,
    className = '',
    disabled = false,
    isDragOverlay = false,
    onDragStart
}: DraggableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id,
        disabled
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.3 : 1,
        width: isDragOverlay ? 'auto' : '100%',
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove();
        }
    };

    // Format the name for drag overlay to be more compact
    const formatName = (name: string) => {
        if (!isDragOverlay) return name;

        // Extract metric and time range from the name
        const match = name.match(/^(.+?)\s+\((.+)\)$/);
        if (!match) return name;

        const [, metric, timeRange] = match;

        // Create short time range label
        let timeRangeLabel = '';
        if (timeRange === 'last7days') {
            timeRangeLabel = 'L7';
        } else if (timeRange === 'last28days') {
            timeRangeLabel = 'L28';
        } else if (timeRange === 'last3months') {
            timeRangeLabel = 'L3M';
        } else {
            timeRangeLabel = timeRange;
        }

        return `${metric} ${timeRangeLabel}`;
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (onDragStart) {
            onDragStart(e);
        } else {
            // Default behavior for standard blocks
            e.dataTransfer.setData('text/plain', id);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex items-center gap-2 ${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-move'}`}
            draggable={!disabled}
            onDragStart={handleDragStart}
        >
            <Button
                variant="outline"
                className={`${isDragOverlay ? 'px-3 py-1 h-auto text-sm' : 'w-full justify-start'} ${disabled ? 'cursor-not-allowed' : 'cursor-move'}`}
                disabled={disabled}
            >
                {formatName(name)}
            </Button>
            {showCrossIcon && onRemove && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
} 