"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminGuardProps {
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * AdminGuard - Restricts access to admin/superAdmin users only
 * Redirects non-admin users to home page
 */
export default function AdminGuard({ children, redirectTo = "/" }: AdminGuardProps) {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAdminAccess = () => {
            try {
                const raw = localStorage.getItem("afritrade:user");
                if (!raw) {
                    router.push(redirectTo);
                    return;
                }

                const user = JSON.parse(raw);
                const userRole = user?.role?.toLowerCase();
                const isSuperAdmin = user?.isSuperAdmin === true;

                // Only allow admin, superAdmin, or manager roles
                if (userRole === "admin" || userRole === "superadmin" || userRole === "product_manager" || userRole === "order_manager" || userRole === "insured_partners_manager" || userRole === "bazaar_manager" || isSuperAdmin) {
                    setIsAdmin(true);
                    setIsChecking(false);
                } else {
                    // Redirect non-admin users
                    router.push(redirectTo);
                }
            } catch {
                router.push(redirectTo);
            }
        };

        checkAdminAccess();
    }, [router, redirectTo]);

    // Show loading while checking access
    if (isChecking) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Only render children if user is admin
    return isAdmin ? <>{children}</> : null;
}
