import type {
  HTMLAttributes,
  ReactNode,
} from "react";

type StudioCardPadding = "none" | "small" | "medium" | "large";

type StudioCardProps = {
  children: ReactNode;
  interactive?: boolean;
  padding?: StudioCardPadding;
  className?: string;
} & HTMLAttributes<HTMLElement>;

export default function StudioCard({
  children,
  interactive = false,
  padding = "medium",
  className = "",
  ...props
}: StudioCardProps) {
  const classes = [
    "studio-card",
    interactive ? "studio-card--interactive" : "",
    `studio-card--padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}