"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/* =========================================================
   HELPERS
   ========================================================= */

function safeReturnPath(
  value: FormDataEntryValue | null
) {
  const path = String(value || "/").trim();

  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return "/";
  }

  return path;
}

function conversationUrl(
  returnPath: string,
  message?: string,
  type: "success" | "error" = "success"
) {
  if (!message) {
    return `${returnPath}#conversation`;
  }

  const separator =
    returnPath.includes("?") ? "&" : "?";

  const key =
    type === "success"
      ? "comment_success"
      : "comment_error";

  return `${returnPath}${separator}${key}=${encodeURIComponent(
    message
  )}#conversation`;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
  };
}

/* =========================================================
   CREATE COMMENT OR REPLY
   ========================================================= */

export async function createContentCommentAction(
  formData: FormData
) {
  const {
    supabase,
    user,
  } = await getAuthenticatedUser();

  const contentItemId = Number(
    formData.get("content_item_id")
  );

  const parentIdValue =
    formData.get("parent_id");

  const parentId =
    parentIdValue &&
    String(parentIdValue).trim()
      ? Number(parentIdValue)
      : null;

  const content = String(
    formData.get("content") || ""
  ).trim();

  const returnPath = safeReturnPath(
    formData.get("return_path")
  );

  if (!user) {
    redirect(
      `/sign-in?message=${encodeURIComponent(
        "Please sign in to join the conversation."
      )}`
    );
  }

  if (!contentItemId) {
    redirect(
      conversationUrl(
        returnPath,
        "The article could not be identified.",
        "error"
      )
    );
  }

  if (!content) {
    redirect(
      conversationUrl(
        returnPath,
        "Please write something before posting.",
        "error"
      )
    );
  }

  if (content.length > 2000) {
    redirect(
      conversationUrl(
        returnPath,
        "Comments must be 2,000 characters or fewer.",
        "error"
      )
    );
  }

  /*
   * If this is a reply, confirm the parent exists
   * and belongs to the same article/content item.
   */
  if (parentId) {
    const {
      data: parentComment,
      error: parentError,
    } = await supabase
      .from("content_comments")
      .select(
        "id, content_item_id, parent_id"
      )
      .eq("id", parentId)
      .single();

    if (
      parentError ||
      !parentComment
    ) {
      redirect(
        conversationUrl(
          returnPath,
          "The comment you are replying to could not be found.",
          "error"
        )
      );
    }

    if (
      Number(
        parentComment.content_item_id
      ) !== contentItemId
    ) {
      redirect(
        conversationUrl(
          returnPath,
          "The reply does not belong to this article.",
          "error"
        )
      );
    }

    /*
     * Keep replies one level deep.
     * If a member replies to a reply,
     * attach it to the original root comment.
     */
    const normalizedParentId =
      parentComment.parent_id
        ? Number(
            parentComment.parent_id
          )
        : Number(parentComment.id);

    const { error } = await supabase
      .from("content_comments")
      .insert({
        content_item_id:
          contentItemId,
        parent_id:
          normalizedParentId,
        user_id: user.id,
        content,
        status: "published",
      });

    if (error) {
      redirect(
        conversationUrl(
          returnPath,
          error.message,
          "error"
        )
      );
    }

    revalidatePath(returnPath);

    redirect(
      conversationUrl(
        returnPath,
        "Your reply was posted."
      )
    );
  }

  /*
   * Root comment
   */
  const { error } = await supabase
    .from("content_comments")
    .insert({
      content_item_id:
        contentItemId,
      parent_id: null,
      user_id: user.id,
      content,
      status: "published",
    });

  if (error) {
    redirect(
      conversationUrl(
        returnPath,
        error.message,
        "error"
      )
    );
  }

  revalidatePath(returnPath);

  redirect(
    conversationUrl(
      returnPath,
      "Your comment was posted."
    )
  );
}

/* =========================================================
   TOGGLE LIKE
   ========================================================= */

