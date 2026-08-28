"use client";

import {
  ClipboardEvent,
  DragEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = "wonderfullife-media";
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

const colors = {
  text: "#173d29",
  muted: "#718077",
  green: "#246b40",
  greenSoft: "#edf5ed",
  border: "#dbe4da",
  red: "#a13f3f",
};

function createSafeFileName(value: string) {
  const extension = value.includes(".")
    ? value.slice(value.lastIndexOf(".")).toLowerCase()
    : "";

  const baseName = value
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${Date.now()}-${baseName || "join-team-video"}${extension}`;
}

export default function VideoUpload() {
  const supabase = useMemo(() => createClient(), []);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [message, setMessage] = useState("");

  const videoInputRef = useRef<HTMLInputElement>(null);

  async function uploadVideo(file: File) {
    if (!file) return;

    if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      setMessage("Please choose an MP4, MOV, or WebM video.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setMessage(
        `"${file.name}" is too large. Videos must be smaller than 100 MB.`
      );
      return;
    }

    setVideoUploading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(
        "Your login session could not be confirmed. Please sign in again."
      );
      setVideoUploading(false);
      return;
    }

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("media_assets")
      .select(
        "id,title,public_url,asset_type,mime_type,size_bytes"
      )
      .eq("uploaded_by", user.id)
      .eq("title", file.name)
      .eq("size_bytes", file.size)
      .eq("mime_type", file.type)
      .maybeSingle();

    if (existingError) {
      setMessage(
        `Could not check "${file.name}" in the Media Library: ${existingError.message}`
      );
      setVideoUploading(false);
      return;
    }

    if (existing?.public_url) {
      setVideoUrl(String(existing.public_url));
      setVideoName(String(existing.title || file.name));
      setMessage(
        "This video already exists in the Media Library, so the existing copy was selected."
      );
      setVideoUploading(false);
      return;
    }

    const path =
      `${user.id}/media-library/` +
      createSafeFileName(file.name);

    const { error: storageError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      setMessage(`Video upload failed: ${storageError.message}`);
      setVideoUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(path);

    const publicUrl = publicData.publicUrl;

    const {
      data: inserted,
      error: dbError,
    } = await supabase
      .from("media_assets")
      .insert({
        uploaded_by: user.id,
        folder_id: null,
        title: file.name,
        alt_text: "",
        bucket: MEDIA_BUCKET,
        path,
        public_url: publicUrl,
        mime_type: file.type,
        size_bytes: file.size,
        asset_type: "video",
        processing_status: "ready",
      })
      .select("id,title,public_url,asset_type,mime_type")
      .single();

    if (dbError || !inserted) {
      await supabase.storage
        .from(MEDIA_BUCKET)
        .remove([path]);

      setMessage(
        `Video upload failed: ${
          dbError?.message ||
          "The video record could not be created."
        }`
      );

      setVideoUploading(false);
      return;
    }

    setVideoUrl(String(inserted.public_url || publicUrl));
    setVideoName(String(inserted.title || file.name));
    setMessage(
      "Video uploaded successfully and attached to this Join Our Team video."
    );
    setVideoUploading(false);
  }

  function handleVideoDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDraggingVideo(false);

    const file = Array.from(
      event.dataTransfer.files || []
    )[0];

    if (file) {
      void uploadVideo(file);
    }
  }

  function handleVideoPaste(
    event: ClipboardEvent<HTMLDivElement>
  ) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    const video = files.find((file) =>
      file.type.startsWith("video/")
    );

    if (video) {
      event.preventDefault();
      void uploadVideo(video);
    }
  }

  function removeVideo() {
    setVideoUrl("");
    setVideoName("");

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }

    setMessage("Video removed from this content.");
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "14px",
      }}
    >
      <div
        tabIndex={0}
        onPaste={handleVideoPaste}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDraggingVideo(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingVideo(true);
        }}
        onDragLeave={(event) => {
          if (
            event.currentTarget === event.target
          ) {
            setIsDraggingVideo(false);
          }
        }}
        onDrop={handleVideoDrop}
        onClick={() => {
          if (!videoUploading) {
            videoInputRef.current?.click();
          }
        }}
        style={{
          display: "grid",
          minHeight: videoUrl ? "auto" : "185px",
          padding: "22px",
          placeItems: "center",
          border: `2px dashed ${
            isDraggingVideo
              ? colors.green
              : colors.border
          }`,
          borderRadius: "12px",
          background: isDraggingVideo
            ? colors.greenSoft
            : "#fbfcfa",
          textAlign: "center",
          cursor: videoUploading
            ? "wait"
            : "pointer",
          outline: "none",
        }}
      >
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
          disabled={videoUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void uploadVideo(file);
            }

            event.target.value = "";
          }}
          style={{ display: "none" }}
        />

        {videoUrl ? (
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              display: "grid",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: colors.green,
                fontSize: "14px",
                fontWeight: 900,
              }}
            >
              🎬 Join Our Team Video Ready
            </div>

            <video
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                maxHeight: "390px",
                borderRadius: "10px",
                background: "#0a120d",
                objectFit: "contain",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  textAlign: "left",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: colors.text,
                    fontSize: "13px",
                  }}
                >
                  {videoName || "Join Our Team video"}
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: "3px",
                    color: colors.muted,
                    fontSize: "11px",
                  }}
                >
                  This video will be attached when you publish.
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    videoInputRef.current?.click()
                  }
                  style={secondaryButtonStyle}
                >
                  Change Video
                </button>

                <button
                  type="button"
                  onClick={removeVideo}
                  style={{
                    ...secondaryButtonStyle,
                    color: colors.red,
                  }}
                >
                  Remove Video
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "38px" }}>
              🎬
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                color: colors.text,
                fontSize: "16px",
              }}
            >
              {videoUploading
                ? "Uploading video…"
                : "Drag, paste, or click to add video"}
            </strong>

            <p
              style={{
                maxWidth: "560px",
                margin: "7px auto 0",
                color: colors.muted,
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              MP4, MOV, or WebM up to 100 MB.
              The uploaded URL is filled in automatically.
            </p>
          </div>
        )}
      </div>

      {message ? (
        <div
          style={{
            padding: "10px 12px",
            border: `1px solid ${colors.border}`,
            borderRadius: "9px",
            background: colors.greenSoft,
            color: colors.green,
            fontSize: "12px",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="video-url"
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#294c36",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          Video URL
        </label>

        <input
          id="video-url"
          name="video_url"
          type="url"
          value={videoUrl}
          onChange={(event) => {
            setVideoUrl(event.target.value);

            if (!event.target.value) {
              setVideoName("");
            }
          }}
          placeholder="Video uploads fill this automatically — or paste a hosted video URL"
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "13px 15px",
            border: `1px solid ${colors.border}`,
            borderRadius: "11px",
            background: "#ffffff",
            color: colors.text,
            fontFamily: "inherit",
            fontSize: "15px",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

const secondaryButtonStyle = {
  width: "auto",
  padding: "9px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: colors.green,
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
} as const;