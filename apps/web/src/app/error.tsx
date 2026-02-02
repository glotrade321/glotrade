"use client";

import { useEffect } from "react";
import { RefreshCcw, AlertTriangle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error("Application error:", error);

        // If it's a ChunkLoadError, it's likely due to a new deployment.
        // Automatically reload the page to get the latest chunks.
        if (
            error.name === "ChunkLoadError" ||
            error.message?.includes("Loading chunk") ||
            error.message?.includes("Failed to fetch dynamically imported module")
        ) {
            console.log("ChunkLoadError detected. Reloading page...");
            window.location.reload();
        }
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-orange-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    Something went wrong
                </h1>

                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                    An unexpected error occurred while loading the application. This might be due to a poor connection or a recent update.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => reset()}
                        className="w-full flex items-center justify-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black py-3 px-6 rounded-xl font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-lg shadow-neutral-200 dark:shadow-none"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try again
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                    >
                        Refresh full page
                    </button>
                </div>

                <div className="mt-12 text-xs text-neutral-400 dark:text-neutral-500">
                    Error: {error.digest || error.message || "Unknown error"}
                </div>
            </div>
        </div>
    );
}
