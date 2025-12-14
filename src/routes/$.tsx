import { Button } from '../components/ui/Button';
import { Separator } from '../components/ui/Separator';
import { m } from '../paraglide/messages';
import { createFileRoute, Link } from '@tanstack/react-router';

export const NotFound = () => (
    <div className="m-auto flex h-screen w-full items-center justify-center">
        <div className="flex flex-col space-y-8">
            <div className="flex">
                <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
                    404
                </h1>
                <div>
                    <Separator className="mx-8 h-full" orientation="vertical" />
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col space-y-1">
                        <div className="text-lg font-semibold">{m.not_found_title()}</div>
                        <p className="text-muted-foreground text-sm">{m.not_found_description()}</p>
                    </div>
                    <div className="flex space-x-4">
                        <Button asChild>
                            <Link to="/">{m.not_found_button()}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const Route = createFileRoute('/$')({
    component: () => <NotFound />,
});
