import Link from "next/link";

import {
  createContentCommentAction,
  deleteContentCommentAction,
  toggleContentCommentLikeAction,
  updateContentCommentAction,
} from "@/app/actions/content-comments";

import { createClient } from "@/lib/supabase/server";

type ContentCommentsProps = {
  contentItemId: number;
  returnPath: string;
};

type RawComment = {
  id: number;
  parent_id: number | null;
  user_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  is_pinned: boolean;
};

type LikeRow = {
  comment_id: number;
  user_id: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type PreparedComment = RawComment & {
  display_name: string;
  avatar_url: string | null;
  like_count: number;
  user_liked: boolean;
};

/* =========================================================
   HELPERS
   ========================================================= */

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "WL";
  }

  return parts
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

function formatCommentDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
    "en-CA",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

/* =========================================================
   AVATAR
   ========================================================= */

function CommentAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <span className="comment-avatar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt=""
        />
      </span>
    );
  }

  return (
    <span
      className="comment-avatar comment-avatar-fallback"
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

/* =========================================================
   COMMENT ACTION BAR
   ========================================================= */

function CommentActions({
  comment,
  contentItemId,
  returnPath,
  currentUserId,
  rootParentId,
}: {
  comment: PreparedComment;
  contentItemId: number;
  returnPath: string;
  currentUserId?: string;
  rootParentId: number;
}) {
  const signedIn =
    Boolean(currentUserId);

  const isOwner =
    currentUserId ===
    comment.user_id;

  return (
    <div className="comment-toolbar">
      {/* LIKE */}

      {signedIn ? (
        <form
          action={
            toggleContentCommentLikeAction
          }
        >
          <input
            type="hidden"
            name="comment_id"
            value={comment.id}
          />

          <input
            type="hidden"
            name="return_path"
            value={returnPath}
          />

          <button
            type="submit"
            className={
              comment.user_liked
                ? "comment-tool comment-liked"
                : "comment-tool"
            }
          >
            <span aria-hidden="true">
              {comment.user_liked
                ? "♥"
                : "♡"}
            </span>

            <span>
              {comment.like_count > 0
                ? comment.like_count
                : "Like"}
            </span>
          </button>
        </form>
      ) : (
        <Link
          href="/sign-in"
          className="comment-tool"
        >
          ♡{" "}
          {comment.like_count > 0
            ? comment.like_count
            : "Like"}
        </Link>
      )}

      {/* REPLY */}

      {signedIn ? (
        <details className="comment-details">
          <summary className="comment-tool">
            Reply
          </summary>

          <form
            action={
              createContentCommentAction
            }
            className="reply-form"
          >
            <input
              type="hidden"
              name="content_item_id"
              value={contentItemId}
            />

            <input
              type="hidden"
              name="parent_id"
              value={rootParentId}
            />

            <input
              type="hidden"
              name="return_path"
              value={returnPath}
            />

            <textarea
              name="content"
              className="reply-textarea"
              placeholder={`Reply to ${comment.display_name}...`}
              maxLength={2000}
              required
            />

            <div className="reply-actions">
              <button
                type="submit"
                className="reply-button"
              >
                Post Reply
              </button>
            </div>
          </form>
        </details>
      ) : null}

      {/* EDIT */}

      {isOwner ? (
        <details className="comment-details">
          <summary className="comment-tool">
            Edit
          </summary>

          <form
            action={
              updateContentCommentAction
            }
            className="reply-form"
          >
            <input
              type="hidden"
              name="comment_id"
              value={comment.id}
            />

            <input
              type="hidden"
              name="return_path"
              value={returnPath}
            />

            <textarea
              name="content"
              className="reply-textarea"
              defaultValue={
                comment.content
              }
              maxLength={2000}
              required
            />

            <div className="reply-actions">
              <button
                type="submit"
                className="reply-button"
              >
                Save Changes
              </button>
            </div>
          </form>
        </details>
      ) : null}

      {/* DELETE */}

      {isOwner ? (
        <details className="comment-details">
          <summary className="comment-tool comment-delete">
            Delete
          </summary>

          <div className="delete-box">
            <span>
              Delete this comment?
            </span>

            <form
              action={
                deleteContentCommentAction
              }
            >
              <input
                type="hidden"
                name="comment_id"
                value={comment.id}
              />

              <input
                type="hidden"
                name="return_path"
                value={returnPath}
              />

              <button
                type="submit"
                className="delete-button"
              >
                Confirm
              </button>
            </form>
          </div>
        </details>
      ) : null}
    </div>
  );
}

/* =========================================================
   REPLY CARD
   ========================================================= */

function ReplyCard({
  reply,
  contentItemId,
  returnPath,
  currentUserId,
  rootParentId,
}: {
  reply: PreparedComment;
  contentItemId: number;
  returnPath: string;
  currentUserId?: string;
  rootParentId: number;
}) {
  return (
    <div
      id={`comment-${reply.id}`}
      className="reply-card"
    >
      <CommentAvatar
        name={reply.display_name}
        avatarUrl={
          reply.avatar_url
        }
      />

      <div className="reply-content">
        <div className="comment-meta">
          <span className="comment-name">
            {reply.display_name}
          </span>

          <span className="comment-date">
            {formatCommentDate(
              reply.created_at
            )}
          </span>

          {reply.edited_at ? (
            <span className="edited-label">
              edited
            </span>
          ) : null}
        </div>

        <p className="comment-body">
          {reply.content}
        </p>

        <CommentActions
          comment={reply}
          contentItemId={
            contentItemId
          }
          returnPath={returnPath}
          currentUserId={
            currentUserId
          }
          rootParentId={
            rootParentId
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   ROOT COMMENT
   ========================================================= */

function RootCommentCard({
  comment,
  replies,
  contentItemId,
  returnPath,
  currentUserId,
}: {
  comment: PreparedComment;
  replies: PreparedComment[];
  contentItemId: number;
  returnPath: string;
  currentUserId?: string;
}) {
  return (
    <article
      id={`comment-${comment.id}`}
      className={
        comment.is_pinned
          ? "comment-card comment-card-pinned"
          : "comment-card"
      }
    >
      {comment.is_pinned ? (
        <div className="pinned-label">
          ★ Pinned
        </div>
      ) : null}

      <div className="comment-main">
        <CommentAvatar
          name={comment.display_name}
          avatarUrl={
            comment.avatar_url
          }
        />

        <div className="comment-content">
          <div className="comment-meta">
            <span className="comment-name">
              {comment.display_name}
            </span>

            <span className="comment-date">
              {formatCommentDate(
                comment.created_at
              )}
            </span>

            {comment.edited_at ? (
              <span className="edited-label">
                edited
              </span>
            ) : null}
          </div>

          <p className="comment-body">
            {comment.content}
          </p>

          <CommentActions
            comment={comment}
            contentItemId={
              contentItemId
            }
            returnPath={
              returnPath
            }
            currentUserId={
              currentUserId
            }
            rootParentId={
              comment.id
            }
          />

          {replies.length > 0 ? (
            <div className="comment-replies">
              {replies.map(
                (reply) => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    contentItemId={
                      contentItemId
                    }
                    returnPath={
                      returnPath
                    }
                    currentUserId={
                      currentUserId
                    }
                    rootParentId={
                      comment.id
                    }
                  />
                )
              )}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default async function ContentComments({
  contentItemId,
  returnPath,
}: ContentCommentsProps) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  /* ---------------------------------------------------------
     LOAD COMMENTS
     --------------------------------------------------------- */

  const {
    data: commentRows,
    error: commentsError,
  } = await supabase
    .from("content_comments")
    .select(
      `
        id,
        parent_id,
        user_id,
        content,
        created_at,
        edited_at,
        is_pinned
      `
    )
    .eq(
      "content_item_id",
      contentItemId
    )
    .eq(
      "status",
      "published"
    )
    .eq(
      "is_hidden",
      false
    )
    .order(
      "is_pinned",
      {
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  const rawComments =
    (commentRows ||
      []) as RawComment[];

  /* ---------------------------------------------------------
     LOAD LIKES
     --------------------------------------------------------- */

  const commentIds =
    rawComments.map(
      (comment) =>
        comment.id
    );

  let likeRows: LikeRow[] = [];

  if (
    commentIds.length > 0
  ) {
    const {
      data: likesData,
    } = await supabase
      .from(
        "content_comment_likes"
      )
      .select(
        "comment_id, user_id"
      )
      .in(
        "comment_id",
        commentIds
      );

    likeRows =
      (likesData ||
        []) as LikeRow[];
  }

  /* ---------------------------------------------------------
     LOAD MEMBER PROFILES
     --------------------------------------------------------- */

  const userIds = Array.from(
    new Set(
      rawComments.map(
        (comment) =>
          comment.user_id
      )
    )
  );

  let profiles: ProfileRow[] =
    [];

  if (
    userIds.length > 0
  ) {
    const {
      data: profileData,
    } = await supabase
      .from("profiles")
      .select(
        `
          id,
          display_name,
          avatar_url
        `
      )
      .in(
        "id",
        userIds
      );

    profiles =
      (profileData ||
        []) as ProfileRow[];
  }

  const profileMap =
    new Map<
      string,
      ProfileRow
    >();

  profiles.forEach(
    (profile) => {
      profileMap.set(
        profile.id,
        profile
      );
    }
  );

  /* ---------------------------------------------------------
     CURRENT USER FALLBACK
     --------------------------------------------------------- */

  const currentUserName =
    user?.user_metadata
      ?.full_name ||
    user?.user_metadata
      ?.name ||
    user?.user_metadata
      ?.display_name ||
    user?.email?.split(
      "@"
    )[0] ||
    "WonderfulLife Member";

  const currentUserAvatar =
    user?.user_metadata
      ?.avatar_url ||
    user?.user_metadata
      ?.picture ||
    null;

  /* ---------------------------------------------------------
     PREPARE COMMENTS
     --------------------------------------------------------- */

  const preparedComments:
    PreparedComment[] =
    rawComments.map(
      (comment) => {
        const profile =
          profileMap.get(
            comment.user_id
          );

        const isCurrentUser =
          user?.id ===
          comment.user_id;

        const displayName =
          profile
            ?.display_name
            ?.trim() ||
          (isCurrentUser
            ? currentUserName
            : "WonderfulLife Member");

        const avatarUrl =
          profile
            ?.avatar_url ||
          (isCurrentUser
            ? currentUserAvatar
            : null);

        const commentLikes =
          likeRows.filter(
            (like) =>
              Number(
                like.comment_id
              ) ===
              Number(
                comment.id
              )
          );

        const userLiked =
          Boolean(
            user &&
              commentLikes.some(
                (like) =>
                  like.user_id ===
                  user.id
              )
          );

        return {
          ...comment,
          display_name:
            displayName,
          avatar_url:
            avatarUrl,
          like_count:
            commentLikes.length,
          user_liked:
            userLiked,
        };
      }
    );

  /* ---------------------------------------------------------
     ROOT COMMENTS + REPLIES
     --------------------------------------------------------- */

  const rootComments =
    preparedComments.filter(
      (comment) =>
        comment.parent_id ===
        null
    );

  const repliesByParent =
    new Map<
      number,
      PreparedComment[]
    >();

  preparedComments
    .filter(
      (comment) =>
        comment.parent_id !==
        null
    )
    .forEach(
      (reply) => {
        const parentId =
          Number(
            reply.parent_id
          );

        const currentReplies =
          repliesByParent.get(
            parentId
          ) || [];

        currentReplies.push(
          reply
        );

        repliesByParent.set(
          parentId,
          currentReplies
        );
      }
    );

  /*
   * Replies read naturally
   * oldest → newest.
   */
  repliesByParent.forEach(
    (replies) => {
      replies.sort(
        (a, b) =>
          new Date(
            a.created_at
          ).getTime() -
          new Date(
            b.created_at
          ).getTime()
      );
    }
  );

  const totalCommentCount =
    preparedComments.length;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section
      id="conversation"
      className="content-comments"
    >
      <style>{`
        .content-comments {
          width: min(100%, 1020px);
          margin: 26px auto 0;
          padding: 26px 30px;
          border: 1px solid #dce5dc;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 7px 18px rgba(26, 65, 40, 0.04);
          scroll-margin-top: 120px;
        }

        .comments-heading-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .comments-eyebrow {
          margin: 0 0 6px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .comments-title {
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 30px;
          line-height: 1.08;
        }

        .comments-count {
          flex: 0 0 auto;
          padding: 7px 11px;
          border-radius: 999px;
          background: #edf5ed;
          color: #286f45;
          font-size: 11px;
          font-weight: 900;
        }

        .comments-intro {
          max-width: 720px;
          margin: 8px 0 0;
          color: #6b786f;
          font-size: 14px;
          line-height: 1.5;
        }

        .comment-form {
          margin-top: 18px;
        }

        .comment-textarea,
        .reply-textarea {
          width: 100%;
          padding: 14px 15px;
          border: 1px solid #d7e1d7;
          border-radius: 12px;
          background: #fbfcfa;
          color: #243b2d;
          font: inherit;
          line-height: 1.55;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
        }

        .comment-textarea {
          min-height: 100px;
          font-size: 14px;
        }

        .reply-textarea {
          min-height: 74px;
          font-size: 13px;
        }

        .comment-textarea:focus,
        .reply-textarea:focus {
          border-color: #6fa17e;
          box-shadow: 0 0 0 3px rgba(47, 121, 73, 0.08);
        }

        .comment-actions,
        .reply-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 9px;
        }

        .comment-button,
        .reply-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 999px;
          background: #23633d;
          color: #ffffff;
          font-weight: 900;
          cursor: pointer;
        }

        .comment-button {
          min-height: 42px;
          padding: 0 18px;
          font-size: 13px;
        }

        .reply-button {
          min-height: 35px;
          padding: 0 14px;
          font-size: 11px;
        }

        .comment-button:hover,
        .reply-button:hover {
          background: #194f31;
        }

        .signin-box {
          margin-top: 18px;
          padding: 15px 16px;
          border: 1px solid #e0e9de;
          border-radius: 12px;
          background: #f1f6ef;
          color: #54655a;
          font-size: 14px;
          line-height: 1.5;
        }

        .signin-box a {
          color: #23633d;
          font-weight: 900;
          text-decoration: none;
        }

        .comments-list {
          display: grid;
          gap: 13px;
          margin-top: 24px;
        }

        .comment-card {
          position: relative;
          padding: 17px;
          border: 1px solid #e2e8e1;
          border-radius: 14px;
          background: #fbfcfa;
          scroll-margin-top: 120px;
        }

        .comment-card-pinned {
          border-color: #cbdcc8;
          background: #f8fbf6;
        }

        .pinned-label {
          margin-bottom: 10px;
          color: #287044;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .comment-main,
        .reply-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .comment-content,
        .reply-content {
          min-width: 0;
          flex: 1;
        }

        .comment-avatar {
          display: flex;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          overflow: hidden;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e5efe4;
          color: #23673e;
          font-size: 11px;
          font-weight: 900;
        }

        .comment-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .comment-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 5px 9px;
          margin-bottom: 6px;
        }

        .comment-name {
          color: #1f5e39;
          font-size: 12px;
          font-weight: 900;
        }

        .comment-date {
          color: #7a877f;
          font-size: 11px;
          font-weight: 700;
        }

        .edited-label {
          color: #909a93;
          font-size: 10px;
          font-style: italic;
        }

        .comment-body {
          margin: 0;
          color: #415247;
          font-size: 14px;
          line-height: 1.55;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .comment-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 9px;
        }

        .comment-toolbar form {
          margin: 0;
        }

        .comment-tool {
          appearance: none;
          padding: 0;
          border: 0;
          background: transparent;
          color: #68776d;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          list-style: none;
        }

        .comment-tool:hover {
          color: #246d42;
        }

        .comment-liked {
          color: #246d42;
        }

        .comment-delete {
          color: #9b6666;
        }

        .comment-details {
          position: relative;
        }

        .comment-details > summary {
          list-style: none;
        }

        .comment-details > summary::-webkit-details-marker {
          display: none;
        }

        .reply-form {
          width: min(540px, 78vw);
          margin-top: 10px;
          padding: 12px;
          border: 1px solid #e0e8df;
          border-radius: 11px;
          background: #f4f8f3;
        }

        .delete-box {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 8px;
          padding: 8px 10px;
          border: 1px solid #eadada;
          border-radius: 9px;
          background: #fff9f9;
          color: #805858;
          font-size: 11px;
        }

        .delete-button {
          border: 0;
          border-radius: 999px;
          padding: 5px 9px;
          background: #955959;
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .comment-replies {
          display: grid;
          gap: 13px;
          margin-top: 16px;
          padding-left: 18px;
          border-left: 2px solid #e0eae0;
        }

        .reply-card {
          padding: 3px 0;
          scroll-margin-top: 120px;
        }

        .reply-card .comment-avatar {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          font-size: 9px;
        }

        .reply-card .comment-body {
          font-size: 13.5px;
        }

        .comments-empty,
        .comments-error {
          margin: 18px 0 0;
          color: #76827a;
          font-size: 13px;
          line-height: 1.5;
        }

        .comments-error {
          color: #9b4545;
        }

        @media (max-width: 760px) {
          .content-comments {
            padding: 22px 18px;
          }

          .comments-title {
            font-size: 27px;
          }

          .comments-heading-row {
            align-items: flex-start;
          }

          .comment-replies {
            padding-left: 10px;
          }

          .reply-form {
            width: 100%;
          }
        }
      `}</style>

      <div className="comments-heading-row">
        <div>
          <p className="comments-eyebrow">
            WonderfulLife Community
          </p>

          <h2 className="comments-title">
            Join the Conversation
          </h2>
        </div>

        <span className="comments-count">
          {totalCommentCount}{" "}
          {totalCommentCount === 1
            ? "Comment"
            : "Comments"}
        </span>
      </div>

      <p className="comments-intro">
        Share your thoughts, questions, or experiences with other
        WonderfulLife readers.
      </p>

      {user ? (
        <form
          action={
            createContentCommentAction
          }
          className="comment-form"
        >
          <input
            type="hidden"
            name="content_item_id"
            value={contentItemId}
          />

          <input
            type="hidden"
            name="return_path"
            value={returnPath}
          />

          <textarea
            name="content"
            className="comment-textarea"
            placeholder="Share your thoughts..."
            maxLength={2000}
            required
          />

          <div className="comment-actions">
            <button
              type="submit"
              className="comment-button"
            >
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="signin-box">
          Please{" "}
          <Link href="/sign-in">
            sign in
          </Link>{" "}
          to comment, reply, or like a conversation.
        </div>
      )}

      {commentsError ? (
        <p className="comments-error">
          Comments could not be loaded.
        </p>
      ) : rootComments.length === 0 ? (
        <p className="comments-empty">
          No comments yet. Be the first to join the conversation.
        </p>
      ) : (
        <div className="comments-list">
          {rootComments.map(
            (comment) => (
              <RootCommentCard
                key={comment.id}
                comment={comment}
                replies={
                  repliesByParent.get(
                    comment.id
                  ) || []
                }
                contentItemId={
                  contentItemId
                }
                returnPath={
                  returnPath
                }
                currentUserId={
                  user?.id
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
}