import { BusinessError } from '../../shared/errors';

export const withErrorHandling =
    <TInput, TContext, TOutput>(
        function_: (context: { context: TContext; data: TInput }) => Promise<TOutput>,
    ) =>
    async (payload: { context: TContext; data: TInput }): Promise<TOutput> => {
        try {
            return await function_(payload);
        } catch (error) {
            if (error instanceof BusinessError) {
                throw Response.json(
                    {
                        errorCode: error.errorCode,
                    },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        status: error.statusCode,
                    },
                );
            }

            throw error;
        }
    };
