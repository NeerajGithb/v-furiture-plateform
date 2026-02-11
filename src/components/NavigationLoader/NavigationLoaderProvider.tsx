'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { navigationLoader } from './navigationLoader';

function NavigationLoaderContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        navigationLoader.complete();
    }, [pathname, searchParams]);

    return <>{children}</>;
}

export const NavigationLoaderProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <Suspense fallback={<>{children}</>}>
            <NavigationLoaderContent>{children}</NavigationLoaderContent>
        </Suspense>
    );
};
