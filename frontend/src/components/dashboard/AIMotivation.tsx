import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

const motivationalMessages = [
  "Your focus today is outstanding! Keep up the momentum.",
  "Every focused minute is a step toward your goals.",
  "You're in the zone. Let's make this session count!",
  "Great work! Your consistency is building success.",
  "Focus is your superpower. Use it wisely today.",
];

interface AIMotivationProps {
  message?: string;
  voiceUrl?: string;
}

export const AIMotivation = ({ message, voiceUrl }: AIMotivationProps) => {
  const displayMessage = message || motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoice = () => {
    if (voiceUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(voiceUrl);
      audioRef.current = audio;
      audio.play().catch(err => {
        console.error("Error playing audio:", err);
        toast.error("Could not play voice message");
      });
    } else {
      toast.info("No voice message available");
    }
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/50 p-6">
      <div className="absolute right-4 top-4">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-primary">AI Motivation</h3>
          <p className="text-sm leading-relaxed text-foreground">{message}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayVoice}
          className="w-full gap-2"
        >
          <Volume2 className="h-4 w-4" />
          Play Voice
        </Button>
      </div>
    </Card>
  );
};
