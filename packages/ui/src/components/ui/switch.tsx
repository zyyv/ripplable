import * as React from 'react'

import { cn } from '../../lib/utils'

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: 'sm' | 'default'
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>((
  {
    checked,
    className,
    defaultChecked = false,
    disabled,
    onCheckedChange,
    onClick,
    size = 'default',
    type = 'button',
    ...props
  },
  ref,
) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isControlled = typeof checked === 'boolean'
  const isChecked = isControlled ? checked : internalChecked

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || disabled)
      return

    const nextChecked = !isChecked
    if (!isControlled)
      setInternalChecked(nextChecked)
    onCheckedChange?.(nextChecked)
  }

  return (
    <button
      ref={ref}
      aria-checked={isChecked}
      className={cn(
        'ui-switch',
        size === 'sm' ? 'ui-switch--sm' : 'ui-switch--default',
        isChecked && 'is-checked',
        disabled && 'is-disabled',
        className,
      )}
      disabled={disabled}
      role="switch"
      type={type}
      onClick={handleClick}
      {...props}
    >
      <span className="ui-switch__thumb" />
    </button>
  )
})

export { Switch }
