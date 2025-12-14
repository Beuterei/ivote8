export type ErrorCode =
    | 'KickSelfError'
    | 'NotOwnerError'
    | 'UserAlreadyInRoomError'
    | 'UserNotInRoomError'
    | 'VotingNotAllowedError';

export class BusinessError extends Error {
    errorCode: ErrorCode;

    statusCode: number;

    constructor(errorCode: ErrorCode, statusCode: number) {
        super(errorCode);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
}

export class KickSelfError extends BusinessError {
    constructor() {
        super('KickSelfError', 400);
    }
}

export class NotOwnerError extends BusinessError {
    constructor() {
        super('NotOwnerError', 403);
    }
}

export class UserAlreadyInRoomError extends BusinessError {
    constructor() {
        super('UserAlreadyInRoomError', 409);
    }
}

export class UserNotInRoomError extends BusinessError {
    constructor() {
        super('UserNotInRoomError', 404);
    }
}

export class VotingNotAllowedError extends BusinessError {
    constructor() {
        super('VotingNotAllowedError', 400);
    }
}
