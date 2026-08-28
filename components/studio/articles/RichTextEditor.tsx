 "use client";

import {
  useMemo,
  useState,
  type ClipboardEvent,
} from "react";

type RichTextEditorProps = {
  initialContent?: string;
};

/*
 * ---------------------------------------------------------
 * HTML -> WONDERFULLIFE MARKDOWN
 * ---------------------------------------------------------
 *
 * Gemini/ChatGPT/browser clipboard content often includes
 * excellent HTML structure even when text/plain has lost
 * paragraph boundaries.
 *
 * This converter rebuilds clean Markdown from that HTML.
 */
function htmlToMarkdown(html: string) {
  if (!html.trim()) {
    return "";
  }

  const parser = new DOMParser();
  const documentNode =
    parser.parseFromString(
      html,
      "text/html"
    );

  function inlineMarkdown(
    node: Node
  ): string {
    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {
      return (
        node.textContent || ""
      );
    }

    if (
      !(
        node instanceof
        HTMLElement
      )
    ) {
      return "";
    }

    const tag =
      node.tagName.toLowerCase();

    if (tag === "br") {
      return "\n";
    }

    const children =
      Array.from(
        node.childNodes
      )
        .map(inlineMarkdown)
        .join("");

    if (
      tag === "strong" ||
      tag === "b"
    ) {
      const value =
        children.trim();

      return value
        ? `**${value}**`
        : "";
    }

    if (
      tag === "em" ||
      tag === "i"
    ) {
      const value =
        children.trim();

      return value
        ? `*${value}*`
        : "";
    }

    if (tag === "a") {
      const label =
        children.trim();

      const href =
        node.getAttribute(
          "href"
        ) || "";

      if (!label) {
        return "";
      }

      if (!href) {
        return label;
      }

      return `[${label}](${href})`;
    }

    if (tag === "code") {
      const value =
        children.trim();

      return value
        ? `\`${value}\``
        : "";
    }

    return children;
  }

  function cleanInline(
    value: string
  ) {
    return value
      .replace(
        /\u00a0/g,
        " "
      )
      .replace(
        /[ \t]+/g,
        " "
      )
      .replace(
        /\s+\n/g,
        "\n"
      )
      .replace(
        /\n\s+/g,
        "\n"
      )
      .trim();
  }

  function blockMarkdown(
    node: Node
  ): string {
    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {
      return cleanInline(
        node.textContent || ""
      );
    }

    if (
      !(
        node instanceof
        HTMLElement
      )
    ) {
      return "";
    }

    const tag =
      node.tagName.toLowerCase();

    /*
     * Headings
     */
    if (tag === "h1") {
      const value =
        cleanInline(
          inlineMarkdown(node)
        );

      return value
        ? `# ${value}`
        : "";
    }

    if (tag === "h2") {
      const value =
        cleanInline(
          inlineMarkdown(node)
        );

      return value
        ? `## ${value}`
        : "";
    }

    if (
      tag === "h3" ||
      tag === "h4" ||
      tag === "h5" ||
      tag === "h6"
    ) {
      const value =
        cleanInline(
          inlineMarkdown(node)
        );

      return value
        ? `### ${value}`
        : "";
    }

    /*
     * Paragraph
     *
     * Gemini/ChatGPT often represents section headings as a
     * paragraph containing only bold text instead of a real
     * <h2>/<h3>. Promote those paragraphs to Markdown headings.
     */
    if (tag === "p") {
      const value =
        cleanInline(
          inlineMarkdown(node)
        );

      if (!value) {
        return "";
      }

      const elementChildren =
        Array.from(
          node.children
        );

      const hasOnlyStrongContent =
        elementChildren.length === 1 &&
        ["strong", "b"].includes(
          elementChildren[0].tagName.toLowerCase()
        ) &&
        cleanInline(
          node.textContent || ""
        ).length <= 140;

      if (hasOnlyStrongContent) {
        const headingText =
          cleanInline(
            node.textContent || ""
          );

        return headingText
          ? `## ${headingText}`
          : "";
      }

      return value;
    }

    /*
     * Block quote
     */
    if (
      tag === "blockquote"
    ) {
      const value =
        cleanInline(
          inlineMarkdown(node)
        );

      if (!value) {
        return "";
      }

      return value
        .split("\n")
        .map(
          (line) =>
            `> ${line.trim()}`
        )
        .join("\n");
    }

    /*
     * Unordered list
     */
    if (tag === "ul") {
      return Array.from(
        node.children
      )
        .filter(
          (child) =>
            child.tagName
              .toLowerCase() ===
            "li"
        )
        .map((child) => {
          const value =
            cleanInline(
              inlineMarkdown(
                child
              )
            );

          return value
            ? `- ${value}`
            : "";
        })
        .filter(Boolean)
        .join("\n");
    }

    /*
     * Ordered list
     */
    if (tag === "ol") {
      return Array.from(
        node.children
      )
        .filter(
          (child) =>
            child.tagName
              .toLowerCase() ===
            "li"
        )
        .map(
          (
            child,
            index
          ) => {
            const value =
              cleanInline(
                inlineMarkdown(
                  child
                )
              );

            return value
              ? `${index + 1}. ${value}`
              : "";
          }
        )
        .filter(Boolean)
        .join("\n");
    }

    /*
     * Markdown table
     */
    if (tag === "table") {
      const rows =
        Array.from(
          node.querySelectorAll(
            "tr"
          )
        );

      const parsedRows =
        rows
          .map((row) =>
            Array.from(
              row.querySelectorAll(
                "th, td"
              )
            ).map((cell) =>
              cleanInline(
                inlineMarkdown(
                  cell
                )
              )
            )
          )
          .filter(
            (row) =>
              row.length > 0
          );

      if (
        parsedRows.length === 0
      ) {
        return "";
      }

      const columnCount =
        Math.max(
          ...parsedRows.map(
            (row) =>
              row.length
          )
        );

      const normalizedRows =
        parsedRows.map(
          (row) => {
            const copy =
              [...row];

            while (
              copy.length <
              columnCount
            ) {
              copy.push("");
            }

            return copy;
          }
        );

      const header =
        normalizedRows[0];

      const divider =
        header.map(
          () => "---"
        );

      const remaining =
        normalizedRows.slice(1);

      return [
        `| ${header.join(
          " | "
        )} |`,
        `| ${divider.join(
          " | "
        )} |`,
        ...remaining.map(
          (row) =>
            `| ${row.join(
              " | "
            )} |`
        ),
      ].join("\n");
    }

    /*
     * Containers.
     *
     * Preserve their child block boundaries.
     */
    if (
      [
        "div",
        "section",
        "article",
        "main",
        "header",
        "footer",
      ].includes(tag)
    ) {
      const childBlocks =
        Array.from(
          node.childNodes
        )
          .map(
            blockMarkdown
          )
          .map(
            (value) =>
              value.trim()
          )
          .filter(Boolean);

      if (
        childBlocks.length >
        0
      ) {
        return childBlocks.join(
          "\n\n"
        );
      }
    }

    /*
     * Fallback
     */
    return cleanInline(
      inlineMarkdown(node)
    );
  }

  const blocks =
    Array.from(
      documentNode.body
        .childNodes
    )
      .map(blockMarkdown)
      .map(
        (value) =>
          value.trim()
      )
      .filter(Boolean);

  return blocks
    .join("\n\n")
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}

