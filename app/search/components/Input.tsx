import { forwardRef } from "react";
import { Input as UiInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
    return (
        <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <UiInput
                ref={ref}
                className={cn(
                    "w-full rounded-full bg-card text-foreground placeholder:text-muted-foreground pl-11",
                    "border border-border focus-visible:ring-2 focus-visible:ring-ring transition-all",
                    className
                )}
                {...props}
            />
        </div>
    );
});

Input.displayName = "Input";
export default Input;