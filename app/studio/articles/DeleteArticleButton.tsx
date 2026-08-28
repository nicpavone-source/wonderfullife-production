"use client";

import { useState } from "react";

type DeleteArticleButtonProps = {
  articleId: number;
  articleTitle: string;
  action: (formData: FormData) => void | Promise<void>;
};

export default function DeleteArticleButton({
  articleId,
  articleTitle,
  action,
}: DeleteArticleButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          minHeight: "42px",
          padding: "0 16px",
          border: "1px solid #efcaca",
          borderRadius: "9px",
          background: "#fff1f1",
          color: "#a13f3f",
          fontFamily: "inherit",
          fontSize: "14px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Delete Article
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-article-${articleId}`}
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "rgba(5, 12, 8, 0.72)",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(460px, 94vw)",
              padding: "24px",
              borderRadius: "16px",
              background: "#ffffff",
              boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
            }}
          >
            <h2
              id={`delete-article-${articleId}`}
              style={{
                margin: 0,
                color: "#173d29",
                fontSize: "24px",
              }}
            >
              Delete Article
            </h2>

            <p
              style={{
                margin: "12px 0 0",
                color: "#6f7e73",
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              Are you sure you want to permanently delete
              <strong style={{ color: "#173d29" }}>
                {` “${articleTitle}”`}
              </strong>
              ? This action cannot be undone.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginTop: "22px",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: "11px 14px",
                  border: "1px solid #dfe6dd",
                  borderRadius: "9px",
                  background: "#ffffff",
                  color: "#28633f",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <form action={action}>
                <input type="hidden" name="article_id" value={articleId} />

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "none",
                    borderRadius: "9px",
                    background: "#a13f3f",
                    color: "#ffffff",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Delete Article
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}