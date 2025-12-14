import { cn } from '../../utils/ui';
import { Root } from '@radix-ui/react-separator';
import { type ComponentProps } from 'react';

export const Separator = ({
    className,
    decorative = true,
    orientation = 'horizontal',
    ...props
}: ComponentProps<typeof Root>) => (
    <Root
        className={cn(
            'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
            className,
        )}
        data-slot="separator"
        decorative={decorative}
        orientation={orientation}
        {...props}
    />
);
