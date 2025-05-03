'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { DraggableBlock } from './DraggableBlock';
import { useReportConfig } from '@/contexts/report-config-context';
import { Calendar } from '@/app/components/ui/calendar';
import { Button } from '@/app/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Metric } from '@/lib/types';
import { ScrollArea } from '@/app/components/ui/scroll-area';

export function MetricsSidebar() {
    const { reportBlocks } = useReportConfig();
    const [activeId, setActiveId] = useState<string | null>(null);

    const availableBlocks = [
        // Last 7 days blocks
        {
            id: 'clicks_l7d',
            type: 'metric',
            metric: 'clicks' as Metric,
            timeRange: 'last7days'
        },
        {
            id: 'impressions_l7d',
            type: 'metric',
            metric: 'impressions' as Metric,
            timeRange: 'last7days'
        },
        {
            id: 'ctr_l7d',
            type: 'metric',
            metric: 'ctr' as Metric,
            timeRange: 'last7days'
        },
        {
            id: 'position_l7d',
            type: 'metric',
            metric: 'position' as Metric,
            timeRange: 'last7days'
        },
        // Last 28 days blocks
        {
            id: 'clicks_l28d',
            type: 'metric',
            metric: 'clicks' as Metric,
            timeRange: 'last28days'
        },
        {
            id: 'impressions_l28d',
            type: 'metric',
            metric: 'impressions' as Metric,
            timeRange: 'last28days'
        },
        {
            id: 'ctr_l28d',
            type: 'metric',
            metric: 'ctr' as Metric,
            timeRange: 'last28days'
        },
        {
            id: 'position_l28d',
            type: 'metric',
            metric: 'position' as Metric,
            timeRange: 'last28days'
        },
        // Last 3 months blocks
        {
            id: 'clicks_l3m',
            type: 'metric',
            metric: 'clicks' as Metric,
            timeRange: 'last3months'
        },
        {
            id: 'impressions_l3m',
            type: 'metric',
            metric: 'impressions' as Metric,
            timeRange: 'last3months'
        },
        {
            id: 'ctr_l3m',
            type: 'metric',
            metric: 'ctr' as Metric,
            timeRange: 'last3months'
        },
        {
            id: 'position_l3m',
            type: 'metric',
            metric: 'position' as Metric,
            timeRange: 'last3months'
        }
    ];

    // Custom time range metrics
    const metrics: Metric[] = ['clicks', 'impressions', 'ctr', 'position'];
    const [dateRanges, setDateRanges] = useState<Record<Metric, { startDate: Date; endDate: Date }>>({
        clicks: { startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 1)) },
        impressions: { startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 1)) },
        ctr: { startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 1)) },
        position: { startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 1)) }
    });

    // Group blocks by time range
    const groupedBlocks = availableBlocks.reduce((acc, block) => {
        if (block.type === 'metric' && 'timeRange' in block) {
            const timeRange = block.timeRange as string;
            if (!acc[timeRange]) {
                acc[timeRange] = [];
            }
            acc[timeRange].push(block);
        }
        return acc;
    }, {} as Record<string, typeof availableBlocks>);

    // Format time range labels
    const timeRangeLabels: Record<string, string> = {
        'last7days': 'L7D',
        'last28days': 'L28D',
        'last3months': 'L3M'
    };

    // Format metric labels
    const metricLabels: Record<string, string> = {
        'clicks': 'Clicks',
        'impressions': 'Impressions',
        'ctr': 'CTR',
        'position': 'Position'
    };

    const isBlockInTable = (block: any) => {
        return reportBlocks.some(existingBlock => {
            if (block.type === 'metric' && existingBlock.type === 'metric') {
                return existingBlock.metric === block.metric &&
                    existingBlock.timeRange === block.timeRange;
            }
            return false;
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

    const isMetricInTable = (metric: Metric) => {
        return reportBlocks.some(block =>
            block.type === 'metric' &&
            block.metric === metric &&
            'timeRange' in block &&
            typeof block.timeRange === 'object'
        );
    };

    return (
        <div className="h-full flex flex-col bg-background border-r border-border">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Metrics</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {/* Predefined time range metrics */}
                    {Object.entries(groupedBlocks).map(([timeRange, blocks]) => (
                        <div key={timeRange} className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                {timeRangeLabels[timeRange]}
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {blocks.map((block) => {
                                    const isDisabled = isBlockInTable(block);
                                    return (
                                        <div
                                            key={block.id}
                                            draggable={!isDisabled}
                                            onDragStart={(e) => {
                                                if (!isDisabled) {
                                                    e.dataTransfer.setData('text/plain', block.id);
                                                    setActiveId(block.id);
                                                }
                                            }}
                                            className={`p-3 border rounded-lg ${isDisabled
                                                ? 'opacity-50 cursor-not-allowed bg-muted'
                                                : 'cursor-move hover:border-primary transition-colors'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">
                                                        {block.type === 'metric' && 'metric' in block
                                                            ? metricLabels[block.metric]
                                                            : ''}
                                                    </h3>
                                                </div>
                                                <Plus className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Custom time range metrics */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Custom Time Range</h3>
                        <div className="space-y-4">
                            {metrics.map((metric) => {
                                const isDisabled = isMetricInTable(metric);
                                return (
                                    <Card key={metric} className="overflow-hidden border-none shadow-none">
                                        <CardContent className="p-3">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium capitalize">{metric}</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'w-full justify-start text-left font-normal text-sm',
                                                                    !dateRanges[metric].startDate && 'text-muted-foreground'
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {dateRanges[metric].startDate ? format(dateRanges[metric].startDate, 'PPP') : <span>Start date</span>}
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
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'w-full justify-start text-left font-normal text-sm',
                                                                    !dateRanges[metric].endDate && 'text-muted-foreground'
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {dateRanges[metric].endDate ? format(dateRanges[metric].endDate, 'PPP') : <span>End date</span>}
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
                                                    <div className="relative">
                                                        <DraggableBlock
                                                            id={`${metric}_custom_${Date.now()}`}
                                                            name={`${metric} Custom`}
                                                            onDragStart={(e: any) => {
                                                                if (!isDisabled) {
                                                                    const block = createDraggableBlock(metric);
                                                                    e.dataTransfer.setData('application/json', JSON.stringify(block));
                                                                    setActiveId(block.id);
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
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
