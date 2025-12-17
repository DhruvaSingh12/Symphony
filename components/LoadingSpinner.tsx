"use client";

import { BounceLoader } from "react-spinners";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
    color?: string;
}

const LoadingSpinner = ({ className, size = 40, color }: LoadingSpinnerProps) => {
    return (
        <BounceLoader
            color={color}
            size={size}
            className={cn("text-foreground", className)}
        />
    );
};

export default LoadingSpinner;