import { useEffect, useState } from "react";

interface FocusGaugeProps {
  score: number;
  status: "idle" | "active" | "paused";
}

export const FocusGauge = ({ score, status }: FocusGaugeProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (displayScore / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return "hsl(142 76% 36%)";
    if (score >= 60) return "hsl(189 94% 43%)";
    if (score >= 40) return "hsl(39 100% 57%)";
    return "hsl(340 82% 52%)";
  };

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "Focus Active";
      case "paused":
        return "Session Paused";
      default:
        return "Ready to Focus";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative h-64 w-64">
        <svg className="h-full w-full -rotate-90 transform">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r="90"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r="90"
            stroke={getScoreColor()}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
              filter: `drop-shadow(0 0 8px ${getScoreColor()})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-bold" style={{ color: getScoreColor() }}>
            {displayScore}
          </div>
          <div className="mt-2 text-sm font-medium text-muted-foreground">
            Focus Score
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium">{getStatusText()}</p>
        {status === "active" && (
          <p className="mt-1 text-sm text-muted-foreground">
            Stay focused to improve your score
          </p>
        )}
      </div>
    </div>
  );
};
