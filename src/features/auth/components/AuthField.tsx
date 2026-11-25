import type { InputHTMLAttributes } from 'react'

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function AuthField({ id, label, ...props }: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray4">
        {label}
      </label>
      <input
        id={id}
        className="h-13 w-full rounded-lg border border-gray2 bg-white px-4 text-[15px] text-black outline-none transition placeholder:text-gray3 focus:border-main focus:ring-3 focus:ring-main/10 disabled:bg-gray1"
        {...props}
      />
    </div>
  )
}
