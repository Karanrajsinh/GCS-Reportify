'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";

const sampleData = [
    {
        query: "next.js tutorial",
        clicks: 1250,
        impressions: 25000,
        ctr: 0.05,
        position: 2.3
    },
    {
        query: "react server components",
        clicks: 980,
        impressions: 18500,
        ctr: 0.053,
        position: 3.1
    },
    {
        query: "typescript best practices",
        clicks: 1500,
        impressions: 28000,
        ctr: 0.054,
        position: 1.8
    }
];

export function PreviewTable() {
    return (
        <div className="overflow-x-auto w-full">
            <Table className="max-w-[90vw] md:max-w-full">
                <TableHeader className="p-1 sm:p-2 lg:p-4">
                    <TableRow>
                        <TableHead className="border-x border-border whitespace-normal text-[10px] sm:text-xs lg:text-sm lg:min-w-[200px]">
                            Query
                        </TableHead>
                        <TableHead className="text-center border-x border-border text-[10px] sm:text-xs lg:text-sm lg:min-w-[120px]">
                            Clicks (L7D)
                        </TableHead>
                        <TableHead className="text-center border-x border-border text-[10px] sm:text-xs lg:text-sm lg:min-w-[120px]">
                            Impressions (L7D)
                        </TableHead>
                        <TableHead className="text-center border-x border-border text-[10px] sm:text-xs lg:text-sm lg:min-w-[120px]">
                            CTR (L7D)
                        </TableHead>
                        <TableHead className="text-center border-x border-border text-[10px] sm:text-xs lg:text-sm lg:min-w-[120px]">
                            Position (L7D)
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sampleData.map((row) => (
                        <TableRow key={row.query}>
                            <TableCell className="border-x border-border font-medium text-[10px] sm:text-xs lg:text-sm p-1 sm:p-2 lg:p-4 whitespace-normal lg:min-w-[200px]">
                                {row.query}
                            </TableCell>
                            <TableCell className="text-center border-x border-border text-[10px] sm:text-xs lg:text-sm p-1 sm:p-2 lg:p-4 lg:min-w-[120px]">
                                {row.clicks.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center border-x border-border text-[10px] sm:text-xs lg:text-sm p-1 sm:p-2 lg:p-4 lg:min-w-[120px]">
                                {row.impressions.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center border-x border-border text-[10px] sm:text-xs lg:text-sm p-1 sm:p-2 lg:p-4 lg:min-w-[120px]">
                                {(row.ctr * 100).toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-center border-x border-border text-[10px] sm:text-xs lg:text-sm p-1 sm:p-2 lg:p-4 lg:min-w-[120px]">
                                {row.position.toFixed(1)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}