import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface SessionSummaryProps {
  score: number;
  task?: string;
  duration?: number;
  idleTime?: number;
  aiMessage?: string;
}

export const SessionSummary = ({ score, task, duration, idleTime, aiMessage }: SessionSummaryProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatIdleTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold">Session Summary</h3>
            <div className="mt-2 space-y-1 text-sm">
              {task && (
                <p className="text-foreground">
                  <span className="font-medium">Task:</span> {task}
                </p>
              )}
              {duration && (
                <p className="text-foreground">
                  <span className="font-medium">Duration:</span> {formatDuration(duration)}
                </p>
              )}
              <p className="text-foreground">
                <span className="font-medium">Average Focus:</span>{" "}
                <span className="font-bold text-primary">{score}%</span>
              </p>
              {idleTime !== undefined && (
                <p className="text-foreground">
                  <span className="font-medium">Idle Time:</span> {formatIdleTime(idleTime)}
                </p>
              )}
            </div>
          </div>
          {aiMessage && (
            <div className="pt-2 border-t border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">AI Feedback:</p>
              <p className="text-sm text-foreground">"{aiMessage}"</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
