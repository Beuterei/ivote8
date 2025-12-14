import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/Dialog';
import { useRoom } from '../hooks/useRoom';
import { m } from '../paraglide/messages';
import { cardPackages } from '../shared/cardPackage';
import { cn } from '../utils/ui';
import { calculateAverage } from '../utils/voteUtils';
import { createFileRoute, useParams, useRouteContext } from '@tanstack/react-router';
import { Check, Copy, Eye, EyeOff, Glasses, LogOut, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';

const RoomPage = () => {
    // Route context
    const { roomId } = useParams({ from: '/$roomId' });
    const { userId } = useRouteContext({ from: '/$roomId' });

    // Custom hook for room logic
    const { kick, leave, reset, reveal, room, toggleObserver, vote } = useRoom(roomId);

    // State
    const [copied, setCopied] = useState(false);

    const isOwner = room.participants[userId]?.role === 'owner';
    const isObserver = room.participants[userId]?.isObserver;

    const copyToClipboard = () => {
        void navigator.clipboard.writeText(window.location.href);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2_000);
    };

    const handleLeaveRoom = () => {
        leave({ data: { roomId } });
    };

    const confirmLeaveRoom = () => {
        leave({ data: { roomId } });
    };

    const handleKick = (participantId: string) => {
        kick({ data: { participantId, roomId } });
    };

    const handleReveal = () => {
        reveal({ data: { roomId } });
    };

    const handleReset = () => {
        reset({ data: { roomId } });
    };

    const handleToggleObserver = () => {
        toggleObserver({ data: { roomId } });
    };

    const selectedPack = cardPackages[room.options.cardPackage];
    const userVote = room.votes[userId];
    const votingParticipants = Object.entries(room.participants).filter(
        ([_, participant]) => !participant.isObserver,
    );

    const average =
        room.state === 'revealed'
            ? calculateAverage(Object.values(room.votes), room.options.cardPackage)
            : null;

    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{m.room_label({ roomId })}</h1>
                    <Button onClick={copyToClipboard} size="icon" variant="ghost">
                        {copied ? (
                            <Check className="text-green-800 dark:text-green-500" />
                        ) : (
                            <Copy />
                        )}
                    </Button>
                    {average !== null && (
                        <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            <span>{m.room_average()}</span>
                            <span className="font-semibold text-foreground">
                                {typeof average === 'number'
                                    ? Number.isInteger(average)
                                        ? average
                                        : average.toFixed(1)
                                    : average}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isOwner && room.state === 'voting' && (
                        <Button
                            onClick={handleReveal}
                            size="icon"
                            title={m.room_reveal_votes()}
                            variant="ghost"
                        >
                            <Eye />
                        </Button>
                    )}
                    {isOwner && room.state === 'revealed' && (
                        <Button
                            onClick={handleReset}
                            size="icon"
                            title={m.room_reset_room()}
                            variant="ghost"
                        >
                            <RotateCcw />
                        </Button>
                    )}
                    <Button
                        onClick={handleToggleObserver}
                        size="icon"
                        title={isObserver ? m.room_become_participant() : m.room_become_observer()}
                        variant={isObserver ? 'default' : 'ghost'}
                    >
                        <Glasses />
                    </Button>
                    {isOwner ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="icon" title={m.room_leave_room()} variant="ghost">
                                    <LogOut />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{m.room_close_room()}</DialogTitle>
                                    <DialogDescription>
                                        {m.room_close_room_description()}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">{m.common_cancel()}</Button>
                                    </DialogClose>
                                    <Button onClick={confirmLeaveRoom} variant="destructive">
                                        {m.room_close_room()}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Button
                            onClick={handleLeaveRoom}
                            size="icon"
                            title={m.room_leave_room()}
                            variant="ghost"
                        >
                            <LogOut />
                        </Button>
                    )}
                </div>
            </header>
            <div className="flex-1 p-4">
                <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto p-4 flex-nowrap justify-start md:flex-wrap md:justify-center">
                    {votingParticipants.map(([participantId]) => {
                        const voteValue = room.votes[participantId];
                        const hasVoted = voteValue !== undefined;

                        return (
                            <Card
                                className={cn(
                                    'group flex aspect-2/3 w-18 shrink-0 items-center justify-center relative',
                                    !hasVoted && 'border-dashed',
                                )}
                                key={participantId}
                            >
                                {isOwner && participantId !== userId && (
                                    <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            className="h-6 w-6"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleKick(participantId);
                                            }}
                                            size="icon"
                                            title={m.room_kick_user()}
                                            variant="destructive"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                <CardContent
                                    className={cn(
                                        'flex items-center justify-center p-0',
                                        !hasVoted && 'opacity-50',
                                    )}
                                >
                                    {hasVoted ? (
                                        voteValue === null ? (
                                            <EyeOff className="h-6 w-6 " />
                                        ) : (
                                            <span className="text-2xl font-bold">{voteValue}</span>
                                        )
                                    ) : null}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {!isObserver && (
                <div className="fixed bottom-0 left-0 right-0 p-8">
                    <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto p-4 flex-nowrap justify-start md:flex-wrap md:justify-center">
                        {selectedPack.map((value) => {
                            const isSelected = userVote === value;
                            return (
                                <Card
                                    className={cn(
                                        'flex aspect-2/3 w-18 shrink-0 cursor-pointer items-center justify-center transition-all duration-300 hover:-translate-y-3',
                                        isSelected && 'border-primary',
                                    )}
                                    key={value}
                                    onClick={() => vote({ data: { roomId, vote: value } })}
                                >
                                    <CardContent className="flex items-center justify-center p-0">
                                        <span className="text-2xl font-bold">{value}</span>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const Route = createFileRoute('/$roomId')({
    component: RoomPage,
});
