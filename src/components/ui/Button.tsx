'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { buttonVariants } from '@/components/shadcn/button';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md';

const VARIANT: Record<Variant, 'default' | 'outline' | 'ghost' | 'destructive'> = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
  success: 'default',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** The app's button: the shadcn button with the variant names the screens use. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant: VARIANT[variant], size: size === 'sm' ? 'sm' : 'lg' }),
        'font-semibold',
        size === 'md' && 'px-4',
        variant === 'success' && 'bg-success text-white hover:bg-success/85',
        className,
      )}
      {...props}
    />
  )
);

Button.displayName = 'Button';
