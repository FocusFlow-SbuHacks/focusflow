import { Button } from "@/components/ui/button";
import { Pause, Play, Square } from "lucide-react";

interface PomodoroTimerProps {
  timeLeft: number;
  isRunning: boolean;
  onPause: () => void;
  onEnd: () => void;
}

export const PomodoroTimer = ({
  timeLeft,
  isRunning,
  onPause,
  onEnd,
}: PomodoroTimerProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const circumference = 2 * Math.PI * 120;
  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative h-80 w-80">
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            cx="160"
            cy="160"
            r="120"
            stroke="hsl(var(--muted))"
            strokeWidth="16"
            fill="none"
          />
          <circle
            cx="160"
            cy="160"
            r="120"
            stroke="hsl(var(--primary))"
            strokeWidth="16"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s linear",
              filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.5))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-7xl font-bold text-primary">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div className="mt-2 text-sm font-medium text-muted-foreground">
            {isRunning ? "Time Remaining" : "Paused"}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onPause}
          variant={isRunning ? "secondary" : "default"}
          className="gap-2"
          size="lg"
        >
          {isRunning ? (
            <>
              <Pause className="h-5 w-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Resume
            </>
          )}
        </Button>
        <Button onClick={onEnd} variant="outline" className="gap-2" size="lg">
          <Square className="h-5 w-5" />
          End Session
        </Button>
      </div>
    </div>
  );
};
