
"use client";

import {
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import InlineImageUpload from "./InlineImageUpload";

type RichTextEditorProps = {
  initialContent?: string;
};

const green = "#286f45";
const dark = "#264d35";
const border = "#dbe4da";

function cleanInline(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

// Preserve structured content copied from Gemini, ChatGPT, and websites.
function htmlToMarkdown(html: string): string {
  if (!html.trim()) return "";

  const documentNode = new DOMParser().parseFromString(
    html,
    "text/html"
  );

  function inlineMarkdown(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (!(node instanceof HTMLElement)) return "";

    const tag = node.tagName.toLowerCase();

    if (tag === "br") return "\n";

    if (tag === "img") {
      const src = node.getAttribute("src") || "";
      const alt = node.getAttribute("alt") || "Image";
      return src ? `![${alt}](${src})` : "";
    }

    const children = Array.from(node.childNodes)
      .map(inlineMarkdown)
      .join("");

    if (tag === "strong" || tag === "b") {
      return children.trim()
        ? `**${children.trim()}**`
        : "";
    }

    if (tag === "em" || tag === "i") {
      return children.trim()
        ? `*${children.trim()}*`
        : "";
    }

    if (tag === "a") {
      const label = children.trim();
      const href = node.getAttribute("href") || "";

      return label && href
        ? `[${label}](${href})`
        : label;
    }

    if (tag === "code") {
      return children.trim()
        ? `\`${children.trim()}\``
        : "";
    }

    return children;
  }

  function blockMarkdown(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return cleanInline(node.textContent || "");
    }

    if (!(node instanceof HTMLElement)) return "";

    const tag = node.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      const hashes = "#".repeat(
        Math.min(Number(tag[1]), 3)
      );

      const value = cleanInline(inlineMarkdown(node));

      return value ? `${hashes} ${value}` : "";
    }

    if (tag === "p") {
      const value = cleanInline(inlineMarkdown(node));
      if (!value) return "";

      const elements = Array.from(node.children);

      const onlyBold =
        elements.length === 1 &&
        ["strong", "b"].includes(
          elements[0].tagName.toLowerCase()
        ) &&
        cleanInline(node.textContent || "").length <= 140;

      return onlyBold
        ? `## ${cleanInline(node.textContent || "")}`
        : value;
    }

    if (tag === "blockquote") {
      const value = cleanInline(inlineMarkdown(node));

      return value
        ? value
            .split("\n")
            .map((line) => `> ${line.trim()}`)
            .join("\n")
        : "";
    }

    if (tag === "ul" || tag === "ol") {
      return Array.from(node.children)
        .filter(
          (child) =>
            child.tagName.toLowerCase() === "li"
        )
        .map((child, index) => {
          const value = cleanInline(
            inlineMarkdown(child)
          );

          return value
            ? tag === "ul"
              ? `- ${value}`
              : `${index + 1}. ${value}`
            : "";
        })
        .filter(Boolean)
        .join("\n");
    }

    if (tag === "table") {
      const rows = Array.from(
        node.querySelectorAll("tr")
      );

      const parsed = rows
        .map((row) =>
          Array.from(
            row.querySelectorAll("th, td")
          ).map((cell) =>
            cleanInline(
              inlineMarkdown(cell)
            ).replace(/\|/g, "\\|")
          )
        )
        .filter((row) => row.length > 0);

      if (!parsed.length) return "";

      const count = Math.max(
        ...parsed.map((row) => row.length)
      );

      const normalized = parsed.map((row) => [
        ...row,
        ...Array(
          Math.max(0, count - row.length)
        ).fill(""),
      ]);

      return [
        `| ${normalized[0].join(" | ")} |`,
        `| ${Array(count).fill("---").join(" | ")} |`,
        ...normalized
          .slice(1)
          .map((row) => `| ${row.join(" | ")} |`),
      ].join("\n");
    }

    if (
      [
        "div",
        "section",
        "article",
        "main",
        "header",
        "footer",
        "body",
      ].includes(tag)
    ) {
      return Array.from(node.childNodes)
        .map(blockMarkdown)
        .map((value) => value.trim())
        .filter(Boolean)
        .join("\n\n");
    }

    if (tag === "pre") {
      return node.textContent
        ? "```\n" +
            node.textContent.trim() +
            "\n```"
        : "";
    }

    return cleanInline(inlineMarkdown(node));
  }

  return Array.from(documentNode.body.childNodes)
    .map(blockMarkdown)
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function shouldUseHtmlVersion(
  plainText: string,
  htmlText: string
): boolean {
  return (
    Boolean(htmlText.trim()) &&
    (/<(p|h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|table|tr|td|th|strong|b|em|i|a)\b/i.test(
      htmlText
    ) ||
      !plainText.trim())
  );
}

// Render Markdown safely without injecting raw HTML.
function renderInline(text: string): ReactNode[] {
  const result: ReactNode[] = [];

  const pattern =
    /(!?\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`)/g;

  let position = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > position) {
      result.push(
        text.slice(position, match.index)
      );
    }

    const key = `inline-${match.index}`;

    if (match[1]) {
      const isImage = match[1].startsWith("!");
      const label = match[2] || "Image";
      const url = match[3];

      if (isImage) {
        result.push(
          <img
            key={key}
            src={url}
            alt={label}
            loading="lazy"
            style={{
              display: "block",
              maxWidth: "100%",
              height: "auto",
              borderRadius: 12,
              margin: "18px auto",
            }}
          />
        );
      } else {
        result.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: green,
              textDecoration: "underline",
            }}
          >
            {label}
          </a>
        );
      }
    } else if (match[4]) {
      result.push(
        <strong key={key}>{match[4]}</strong>
      );
    } else if (match[5]) {
      result.push(
        <em key={key}>{match[5]}</em>
      );
    } else if (match[6]) {
      result.push(
        <code
          key={key}
          style={{
            background: "#eef3ed",
            padding: "2px 4px",
            borderRadius: 4,
          }}
        >
          {match[6]}
        </code>
      );
    }

    position = pattern.lastIndex;
  }

  if (position < text.length) {
    result.push(text.slice(position));
  }

  return result;
}

function MarkdownPreview({
  body,
}: {
  body: string;
}) {
  const blocks = body
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);

  if (!blocks.length) {
    return (
      <p style={{ color: "#7b887f" }}>
        Your formatted article will appear here
        as you write.
      </p>
    );
  }

  return (
    <article
      style={{
        width: "100%",
        maxWidth: "100%",
        color: "#2d4434",
        fontFamily:
          "Georgia, 'Times New Roman', serif",
        fontSize: 17,
        lineHeight: 1.85,
        overflowWrap: "anywhere",
      }}
    >
      {blocks.map((block, index) => {
        const key = `block-${index}`;
        const lines = block.split("\n");

        const heading = block.match(
          /^(#{1,6})\s+([\s\S]*)$/
        );

        if (heading) {
          const level = heading[1].length;

          const size =
            level === 1
              ? 34
              : level === 2
                ? 27
                : level === 3
                  ? 22
                  : 19;

          return (
            <div
              key={key}
              role="heading"
              aria-level={level}
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: size,
                lineHeight: 1.3,
                fontWeight: 800,
                color: dark,
                margin: "26px 0 12px",
              }}
            >
              {renderInline(heading[2])}
            </div>
          );
        }

        if (/^```/.test(block)) {
          return (
            <pre
              key={key}
              style={{
                padding: 18,
                background: "#f3f6f1",
                borderRadius: 10,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                fontSize: 14,
              }}
            >
              {block
                .replace(/^```[^\n]*\n?/, "")
                .replace(/\n?```$/, "")}
            </pre>
          );
        }

        if (
          lines.every((line) =>
            /^\s*[-*+]\s+/.test(line)
          )
        ) {
          return (
            <ul
              key={key}
              style={{
                paddingLeft: 28,
                margin: "14px 0",
              }}
            >
              {lines.map((line, i) => (
                <li key={i}>
                  {renderInline(
                    line.replace(
                      /^\s*[-*+]\s+/,
                      ""
                    )
                  )}
                </li>
              ))}
            </ul>
          );
        }

        if (
          lines.every((line) =>
            /^\s*\d+[.)]\s+/.test(line)
          )
        ) {
          return (
            <ol
              key={key}
              style={{
                paddingLeft: 28,
                margin: "14px 0",
              }}
            >
              {lines.map((line, i) => (
                <li key={i}>
                  {renderInline(
                    line.replace(
                      /^\s*\d+[.)]\s+/,
                      ""
                    )
                  )}
                </li>
              ))}
            </ol>
          );
        }

        if (
          lines.every((line) =>
            /^\s*>/.test(line)
          )
        ) {
          return (
            <blockquote
              key={key}
              style={{
                margin: "20px 0",
                padding: "8px 20px",
                borderLeft: `4px solid ${green}`,
                background: "#f5f8f3",
                fontStyle: "italic",
              }}
            >
              {lines.map((line, i) => (
                <div key={i}>
                  {renderInline(
                    line.replace(
                      /^\s*>\s?/,
                      ""
                    )
                  )}
                </div>
              ))}
            </blockquote>
          );
        }

        if (
          lines.length >= 2 &&
          /^\s*\|/.test(lines[0]) &&
          /^\s*\|?[\s|:-]+\|?\s*$/.test(
            lines[1]
          )
        ) {
          const cells = (line: string) =>
            line
              .trim()
              .replace(/^\|/, "")
              .replace(/\|$/, "")
              .split(/(?<!\\)\|/)
              .map((cell) =>
                cell
                  .trim()
                  .replace(/\\\|/g, "|")
              );

          return (
            <div
              key={key}
              style={{
                overflowX: "auto",
                margin: "20px 0",
              }}
            >
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: 15,
                }}
              >
                <thead>
                  <tr>
                    {cells(lines[0]).map(
                      (cell, i) => (
                        <th
                          key={i}
                          style={{
                            border: `1px solid ${border}`,
                            background: "#f0f5ee",
                            padding: 10,
                            textAlign: "left",
                          }}
                        >
                          {renderInline(cell)}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lines
                    .slice(2)
                    .map((line, row) => (
                      <tr key={row}>
                        {cells(line).map(
                          (cell, col) => (
                            <td
                              key={col}
                              style={{
                                border: `1px solid ${border}`,
                                padding: 10,
                              }}
                            >
                              {renderInline(cell)}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p
            key={key}
            style={{
              margin: "0 0 20px",
              whiteSpace: "pre-line",
            }}
          >
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </article>
  );
}

export default function RichTextEditor({
  initialContent = "",
}: RichTextEditorProps) {
  const [body, setBody] = useState(
    initialContent
  );

  const [pasteMessage, setPasteMessage] =
    useState("");

  const [mode, setMode] = useState<
    "edit" | "preview"
  >("edit");

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const bodyRef = useRef(body);

  const selectionRef = useRef({
    start: initialContent.length,
    end: initialContent.length,
  });

  function updateBody(value: string) {
    bodyRef.current = value;
    setBody(value);
  }

  function rememberSelection(
    event: SyntheticEvent<HTMLTextAreaElement>
  ) {
    const target = event.currentTarget;

    selectionRef.current = {
      start: target.selectionStart,
      end: target.selectionEnd,
    };
  }

  function insertAtCursor(
    insertedText: string,
    addSpacing = false
  ) {
    const previousBody = bodyRef.current;

    const start = Math.min(
      selectionRef.current.start,
      previousBody.length
    );

    const end = Math.min(
      selectionRef.current.end,
      previousBody.length
    );

    const before = previousBody.slice(0, start);
    const after = previousBody.slice(end);

    let insertion = insertedText;

    if (addSpacing) {
      const prefix =
        before.length &&
        !before.endsWith("\n\n")
          ? before.endsWith("\n")
            ? "\n"
            : "\n\n"
          : "";

      const suffix =
        after.length &&
        !after.startsWith("\n\n")
          ? after.startsWith("\n")
            ? "\n"
            : "\n\n"
          : "\n\n";

      insertion =
        prefix + insertedText + suffix;
    }

    updateBody(
      before + insertion + after
    );

    const newPosition =
      start + insertion.length;

    selectionRef.current = {
      start: newPosition,
      end: newPosition,
    };

    setMode("edit");

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;

      if (!textarea) return;

      textarea.focus();

      textarea.setSelectionRange(
        newPosition,
        newPosition
      );
    });
  }

  function handleInlineImageInsert(
    imageUrl: string,
    altText: string
  ) {
    const safeAlt = altText
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\r?\n/g, " ");

    insertAtCursor(
      `![${safeAlt}](${imageUrl})`,
      true
    );

    setPasteMessage(
      "Image inserted at your selected position."
    );
  }

  function handlePaste(
    event: ClipboardEvent<HTMLTextAreaElement>
  ) {
    event.preventDefault();

    const plainText =
      event.clipboardData.getData(
        "text/plain"
      );

    const htmlText =
      event.clipboardData.getData(
        "text/html"
      );

    let pastedValue = plainText;
    let source = "plain text";

    if (
      shouldUseHtmlVersion(
        plainText,
        htmlText
      )
    ) {
      const converted =
        htmlToMarkdown(htmlText);

      if (converted.trim()) {
        pastedValue = converted;
        source = "structured HTML";
      }
    }

    pastedValue = pastedValue
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");

    const target = event.currentTarget;

    const start = target.selectionStart;
    const end = target.selectionEnd;

    const previousBody = bodyRef.current;

    updateBody(
      previousBody.slice(0, start) +
        pastedValue +
        previousBody.slice(end)
    );

    const newPosition =
      start + pastedValue.length;

    selectionRef.current = {
      start: newPosition,
      end: newPosition,
    };

    setPasteMessage(
      source === "structured HTML"
        ? "Smart Paste restored structured formatting."
        : "Plain-text formatting preserved."
    );

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;

      if (!textarea) return;

      textarea.focus();

      textarea.setSelectionRange(
        newPosition,
        newPosition
      );
    });
  }

  const wordCount = useMemo(() => {
    const plain = body
      .replace(
        /!\[[^\]]*\]\([^)]+\)/g,
        ""
      )
      .replace(
        /\[([^\]]+)\]\([^)]+\)/g,
        "$1"
      )
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^[-•]\s+/gm, "")
      .replace(/^\d+[.)]\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/\|/g, " ")
      .trim();

    return plain
      ? plain.split(/\s+/).filter(Boolean).length
      : 0;
  }, [body]);

  const readingMinutes =
    wordCount === 0
      ? 0
      : Math.max(
          1,
          Math.ceil(wordCount / 220)
        );

  const formattingItems = [
    "## Heading",
    "### Subheading",
    "**Bold**",
    "*Italic*",
    "- Bullet",
    "1. Numbered",
    "> Quote",
    "| Table |",
  ];

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <div
        style={{
          overflow: "hidden",
          border: `1px solid ${border}`,
          borderRadius: 14,
          background: "#ffffff",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "13px 16px",
            borderBottom:
              `1px solid ${border}`,
            background: "#fafcf9",
          }}
        >
          <div>
            <div
              style={{
                color: dark,
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              Article Content
            </div>

            <div
              style={{
                marginTop: 3,
                color: "#7b887f",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Gemini formatting is preserved
              and reconstructed when needed.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                padding: "7px 11px",
                border:
                  "1px solid #d7e5d8",
                borderRadius: 999,
                background: "#edf5ed",
                color: green,
                fontSize: 10,
                fontWeight: 900,
                textTransform:
                  "uppercase",
              }}
            >
              Smart Paste
            </span>

            <div
              role="group"
              aria-label="Article display mode"
              style={{
                display: "flex",
                padding: 3,
                border:
                  `1px solid ${border}`,
                borderRadius: 9,
                background: "#f0f5ef",
              }}
            >
              {(
                ["edit", "preview"] as const
              ).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setMode(value)
                  }
                  aria-pressed={
                    mode === value
                  }
                  style={{
                    cursor: "pointer",
                    padding: "7px 13px",
                    border: 0,
                    borderRadius: 7,
                    background:
                      mode === value
                        ? green
                        : "transparent",
                    color:
                      mode === value
                        ? "#fff"
                        : dark,
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {value === "edit"
                    ? "Edit"
                    : "Preview"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INLINE IMAGE UPLOADER */}

        <div
          style={{
            display:
              mode === "edit"
                ? "block"
                : "none",
          }}
        >
          <InlineImageUpload
            onImageUploaded={
              handleInlineImageInsert
            }
          />

          {/* FORMATTING GUIDE */}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              padding: "10px 16px",
              borderBottom:
                "1px solid #e5ebe4",
            }}
          >
            {formattingItems.map(
              (item) => (
                <span
                  key={item}
                  style={{
                    padding: "5px 8px",
                    border:
                      "1px solid #e1e8e0",
                    borderRadius: 7,
                    background:
                      "#f8faf7",
                    color: "#617067",
                    fontFamily:
                      "monospace",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        {/* STATUS MESSAGE */}

        {pasteMessage ? (
          <div
            role="status"
            style={{
              padding: "9px 16px",
              borderBottom:
                "1px solid #dfe9df",
              background: "#f3f8f2",
              color: green,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            ✓ {pasteMessage}
          </div>
        ) : null}

        {/* EDITOR */}

        <textarea
          ref={textareaRef}
          name="body"
          value={body}
          onChange={(event) => {
            updateBody(
              event.target.value
            );
            rememberSelection(event);
          }}
          onSelect={
            rememberSelection
          }
          onClick={
            rememberSelection
          }
          onKeyUp={
            rememberSelection
          }
          onPaste={handlePaste}
          placeholder={
            "Paste your WonderfulLife article here...\n\n" +
            "## Understanding Cellular Nutrition\n\n" +
            "Your paragraph begins here.\n\n" +
            "### Key Benefits\n\n" +
            "- **Benefit One:** Description\n" +
            "- **Benefit Two:** Description\n\n" +
            "## The Bottom Line\n\n" +
            "Your conclusion goes here."
          }
          spellCheck
          style={{
            display:
              mode === "edit"
                ? "block"
                : "none",
            boxSizing: "border-box",
            width: "100%",
            minHeight: 600,
            padding: 26,
            border: 0,
            resize: "vertical",
            outline: "none",
            background: "#ffffff",
            color: "#2d4434",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
            fontSize: 14,
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            tabSize: 2,
          }}
        />

        {/* PREVIEW */}

        {mode === "preview" ? (
          <div
            style={{
              padding:
                "26px clamp(18px, 4vw, 48px)",
              minHeight: 600,
              background: "#fff",
            }}
          >
            <MarkdownPreview
              body={body}
            />
          </div>
        ) : null}

        {/* FOOTER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            padding: "11px 16px",
            borderTop:
              "1px solid #e3e9e2",
            background: "#fafcf9",
            color: "#718077",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          <span>
            {wordCount} words
          </span>

          <span>
            Estimated reading time:{" "}
            {readingMinutes} min
          </span>
        </div>
      </div>

      <input
        type="hidden"
        name="reading_minutes"
        value={readingMinutes}
      />
    </div>
  );
}
