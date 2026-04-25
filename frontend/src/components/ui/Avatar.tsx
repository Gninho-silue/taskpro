import { cn } from '../../lib/cn';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 28, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const fontSize = Math.round(size * 0.38);

  return (
    <div
      className={cn('rounded-full flex items-center justify-center text-white flex-shrink-0', className)}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #7c3aed, #10b981)',
        fontSize,
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  );
}
