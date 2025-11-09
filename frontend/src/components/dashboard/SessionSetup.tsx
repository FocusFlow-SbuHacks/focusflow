import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play } from "lucide-react";

interface SessionSetupProps {
  onStart: (config: {
    task: string;
    duration: number;
    mood: string;
  }) => void;
}

export const SessionSetup = ({ onStart }: SessionSetupProps) => {
  const [task, setTask] = useState("");
  const [duration, setDuration] = useState("25");
  const [mood, setMood] = useState("😊");

  const handleStart = () => {
    if (!task.trim()) {
      return;
    }
    onStart({
      task: task.trim(),
      duration: parseInt(duration),
      mood,
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Start Focus Session</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set up your session to track your focus effectively
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task">What are you focusing on?</Label>
          <Input
            id="task"
            placeholder="e.g., Java practice, Exam revision, Assignment writing"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Session duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger id="duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mood">Mood before session</Label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger id="mood">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="😊">😊 Feeling good</SelectItem>
              <SelectItem value="😐">😐 Neutral</SelectItem>
              <SelectItem value="😞">😞 Tired/Struggling</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleStart}
          className="w-full gap-2"
          size="lg"
          disabled={!task.trim()}
        >
          <Play className="h-5 w-5" />
          Start Session
        </Button>
      </div>
    </Card>
  );
};

