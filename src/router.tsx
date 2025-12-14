import { routeTree } from './routeTree.gen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { type PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export const getRouter = () => {
    const router = createRouter({
        context: { queryClient },
        defaultPreload: 'intent',
        routeTree,
        Wrap: ({ children }: PropsWithChildren<{}>) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
    });

    setupRouterSsrQueryIntegration({ queryClient, router });

    return router;
};
