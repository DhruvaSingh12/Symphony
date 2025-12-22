import { toast } from "react-hot-toast";

export interface AppError {
    message: string;
    details?: unknown;
    code?: string;
}

export const handleError = (error: unknown, customMessage?: string) => {
    console.error("Application Error:", error);

    const message = customMessage || 
        (typeof error === 'string' ? error : (error as any)?.message) || 
        "An unexpected error occurred. Please try again.";

    toast.error(message);

    return {
        message,
        originalError: error
    };
};

export const handleAsync = async <T>(
    promise: Promise<T>,
    customMessage?: string
): Promise<[T | null, unknown]> => {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        handleError(error, customMessage);
        return [null, error];
    }
};