import React from 'react';
import { cn } from '../lib/utils';

export function Card({ className, ...props }) {
  return <div className={cn('rounded-3xl border border-border bg-card text-card-foreground shadow-sm', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function Badge({ className, ...props }) {
  return <span className={cn('inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground', className)} {...props} />;
}

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:opacity-95',
    outline: 'border border-border bg-white hover:bg-slate-50',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-slate-100',
    ghost: 'hover:bg-slate-100'
  };
  const sizes = {
    default: 'h-11 px-5 py-2',
    sm: 'h-9 px-3',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10'
  };
  return (
    <button
      ref={ref}
      className={cn('inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export function Input({ className, ...props }) {
  return <input className={cn('flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)} {...props} />;
}

export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium', className)} {...props} />;
}

export function Switch({ checked, onCheckedChange }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn('relative inline-flex h-7 w-12 items-center rounded-full transition', checked ? 'bg-primary' : 'bg-slate-300')}
    >
      <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white transition', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}
