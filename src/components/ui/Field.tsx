'use client';

import { cn } from '../../utils/ui';
import { Label } from './Label';
import { Separator } from './Separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, type ReactNode, useMemo } from 'react';

export const FieldSet = ({ className, ...props }: ComponentProps<'fieldset'>) => (
    <fieldset
        className={cn(
            'flex flex-col gap-6',
            'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
            className,
        )}
        data-slot="field-set"
        {...props}
    />
);

export const FieldLegend = ({
    className,
    variant = 'legend',
    ...props
}: ComponentProps<'legend'> & { readonly variant?: 'label' | 'legend' }) => (
    <legend
        className={cn(
            'mb-3 font-medium',
            'data-[variant=legend]:text-base',
            'data-[variant=label]:text-sm',
            className,
        )}
        data-slot="field-legend"
        data-variant={variant}
        {...props}
    />
);

export const FieldGroup = ({ className, ...props }: ComponentProps<'div'>) => (
    <div
        className={cn(
            'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
            className,
        )}
        data-slot="field-group"
        {...props}
    />
);

const fieldVariants = cva('group/field flex w-full gap-3 data-[invalid=true]:text-destructive', {
    defaultVariants: {
        orientation: 'vertical',
    },
    variants: {
        orientation: {
            horizontal: [
                'flex-row items-center',
                '[&>[data-slot=field-label]]:flex-auto',
                'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
            ],
            responsive: [
                'flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto',
                '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
                '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
            ],
            vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
        },
    },
});

export const Field = ({
    className,
    orientation = 'vertical',
    ...props
}: ComponentProps<'div'> & VariantProps<typeof fieldVariants>) => (
    <div
        className={cn(fieldVariants({ orientation }), className)}
        data-orientation={orientation}
        data-slot="field"
        role="group"
        {...props}
    />
);

export const FieldContent = ({ className, ...props }: ComponentProps<'div'>) => (
    <div
        className={cn('group/field-content flex flex-1 flex-col gap-1.5 leading-snug', className)}
        data-slot="field-content"
        {...props}
    />
);

export const FieldLabel = ({ className, ...props }: ComponentProps<typeof Label>) => (
    <Label
        className={cn(
            'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
            'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4',
            'has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10',
            className,
        )}
        data-slot="field-label"
        {...props}
    />
);

export const FieldTitle = ({ className, ...props }: ComponentProps<'div'>) => (
    <div
        className={cn(
            'flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50',
            className,
        )}
        data-slot="field-label"
        {...props}
    />
);

export const FieldDescription = ({ className, ...props }: ComponentProps<'p'>) => (
    <p
        className={cn(
            'text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance',
            'last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5',
            '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
            className,
        )}
        data-slot="field-description"
        {...props}
    />
);

export const FieldSeparator = ({
    children,
    className,
    ...props
}: ComponentProps<'div'> & {
    readonly children?: ReactNode;
}) => (
    <div
        className={cn(
            'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
            className,
        )}
        data-content={Boolean(children)}
        data-slot="field-separator"
        {...props}
    >
        <Separator className="absolute inset-0 top-1/2" />
        {children && (
            <span
                className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
                data-slot="field-separator-content"
            >
                {children}
            </span>
        )}
    </div>
);

export const FieldError = ({
    children,
    className,
    errors,
    ...props
}: ComponentProps<'div'> & {
    readonly errors?: Array<undefined | { message?: string }>;
}) => {
    const content = useMemo(async () => {
        if (children) {
            return await children;
        }

        if (!errors?.length) {
            return null;
        }

        const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

        if (uniqueErrors?.length === 1) {
            return uniqueErrors[0]?.message;
        }

        return (
            <ul className="ml-4 flex list-disc flex-col gap-1">
                {uniqueErrors.map(
                    // eslint-disable-next-line react/no-array-index-key
                    (error, index) => error?.message && <li key={index}>{error.message}</li>,
                )}
            </ul>
        );
    }, [children, errors]);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if (!content) {
        return null;
    }

    return (
        <div
            className={cn('text-destructive text-sm font-normal', className)}
            data-slot="field-error"
            role="alert"
            {...props}
        >
            {content}
        </div>
    );
};