/*
 * Decide whether clipboard plain text looks suspiciously
 * flattened compared with the available HTML.
 */
function shouldUseHtmlVersion(
  plainText: string,
  htmlText: string
) {
  if (!htmlText.trim()) {
    return false;
  }

  /*
   * Prefer structured clipboard HTML whenever it contains useful
   * document markup. Gemini/ChatGPT often preserve headings,
   * paragraphs, lists, bold text, links, quotes, and tables in
   * text/html even when text/plain looks superficially acceptable.
   */
  const hasStructuredHtml =
    /<(p|h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|table|tr|td|th|strong|b|em|i|a)/i.test(
      htmlText
    );

  if (hasStructuredHtml) {
    return true;
  }

  /*
   * If plain text is empty but HTML exists, use the HTML version.
   */
  if (!plainText.trim()) {
    return true;
  }

  return false;
}

export default function RichTextEditor({
  initialContent = "",
}: RichTextEditorProps) {
  const [body, setBody] =
    useState(initialContent);

  const [
    pasteMessage,
    setPasteMessage,
  ] = useState("");

  const wordCount =
    useMemo(() => {
      const plainText =
        body
          .replace(
            /^#{1,6}\s+/gm,
            ""
          )
          .replace(
            /\*\*/g,
            ""
          )
          .replace(
            /\*/g,
            ""
          )
          .replace(
            /^[-•]\s+/gm,
            ""
          )
          .replace(
            /^\d+[.)]\s+/gm,
            ""
          )
          .replace(
            /^>\s+/gm,
            ""
          )
          .replace(
            /\|/g,
            " "
          )
          .trim();

      if (!plainText) {
        return 0;
      }

      return plainText
        .split(/\s+/)
        .filter(Boolean)
        .length;
    }, [body]);

  const readingMinutes =
    wordCount === 0
      ? 0
      : Math.max(
          1,
          Math.ceil(
            wordCount / 220
          )
        );

  /*
   * -------------------------------------------------------
   * SMART PASTE
   * -------------------------------------------------------
   *
   * Intercepts Gemini/browser clipboard data before the
   * browser can flatten it.
   */
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

    let pastedValue =
      plainText;

    let source =
      "plain text";

    if (
      shouldUseHtmlVersion(
        plainText,
        htmlText
      )
    ) {
      const converted =
        htmlToMarkdown(
          htmlText
        );

      if (converted.trim()) {
        pastedValue =
          converted;

        source =
          "structured HTML";
      }
    }

    /*
     * Normalize Windows/Mac line endings,
     * but DO NOT remove paragraph breaks.
     */
    pastedValue =
      pastedValue
        .replace(
          /\r\n/g,
          "\n"
        )
        .replace(
          /\r/g,
          "\n"
        );

    const target =
      event.currentTarget;

    const start =
      target.selectionStart;

    const end =
      target.selectionEnd;

    const before =
      body.slice(
        0,
        start
      );

    const after =
      body.slice(
        end
      );

    const nextBody =
      `${before}${pastedValue}${after}`;

    setBody(nextBody);

    setPasteMessage(
      source ===
        "structured HTML"
        ? "Smart Paste restored structured formatting."
        : "Plain-text formatting preserved."
    );

    /*
     * Restore cursor after inserted text.
     */
    requestAnimationFrame(
      () => {
        const cursorPosition =
          start +
          pastedValue.length;

        target.focus();

        target.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      }
    );
  }

  return (
    <div>
      <div
        style={{
          overflow:
            "hidden",
          border:
            "1px solid #dbe4da",
          borderRadius:
            "14px",
          background:
            "#ffffff",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            flexWrap:
              "wrap",
            gap: "12px",
            padding:
              "13px 16px",
            borderBottom:
              "1px solid #dbe4da",
            background:
              "#fafcf9",
          }}
        >
          <div>
            <div
              style={{
                color:
                  "#264d35",
                fontSize:
                  "13px",
                fontWeight:
                  900,
              }}
            >
              Article Content
            </div>

            <div
              style={{
                marginTop:
                  "3px",
                color:
                  "#7b887f",
                fontSize:
                  "11px",
                fontWeight:
                  600,
              }}
            >
              Gemini formatting is preserved and reconstructed when needed.
            </div>
          </div>

          <div
            style={{
              padding:
                "7px 11px",
              border:
                "1px solid #d7e5d8",
              borderRadius:
                "999px",
              background:
                "#edf5ed",
              color:
                "#286f45",
              fontSize:
                "10px",
              fontWeight:
                900,
              letterSpacing:
                ".04em",
              textTransform:
                "uppercase",
            }}
          >
            Smart Paste
          </div>
        </div>

        {/* MARKDOWN GUIDE */}

        <div
          style={{
            display:
              "flex",
            flexWrap:
              "wrap",
            gap: "7px",
            padding:
              "10px 16px",
            borderBottom:
              "1px solid #e5ebe4",
            background:
              "#ffffff",
          }}
        >
          {[
            "## Heading",
            "### Subheading",
            "**Bold**",
            "*Italic*",
            "- Bullet",
            "1. Numbered",
            "> Quote",
            "| Table |",
          ].map(
            (item) => (
              <span
                key={item}
                style={{
                  padding:
                    "5px 8px",
                  border:
                    "1px solid #e1e8e0",
                  borderRadius:
                    "7px",
                  background:
                    "#f8faf7",
                  color:
                    "#617067",
                  fontFamily:
                    "monospace",
                  fontSize:
                    "10px",
                  fontWeight:
                    700,
                }}
              >
                {item}
              </span>
            )
          )}
        </div>

        {/* PASTE STATUS */}

        {pasteMessage ? (
          <div
            style={{
              padding:
                "9px 16px",
              borderBottom:
                "1px solid #dfe9df",
              background:
                "#f3f8f2",
              color:
                "#286f45",
              fontSize:
                "11px",
              fontWeight:
                800,
            }}
          >
            ✓ {pasteMessage}
          </div>
        ) : null}

        {/* EDITOR */}

        <textarea
          name="body"
          value={body}
          onChange={(
            event
          ) =>
            setBody(
              event.target
                .value
            )
          }
          onPaste={
            handlePaste
          }
          placeholder={`Paste your WonderfulLife article here...

## Understanding Cellular Nutrition

Your paragraph begins here.

### Key Benefits

- **Benefit One:** Description
- **Benefit Two:** Description

## The Bottom Line

Your conclusion goes here.`}
          spellCheck
          style={{
            display:
              "block",
            boxSizing:
              "border-box",
            width: "100%",
            minHeight:
              "600px",
            padding:
              "26px",
            border: "0",
            resize:
              "vertical",
            outline:
              "none",
            background:
              "#ffffff",
            color:
              "#2d4434",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
            fontSize:
              "14px",
            lineHeight:
              1.8,
            whiteSpace:
              "pre-wrap",
            tabSize: 2,
          }}
        />

        {/* FOOTER */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            flexWrap:
              "wrap",
            gap: "12px",
            padding:
              "11px 16px",
            borderTop:
              "1px solid #e3e9e2",
            background:
              "#fafcf9",
            color:
              "#718077",
            fontSize:
              "11px",
            fontWeight:
              700,
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
        value={
          readingMinutes
        }
      />
    </div>
  );
}