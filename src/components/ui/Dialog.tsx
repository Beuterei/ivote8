'use client';

import { cn } from '../../utils/ui';
import {
    Close,
    Content,
    Description,
    Overlay,
    Portal,
    Root,
    Title,
    Trigger,
} from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { type ComponentProps } from 'react';

export const Dialog = ({ ...props }: ComponentProps<typeof Root>) => (
    <Root data-slot="dialog" {...props} />
);

export const DialogTrigger = ({ ...props }: ComponentProps<typeof Trigger>) => (
    <Trigger data-slot="dialog-trigger" {...props} />
);

export const DialogPortal = ({ ...props }: ComponentProps<typeof Portal>) => (
    <Portal data-slot="dialog-portal" {...props} />
);

export const DialogClose = ({ ...props }: ComponentProps<typeof Close>) => (
    <Close data-slot="dialog-close" {...props} />
);

export const DialogOverlay = ({ className, ...props }: ComponentProps<typeof Overlay>) => (
    <Overlay
        className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
            className,
        )}
        data-slot="dialog-overlay"
        {...props}
    />
);

export const DialogContent = ({
    children,
    className,
    showCloseButton = true,
    ...props
}: ComponentProps<typeof Content> & {
    readonly showCloseButton?: boolean;
}) => (
    <DialogPortal data-slot="dialog-portal">
        <DialogOverlay />
        <Content
            className={cn(
                'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
                className,
            )}
            data-slot="dialog-content"
            {...props}
        >
            {children}
            {showCloseButton && (
                <Close
                    className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer"
                    data-slot="dialog-close"
                >
                    <XIcon />
                    <span className="sr-only">Close</span>
                </Close>
            )}
        </Content>
    </DialogPortal>
);

export const DialogHeader = ({ className, ...props }: ComponentProps<'div'>) => (
    <div
        className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
        data-slot="dialog-header"
        {...props}
    />
);

export const DialogFooter = ({ className, ...props }: ComponentProps<'div'>) => (
    <div
        className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
        data-slot="dialog-footer"
        {...props}
    />
);

export const DialogTitle = ({ className, ...props }: ComponentProps<typeof Title>) => (
    <Title
        className={cn('text-lg leading-none font-semibold', className)}
        data-slot="dialog-title"
        {...props}
    />
);

export const DialogDescription = ({ className, ...props }: ComponentProps<typeof Description>) => (
    <Description
        className={cn('text-muted-foreground text-sm', className)}
        data-slot="dialog-description"
        {...props}
    />
);
