import { type RoomEntity, type VoteValue } from '../../shared/room';

export const generateRoomId = (): string => {
    return Math.floor(10_000 + Math.random() * 90_000).toString();
};

export const createRoom = (options: RoomEntity['options'], ownerUserId: string): RoomEntity => {
    return {
        options,
        participants: {
            [ownerUserId]: {
                isObserver: false,
                role: 'owner',
            },
        },
        state: 'voting',
        votes: {},
    };
};

export const addParticipant = (room: RoomEntity, userId: string): RoomEntity => {
    if (room.participants[userId]) {
        return room;
    }

    room.participants[userId] = {
        isObserver: false,
        role: 'participant',
    };

    return room;
};

export const removeParticipant = (room: RoomEntity, userId: string): RoomEntity => {
    if (!room.participants[userId]) {
        return room;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [userId]: removed, ...remainingParticipants } = room.participants;
    room.participants = remainingParticipants;

    if (room.votes[userId] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [userId]: removedVote, ...remainingVotes } = room.votes;
        room.votes = remainingVotes as Record<string, VoteValue>;
    }

    return room;
};

export const castVote = (room: RoomEntity, userId: string, vote: VoteValue): RoomEntity => {
    room.votes[userId] = vote;
    return room;
};

export const toggleObserverStatus = (room: RoomEntity, userId: string): RoomEntity => {
    if (!room.participants[userId]) {
        return room;
    }

    const isObserver = room.participants[userId].isObserver;
    room.participants[userId].isObserver = !isObserver;

    if (room.participants[userId].isObserver) {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
        const { [userId]: _, ...restVotes } = room.votes;
        room.votes = restVotes as Record<string, VoteValue>;
    }

    return room;
};

export const setRoomState = (room: RoomEntity, state: RoomEntity['state']): RoomEntity => {
    room.state = state;

    if (state === 'voting') {
        room.votes = {};
    }

    return room;
};
