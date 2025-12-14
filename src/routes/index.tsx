import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
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
import { Field, FieldError, FieldGroup, FieldLabel } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/Select';
import { Separator } from '../components/ui/Separator';
import { m } from '../paraglide/messages';
import { createRoomServer } from '../server/functions/room';
import { cardPackages, type CardPackagesTypes } from '../shared/cardPackage';
import { type RoomEntity } from '../shared/room';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    allowVotesAfterReveal: z.boolean(),
    cardPackage: z.enum(Object.keys(cardPackages) as [CardPackagesTypes, ...CardPackagesTypes[]]),
});

const defaultValues: RoomEntity['options'] = {
    allowVotesAfterReveal: true,
    cardPackage: 'mountainGoat',
};

const getCardPackageName = (pkg: string): string => {
    const translationKey =
        `card_package_${pkg.replaceAll(/([A-Z])/gu, '_$1').toLowerCase()}` as keyof typeof m;
    return (m[translationKey] as () => string)?.() ?? pkg;
};

const JoinOrCreateRoomPage = () => {
    const navigate = useNavigate();
    const [joinRoomId, setJoinRoomId] = useState('');
    const createRoom = useServerFn(createRoomServer);

    const { isPending, mutate } = useMutation({
        mutationFn: createRoom,
        onError: () => {
            toast.error(m.home_failed_to_create_room(), {
                description: m.home_failed_to_create_room_description(),
            });
        },
    });

    const form = useForm({
        defaultValues,
        onSubmit: async () => {
            mutate({ data: { roomOptions: form.state.values } });
        },
        validators: {
            onSubmit: formSchema,
        },
    });

    const handleJoinRoom = () => {
        const roomId = joinRoomId.trim();

        if (!roomId) {
            return;
        }

        void navigate({ params: { roomId }, to: '/$roomId' });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
            <h1 className="text-4xl font-bold tracking-tight">{m.home_app_title()}</h1>

            <Card className="w-full max-w-md bg-background">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle>{m.home_start_voting()}</CardTitle>
                    <CardDescription>{m.home_start_voting_description()}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full" size="lg">
                                {m.home_create_new_room()}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{m.home_create_new_room()}</DialogTitle>
                                <DialogDescription>
                                    {m.home_create_new_room_description()}
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                className="space-y-4 py-4"
                                id="create-room-form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void form.handleSubmit();
                                }}
                            >
                                <FieldGroup>
                                    <form.Field name="cardPackage">
                                        {(field) => (
                                            <Field>
                                                <FieldLabel>{m.home_card_package()}</FieldLabel>
                                                <Select
                                                    defaultValue={field.state.value}
                                                    onValueChange={(value) =>
                                                        field.handleChange(
                                                            value as CardPackagesTypes,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={m.home_select_card_package()}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.keys(cardPackages).map((pkg) => (
                                                            <SelectItem key={pkg} value={pkg}>
                                                                {getCardPackageName(pkg)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {field.state.meta.isTouched &&
                                                field.state.meta.errors.length ? (
                                                    <FieldError errors={field.state.meta.errors} />
                                                ) : null}
                                            </Field>
                                        )}
                                    </form.Field>
                                </FieldGroup>

                                <FieldGroup>
                                    <form.Field name="allowVotesAfterReveal">
                                        {(field) => (
                                            <Field orientation="horizontal">
                                                <Checkbox
                                                    checked={field.state.value}
                                                    id={field.name}
                                                    onCheckedChange={(checked) =>
                                                        field.handleChange(Boolean(checked))
                                                    }
                                                />
                                                <FieldLabel
                                                    className="font-normal"
                                                    htmlFor={field.name}
                                                >
                                                    {m.home_allow_votes_after_reveal()}
                                                </FieldLabel>
                                            </Field>
                                        )}
                                    </form.Field>
                                </FieldGroup>
                            </form>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        onClick={() => form.reset()}
                                        type="button"
                                        variant="outline"
                                    >
                                        {m.common_cancel()}
                                    </Button>
                                </DialogClose>
                                <Button disabled={isPending} form="create-room-form" type="submit">
                                    {m.common_create_room()}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                {m.home_or_join_with_code()}
                            </span>
                        </div>
                    </div>

                    <Input
                        onChange={(event) => setJoinRoomId(event.target.value)}
                        placeholder={m.home_enter_room_id()}
                        value={joinRoomId}
                    />

                    <Button
                        className="w-full"
                        disabled={!joinRoomId.trim()}
                        onClick={handleJoinRoom}
                        size="lg"
                        type="submit"
                        variant="outline"
                    >
                        {m.home_join_room()}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export const Route = createFileRoute('/')({
    component: JoinOrCreateRoomPage,
});
