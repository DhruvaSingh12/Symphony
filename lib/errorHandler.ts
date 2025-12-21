import { toast } from "react-hot-toast";

export interface AppError {
    message: string;
    details?: any;
    code?: string;
}

export const handleError = (error: any, customMessage?: string) => {
    console.error("Application Error:", error);

    const message = customMessage || 
        (typeof error === 'string' ? error : error?.message) || 
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
): Promise<[T | null, any]> => {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        handleError(error, customMessage);
        return [null, error];
    }
};