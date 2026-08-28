"use client";

import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "wonderfullife-media";
const MAX_FILE_SIZE = 250 * 1024 * 1024;

type MediaFilter = "all" | "image" | "video";
type SortOption = "newest" | "oldest" | "name" | "largest";

type MediaFile = {
  id: number;
  name: string;
  path: string;
  publicUrl: string;
  createdAt: string | null;
  size: number | null;
  mimeType: string | null;
  assetType: string | null;
};

const ui = {
  page: "#f6f8f5",
  panel: "#ffffff",
  border: "#dfe6dd",
  text: "#173d29",
  muted: "#6f7e73",
  green: "#23633d",
  greenSoft: "#eaf2e8",
  red: "#a13f3f",
};

function createSafeFileName(originalName: string) {
  const extension = originalName.includes(".")
    ? originalName.split(".").pop()?.toLowerCase()
    : "";

  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniqueName = `${Date.now()}-${baseName || "media"}`;
  return extension ? `${uniqueName}.${extension}` : uniqueName;
}

function isVideo(file: MediaFile) {
  return (
    file.assetType === "video" ||
    file.mimeType?.startsWith("video/") ||
    /\.(mp4|webm|mov)$/i.test(file.name)
  );
}

function formatFileSize(size: number | null) {
  if (!size) return "Unknown";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function MediaPage() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [renameFile, setRenameFile] = useState<MediaFile | null>(null);
  const [newName, setNewName] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setIsError(false);

    const { data, error } = await supabase
      .from("media_assets")
      .select(
        "id,title,path,public_url,created_at,size_bytes,mime_type,asset_type"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      setMessage(`Unable to load media: ${error.message}`);
      setIsError(true);
      setLoading(false);
      return;
    }

    setFiles(
      (data ?? []).map((file) => ({
        id: Number(file.id),
        name: String(file.title || file.path?.split("/").pop() || "Media file"),
        path: String(file.path || ""),
        publicUrl: String(file.public_url || ""),
        createdAt: file.created_at ? String(file.created_at) : null,
        size:
          typeof file.size_bytes === "number"
            ? file.size_bytes
            : file.size_bytes
              ? Number(file.size_bytes)
              : null,
        mimeType: file.mime_type ? String(file.mime_type) : null,
        assetType: file.asset_type ? String(file.asset_type) : null,
      }))
    );

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const visibleFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = files.filter((file) => {
      const matchesSearch = !query || file.name.toLowerCase().includes(query);
      const fileType = isVideo(file) ? "video" : "image";
      const matchesFilter = filter === "all" || filter === fileType;
      return matchesSearch && matchesFilter;
    });

    return [...result].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "largest") return (b.size || 0) - (a.size || 0);

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  }, [files, search, filter, sort]);

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedIds.includes(file.id)),
    [files, selectedIds]
  );

  const imageCount = files.filter((file) => !isVideo(file)).length;
  const videoCount = files.filter(isVideo).length;
  const totalBytes = files.reduce((total, file) => total + (file.size || 0), 0);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.key === "Escape") {
        setPreviewFile(null);
        setRenameFile(null);
        setSelectedIds([]);
        return;
      }

      if (typing) return;

      if (event.key === "F2" && selectedFile) {
        event.preventDefault();
        setRenameFile(selectedFile);
        setNewName(selectedFile.name);
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedIds.length > 0
      ) {
        event.preventDefault();
        void deleteSelectedFiles();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        if (selectedIds.length > 0) {
          event.preventDefault();
          void copySelectedUrls();
        }
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  async function uploadFile(file?: File) {
    if (!file) return;

    const image = file.type.startsWith("image/");
    const video = file.type.startsWith("video/");

    if (!image && !video) {
      setMessage("Only image and video files are supported.");
      setIsError(true);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage("The maximum file size is 250 MB.");
      setIsError(true);
      return;
    }

    setUploading(true);
    setMessage("");
    setIsError(false);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Your session could not be confirmed. Please sign in again.");
      setIsError(true);
      setUploading(false);
      return;
    }

    const path = `${user.id}/media-library/${createSafeFileName(file.name)}`;

    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (storageError) {
      setMessage(`Upload failed: ${storageError.message}`);
      setIsError(true);
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    const publicUrl = publicData.publicUrl;

    const { error: databaseError } = await supabase
      .from("media_assets")
      .insert({
        uploaded_by: user.id,
        folder_id: null,
        title: file.name,
        alt_text: "",
        bucket: BUCKET_NAME,
        path,
        public_url: publicUrl,
        optimized_url: image
          ? `${publicUrl}?width=1400&quality=82&resize=contain`
          : publicUrl,
        thumbnail_url: image
          ? `${publicUrl}?width=480&quality=75&resize=contain`
          : "",
        poster_url: image
          ? `${publicUrl}?width=480&quality=75&resize=contain`
          : "",
        mime_type: file.type || null,
        size_bytes: file.size,
        asset_type: video ? "video" : "image",
        processing_status: "ready",
      });

    if (databaseError) {
      await supabase.storage.from(BUCKET_NAME).remove([path]);
      setMessage(`Upload failed: ${databaseError.message}`);
      setIsError(true);
      setUploading(false);
      return;
    }

    await loadFiles();
    setMessage("Upload complete.");
    setUploading(false);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    void uploadFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void uploadFile(event.dataTransfer.files?.[0]);
  }

  function selectFile(
    event: ReactKeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>,
    file: MediaFile
  ) {
    const additive = event.ctrlKey || event.metaKey;

    if (additive) {
      setSelectedIds((current) =>
        current.includes(file.id)
          ? current.filter((id) => id !== file.id)
          : [...current, file.id]
      );
    } else {
      setSelectedIds([file.id]);
    }

    setSelectedFile(file);
  }

  async function copySelectedUrls() {
    if (selectedFiles.length === 0) return;

    try {
      await navigator.clipboard.writeText(
        selectedFiles.map((file) => file.publicUrl).join("\n")
      );
      setMessage(
        selectedFiles.length === 1
          ? "URL copied."
          : `${selectedFiles.length} URLs copied.`
      );
      setIsError(false);
    } catch {
      setMessage("The URL could not be copied.");
      setIsError(true);
    }
  }

  async function deleteSelectedFiles() {
    if (selectedFiles.length === 0) return;

    const label =
      selectedFiles.length === 1
        ? `"${selectedFiles[0].name}"`
        : `${selectedFiles.length} selected files`;

    const confirmed = window.confirm(
      `Permanently delete ${label} from storage and the Media Library?`
    );

    if (!confirmed) return;

    const paths = selectedFiles
      .map((file) => file.path)
      .filter((path): path is string => Boolean(path));

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(paths);

      if (storageError) {
        setMessage(`Delete failed: ${storageError.message}`);
        setIsError(true);
        return;
      }
    }

    const { error: databaseError } = await supabase
      .from("media_assets")
      .delete()
      .in(
        "id",
        selectedFiles.map((file) => file.id)
      );

    if (databaseError) {
      setMessage(`Delete failed: ${databaseError.message}`);
      setIsError(true);
      return;
    }

    setSelectedIds([]);
    setSelectedFile(null);
    setPreviewFile(null);
    await loadFiles();
    setMessage(
      selectedFiles.length === 1
        ? "File deleted."
        : `${selectedFiles.length} files deleted.`
    );
    setIsError(false);
  }

  async function saveRename() {
    if (!renameFile) return;

    const trimmed = newName.trim();

    if (!trimmed) {
      setMessage("Enter a filename.");
      setIsError(true);
      return;
    }

    const { error } = await supabase
      .from("media_assets")
      .update({
        title: trimmed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", renameFile.id);

    if (error) {
      setMessage(`Rename failed: ${error.message}`);
      setIsError(true);
      return;
    }

    setRenameFile(null);
    setNewName("");
    await loadFiles();
    setMessage("File renamed.");
    setIsError(false);
  }

  function selectAllVisible() {
    const visibleIds = visibleFiles.map((file) => file.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id))
      );
      return;
    }

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...visibleIds]))
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 32px 56px",
        background: ui.page,
        color: ui.text,
      }}
    >
      <header
        style={{
          display: "flex",
          gap: "18px",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "34px", lineHeight: 1.1 }}>
            Media Library
          </h1>
          <p style={{ margin: "7px 0 0", color: ui.muted, fontSize: "14px" }}>
            Upload, search, inspect, rename, copy, and delete media assets.
          </p>
        </div>

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={primaryButton}
        >
          {uploading ? "Uploading…" : "+ Upload media"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          disabled={uploading}
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <Stat label="Total" value={files.length} />
        <Stat label="Images" value={imageCount} />
        <Stat label="Videos" value={videoCount} />
        <Stat label="Storage" value={formatFileSize(totalBytes)} />
      </section>

      {message && (
        <div
          style={{
            marginBottom: "14px",
            padding: "10px 13px",
            border: `1px solid ${isError ? "#eccaca" : "#cfe0cc"}`,
            borderRadius: "9px",
            background: isError ? "#fff6f6" : "#eef6ec",
            color: isError ? ui.red : ui.green,
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {message}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "12px",
            padding: "10px 12px",
            border: `1px solid ${ui.border}`,
            borderRadius: "10px",
            background: ui.greenSoft,
          }}
        >
          <strong style={{ fontSize: "13px" }}>
            {selectedIds.length} selected
          </strong>

          <button
            type="button"
            onClick={() => void copySelectedUrls()}
            style={secondaryButton}
          >
            Copy URL{selectedIds.length > 1 ? "s" : ""}
          </button>

          {selectedIds.length === 1 && selectedFile && (
            <>
              <button
                type="button"
                onClick={() => setPreviewFile(selectedFile)}
                style={secondaryButton}
              >
                Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  setRenameFile(selectedFile);
                  setNewName(selectedFile.name);
                }}
                style={secondaryButton}
              >
                Rename
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => void deleteSelectedFiles()}
            style={{ ...secondaryButton, color: ui.red }}
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedIds([]);
              setSelectedFile(null);
            }}
            style={secondaryButton}
          >
            Clear
          </button>

          <span style={{ marginLeft: "auto", color: ui.muted, fontSize: "11px" }}>
            Ctrl-click selects multiple · F2 rename · Delete removes · Ctrl+C copies URL
          </span>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: selectedFile
            ? "minmax(0, 1fr) 320px"
            : "minmax(0, 1fr)",
          gap: "14px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            border: `1px solid ${ui.border}`,
            borderRadius: "14px",
            background: ui.panel,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              borderBottom: `1px solid ${ui.border}`,
            }}
          >
            <button
              type="button"
              onClick={selectAllVisible}
              style={secondaryButton}
            >
              Select all
            </button>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files"
              style={{ ...controlStyle, flex: "1 1 240px" }}
            />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as MediaFilter)
              }
              style={controlStyle}
            >
              <option value="all">All media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as SortOption)
              }
              style={controlStyle}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="largest">Largest</option>
            </select>

            <span style={{ color: ui.muted, fontSize: "12px" }}>
              {visibleFiles.length} shown
            </span>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            style={{
              minHeight: "500px",
              padding: "14px",
              background: isDragging ? "#edf5ea" : "#ffffff",
              transition: "background 120ms ease",
            }}
          >
            {loading ? (
              <EmptyState text="Loading media…" />
            ) : visibleFiles.length === 0 ? (
              <EmptyState text="No files match the current search or filter." />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(155px, 1fr))",
                  gap: "12px",
                }}
              >
                {visibleFiles.map((file) => {
                  const active = selectedIds.includes(file.id);

                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={(event) => selectFile(event, file)}
                      onDoubleClick={() => setPreviewFile(file)}
                      title="Click to select. Ctrl-click for multiple. Double-click to preview."
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        padding: 0,
                        border: active
                          ? `2px solid ${ui.green}`
                          : `1px solid ${ui.border}`,
                        borderRadius: "10px",
                        background: "#ffffff",
                        boxShadow: active
                          ? "0 0 0 2px rgba(35,99,61,0.12)"
                          : "none",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          aspectRatio: "1 / 1",
                          overflow: "hidden",
                          background: "#eef1ed",
                        }}
                      >
                        {isVideo(file) ? (
                          <video
                            src={file.publicUrl}
                            muted
                            preload="metadata"
                            style={thumbnailStyle}
                          />
                        ) : (
                          <img
                            src={file.publicUrl}
                            alt={file.name}
                            loading="lazy"
                            style={thumbnailStyle}
                          />
                        )}

                        <span
                          style={{
                            position: "absolute",
                            top: "7px",
                            left: "7px",
                            padding: "3px 6px",
                            borderRadius: "999px",
                            background: "rgba(23,61,41,0.82)",
                            color: "#ffffff",
                            fontSize: "8px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                          }}
                        >
                          {isVideo(file) ? "Video" : "Image"}
                        </span>

                        {active && (
                          <span
                            style={{
                              position: "absolute",
                              top: "7px",
                              right: "7px",
                              display: "grid",
                              width: "22px",
                              height: "22px",
                              placeItems: "center",
                              borderRadius: "50%",
                              background: ui.green,
                              color: "#ffffff",
                              fontSize: "13px",
                              fontWeight: 900,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      <div style={{ padding: "9px" }}>
                        <div
                          style={{
                            overflow: "hidden",
                            color: ui.text,
                            fontSize: "12px",
                            fontWeight: 800,
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.name}
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            color: ui.muted,
                            fontSize: "10px",
                          }}
                        >
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {selectedFile && (
          <aside
            style={{
              position: "sticky",
              top: "18px",
              overflow: "hidden",
              border: `1px solid ${ui.border}`,
              borderRadius: "14px",
              background: ui.panel,
            }}
          >
            <div
              style={{
                aspectRatio: "4 / 3",
                overflow: "hidden",
                background: "#edf0ec",
              }}
            >
              {isVideo(selectedFile) ? (
                <video
                  src={selectedFile.publicUrl}
                  muted
                  controls
                  style={thumbnailStyle}
                />
              ) : (
                <img
                  src={selectedFile.publicUrl}
                  alt={selectedFile.name}
                  style={thumbnailStyle}
                />
              )}
            </div>

            <div style={{ padding: "16px" }}>
              <div
                style={{
                  overflowWrap: "anywhere",
                  fontSize: "15px",
                  fontWeight: 900,
                }}
              >
                {selectedFile.name}
              </div>

              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "82px 1fr",
                  gap: "9px",
                  margin: "16px 0",
                  fontSize: "12px",
                }}
              >
                <Detail
                  label="Type"
                  value={
                    selectedFile.mimeType ||
                    (isVideo(selectedFile) ? "Video" : "Image")
                  }
                />
                <Detail
                  label="Size"
                  value={formatFileSize(selectedFile.size)}
                />
                <Detail
                  label="Uploaded"
                  value={formatDate(selectedFile.createdAt)}
                />
                <Detail label="ID" value={String(selectedFile.id)} />
              </dl>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPreviewFile(selectedFile)}
                  style={secondaryButton}
                >
                  Preview
                </button>

                <button
                  type="button"
                  onClick={() => void copySelectedUrls()}
                  style={secondaryButton}
                >
                  Copy URL
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRenameFile(selectedFile);
                    setNewName(selectedFile.name);
                  }}
                  style={secondaryButton}
                >
                  Rename
                </button>

                <button
                  type="button"
                  onClick={() => void deleteSelectedFiles()}
                  style={{ ...secondaryButton, color: ui.red }}
                >
                  Delete
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedIds([]);
                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "9px",
                  border: "none",
                  background: "transparent",
                  color: ui.muted,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Close inspector
              </button>
            </div>
          </aside>
        )}
      </section>

      {previewFile && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewFile(null)}
          style={overlayStyle}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              display: "flex",
              width: "min(1100px, 94vw)",
              height: "min(760px, 90vh)",
              padding: "20px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "14px",
              background: "#151515",
            }}
          >
            {isVideo(previewFile) ? (
              <video
                src={previewFile.publicUrl}
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            ) : (
              <img
                src={previewFile.publicUrl}
                alt={previewFile.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            )}

            <button
              type="button"
              onClick={() => setPreviewFile(null)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "38px",
                height: "38px",
                border: "none",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.72)",
                color: "#ffffff",
                fontSize: "23px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {renameFile && (
        <div role="dialog" aria-modal="true" style={overlayStyle}>
          <div
            style={{
              width: "min(440px, 92vw)",
              padding: "24px",
              borderRadius: "14px",
              background: "#ffffff",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "22px" }}>Rename file</h2>

            <input
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveRename();
              }}
              style={{
                ...controlStyle,
                width: "100%",
                boxSizing: "border-box",
                marginTop: "18px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => setRenameFile(null)}
                style={secondaryButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveRename()}
                style={primaryButton}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        padding: "11px 13px",
        border: `1px solid ${ui.border}`,
        borderRadius: "10px",
        background: "#ffffff",
      }}
    >
      <strong style={{ display: "block", fontSize: "18px" }}>{value}</strong>
      <span style={{ color: ui.muted, fontSize: "11px" }}>{label}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "430px",
        alignItems: "center",
        justifyContent: "center",
        color: ui.muted,
        fontSize: "13px",
      }}
    >
      {text}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ color: ui.muted }}>{label}</dt>
      <dd style={{ margin: 0, overflowWrap: "anywhere", fontWeight: 700 }}>
        {value}
      </dd>
    </>
  );
}

const controlStyle = {
  padding: "9px 11px",
  border: `1px solid ${ui.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: ui.text,
  fontSize: "12px",
  outline: "none",
} as const;

const primaryButton = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  background: ui.green,
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
} as const;

const secondaryButton = {
  padding: "9px 10px",
  border: `1px solid ${ui.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: ui.text,
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
} as const;

const thumbnailStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
} as const;

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  display: "flex",
  padding: "24px",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(5, 12, 8, 0.78)",
} as const;