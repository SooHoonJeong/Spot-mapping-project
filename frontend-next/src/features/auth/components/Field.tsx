import type { InputHTMLAttributes } from "react";

export function Field({
  id,
  label,
  className,
  ...inputProps
}: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={`h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:bg-muted ${className ?? ""}`}
        {...inputProps}
      />
    </div>
  );
}
