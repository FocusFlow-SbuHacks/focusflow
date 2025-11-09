import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";

interface SessionControlsProps {
  status: "idle" | "active" | "paused";
  onStart: () => void;
  onPause: () => void;
  onEnd: () => void;
}

export const SessionControls = ({
  status,
  onStart,
  onPause,
  onEnd,
}: SessionControlsProps) => {
  return (
    <div className="flex gap-3">
      {status === "idle" && (
        <Button
          onClick={onStart}
          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          <Play className="h-5 w-5" />
          Start Focus Session
        </Button>
      )}

      {status === "active" && (
        <>
          <Button
            onClick={onPause}
            variant="secondary"
            className="flex-1 gap-2"
            size="lg"
          >
            <Pause className="h-5 w-5" />
            Pause
          </Button>
          <Button
            onClick={onEnd}
            variant="outline"
            className="flex-1 gap-2"
            size="lg"
          >
            <Square className="h-5 w-5" />
            End Session
          </Button>
        </>
      )}

      {status === "paused" && (
        <>
          <Button
            onClick={onStart}
            className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <Play className="h-5 w-5" />
            Resume
          </Button>
          <Button
            onClick={onEnd}
            variant="outline"
            className="flex-1 gap-2"
            size="lg"
          >
            <Square className="h-5 w-5" />
            End Session
          </Button>
        </>
      )}
    </div>
  );
};
