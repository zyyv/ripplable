import * as React from 'react'

import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const badgeClassByVariant: Record<BadgeVariant, string> = {
  default: 'ui-badge--default',
  secondary: 'ui-badge--secondary',
  destructive: 'ui-badge--destructive',
  outline: 'ui-badge--outline',
  ghost: 'ui-badge--ghost',
  link: 'ui-badge--link',
}

function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn('ui-badge', badgeClassByVariant[variant], className)}
      {...props}
    />
  )
}

export { Badge }
