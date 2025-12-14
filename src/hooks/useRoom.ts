import { m } from '../paraglide/messages';
import {
    getRoomServer,
    kickParticipantServer,
    leaveRoomServer,
    resetRoomServer,
    revealRoomServer,
    toggleObserverServer,
    voteServer,
} from '../server/functions/room';
import { type BusinessError, type ErrorCode } from '../shared/errors';
import { type RoomEventTypes } from '../shared/room';
import { parseServerError } from '../utils/errorHelpers';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useEffect } from 'react';
import { toast } from 'sonner';

const ERROR_MESSAGES: Record<ErrorCode, { description: () => string; title: () => string }> = {
    KickSelfError: {
        description: () => m.error_kick_self_description(),
        title: () => m.error_kick_self_title(),
    },
    NotOwnerError: {
        description: () => m.error_not_owner_description(),
        title: () => m.error_not_owner_title(),
    },
    UserAlreadyInRoomError: {
        description: () => m.error_user_already_in_room_description(),
        title: () => m.error_user_already_in_room_title(),
    },
    UserNotInRoomError: {
        description: () => m.error_user_not_in_room_description(),
        title: () => m.error_user_not_in_room_title(),
    },
    VotingNotAllowedError: {
        description: () => m.error_voting_not_allowed_description(),
        title: () => m.error_voting_not_allowed_title(),
    },
};

const handleMutationError = (error: Error) => {
    const parsedError = parseServerError(error);
    const businessError = parsedError as BusinessError;

    if (businessError.errorCode && ERROR_MESSAGES[businessError.errorCode]) {
        const { description, title } = ERROR_MESSAGES[businessError.errorCode];
        toast.error(title(), { description: description() });
        return;
    }

    toast.error(m.error_unexpected_title(), {
        description: m.error_unexpected_description(),
    });
};

export const useRoom = (roomId: string) => {
    const { queryClient, userId } = useRouteContext({ from: '/$roomId' });
    const navigate = useNavigate();

    const getRoom = useServerFn(getRoomServer);
    const vote = useServerFn(voteServer);
    const leaveRoom = useServerFn(leaveRoomServer);
    const kickParticipant = useServerFn(kickParticipantServer);
    const revealRoom = useServerFn(revealRoomServer);
    const resetRoom = useServerFn(resetRoomServer);
    const toggleObserver = useServerFn(toggleObserverServer);

    const roomQueryKey = ['room', roomId];

    const { data: room } = useSuspenseQuery({
        queryFn: async () => await getRoom({ data: { roomId } }),
        queryKey: roomQueryKey,
    });

    const { mutate: voteMutation } = useMutation({
        mutationFn: vote,
        onError: handleMutationError,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: roomQueryKey });
        },
    });

    const { mutate: leaveMutation } = useMutation({
        mutationFn: leaveRoom,
        onError: handleMutationError,
    });

    const { mutate: kickMutation } = useMutation({
        mutationFn: kickParticipant,
        onError: handleMutationError,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: roomQueryKey });
        },
    });

    const { mutate: revealMutation } = useMutation({
        mutationFn: revealRoom,
        onError: handleMutationError,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: roomQueryKey });
        },
    });

    const { mutate: resetMutation } = useMutation({
        mutationFn: resetRoom,
        onError: handleMutationError,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: roomQueryKey });
        },
    });

    const { mutate: toggleObserverMutation } = useMutation({
        mutationFn: toggleObserver,
        onError: handleMutationError,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: roomQueryKey });
        },
    });

    useEffect(() => {
        const eventSource = new EventSource(`/api/${roomId}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data) as {
                eventType: RoomEventTypes;
                payload?: { kickedUserId?: string };
                sourceUserId: string;
            };

            if (data.eventType === 'kick' && data.payload?.kickedUserId === userId) {
                void navigate({ to: '/' });
                return;
            }

            if (data.sourceUserId === userId) {
                return;
            }

            switch (data.eventType) {
                case 'closed':
                    void navigate({ to: '/' });
                    break;

                case 'join':
                case 'kick':
                case 'leave':
                case 'reset':
                case 'reveal':
                case 'update_participant':
                case 'vote':
                    void queryClient.invalidateQueries({ queryKey: roomQueryKey });
                    break;

                default:
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
            toast.error(m.error_connection_lost_title(), {
                description: m.error_connection_lost_description(),
            });
        };

        return () => {
            eventSource.close();
        };
    }, [roomId, queryClient, userId, roomQueryKey]);

    return {
        kick: kickMutation,
        leave: leaveMutation,
        reset: resetMutation,
        reveal: revealMutation,
        room,
        toggleObserver: toggleObserverMutation,
        vote: voteMutation,
    };
};
