import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink/90 border border-ink shadow-sm disabled:bg-ink/50",
  secondary:
    "bg-mint text-ink hover:bg-mint/80 border border-moss/10 disabled:bg-mint/50",
  ghost: "bg-transparent text-ink hover:bg-ink/5 border border-transparent",
  danger:
    "bg-coral text-white hover:bg-coral/90 border border-coral disabled:bg-coral/50",
  outline:
    "bg-white/70 text-ink hover:bg-white border border-ink/15 disabled:bg-white/40"
};

const sizes: Record<Size, string> = {
  sm: "h-9 gap-2 rounded-md px-3 text-sm",
  md: "h-10 gap-2 rounded-md px-4 text-sm",
  icon: "h-10 w-10 rounded-md p-0"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: false;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  asChild: true;
};

export function Button(props: ButtonProps | LinkButtonProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const className = cn(
    "inline-flex shrink-0 items-center justify-center font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    props.className
  );

  if ("asChild" in props && props.asChild) {
    const { asChild, variant: _variant, size: _size, className: _className, ...rest } = props;
    return <Link className={className} {...rest} />;
  }

  const { variant: _variant, size: _size, className: _className, ...rest } = props;
  return <button className={className} {...rest} />;
}
