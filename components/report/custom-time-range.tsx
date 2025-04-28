'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useReportConfig } from '@/contexts/report-config-context';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Metric } from '@/lib/types';
import { DraggableBlock } from './DraggableBlock';

export function CustomTimeRange() {
    const { addReportBlock, reportBlocks } = useReportConfig();

    // Define the metrics
    const metrics: Metric[] = ['clicks', 'impressions', 'ctr', 'position'];

    // Create a state object for each metric's date range
    const [dateRanges, setDateRanges] = useState<Record<Metric, { startDate: Date; endDate: Date }>>({
        clicks: { startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 1)) },
        impressions: { startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 1)) },
        ctr: { startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 1)) },
        position: { startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 1)) }
    });

    const handleAddMetric = (metric: Metric) => {
        // Check if a custom metric block with the same metric already exists
        const isDuplicate = reportBlocks.some(block =>
            block.type === 'metric' &&
            block.metric === metric &&
            'timeRange' in block &&
            typeof block.timeRange === 'object'
        );

        if (isDuplicate) {
            toast({
                title: "Custom metric already added",
                description: `A custom ${metric} metric already exists in the report. You can only add one custom time range per metric type.`,
                variant: "destructive",
            });
            return;
        }

        const { startDate, endDate } = dateRanges[metric];

        const block = {
            id: `${metric}_custom_${Date.now()}`,
            type: 'metric' as const,
            metric: metric,
            timeRange: {
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
            },
        };

        addReportBlock(block);

        toast({
            title: "Metric added",
            description: `Added custom ${metric} metric for ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`,
        });
    };

    const updateDateRange = (metric: Metric, field: 'startDate' | 'endDate', date: Date) => {
        setDateRanges(prev => ({
            ...prev,
            [metric]: {
                ...prev[metric],
                [field]: date
            }
        }));
    };

    // Create draggable blocks for each metric
    const createDraggableBlock = (metric: Metric) => {
        const { startDate, endDate } = dateRanges[metric];

        return {
            id: `${metric}_custom_${Date.now()}`,
            type: 'metric' as const,
            metric: metric,
            timeRange: {
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
            },
            name: `${metric} Custom`
        };
    };

    // Check if a custom metric block with the same metric already exists
    const isMetricInTable = (metric: Metric) => {
        return reportBlocks.some(block =>
            block.type === 'metric' &&
            block.metric === metric &&
            'timeRange' in block &&
            typeof block.timeRange === 'object'
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground">Custom Time Range</h2>
            <div className="grid grid-cols-1 gap-4">
                {metrics.map((metric) => {
                    const isDisabled = isMetricInTable(metric);
                    return (
                        <Card key={metric} className="overflow-hidden border-none shadow-none">
                            <CardContent className="p-4">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium capitalize">{metric}</h4>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !dateRanges[metric].startDate && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateRanges[metric].startDate ? format(dateRanges[metric].startDate, 'PPP') : <span>Pick start date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateRanges[metric].startDate}
                                                        onSelect={(date) => date && updateDateRange(metric, 'startDate', date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex-1">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !dateRanges[metric].endDate && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateRanges[metric].endDate ? format(dateRanges[metric].endDate, 'PPP') : <span>Pick end date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateRanges[metric].endDate}
                                                        onSelect={(date) => date && updateDateRange(metric, 'endDate', date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex-1">
                                            <div className="relative">
                                                <DraggableBlock
                                                    id={`${metric}_custom_${Date.now()}`}
                                                    name={`${metric} Custom`}
                                                    onDragStart={() => {
                                                        // Create the block when dragging starts
                                                        const block = createDraggableBlock(metric);
                                                        // Store the block in the dataTransfer
                                                        const dataTransfer = (event as any).dataTransfer;
                                                        if (dataTransfer) {
                                                            dataTransfer.setData('application/json', JSON.stringify(block));
                                                        }
                                                    }}
                                                    disabled={isDisabled}
                                                    className={cn(
                                                        "w-full h-10",
                                                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                                    )}
                                                />
                                                {!isDisabled && (
                                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
} 