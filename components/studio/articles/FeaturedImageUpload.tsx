"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type FeaturedImageUploadProps = {
  initialImageUrl?: string;
};

function slugifyFileName(value: string) {
  return String(value || "featured-image")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function FeaturedImageUpload({
  initialImageUrl = "",
}: FeaturedImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] =
    useState<string>(initialImageUrl);

  const [fileName, setFileName] = useState<string>(
    initialImageUrl ? "Existing featured image" : ""
  );

  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] =
    useState<boolean>(false);

  const [isUploading, setIsUploading] =
    useState<boolean>(false);

  async function uploadImage(file?: File) {
    setError("");

    if (!file) {
      return;
    }

    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be smaller than 8 MB.");
      return;
    }

    setIsUploading(true);

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your login session could not be confirmed. Please sign in again."
        );
      }

      const safeFileName = slugifyFileName(file.name);

      const storagePath = [
        user.id,
        "article-featured-images",
        `${Date.now()}-${safeFileName}`,
      ].join("/");

      const { error: uploadError } =
        await supabase.storage
          .from("wonderfullife-media")
          .upload(storagePath, file, {
            cacheControl: "31536000",
            contentType: file.type,
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage
        .from("wonderfullife-media")
        .getPublicUrl(storagePath);

      const publicUrl = publicData.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "The uploaded image URL could not be created."
        );
      }

      const { error: databaseError } = await supabase
        .from("media_assets")
        .insert({
          uploaded_by: user.id,
          folder_id: null,
          title: file.name || "Article featured image",
          alt_text: "",
          bucket: "wonderfullife-media",
          path: storagePath,
          public_url: publicUrl,
          optimized_url: `${publicUrl}?width=1400&quality=82&resize=contain`,
          thumbnail_url: `${publicUrl}?width=480&quality=75&resize=contain`,
          poster_url: `${publicUrl}?width=480&quality=75&resize=contain`,
          mime_type: file.type,
          size_bytes: file.size,
          asset_type: "image",
          processing_status: "ready",
        });

      if (databaseError) {
        await supabase.storage
          .from("wonderfullife-media")
          .remove([storagePath]);

        throw databaseError;
      }

      setImageUrl(publicUrl);
      setFileName(file.name);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "The image could not be uploaded.";

      setError(message);
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    void uploadImage(event.target.files?.[0]);
  }

  function handleDragEnter(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!isUploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (!isUploading) {
      void uploadImage(event.dataTransfer.files?.[0]);
    }
  }

  function openFilePicker() {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }

  function removeImage() {
    setImageUrl("");
    setFileName("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        type="hidden"
        name="image_url"
        value={imageUrl}
      />

      <input
        ref={fileInputRef}
        id="featured-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
        style={{ display: "none" }}
      />

      {imageUrl ? (
        <div>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              aspectRatio: "16 / 9",
              marginTop: "18px",
              border: "1px solid #dbe4da",
              borderRadius: "14px",
              background: "#eef3ed",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Featured article preview"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            <span
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                padding: "6px 10px",
                borderRadius: "999px",
                background: "rgba(23, 61, 41, 0.88)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              Featured image
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "14px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  overflow: "hidden",
                  margin: 0,
                  color: "#294c36",
                  fontSize: "13px",
                  fontWeight: 800,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileName}
              </p>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#718077",
                  fontSize: "11px",
                }}
              >
                Stored in the WonderfulLife Media Library
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexShrink: 0,
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isUploading}
                style={{
                  padding: "9px 12px",
                  border: "1px solid #d4ded3",
                  borderRadius: "9px",
                  background: "#ffffff",
                  color: "#2c6240",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: isUploading
                    ? "not-allowed"
                    : "pointer",
                  opacity: isUploading ? 0.65 : 1,
                }}
              >
                {isUploading ? "Uploading..." : "Replace"}
              </button>

              <button
                type="button"
                onClick={removeImage}
                disabled={isUploading}
                style={{
                  padding: "9px 12px",
                  border: "1px solid #ead2d2",
                  borderRadius: "9px",
                  background: "#fff8f8",
                  color: "#a23f3f",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: isUploading
                    ? "not-allowed"
                    : "pointer",
                  opacity: isUploading ? 0.65 : 1,
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-disabled={isUploading}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (
              !isUploading &&
              (event.key === "Enter" ||
                event.key === " ")
            ) {
              event.preventDefault();
              openFilePicker();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            display: "flex",
            minHeight: "220px",
            marginTop: "18px",
            padding: "20px",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            border: isDragging
              ? "2px dashed #3f8757"
              : "2px dashed #cbd8ca",
            borderRadius: "14px",
            background: isDragging
              ? "#edf6ee"
              : "#f8faf7",
            textAlign: "center",
            cursor: isUploading
              ? "wait"
              : "pointer",
            opacity: isUploading ? 0.72 : 1,
            transition: "all 160ms ease",
          }}
        >
          <span
            style={{
              display: "flex",
              width: "50px",
              height: "50px",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              borderRadius: "50%",
              background: "#e5f0e6",
              fontSize: "22px",
            }}
          >
            {isUploading ? "⏳" : "🖼️"}
          </span>

          <strong
            style={{
              color: "#28543a",
              fontSize: "14px",
            }}
          >
            {isUploading
              ? "Uploading to WonderfulLife..."
              : isDragging
                ? "Drop your image here"
                : "Upload featured image"}
          </strong>

          <span
            style={{
              marginTop: "6px",
              color: "#718077",
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            {isUploading
              ? "Please keep this page open."
              : "Click to browse or drag an image here"}
          </span>

          <span
            style={{
              marginTop: "4px",
              color: "#87938b",
              fontSize: "11px",
              lineHeight: 1.5,
            }}
          >
            Recommended: 1600 × 900 pixels · Maximum 8 MB
          </span>
        </div>
      )}

      {error ? (
        <p
          role="alert"
          style={{
            margin: "10px 0 0",
            padding: "10px 12px",
            border: "1px solid #efd2d2",
            borderRadius: "9px",
            background: "#fff7f7",
            color: "#a23f3f",
            fontSize: "12px",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}