export async function toggleContentCommentLikeAction(
  formData: FormData
) {
  const {
    supabase,
    user,
  } = await getAuthenticatedUser();

  const commentId = Number(
    formData.get("comment_id")
  );

  const returnPath = safeReturnPath(
    formData.get("return_path")
  );

  if (!user) {
    redirect(
      `/sign-in?message=${encodeURIComponent(
        "Please sign in to like comments."
      )}`
    );
  }

  if (!commentId) {
    redirect(
      conversationUrl(
        returnPath,
        "The comment could not be identified.",
        "error"
      )
    );
  }

  /*
   * Confirm the comment exists.
   */
  const {
    data: comment,
    error: commentError,
  } = await supabase
    .from("content_comments")
    .select("id")
    .eq("id", commentId)
    .single();

  if (
    commentError ||
    !comment
  ) {
    redirect(
      conversationUrl(
        returnPath,
        "The comment could not be found.",
        "error"
      )
    );
  }

  /*
   * Check whether this member
   * has already liked the comment.
   */
  const {
    data: existingLike,
    error: likeLookupError,
  } = await supabase
    .from("content_comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (likeLookupError) {
    redirect(
      conversationUrl(
        returnPath,
        likeLookupError.message,
        "error"
      )
    );
  }

  if (existingLike) {
    const { error } = await supabase
      .from("content_comment_likes")
      .delete()
      .eq(
        "id",
        existingLike.id
      )
      .eq(
        "user_id",
        user.id
      );

    if (error) {
      redirect(
        conversationUrl(
          returnPath,
          error.message,
          "error"
        )
      );
    }
  } else {
    const { error } = await supabase
      .from("content_comment_likes")
      .insert({
        comment_id: commentId,
        user_id: user.id,
      });

    if (error) {
      redirect(
        conversationUrl(
          returnPath,
          error.message,
          "error"
        )
      );
    }
  }

  revalidatePath(returnPath);

  redirect(
    `${returnPath}#comment-${commentId}`
  );
}

/* =========================================================
   EDIT OWN COMMENT
   ========================================================= */

export async function updateContentCommentAction(
  formData: FormData
) {
  const {
    supabase,
    user,
  } = await getAuthenticatedUser();

  const commentId = Number(
    formData.get("comment_id")
  );

  const content = String(
    formData.get("content") || ""
  ).trim();

  const returnPath = safeReturnPath(
    formData.get("return_path")
  );

  if (!user) {
    redirect(
      `/sign-in?message=${encodeURIComponent(
        "Please sign in to edit your comment."
      )}`
    );
  }

  if (!commentId) {
    redirect(
      conversationUrl(
        returnPath,
        "The comment could not be identified.",
        "error"
      )
    );
  }

  if (!content) {
    redirect(
      conversationUrl(
        returnPath,
        "A comment cannot be empty.",
        "error"
      )
    );
  }

  if (content.length > 2000) {
    redirect(
      conversationUrl(
        returnPath,
        "Comments must be 2,000 characters or fewer.",
        "error"
      )
    );
  }

  const { error } = await supabase
    .from("content_comments")
    .update({
      content,
      edited_at:
        new Date().toISOString(),
    })
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      conversationUrl(
        returnPath,
        error.message,
        "error"
      )
    );
  }

  revalidatePath(returnPath);

  redirect(
    `${returnPath}#comment-${commentId}`
  );
}

/* =========================================================
   DELETE OWN COMMENT
   ========================================================= */

export async function deleteContentCommentAction(
  formData: FormData
) {
  const {
    supabase,
    user,
  } = await getAuthenticatedUser();

  const commentId = Number(
    formData.get("comment_id")
  );

  const returnPath = safeReturnPath(
    formData.get("return_path")
  );

  if (!user) {
    redirect(
      `/sign-in?message=${encodeURIComponent(
        "Please sign in."
      )}`
    );
  }

  if (!commentId) {
    redirect(
      conversationUrl(
        returnPath,
        "The comment could not be identified.",
        "error"
      )
    );
  }

  /*
   * RLS protects this too,
   * but we also explicitly match the user ID.
   */
  const { error } = await supabase
    .from("content_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      conversationUrl(
        returnPath,
        error.message,
        "error"
      )
    );
  }

  revalidatePath(returnPath);

  redirect(
    conversationUrl(
      returnPath,
      "Your comment was deleted."
    )
  );
}