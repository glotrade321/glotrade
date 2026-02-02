"use client";

import { RefreshCcw, AlertTriangle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                <div className="min-h-screen flex items-center justify-center bg-white px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-orange-50 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-orange-500" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                            Critical System Error
                        </h1>

                        <p className="text-neutral-600 mb-8">
                            A critical error occurred while loading the application shell.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    // For ChunkLoadErrors, force a full refresh as reset() might not be enough
                                    if (error.name === "ChunkLoadError" || error.message?.includes("Loading chunk")) {
                                        window.location.reload();
                                    } else {
                                        reset();
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-neutral-800 transition-all shadow-lg"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Attempt Recovery
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
