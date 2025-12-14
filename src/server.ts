import { paraglideMiddleware } from './paraglide/server.js';
import handler from '@tanstack/react-start/server-entry';

export default {
    async fetch(request: Request): Promise<Response> {
        return await paraglideMiddleware(
            request,
            async ({ request: innerRequest }) => await handler.fetch(innerRequest),
        );
    },
};
