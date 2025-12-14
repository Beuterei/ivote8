import { type RoomEventTypes } from '../../shared/room';
import { createServerOnlyFn } from '@tanstack/react-start';

interface ClientConnection {
    controller: ReadableStreamDefaultController<string>;
    roomId: string;
    userId: string;
}

class RoomEventManager {
    private rooms: Map<string, Set<ClientConnection>> = new Map();

    /**
     * Add a client connection to a room
     */
    addClient(
        roomId: string,
        userId: string,
        controller: ReadableStreamDefaultController<string>,
    ): void {
        const connection: ClientConnection = {
            controller,
            roomId,
            userId,
        };

        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }

        const room = this.rooms.get(roomId);
        if (room) {
            room.add(connection);
        }
    }

    /**
     * Broadcast a message to all clients in a room
     */
    broadcastToRoom(
        roomId: string,
        eventType: RoomEventTypes,
        sourceUserId: string,
        payload?: unknown,
    ): void {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }

        const message = JSON.stringify({ eventType, payload, sourceUserId });
        const sseMessage = `data: ${message}\n\n`;

        const disconnectedClients: string[] = [];

        for (const connection of room) {
            try {
                connection.controller.enqueue(sseMessage);
            } catch {
                // Client disconnected, mark for removal
                disconnectedClients.push(connection.userId);
            }
        }

        // Clean up disconnected clients
        for (const userId of disconnectedClients) {
            this.removeClient(roomId, userId);
        }
    }

    /**
     * Remove a client connection from a room
     */
    removeClient(roomId: string, userId: string): void {
        const room = this.rooms.get(roomId);
        if (room) {
            for (const connection of room) {
                if (connection.userId === userId) {
                    room.delete(connection);
                    break;
                }
            }

            // Clean up empty rooms
            if (room.size === 0) {
                this.rooms.delete(roomId);
            }
        }
    }
}

const roomEventManager = new RoomEventManager();

export const getRoomEventManager = createServerOnlyFn(() => roomEventManager);

export const broadcastToRoom = createServerOnlyFn(
    (roomId: string, eventType: RoomEventTypes, sourceUserId: string, payload?: unknown): void => {
        roomEventManager.broadcastToRoom(roomId, eventType, sourceUserId, payload);
    },
);
