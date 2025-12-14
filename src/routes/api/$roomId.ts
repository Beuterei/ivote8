import { refreshUserId } from '../../server/middlewares/session';
import { getRoomEventManager } from '../../server/utils/roomEventManager';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/$roomId')({
    server: {
        handlers: {
            GET: async ({ context, params, request }) => {
                const { roomId } = params;

                const userId = context.userId;

                const stream = new ReadableStream<string>({
                    start(controller) {
                        const roomEventManager = getRoomEventManager();
                        roomEventManager.addClient(roomId, userId, controller);

                        // Handle client disconnect
                        request.signal.addEventListener('abort', () => {
                            roomEventManager.removeClient(roomId, userId);
                            try {
                                controller.close();
                            } catch {
                                // Controller may already be closed
                            }
                        });
                    },
                });

                return new Response(stream, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        Connection: 'keep-alive',
                        'Content-Type': 'text/event-stream',
                        'X-Accel-Buffering': 'no',
                    },
                });
            },
        },
        middleware: [refreshUserId],
    },
});
