import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, LineChart, PieChart, FileBarChart } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "chart" | "pie" | "line";
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = "chart",
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="gap-2 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          {icon === "chart" && <BarChart3 className="h-10 w-10 text-muted-foreground" />}
          {icon === "pie" && <PieChart className="h-10 w-10 text-muted-foreground" />}
          {icon === "line" && <LineChart className="h-10 w-10 text-muted-foreground" />}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {action}
      </CardContent>
    </Card>
  );
}