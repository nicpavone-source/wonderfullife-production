"use client";

import { useState } from "react";

type DeleteRecipeButtonProps = {
  recipeId: number;
  recipeTitle: string;
  action: (formData: FormData) => void | Promise<void>;
};

export default function DeleteRecipeButton({
  recipeId,
  recipeTitle,
  action,
}: DeleteRecipeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "1px solid #e7c9c9",
          borderRadius: "8px",
          background: "#fff0f0",
          color: "#9f3838",
          fontFamily: "inherit",
          fontSize: "12px",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Delete Recipe
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "grid",
            padding: "24px",
            placeItems: "center",
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
            <h2 style={{ margin: 0, color: "#173d29", fontSize: "24px" }}>
              Delete Recipe
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
                {` “${recipeTitle}”`}
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
                  color: "#23633d",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <form action={action}>
                <input type="hidden" name="recipe_id" value={recipeId} />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "none",
                    borderRadius: "9px",
                    background: "#9f3838",
                    color: "#ffffff",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Delete Recipe
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}