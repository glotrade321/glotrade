'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductManagersPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/managers?role=product_manager');
    }, [router]);

    return null;
}
