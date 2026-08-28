"use client";

import { useRef, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";

type ProductImageUploadProps = {
  defaultImageUrl?: string;
};

export default function ProductImageUpload({
  defaultImageUrl = "",
}: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    defaultImageUrl || null
  );
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 5 MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const supabase = createClient();

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setUploading(false);
      setMessage(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    setImageUrl(publicUrl);
    setPreview(publicUrl);
    setUploading(false);
    setMessage("Image uploaded successfully.");
  }

  function removeImage() {
    setPreview(null);
    setImageUrl("");
    setMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name="image_url" value={imageUrl} />

      <div
        style={{
          minHeight: "280px",
          border: "2px dashed #dfe6dd",
          borderRadius: "14px",
          padding: "20px",
          background: "#fafcf9",
          textAlign: "center",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Product preview"
            style={{
              display: "block",
              width: "100%",
              aspectRatio: "1 / 1",
              marginBottom: "16px",
              borderRadius: "10px",
              objectFit: "cover",
              background: "#eef3ec",
            }}
          />
        ) : (
          <div
            style={{
              display: "grid",
              minHeight: "190px",
              placeItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "52px",
                }}
              >
                📷
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#173d29",
                  fontSize: "20px",
                }}
              >
                Upload Product Image
              </h3>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#6f7e73",
                  fontSize: "13px",
                }}
              >
                JPG • PNG • WebP • Maximum 5 MB
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#23633d",
              color: "#ffffff",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 800,
              cursor: uploading ? "wait" : "pointer",
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading
              ? "Uploading..."
              : preview
                ? "Replace Image"
                : "Browse Image"}
          </button>

          {preview ? (
            <button
              type="button"
              disabled={uploading}
              onClick={removeImage}
              style={{
                padding: "10px 18px",
                border: "1px solid #e7c9c9",
                borderRadius: "8px",
                background: "#fff0f0",
                color: "#9f3838",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 800,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              Remove Image
            </button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleFileChange}
        />
      </div>

      {message ? (
        <p
          style={{
            margin: "10px 0 0",
            color: message.includes("successfully")
              ? "#23633d"
              : "#9f3838",
            fontSize: "12px",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}