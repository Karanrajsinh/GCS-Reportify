'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DraggableBlockProps {
    id: string;
    name: string;
    showCrossIcon?: boolean;
    onRemove?: () => void;
    className?: string;
    disabled?: boolean;
}

export function DraggableBlock({
    id,
    name,
    showCrossIcon = false,
    onRemove,
    className = '',
    disabled = false
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
        width: '100%',
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex items-center gap-2 ${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-move'}`}
        >
            <Button
                variant="outline"
                className={`w-full justify-start ${disabled ? 'cursor-not-allowed' : 'cursor-move'}`}
                disabled={disabled}
            >
                {name}
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