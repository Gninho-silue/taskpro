import { cn } from '../../lib/cn';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md';
}

const variantStyles = {
  primary: 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] border-transparent',
  ghost: 'bg-transparent border-[#1e1e3a] text-[#6b6b8a] hover:border-[#2a2a48] hover:text-[#e8e8f0]',
  danger: 'bg-[#ef444422] border-[#ef444444] text-[#ef4444] hover:bg-[#ef444433]',
  success: 'bg-[#10b98122] border-[#10b98144] text-[#10b981] hover:bg-[#10b98133]',
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-[12px]',
  md: 'px-5 py-2.5 text-[13px]',
};

export function Button({ variant = 'ghost', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[8px] border font-semibold transition-all cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
