import { isRedirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';

// Temporary middleware to fix: https://github.com/TanStack/router/issues/4460. Remove when fixed.
// Needs to be first middleware
export const temporaryRedirectMiddleware = createMiddleware({ type: 'function' }).server(
    async ({ next }) => {
        const result = await next();
        if ('error' in result && isRedirect(result.error)) {
            throw result.error;
        }

        return result;
    },
);
