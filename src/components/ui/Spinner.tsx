import { cn } from '../../utils/ui';
import { Loader2Icon } from 'lucide-react';
import { type ComponentProps } from 'react';

export const Spinner = ({ className, ...props }: ComponentProps<'svg'>) => (
    <Loader2Icon
        aria-label="Loading"
        className={cn('size-4 animate-spin', className)}
        role="status"
        {...props}
    />
);
