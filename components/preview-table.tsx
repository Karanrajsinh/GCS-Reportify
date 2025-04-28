'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        <Table>
            <TableHeader className="p-4">
                <TableRow>
                    <TableHead className="min-w-[200px] border-x border-border">Query</TableHead>
                    <TableHead className="text-center text-xs min-w-[150px] border-x border-border">Clicks (L7D)</TableHead>
                    <TableHead className="text-center text-xs min-w-[150px] border-x border-border">Impressions (L7D)</TableHead>
                    <TableHead className="text-center text-xs min-w-[150px] border-x border-border">CTR (L7D)</TableHead>
                    <TableHead className="text-center text-xs min-w-[150px] border-x border-border">Position (L7D)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sampleData.map((row) => (
                    <TableRow key={row.query}>
                        <TableCell className="border-x border-border font-medium">{row.query}</TableCell>
                        <TableCell className="text-center border-x border-border">{row.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-center border-x border-border">{row.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-center border-x border-border">{(row.ctr * 100).toFixed(2)}%</TableCell>
                        <TableCell className="text-center border-x border-border">{row.position.toFixed(1)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}