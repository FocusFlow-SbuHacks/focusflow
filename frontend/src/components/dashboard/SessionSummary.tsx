import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface SessionSummaryProps {
  score: number;
}

export const SessionSummary = ({ score }: SessionSummaryProps) => {
  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold">Session Complete!</h3>
          <p className="text-foreground">
            You stayed focused for <span className="font-bold text-primary">{score}%</span> of the time.
          </p>
          <p className="text-sm text-muted-foreground">
            Great work! Keep up the momentum.
          </p>
        </div>
      </div>
    </Card>
  );
};
