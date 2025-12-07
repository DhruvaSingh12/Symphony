import { forwardRef } from "react";
import { Input as UiInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
    return (
        <UiInput
            ref={ref}
            className={cn(
                "w-full rounded-full bg-card text-foreground placeholder:text-muted-foreground",
                "border border-border focus-visible:ring-2 focus-visible:ring-ring",
                className
            )}
            {...props}
        />
    );
});

Input.displayName = "Input";
export default Input;