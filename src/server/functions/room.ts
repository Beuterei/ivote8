import {
    KickSelfError,
    NotOwnerError,
    UserNotInRoomError,
    VotingNotAllowedError,
} from '../../shared/errors';
import {
    type RevealedRoomEntity,
    type RoomEntity,
    type VoteValue,
    type VotingRoomEntity,
} from '../../shared/room';
import { temporaryRedirectMiddleware } from '../middlewares/redirect';
import { refreshUserId } from '../middlewares/session';
import {
    addParticipant,
    castVote,
    createRoom,
    generateRoomId,
    removeParticipant,
    setRoomState,
    toggleObserverStatus,
} from '../utils/room';
import { broadcastToRoom } from '../utils/roomEventManager';
import { getRoomStore } from '../utils/roomStore';
import { withErrorHandling } from '../utils/withErrorHandling';
import { notFound, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const checkAndPerformAutoReveal = async (
    room: RoomEntity,
    roomId: string,
    sourceUserId: string,
): Promise<boolean> => {
    if (room.state !== 'voting') {
        return false;
    }

    const eligibleVoters = Object.values(room.participants).filter(
        (participant) => !participant.isObserver,
    );
    const voteCount = Object.keys(room.votes).length;

    if (eligibleVoters.length > 0 && eligibleVoters.length === voteCount) {
        const updatedRoom = setRoomState(room, 'revealed');
        const roomStore = getRoomStore();
        await roomStore.saveRoom(roomId, updatedRoom);
        broadcastToRoom(roomId, 'reveal', sourceUserId);
        return true;
    }

    return false;
};

export const createRoomServer = createServerFn()
    .middleware([temporaryRedirectMiddleware, refreshUserId])
    .inputValidator((data: { roomOptions: RoomEntity['options'] }) => data)
    .handler(
        withErrorHandling(async ({ context, data }) => {
            const roomStore = getRoomStore();
            const room = createRoom(data.roomOptions, context.userId);
            let roomId = generateRoomId();

            while (await roomStore.getRoom(roomId)) {
                roomId = generateRoomId();
            }

            await roomStore.createRoom(roomId, room);

            throw redirect({ params: { roomId }, to: '/$roomId' });
        }),
    );

export const getRoomServer = createServerFn()
    .middleware([temporaryRedirectMiddleware, refreshUserId])
    .inputValidator((data: { roomId: string }) => data)
    .handler(
        withErrorHandling(
            async ({ context, data }): Promise<RevealedRoomEntity | VotingRoomEntity> => {
                const roomStore = getRoomStore();
                let room = await roomStore.getRoom(data.roomId);

                if (!room) {
                    throw notFound();
                }

                if (!room.participants[context.userId]) {
                    room = addParticipant(room, context.userId);

                    await roomStore.saveRoom(data.roomId, room);

                    broadcastToRoom(data.roomId, 'join', context.userId);
                }

                if (room.state === 'revealed') {
                    return room;
                }

                // If room is voting, we need to anonymize the votes
                return {
                    ...room,
                    state: 'voting',
                    votes: Object.fromEntries(
                        Object.entries(room.votes).map(([participantId, vote]) => [
                            participantId,
                            context.userId === participantId ? vote : null,
                        ]),
                    ),
                };
            },
        ),
    );

export const leaveRoomServer = createServerFn()
    .middleware([temporaryRedirectMiddleware, refreshUserId])
    .inputValidator((data: { roomId: string }) => data)
    .handler(
        withErrorHandling(async ({ context, data }) => {
            const roomStore = getRoomStore();

            let room = await roomStore.getRoom(data.roomId);
            if (!room) {
                throw notFound();
            }

            if (!room.participants[context.userId]) {
                throw new UserNotInRoomError();
            }

            if (room.participants[context.userId].role === 'owner') {
                await roomStore.deleteRoom(data.roomId);
                broadcastToRoom(data.roomId, 'closed', context.userId);
            } else {
                room = removeParticipant(room, context.userId);
                await roomStore.saveRoom(data.roomId, room);

                broadcastToRoom(data.roomId, 'leave', context.userId);

                await checkAndPerformAutoReveal(room, data.roomId, context.userId);
            }

            throw redirect({ to: '/' });
        }),
    );

export const voteServer = createServerFn()
    .middleware([temporaryRedirectMiddleware, refreshUserId])
    .inputValidator((data: { roomId: string; vote: VoteValue }) => data)
    .handler(
        withErrorHandling(async ({ context, data }) => {
            const roomStore = getRoomStore();

            let room = await roomStore.getRoom(data.roomId);

            if (!room) {
                throw notFound();
            }

            if (room.state === 'revealed' && !room.options.allowVotesAfterReveal) {
                throw new VotingNotAllowedError();
            }

            room = castVote(room, context.userId, data.vote);
            await roomStore.saveRoom(data.roomId, room);

            const revealed = await checkAndPerformAutoReveal(room, data.roomId, context.userId);

            if (!revealed) {
                broadcastToRoom(data.roomId, 'vote', context.userId);
            }
        }),
    );

export const kickParticipantServer = createServerFn()
    .middleware([temporaryRedirectMiddleware, refreshUserId])
    .inputValidator((data: { participantId: string; roomId: string }) => data)
    .handler(
        withErrorHandling(async ({ context, data }) => {
            const roomStore = getRoomStore();
            let room = await roomStore.getRoom(data.roomId);

            if (!room) {
                throw notFound();
            }

            if (room.participants[context.userId]?.role !== 'owner') {
                throw new NotOwnerError();
            }

            if (data.participantId === context.userId) {
                throw new KickSelfError();
            }

            if (!room.participants[data.participantId]) {
                throw new UserNotInRoomError();
            }

            room = removeParticipant(room, data.participantId);
            await roomStore.saveRoom(data.roomId, room);

            broadcastToRoom(data.roomId, 'kick', context.userId, {
                kickedUserId: data.participantId,
            });

            await checkAndPerformAutoReveal(room, data.roomId, context.userId);
        }),
    );

export const revealRoomServer = createServerFn()
    .middleware([temporaryRedirectMiddleware, refreshUserId])
    .inputValidator((data: { roomId: string }) => data)
    .handler(
        withErrorHandling(async ({ context, data }) => {
            const roomStore = getRoomStore();
            let room = await roomStore.getRoom(data.roomId);

            if (!room) {
                throw notFound();
            }

            if (room.participants[context.userId]?.role !== 'owner') {
                throw new NotOwnerError();
            }

            room = setRoomState(room, 'revealed');
            await roomStore.saveRoom(data.roomId, room);

            broadcastToRoom(data.roomId, 'reveal', context.userId);
        }),
    );

export const resetRoomServer = createServerFn()
    .middleware([temporaryRedirectMiddleware, refreshUserId])
    .inputValidator((data: { roomId: string }) => data)
    .handler(
        withErrorHandling(async ({ context, data }) => {
            const roomStore = getRoomStore();
            let room = await roomStore.getRoom(data.roomId);

            if (!room) {
                throw notFound();
            }

            if (room.participants[context.userId]?.role !== 'owner') {
                throw new NotOwnerError();
            }

            room = setRoomState(room, 'voting');
            await roomStore.saveRoom(data.roomId, room);

            broadcastToRoom(data.roomId, 'reset', context.userId);
        }),
    );

export const toggleObserverServer = createServerFn()
    .middleware([temporaryRedirectMiddleware, refreshUserId])
    .inputValidator((data: { roomId: string }) => data)
    .handler(
        withErrorHandling(async ({ context, data }) => {
            const roomStore = getRoomStore();
            let room = await roomStore.getRoom(data.roomId);

            if (!room) {
                throw notFound();
            }

            room = toggleObserverStatus(room, context.userId);
            await roomStore.saveRoom(data.roomId, room);

            broadcastToRoom(data.roomId, 'update_participant', context.userId);

            await checkAndPerformAutoReveal(room, data.roomId, context.userId);
        }),
    );
