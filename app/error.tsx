"use client";

import Box from "@/components/Box";
import { Button } from "@/components/ui/button";

const Error = ({
    error,
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) => {
    return (
        <Box className="h-full flex items-center justify-center">
            <div className="text-neutral-400 flex flex-col items-center gap-y-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Something went wrong!</h2>
                    <p className="text-neutral-500 mb-6 max-w-[400px]">
                        {error.message || "An unexpected error occurred while loading this page."}
                    </p>
                </div>
                <Button
                    onClick={() => reset()}
                    className="bg-white text-black hover:bg-neutral-200 px-8 py-2 rounded-full font-bold transition"
                >
                    Try again
                </Button>
            </div>
        </Box>
    );
}

export default Error;
