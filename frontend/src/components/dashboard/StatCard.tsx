import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
}

export const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  return (
    <Card className="flex items-center gap-4 p-4 transition-all hover:border-primary/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      {trend && (
        <div className="text-xs font-medium text-primary">{trend}</div>
      )}
    </Card>
  );
};
