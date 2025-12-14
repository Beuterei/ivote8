import { createServerOnlyFn } from '@tanstack/react-start';
import { useSession } from '@tanstack/react-start/server';

export const useAppSession = async () =>
    await useSession<{ userId: string }>({
        cookie: {
            httpOnly: true, // XSS protection
            maxAge: 30 * 24 * 60 * 60, // 30 days
            sameSite: 'lax', // CSRF protection
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        },
        name: 'ivote8-session',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        password: process.env.SESSION_SECRET!,
    });

export const generateUserId = createServerOnlyFn(() => {
    return crypto.randomUUID();
});
