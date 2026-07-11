'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefix?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, prefix, suffix, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && <span className="pointer-events-none absolute left-4 text-[15px] text-subtle">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'field',
            prefix && 'pl-11',
            suffix && 'pr-11',
            error && 'border-danger focus:border-danger',
            className,
          )}
          {...props}
        />
        {suffix && <span className="pointer-events-none absolute right-4 text-[15px] text-subtle">{suffix}</span>}
      </div>
      {error ? (
        <p className="mt-1.5 text-[12px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-subtle">{hint}</p>
      ) : null}
    </div>
  )
})
