import { Toaster } from '../components/ui/Sonner.js';
import { Spinner } from '../components/ui/Spinner.js';
import { getLocale } from '../paraglide/runtime.js';
import { getUserIdServer } from '../server/functions/session.js';
import appCss from '../styles.css?url';
import { NotFound } from './$.js';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { type QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { type PropsWithChildren, Suspense } from 'react';

const RootDocument = ({ children }: PropsWithChildren<{}>) => (
    <html lang={getLocale()}>
        <head>
            <HeadContent />
        </head>
        <body className="dark">
            <Toaster />
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-screen">
                        <Spinner />
                    </div>
                }
            >
                {children}
            </Suspense>
            <TanStackDevtools
                config={{
                    position: 'bottom-right',
                }}
                plugins={[
                    {
                        name: 'Tanstack Router',
                        render: <TanStackRouterDevtoolsPanel />,
                    },
                    {
                        name: 'Tanstack Query',
                        render: <ReactQueryDevtoolsPanel />,
                    },
                ]}
            />
            <Scripts />
        </body>
    </html>
);

interface RouterContext {
    queryClient: QueryClient;
    userId?: string;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    beforeLoad: async () => {
        const userId = await getUserIdServer();

        return { userId };
    },
    head: () => ({
        links: [
            {
                href: appCss,
                rel: 'stylesheet',
            },
        ],
        meta: [
            {
                // eslint-disable-next-line unicorn/text-encoding-identifier-case
                charSet: 'utf-8',
            },
            {
                content: 'width=device-width, initial-scale=1',
                name: 'viewport',
            },
            {
                title: 'iVote8 - Luis Beu',
            },
        ],
    }),
    notFoundComponent: NotFound,
    shellComponent: RootDocument,
});
