import { generateUserId, useAppSession } from '../utils/session';
import { createMiddleware } from '@tanstack/react-start';

export const refreshUserId = createMiddleware().server(async ({ next }) => {
    const session = await useAppSession();
    let userId = session.data.userId;

    userId ??= generateUserId();

    // Always update to refresh the session max age
    await session.update({ userId });

    return await next({ context: { userId } });
});
