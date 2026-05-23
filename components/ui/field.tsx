import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-ink/80", className)}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm leading-5 text-ink shadow-sm outline-none transition placeholder:text-ink/35 focus:border-moss focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/45",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full min-w-0 resize-y rounded-md border border-ink/15 bg-white px-3 py-2 text-sm leading-6 text-ink shadow-sm outline-none transition placeholder:text-ink/35 focus:border-moss focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/45",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm leading-5 text-ink shadow-sm outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/45",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  children,
  hint
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-ink/50">{hint}</p> : null}
    </div>
  );
}
