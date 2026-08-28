import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type StudioButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type StudioButtonSize = "small" | "medium" | "large";

type StudioButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: StudioButtonVariant;
  size?: StudioButtonSize;
  fullWidth?: boolean;
  mobileFullWidth?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function StudioButton({
  children,
  href,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  mobileFullWidth = false,
  className = "",
  type = "button",
  ...buttonProps
}: StudioButtonProps) {
  const classes = [
    "studio-button",
    `studio-button--${variant}`,
    size !== "medium" ? `studio-button--${size}` : "",
    fullWidth ? "studio-button--full" : "",
    mobileFullWidth ? "studio-button--mobile-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}