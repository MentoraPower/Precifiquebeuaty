import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'sm'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90 disabled:bg-ink/40',
  secondary: 'bg-surface text-ink border border-line hover:bg-line/40',
  outline: 'bg-bg text-ink border border-line hover:bg-surface',
  ghost: 'bg-transparent text-ink hover:bg-line/40',
  danger: 'bg-danger text-white hover:bg-danger/90',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] rounded-btn',
  md: 'h-11 px-5 text-[14px] rounded-btn',
  lg: 'h-14 px-6 text-[15px] rounded-btn',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold outline-none transition focus:outline-none focus-visible:outline-none active:scale-[0.99] disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})
