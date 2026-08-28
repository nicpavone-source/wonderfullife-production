import type { ReactNode } from "react";

type ProductBodyProps = {
  body: string;
};

function renderInlineFormatting(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={`${part}-${index}`}
          style={{
            color: "#173d29",
            fontWeight: 800,
          }}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export default function ProductBody({
  body,
}: ProductBodyProps) {
  const lines = body
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  return (
    <div
      className="product-body"
      style={{
        color: "#405047",
        fontSize: "17px",
        lineHeight: 1.8,
      }}
    >
      {lines.map((line, index) => {
        if (!line) {
          return (
            <div
              key={`space-${index}`}
              className="product-body-spacer"
              style={{ height: "14px" }}
            />
          );
        }

        if (line === "---") {
          return (
            <hr
              key={`divider-${index}`}
              className="product-body-divider"
              style={{
                margin: "30px 0",
                border: 0,
                borderTop: "1px solid #dfe6dd",
              }}
            />
          );
        }

        if (line.startsWith("### ")) {
          return (
            <h3
              key={`heading-${index}`}
              className="product-body-h3"
              style={{
                margin: "28px 0 12px",
                color: "#173d29",
                fontSize: "23px",
                lineHeight: 1.3,
              }}
            >
              {renderInlineFormatting(line.slice(4))}
            </h3>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h2
              key={`heading-${index}`}
              className="product-body-h2"
              style={{
                margin: "32px 0 14px",
                color: "#173d29",
                fontSize: "28px",
                lineHeight: 1.25,
              }}
            >
              {renderInlineFormatting(line.slice(3))}
            </h2>
          );
        }

        if (line.startsWith("# ")) {
          return (
            <h2
              key={`heading-${index}`}
              className="product-body-h2"
              style={{
                margin: "34px 0 16px",
                color: "#173d29",
                fontSize: "31px",
                lineHeight: 1.2,
              }}
            >
              {renderInlineFormatting(line.slice(2))}
            </h2>
          );
        }

        if (
          line.startsWith("- ") ||
          line.startsWith("* ")
        ) {
          const bulletText = line.slice(2).trim();

          return (
            <div
              key={`bullet-${index}`}
              className="product-body-bullet"
              style={{
                display: "grid",
                gridTemplateColumns: "24px minmax(0, 1fr)",
                gap: "8px",
                margin: "9px 0",
                padding: "11px 14px",
                border: "1px solid #e4ebe2",
                borderRadius: "10px",
                background: "#f9fbf8",
              }}
            >
              <span
                aria-hidden="true"
                className="product-body-bullet-check"
                style={{
                  color: "#23633d",
                  fontWeight: 900,
                }}
              >
                ✓
              </span>

              <div>{renderInlineFormatting(bulletText)}</div>
            </div>
          );
        }

        return (
          <p
            key={`paragraph-${index}`}
            className="product-body-paragraph"
            style={{
              margin: "0 0 14px",
            }}
          >
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}