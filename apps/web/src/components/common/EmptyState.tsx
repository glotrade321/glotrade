import { ReactNode } from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: {
        label: string;
        href: string;
        variant?: "primary" | "outline";
    };
    className?: string;
}

export default function EmptyState({
    title = "No items found",
    description = "We couldn't find anything matching your criteria.",
    icon,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 ${className}`}>
            <div className="mb-4 p-4 rounded-full bg-white dark:bg-neutral-800 shadow-sm text-neutral-400 dark:text-neutral-500">
                {icon || <PackageOpen size={48} strokeWidth={1.5} />}
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 leading-relaxed">
                {description}
            </p>
            {action && (
                <Link
                    href={action.href}
                    className={`inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${action.variant === "outline"
                            ? "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            : "bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        }`}
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
