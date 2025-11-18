import { motion } from 'motion/react';
import type { JSX } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AnimatedPillButtonProps extends ButtonProps {
  isActive?: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function AnimatedPillButton({
  isActive = false,
  className,
  activeClassName,
  inactiveClassName,
  variant,
  ...props
}: AnimatedPillButtonProps): JSX.Element {
  const finalVariant = variant ?? (isActive ? 'default' : 'outline');

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
    >
      <Button
        variant={finalVariant}
        className={cn(
          'rounded-full border-border/60 px-4 text-xs font-medium transition-shadow',
          isActive ? 'shadow-md shadow-primary/20' : 'bg-white/80',
          isActive ? activeClassName : inactiveClassName,
          className
        )}
        aria-pressed={isActive}
        {...props}
      />
    </motion.div>
  );
}
