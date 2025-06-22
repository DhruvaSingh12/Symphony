import { FaPlay } from "react-icons/fa";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface PlayButtonProps {
  onClick: () => void;
  className?: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({onClick, className}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "transition-all opacity-0 rounded-full bg-foreground p-4 drop-shadow-md",
        "translate-y-1/4 group-hover:opacity-100 group-hover:translate-y-0",
        "hover:scale-110 hover:bg-foreground/90",
        className
      )}
    >
      <FaPlay className="h-4 w-4 text-background" />
    </Button>
  );
};

export default PlayButton;
