import { useDraggable } from '@dnd-kit/core';
import { Label } from '@/app/components/ui/label';
import { RadioGroupItem } from '@/app/components/ui/radio-group';

interface DraggableMetricOptionProps {
    value: string;
    id: string;
    label: string;
}

export function DraggableMetricOption({ value, id, label }: DraggableMetricOptionProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: value,
    });

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={{
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        }}>
            <RadioGroupItem value={value} id={id} />
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}
