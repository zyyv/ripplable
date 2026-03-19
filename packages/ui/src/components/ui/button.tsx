import * as React from 'react'

import { cn } from '../../lib/utils'

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const buttonClassByVariant: Record<ButtonVariant, string> = {
  default: 'ui-button--default',
  outline: 'ui-button--outline',
  secondary: 'ui-button--secondary',
  ghost: 'ui-button--ghost',
  destructive: 'ui-button--destructive',
  link: 'ui-button--link',
}

const buttonClassBySize: Record<ButtonSize, string> = {
  'default': 'ui-button--default-size',
  'xs': 'ui-button--xs',
  'sm': 'ui-button--sm',
  'lg': 'ui-button--lg',
  'icon': 'ui-button--icon',
  'icon-xs': 'ui-button--icon-xs',
  'icon-sm': 'ui-button--icon-sm',
  'icon-lg': 'ui-button--icon-lg',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((
  {
    className,
    type = 'button',
    variant = 'default',
    size = 'default',
    ...props
  },
  ref,
) => {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'ui-button',
        buttonClassByVariant[variant],
        buttonClassBySize[size],
        className,
      )}
      {...props}
    />
  )
})

export { Button }
