import { generateUserId, useAppSession } from '../utils/session';
import { createServerFn } from '@tanstack/react-start';

export const getUserIdServer = createServerFn().handler(async () => {
    const session = await useAppSession();

    const userId = session.data.userId;

    if (!userId) {
        const newUserId = generateUserId();
        await session.update({ userId: newUserId });
        return newUserId;
    }

    return userId;
});
