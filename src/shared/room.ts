import { type cardPackages, type CardPackagesTypes } from './cardPackage';

export interface Participant {
    isObserver: boolean;
    role: 'owner' | 'participant';
}

export interface RevealedRoomEntity extends RoomEntity {
    state: 'revealed';
}

export interface RoomEntity {
    options: RoomOptions;
    participants: Record<string, Participant>;
    state: 'revealed' | 'voting';
    votes: Record<string, VoteValue>;
}

export type RoomEventTypes =
    | 'closed'
    | 'join'
    | 'kick'
    | 'leave'
    | 'reset'
    | 'reveal'
    | 'update_participant'
    | 'vote';

export interface RoomOptions {
    allowVotesAfterReveal: boolean;
    cardPackage: CardPackagesTypes;
}

export type VoteValue = (typeof cardPackages)[CardPackagesTypes][number];

export interface VotingRoomEntity extends Omit<RoomEntity, 'votes'> {
    state: 'voting';
    votes: Record<string, null | VoteValue>;
}
