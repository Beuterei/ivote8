import { type CardPackagesTypes } from '../shared/cardPackage';
import { type VoteValue } from '../shared/room';

export const calculateAverage = (
    votes: VoteValue[],
    pack: CardPackagesTypes,
): null | number | string => {
    if (votes.length === 0) {
        return null;
    }

    switch (pack) {
        case 'mountainGoat': {
            const numericVotes = votes.filter(
                (value): value is Extract<VoteValue, number> => typeof value === 'number',
            );

            if (numericVotes.length === 0) {
                return null;
            }

            const sum = numericVotes.reduce<number>(
                (accumulator, current) => accumulator + current,
                0,
            );
            return sum / numericVotes.length;
        }

        default:
            return null;
    }
};
