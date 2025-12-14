import {
    type BusinessError,
    type ErrorCode,
    KickSelfError,
    NotOwnerError,
    UserAlreadyInRoomError,
    UserNotInRoomError,
    VotingNotAllowedError,
} from '../shared/errors';

/**
 * Tries to parse a server error into a specific BusinessError class instance.
 * This allows using `instanceof` checks on the client side.
 */
export const parseServerError = (error: Error): BusinessError | Error => {
    try {
        const parsed = JSON.parse(error.message) as {
            errorCode: ErrorCode;
        };

        if (parsed?.errorCode) {
            switch (parsed.errorCode) {
                case 'KickSelfError':
                    return new KickSelfError();
                case 'NotOwnerError':
                    return new NotOwnerError();
                case 'UserAlreadyInRoomError':
                    return new UserAlreadyInRoomError();
                case 'UserNotInRoomError':
                    return new UserNotInRoomError();
                case 'VotingNotAllowedError':
                    return new VotingNotAllowedError();
                default:
                    return error;
            }
        }

        return error;
    } catch {
        return error;
    }
};
