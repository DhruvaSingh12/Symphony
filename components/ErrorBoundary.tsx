"use client";

import React from "react";
import Box from "./Box";
import { Button } from "./ui/button";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box className="h-full flex items-center justify-center">
                    <div className="text-neutral-400 flex flex-col items-center gap-y-4">
                        <h2 className="text-2xl font-bold">Something went wrong</h2>
                        <p className="text-sm">{this.state.error?.message}</p>
                        <Button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="bg-white text-black hover:bg-neutral-200"
                        >
                            Try again
                        </Button>
                    </div>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;