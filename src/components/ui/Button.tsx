import type { Icon } from '@phosphor-icons/react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cx } from '../../lib/cx'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'surface' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface StyleProps {
  variant?: Variant
  size?: Size
  icon?: Icon
  /** Renders only the icon; `children` becomes the accessible label. */
  iconOnly?: boolean
  block?: boolean
}

const iconSize: Record<Size, number> = { sm: 16, md: 20, lg: 24 }

function classesFor({ variant = 'primary', size = 'md', iconOnly, block }: StyleProps, className?: string) {
  return cx(styles.button, styles[variant], styles[size], iconOnly && styles.iconOnly, block && styles.block, className)
}

function Content({ icon: IconComponent, iconOnly, size = 'md', children }: StyleProps & { children?: ReactNode }) {
  return (
    <>
      {IconComponent && <IconComponent size={iconSize[size]} weight="bold" aria-hidden />}
      {iconOnly ? <span className="visually-hidden">{children}</span> : children}
    </>
  )
}

export type ButtonProps = StyleProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant, size, icon, iconOnly, block, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={classesFor({ variant, size, iconOnly, block }, className)}
      title={iconOnly && typeof children === 'string' ? children : undefined}
      {...rest}
    >
      <Content icon={icon} iconOnly={iconOnly} size={size}>
        {children}
      </Content>
    </button>
  )
}

export type ButtonLinkProps = StyleProps & LinkProps

export function ButtonLink({ variant, size, icon, iconOnly, block, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={classesFor({ variant, size, iconOnly, block }, className)} {...rest}>
      <Content icon={icon} iconOnly={iconOnly} size={size}>
        {children as ReactNode}
      </Content>
    </Link>
  )
}
