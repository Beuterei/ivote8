import { type RoomEntity } from '../../shared/room';
import { createServerOnlyFn } from '@tanstack/react-start';
import Redis from 'ioredis';

const ROOM_KEY_PREFIX = 'room:';

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number.parseInt(process.env.REDIS_PORT ?? '6379', 10),
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2_000);
        return delay;
    },
});

redis.on('error', (error) => {
    console.error('Redis connection error:', error);
});

class RoomStore {
    async createRoom(roomId: string, room: RoomEntity): Promise<void> {
        const key = await this.getRoomKey(roomId);
        await redis.set(key, JSON.stringify(room));
        await this.setRoomExpiration(key);
    }

    async deleteRoom(roomId: string): Promise<void> {
        const key = await this.getRoomKey(roomId);
        await redis.del(key);
    }

    async getRoom(roomId: string): Promise<null | RoomEntity> {
        const key = await this.getRoomKey(roomId);
        const roomData = await redis.get(key);

        if (!roomData) {
            return null;
        }

        return JSON.parse(roomData) as RoomEntity;
    }

    async saveRoom(roomId: string, room: RoomEntity): Promise<void> {
        const key = await this.getRoomKey(roomId);
        await redis.set(key, JSON.stringify(room));
        await this.setRoomExpiration(key);
    }

    private async getRoomKey(roomId: string): Promise<string> {
        return `${ROOM_KEY_PREFIX}${roomId}`;
    }

    private async setRoomExpiration(key: string): Promise<void> {
        await redis.expire(key, 60 * 60 * 6); // 6 Hours
    }
}

// Singleton instance
const roomStore = new RoomStore();

// Export as server-only function to prevent client-side usage
export const getRoomStore = createServerOnlyFn(() => roomStore);
