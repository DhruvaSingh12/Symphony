"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlayButtonProps {
  onClick: () => void;
  className?: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({ onClick, className }) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      size="icon"
      className={cn(
        "transition opacity-0 rounded-full bg-primary text-primary-foreground shadow-lg",
        "translate-y-1/4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110",
        "h-12 w-12",
        className
      )}
      aria-label="Play"
    >
      <Play className="h-5 w-5 fill-current" />
    </Button>
  );
};

export default PlayButton;
