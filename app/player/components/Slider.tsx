"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import React from "react";

interface SliderProps {
    value?: number;
    onChange?: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
    value = 1,
    onChange
}) => {
    const handleChange = (newValue: number[]) => {
        onChange?.(newValue[0]);
    }

    return (
        <RadixSlider.Root
            className="relative flex items-center w-full h-10 touch-none select-none"
            defaultValue={[value]}
            onValueChange={handleChange}
            max={1}
            step={0.01}
            aria-label="Volume"
        >
            <RadixSlider.Track
                className="relative flex-grow bg-neutral-600 rounded-full h-[3px]"
            >
                <RadixSlider.Range
                    className="absolute bg-violet-500 rounded-full h-full"
                />
            </RadixSlider.Track>
        </RadixSlider.Root>
    );
}

export default Slider;
