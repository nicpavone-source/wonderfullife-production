
"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type InlineImageUploadProps = {
  onImageUploaded: (url: string, altText: string) => void;
  disabled?: boolean;
};

function safeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "article-image";
}

export default function InlineImageUpload({
  onImageUploaded,
  disabled = false,
}: InlineImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file?: File) {
    setError("");
    if (!file) return;

    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be 8 MB or smaller.");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Please sign in again before uploading an image."
        );
      }

      const storagePath = [
        user.id,
        "article-inline-images",
        `${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`,
      ].join("/");

      const { error: uploadError } = await supabase.storage
        .from("wonderfullife-media")
        .upload(storagePath, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("wonderfullife-media")
        .getPublicUrl(storagePath);

      const publicUrl = publicData.publicUrl;

      if (!publicUrl) {
        await supabase.storage
          .from("wonderfullife-media")
          .remove([storagePath]);

        throw new Error(
          "Could not create a public URL for this image."
        );
      }

      const altText = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim() || "Article image";

      const { error: databaseError } = await supabase
        .from("media_assets")
        .insert({
          uploaded_by: user.id,
          folder_id: null,
          title: file.name || "Article image",
          alt_text: altText,
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

      onImageUploaded(publicUrl, altText);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Image upload failed."
      );
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    void uploadImage(event.target.files?.[0]);
  }

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={disabled || isUploading}
        style={{ display: "none" }}
        aria-label="Choose article image"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        style={{
          padding: "9px 14px",
          border: "1px solid #cbd8ca",
          borderRadius: 9,
          background: "#f8faf7",
          color: "#28543a",
          fontSize: 12,
          fontWeight: 800,
          cursor:
            disabled || isUploading
              ? "not-allowed"
              : "pointer",
        }}
      >
        {isUploading ? "Uploading image..." : "Insert Image"}
      </button>

      {error && (
        <span
          role="alert"
          style={{
            color: "#a23f3f",
            fontSize: 12,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
