import type { ReactNode } from "react";

type StudioSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function StudioSection({
  eyebrow,
  title,
  description,
  aside,
  children,
  className = "",
}: StudioSectionProps) {
  const classes = ["studio-section", className]
    .filter(Boolean)
    .join(" ");

  const showHeading = eyebrow || title || description || aside;

  return (
    <section className={classes}>
      {showHeading && (
        <div className="studio-section__heading">
          <div>
            {eyebrow && (
              <p className="studio-section__eyebrow">
                {eyebrow}
              </p>
            )}

            {title && (
              <h2 className="studio-section__title">
                {title}
              </h2>
            )}

            {description && (
              <p className="studio-section__description">
                {description}
              </p>
            )}
          </div>

          {aside && (
            <div className="studio-section__aside">
              {aside}
            </div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}