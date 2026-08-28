"use client";

import {
  ClipboardEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createContentAction } from "@/lib/actions/content";
import { createClient } from "@/lib/supabase/client";

type MediaAsset = {
  id: number;
  title: string;
  public_url: string;
  asset_type: string | null;
  mime_type: string | null;
};

type Ingredient = {
  id: number;
  text: string;
};

type Instruction = {
  id: number;
  text: string;
  image: MediaAsset | null;
};

const colors = {
  page: "#f6f8f5",
  panel: "#ffffff",
  border: "#dfe6dd",
  text: "#173d29",
  muted: "#6f7e73",
  green: "#23633d",
  greenSoft: "#eaf2e8",
  red: "#a13f3f",
};

const MEDIA_BUCKET = "wonderfullife-media";

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

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

  return `${Date.now()}-${baseName || "recipe-media"}${extension}`;
}

export default function RecipeStudioV2Page() {
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [difficulty, setDifficulty] = useState("Easy");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [tags, setTags] = useState("");

  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, text: "" },
  ]);

  const [instructions, setInstructions] = useState<Instruction[]>([
    { id: 1, text: "", image: null },
  ]);

  const [nutrition, setNutrition] = useState("");

  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");

  const [pickerMode, setPickerMode] = useState<
    "featured" | "gallery" | "step" | null
  >(null);

  const [stepImageTargetId, setStepImageTargetId] =
    useState<number | null>(null);

  const [featuredImage, setFeaturedImage] =
    useState<MediaAsset | null>(null);

  const [gallery, setGallery] = useState<MediaAsset[]>([]);

  const [message, setMessage] = useState("");

  const [imageUploading, setImageUploading] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPickerMode(null);
        setStepImageTargetId(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const bodyValue = useMemo(() => {
    const ingredientLines = ingredients
      .filter((x) => x.text.trim())
      .flatMap((x) => x.text.trim().split("\n"));

    const instructionLines = instructions
      .filter((instruction) => instruction.text.trim())
      .flatMap((instruction, index) => {
        const lines = instruction.text.trim().split("\n");

        return [
          `### Step ${index + 1}`,
          ...lines,
          ...(instruction.image?.public_url
            ? [
                `![Step ${index + 1}: ${instruction.image.title}](${instruction.image.public_url})`,
              ]
            : []),
          "",
        ];
      });

    const nutritionLines = nutrition
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const detailLines = [
      prepTime && `Prep time: ${prepTime}`,
      cookTime && `Cook time: ${cookTime}`,
      servings && `Servings: ${servings}`,
      difficulty && `Difficulty: ${difficulty}`,
    ].filter(Boolean);

    const galleryLines = gallery.map((asset) => asset.public_url);

    return [
      "## Recipe Details",
      ...detailLines,
      "",
      "## Ingredients",
      ...ingredientLines.map((line) => `- ${line}`),
      "",
      "## Instructions",
      ...instructionLines,
      "",
      "## Nutrition",
      ...(nutritionLines.length ? nutritionLines : ["Not provided"]),
      "",
      "## Gallery",
      ...(galleryLines.length ? galleryLines : ["No additional images"]),
    ].join("\n");
  }, [
    cookTime,
    difficulty,
    gallery,
    ingredients,
    instructions,
    nutrition,
    prepTime,
    servings,
  ]);

  const filteredMedia = useMemo(() => {
    const query = mediaSearch.trim().toLowerCase();

    return media.filter((asset) => {
      const image =
        asset.asset_type === "image" ||
        asset.mime_type?.startsWith("image/");

      return (
        image &&
        (!query || asset.title.toLowerCase().includes(query))
      );
    });
  }, [media, mediaSearch]);

  async function openMediaPicker(
    mode: "featured" | "gallery" | "step",
    instructionId?: number
  ) {
    setStepImageTargetId(
      mode === "step" ? instructionId ?? null : null
    );

    setPickerMode(mode);
    setMessage("");

    if (media.length) return;

    setMediaLoading(true);

    const { data, error } = await supabase
      .from("media_assets")
      .select("id,title,public_url,asset_type,mime_type")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setMessage(`Unable to load Media Library: ${error.message}`);
      setMediaLoading(false);
      return;
    }

    setMedia(
      (data ?? []).map((asset) => ({
        id: Number(asset.id),
        title: String(asset.title || "Media image"),
        public_url: String(asset.public_url || ""),
        asset_type: asset.asset_type
          ? String(asset.asset_type)
          : null,
        mime_type: asset.mime_type
          ? String(asset.mime_type)
          : null,
      }))
    );

    setMediaLoading(false);
  }

  function chooseMedia(asset: MediaAsset) {
    if (pickerMode === "featured") {
      setFeaturedImage(asset);
      setPickerMode(null);
      return;
    }

    if (
      pickerMode === "step" &&
      stepImageTargetId !== null
    ) {
      setInstructions((current) =>
        current.map((instruction) =>
          instruction.id === stepImageTargetId
            ? { ...instruction, image: asset }
            : instruction
        )
      );

      setPickerMode(null);
      setStepImageTargetId(null);
      return;
    }

    if (pickerMode === "gallery") {
      setGallery((current) =>
        current.some((item) => item.id === asset.id)
          ? current.filter((item) => item.id !== asset.id)
          : [...current, asset]
      );
    }
  }

  async function uploadRecipeImages(files: File[]) {
    if (!files.length) return;

    if (
      files.some(
        (file) => !SUPPORTED_IMAGE_TYPES.includes(file.type)
      )
    ) {
      setMessage("Please choose only JPG, PNG, or WebP images.");
      return;
    }

    const oversized = files.find(
      (file) => file.size > MAX_IMAGE_SIZE
    );

    if (oversized) {
      setMessage(
        `"${oversized.name}" is too large. Each image must be smaller than 12 MB.`
      );
      return;
    }

    setImageUploading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(
        "Your login session could not be confirmed. Please sign in again."
      );
      setImageUploading(false);
      return;
    }

    const assets: MediaAsset[] = [];
    let uploadedCount = 0;
    let reusedCount = 0;

    for (const file of files) {
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
        setImageUploading(false);
        return;
      }

      if (existing?.public_url) {
        assets.push({
          id: Number(existing.id),
          title: String(existing.title || file.name),
          public_url: String(existing.public_url),
          asset_type: existing.asset_type
            ? String(existing.asset_type)
            : "image",
          mime_type: existing.mime_type
            ? String(existing.mime_type)
            : file.type,
        });

        reusedCount += 1;
        continue;
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
        setMessage(
          `Upload stopped at "${file.name}": ${storageError.message}`
        );
        setImageUploading(false);
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
          optimized_url: `${publicUrl}?width=1400&quality=82&resize=contain`,
          thumbnail_url: `${publicUrl}?width=480&quality=75&resize=contain`,
          poster_url: `${publicUrl}?width=480&quality=75&resize=contain`,
          mime_type: file.type,
          size_bytes: file.size,
          asset_type: "image",
          processing_status: "ready",
        })
        .select("id,title,public_url,asset_type,mime_type")
        .single();

      if (dbError || !inserted) {
        await supabase.storage
          .from(MEDIA_BUCKET)
          .remove([path]);

        setMessage(
          `Upload stopped at "${file.name}": ${
            dbError?.message ||
            "The image record could not be created."
          }`
        );

        setImageUploading(false);
        return;
      }

      assets.push({
        id: Number(inserted.id),
        title: String(inserted.title || file.name),
        public_url: String(inserted.public_url || publicUrl),
        asset_type: inserted.asset_type
          ? String(inserted.asset_type)
          : "image",
        mime_type: inserted.mime_type
          ? String(inserted.mime_type)
          : file.type,
      });

      uploadedCount += 1;
    }

    const unique = assets.filter(
      (asset, index, list) =>
        list.findIndex(
          (item) => item.public_url === asset.public_url
        ) === index
    );

    setFeaturedImage(
      (current) => current || unique[0] || null
    );

    setGallery((current) => {
      const urls = new Set(
        current.map((asset) => asset.public_url)
      );

      return [
        ...current,
        ...unique.filter(
          (asset) => !urls.has(asset.public_url)
        ),
      ];
    });

    setMedia((current) => {
      const urls = new Set(
        current.map((asset) => asset.public_url)
      );

      return [
        ...unique.filter(
          (asset) => !urls.has(asset.public_url)
        ),
        ...current,
      ];
    });

    const parts: string[] = [];

    if (uploadedCount) {
      parts.push(
        `${uploadedCount} image${
          uploadedCount === 1 ? "" : "s"
        } uploaded`
      );
    }

    if (reusedCount) {
      parts.push(
        `${reusedCount} existing image${
          reusedCount === 1 ? "" : "s"
        } reused`
      );
    }

    setMessage(
      `${parts.join(
        " and "
      )}. The first image is the Featured image and all images were added to the gallery.`
    );

    setImageUploading(false);
  }

  async function uploadRecipeVideo(file: File) {
    if (!file) return;

    if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      setMessage(
        "Please choose an MP4, MOV, or WebM video."
      );
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setMessage(
        `"${file.name}" is too large. Recipe videos must be smaller than 100 MB.`
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
      setMessage(
        `Video upload failed: ${storageError.message}`
      );
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

    setVideoUrl(
      String(inserted.public_url || publicUrl)
    );

    setVideoName(
      String(inserted.title || file.name)
    );

    setMedia((current) => [
      {
        id: Number(inserted.id),
        title: String(inserted.title || file.name),
        public_url: String(
          inserted.public_url || publicUrl
        ),
        asset_type: inserted.asset_type
          ? String(inserted.asset_type)
          : "video",
        mime_type: inserted.mime_type
          ? String(inserted.mime_type)
          : file.type,
      },
      ...current,
    ]);

    setMessage(
      "Recipe video uploaded successfully and attached to this recipe."
    );

    setVideoUploading(false);
  }

  function handleImageDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDraggingImages(false);

    void uploadRecipeImages(
      Array.from(event.dataTransfer.files || [])
    );
  }

  function handleImagePaste(
    event: ClipboardEvent<HTMLDivElement>
  ) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    if (files.length) {
      event.preventDefault();
      void uploadRecipeImages(files);
    }
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
      void uploadRecipeVideo(file);
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
      void uploadRecipeVideo(video);
    }
  }

  function updateTitle(value: string) {
    setTitle(value);

    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      {
        id: Date.now(),
        text: "",
      },
    ]);
  }

  function updateIngredient(
    id: number,
    value: string
  ) {
    setIngredients((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, text: value }
          : item
      )
    );
  }

  function removeIngredient(id: number) {
    setIngredients((current) =>
      current.length === 1
        ? [{ id: Date.now(), text: "" }]
        : current.filter((item) => item.id !== id)
    );
  }

  function addInstruction() {
    setInstructions((current) => [
      ...current,
      {
        id: Date.now(),
        text: "",
        image: null,
      },
    ]);
  }

  function updateInstruction(
    id: number,
    value: string
  ) {
    setInstructions((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, text: value }
          : item
      )
    );
  }

  function removeInstruction(id: number) {
    setInstructions((current) =>
      current.length === 1
        ? [
            {
              id: Date.now(),
              text: "",
              image: null,
            },
          ]
        : current.filter((item) => item.id !== id)
    );
  }

  function removeVideo() {
    setVideoUrl("");
    setVideoName("");

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }

    setMessage(
      "Recipe video removed from this recipe."
    );
  }

  function startNewBlankRecipe() {
    const hasContent =
      title.trim() ||
      excerpt.trim() ||
      ingredients.some((ingredient) =>
        ingredient.text.trim()
      ) ||
      instructions.some((instruction) =>
        instruction.text.trim()
      ) ||
      featuredImage ||
      gallery.length > 0 ||
      videoUrl.trim();

    if (
      hasContent &&
      !window.confirm(
        "Start a new blank recipe? Any unsaved information on this page will be cleared."
      )
    ) {
      return;
    }

    setTitle("");
    setSlug("");
    setExcerpt("");
    setCategory("Breakfast");
    setDifficulty("Easy");
    setPrepTime("");
    setCookTime("");
    setServings("");
    setTags("");
    setVideoUrl("");
    setVideoName("");

    setIngredients([
      {
        id: Date.now(),
        text: "",
      },
    ]);

    setInstructions([
      {
        id: Date.now() + 1,
        text: "",
        image: null,
      },
    ]);

    setNutrition("");
    setFeaturedImage(null);
    setGallery([]);
    setMediaSearch("");
    setPickerMode(null);
    setStepImageTargetId(null);

    setMessage("A new blank recipe is ready.");
  }

  function validateBeforeSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    const hasIngredient = ingredients.some((item) =>
      item.text.trim()
    );

    const hasInstruction = instructions.some((item) =>
      item.text.trim()
    );

    if (!hasIngredient || !hasInstruction) {
      event.preventDefault();

      setMessage(
        "Add at least one ingredient and one instruction before saving."
      );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 32px 60px",
        background: colors.page,
        color: colors.text,
      }}
    >
      <header
        style={{
          display: "flex",
          gap: "18px",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <div>
          <p style={eyebrowStyle}>
            WonderfulLife Studio
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "34px",
              lineHeight: 1.1,
            }}
          >
            Create Recipe
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: colors.muted,
              fontSize: "14px",
            }}
          >
            Create, organize, and publish complete
            WonderfulLife recipes.
          </p>
        </div>

        <button
          type="button"
          onClick={startNewBlankRecipe}
          style={{
            padding: "10px 14px",
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            background: "#ffffff",
            color: colors.green,
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          + Start New Blank Recipe
        </button>
      </header>

      {message && (
        <div
          style={{
            marginBottom: "14px",
            padding: "11px 13px",
            border: `1px solid ${colors.border}`,
            borderRadius: "9px",
            background: colors.greenSoft,
            color: colors.green,
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {message}
        </div>
      )}

      <form
        action={createContentAction}
        onSubmit={validateBeforeSubmit}
      >
        <input
          type="hidden"
          name="type"
          value="recipe"
        />

        <input
          type="hidden"
          name="body"
          value={bodyValue}
        />

        <input
          type="hidden"
          name="image_url"
          value={featuredImage?.public_url || ""}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 330px",
            gap: "16px",
            alignItems: "start",
          }}
        >
          <section
            style={{
              overflow: "hidden",
              border: `1px solid ${colors.border}`,
              borderRadius: "14px",
              background: colors.panel,
            }}
          >
            <Section title="Recipe basics">
              <Field label="Recipe title" required>
                <input
                  name="title"
                  required
                  value={title}
                  onChange={(e) =>
                    updateTitle(e.target.value)
                  }
                  placeholder="Garden Vegetable Omelette"
                  style={inputStyle}
                />
              </Field>

              <div style={twoColumnStyle}>
                <Field label="Slug">
                  <input
                    name="slug"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value)
                    }
                    placeholder="garden-vegetable-omelette"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Category">
                  <select
                    name="category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snacks</option>
                    <option>Desserts</option>
                    <option>Smoothies</option>
                    <option>Wellness</option>
                  </select>
                </Field>
              </div>

              <Field label="Short description">
                <textarea
                  name="excerpt"
                  rows={4}
                  value={excerpt}
                  onChange={(e) =>
                    setExcerpt(e.target.value)
                  }
                  placeholder="A fresh, protein-rich omelette filled with colourful garden vegetables."
                  style={textareaStyle}
                />
              </Field>
            </Section>

            <Section title="Ingredients">
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {ingredients.map(
                  (ingredient, index) => (
                    <div
                      key={ingredient.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "34px minmax(0, 1fr) auto",
                        gap: "8px",
                        alignItems: "start",
                      }}
                    >
                      <span
                        style={{
                          display: "grid",
                          width: "34px",
                          height: "34px",
                          placeItems: "center",
                          borderRadius: "50%",
                          background:
                            colors.greenSoft,
                          color: colors.green,
                          fontSize: "12px",
                          fontWeight: 900,
                        }}
                      >
                        {index + 1}
                      </span>

                      <textarea
                        rows={6}
                        value={ingredient.text}
                        onChange={(e) =>
                          updateIngredient(
                            ingredient.id,
                            e.target.value
                          )
                        }
                        placeholder="Paste or type your complete ingredient list here."
                        style={textareaStyle}
                      />

                      <button
                        type="button"
                        aria-label="Remove ingredient"
                        onClick={() =>
                          removeIngredient(
                            ingredient.id
                          )
                        }
                        style={removeButtonStyle}
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={addIngredient}
                style={addButtonStyle}
              >
                + Add ingredient
              </button>
            </Section>

            <Section title="Instructions">
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {instructions.map(
                  (instruction, index) => (
                    <div
                      key={instruction.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "34px minmax(0, 1fr) auto",
                        gap: "8px",
                        alignItems: "start",
                      }}
                    >
                      <span
                        style={{
                          display: "grid",
                          width: "34px",
                          height: "34px",
                          placeItems: "center",
                          borderRadius: "50%",
                          background:
                            colors.greenSoft,
                          color: colors.green,
                          fontSize: "12px",
                          fontWeight: 900,
                        }}
                      >
                        {index + 1}
                      </span>

                      <textarea
                        rows={8}
                        value={instruction.text}
                        onChange={(e) =>
                          updateInstruction(
                            instruction.id,
                            e.target.value
                          )
                        }
                        placeholder="Paste or type your complete instruction list here."
                        style={textareaStyle}
                      />

                      <button
                        type="button"
                        aria-label="Remove instruction"
                        onClick={() =>
                          removeInstruction(
                            instruction.id
                          )
                        }
                        style={removeButtonStyle}
                      >
                        ×
                      </button>

                      <div
                        style={{
                          gridColumn: "2 / 3",
                          padding: "12px",
                          border: `1px solid ${colors.border}`,
                          borderRadius: "10px",
                          background: "#fbfcfa",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "12px",
                          }}
                        >
                          Optional step image
                        </strong>

                        {instruction.image ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "120px minmax(0, 1fr)",
                              gap: "12px",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                overflow: "hidden",
                                aspectRatio: "4 / 3",
                                borderRadius: "8px",
                                background:
                                  "#edf0ec",
                              }}
                            >
                              <img
                                src={
                                  instruction.image
                                    .public_url
                                }
                                alt={
                                  instruction.image
                                    .title
                                }
                                style={imageStyle}
                              />
                            </div>

                            <div>
                              <p
                                style={{
                                  overflow: "hidden",
                                  margin: "0 0 9px",
                                  color:
                                    colors.muted,
                                  fontSize: "11px",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  instruction.image
                                    .title
                                }
                              </p>

                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    void openMediaPicker(
                                      "step",
                                      instruction.id
                                    )
                                  }
                                  style={{
                                    ...secondaryButtonStyle,
                                    width: "auto",
                                  }}
                                >
                                  Change image
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setInstructions(
                                      (current) =>
                                        current.map(
                                          (item) =>
                                            item.id ===
                                            instruction.id
                                              ? {
                                                  ...item,
                                                  image:
                                                    null,
                                                }
                                              : item
                                        )
                                    )
                                  }
                                  style={{
                                    ...secondaryButtonStyle,
                                    width: "auto",
                                    color:
                                      colors.red,
                                  }}
                                >
                                  Remove image
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              void openMediaPicker(
                                "step",
                                instruction.id
                              )
                            }
                            style={{
                              ...secondaryButtonStyle,
                              width: "auto",
                            }}
                          >
                            Choose step image
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={addInstruction}
                style={addButtonStyle}
              >
                + Add instruction
              </button>
            </Section>

            <Section title="Media">
              {/* IMAGE UPLOADER */}
              <div
                tabIndex={0}
                onPaste={handleImagePaste}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDraggingImages(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingImages(true);
                }}
                onDragLeave={(event) => {
                  if (
                    event.currentTarget ===
                    event.target
                  ) {
                    setIsDraggingImages(false);
                  }
                }}
                onDrop={handleImageDrop}
                onClick={() =>
                  imageInputRef.current?.click()
                }
                style={{
                  display: "grid",
                  minHeight: "170px",
                  padding: "24px",
                  placeItems: "center",
                  border: `2px dashed ${
                    isDraggingImages
                      ? colors.green
                      : colors.border
                  }`,
                  borderRadius: "12px",
                  background:
                    isDraggingImages
                      ? colors.greenSoft
                      : "#fbfcfa",
                  textAlign: "center",
                  cursor: imageUploading
                    ? "wait"
                    : "pointer",
                  outline: "none",
                }}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={imageUploading}
                  onChange={(event) => {
                    void uploadRecipeImages(
                      Array.from(
                        event.target.files ||
                          []
                      )
                    );

                    event.target.value = "";
                  }}
                  style={{ display: "none" }}
                />

                <div>
                  <div
                    style={{
                      fontSize: "34px",
                    }}
                  >
                    🖼️
                  </div>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "8px",
                      color: colors.text,
                      fontSize: "16px",
                    }}
                  >
                    {imageUploading
                      ? "Uploading images…"
                      : "Drag, paste, or click to add recipe images"}
                  </strong>

                  <p
                    style={{
                      margin: "7px 0 0",
                      color: colors.muted,
                      fontSize: "12px",
                      lineHeight: 1.6,
                    }}
                  >
                    JPG, PNG, or WebP up to
                    12 MB each. The first
                    image becomes the Featured
                    image; all images are added
                    to the gallery.
                  </p>
                </div>
              </div>

              <div style={twoColumnStyle}>
                <MediaSelection
                  title="Featured image"
                  asset={featuredImage}
                  emptyText="No featured image selected"
                  buttonText="Choose from Media Library"
                  onChoose={() =>
                    void openMediaPicker(
                      "featured"
                    )
                  }
                  onRemove={() =>
                    setFeaturedImage(null)
                  }
                />

                <div
                  style={{
                    padding: "13px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "10px",
                    background: "#ffffff",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "13px",
                    }}
                  >
                    Recipe gallery
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 11px",
                      color: colors.muted,
                      fontSize: "11px",
                    }}
                  >
                    {gallery.length
                      ? `${gallery.length} image${
                          gallery.length === 1
                            ? ""
                            : "s"
                        } selected`
                      : "No gallery images selected"}
                  </p>

                  {gallery.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, minmax(0, 1fr))",
                        gap: "6px",
                        marginBottom: "10px",
                      }}
                    >
                      {gallery.map((asset) => (
                        <div
                          key={`${asset.id}-${asset.public_url}`}
                          style={{
                            position: "relative",
                            overflow: "hidden",
                            aspectRatio: "1 / 1",
                            borderRadius: "7px",
                            background:
                              "#edf0ec",
                          }}
                        >
                          <img
                            src={
                              asset.public_url
                            }
                            alt={asset.title}
                            style={imageStyle}
                          />

                          <button
                            type="button"
                            aria-label={`Remove ${asset.title}`}
                            onClick={() =>
                              setGallery(
                                (current) =>
                                  current.filter(
                                    (item) =>
                                      item.public_url !==
                                      asset.public_url
                                  )
                              )
                            }
                            style={{
                              position:
                                "absolute",
                              top: "4px",
                              right: "4px",
                              width: "22px",
                              height: "22px",
                              border: "none",
                              borderRadius:
                                "50%",
                              background:
                                "rgba(0,0,0,0.65)",
                              color:
                                "#ffffff",
                              cursor:
                                "pointer",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void openMediaPicker(
                        "gallery"
                      );
                    }}
                    style={secondaryButtonStyle}
                  >
                    Choose from Media Library
                  </button>
                </div>
              </div>

              {/* RECIPE VIDEO UPLOADER */}
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
                    event.currentTarget ===
                    event.target
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
                  minHeight: videoUrl
                    ? "auto"
                    : "185px",
                  padding: "22px",
                  placeItems: "center",
                  border: `2px dashed ${
                    isDraggingVideo
                      ? colors.green
                      : colors.border
                  }`,
                  borderRadius: "12px",
                  background:
                    isDraggingVideo
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
                    const file =
                      event.target.files?.[0];

                    if (file) {
                      void uploadRecipeVideo(
                        file
                      );
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
                      🎬 Recipe Video Ready
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
                        justifyContent:
                          "space-between",
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
                          {videoName ||
                            "Recipe video"}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: "3px",
                            color:
                              colors.muted,
                            fontSize: "11px",
                          }}
                        >
                          This video will be
                          attached to the
                          recipe.
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
                          style={{
                            ...secondaryButtonStyle,
                            width: "auto",
                          }}
                        >
                          Change Video
                        </button>

                        <button
                          type="button"
                          onClick={removeVideo}
                          style={{
                            ...secondaryButtonStyle,
                            width: "auto",
                            color:
                              colors.red,
                          }}
                        >
                          Remove Video
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: "38px",
                      }}
                    >
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
                        ? "Uploading recipe video…"
                        : "Drag, paste, or click to add recipe video"}
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
                      MP4, MOV, or WebM up to
                      100 MB. Ideal for a
                      10–20 second Zoey recipe
                      introduction.
                    </p>
                  </div>
                )}
              </div>

              <Field label="Video URL">
                <input
                  name="video_url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(
                      e.target.value
                    );

                    if (!e.target.value) {
                      setVideoName("");
                    }
                  }}
                  placeholder="Video uploads fill this automatically — or paste a hosted video URL"
                  style={inputStyle}
                />
              </Field>
            </Section>

            <Section title="Nutrition">
              <textarea
                rows={8}
                value={nutrition}
                onChange={(event) =>
                  setNutrition(
                    event.target.value
                  )
                }
                placeholder={`Paste nutrition information here...

Calories: 280
Protein: 12 g
Carbohydrates: 38 g
Fat: 9 g
Fibre: 7 g
Sodium: 210 mg`}
                style={textareaStyle}
              />
            </Section>

            <Section title="Discoverability">
              <Field label="Tags">
                <input
                  name="tags"
                  value={tags}
                  onChange={(e) =>
                    setTags(e.target.value)
                  }
                  placeholder="breakfast, vegetables, high protein, quick"
                  style={inputStyle}
                />
              </Field>
            </Section>
          </section>

          <aside
            style={{
              position: "sticky",
              top: "18px",
              display: "grid",
              gap: "14px",
            }}
          >
            <section style={sidePanelStyle}>
              <h2 style={sideTitleStyle}>
                Publish
              </h2>

              <Field label="Status">
                <select
                  name="status"
                  defaultValue="draft"
                  style={inputStyle}
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>
                </select>
              </Field>

              <Field label="Reading time">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr auto",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    name="reading_minutes"
                    type="number"
                    min="1"
                    defaultValue="5"
                    style={inputStyle}
                  />

                  <span
                    style={{
                      color: colors.muted,
                      fontSize: "12px",
                    }}
                  >
                    minutes
                  </span>
                </div>
              </Field>

              <label
                style={{
                  display: "flex",
                  gap: "9px",
                  alignItems: "center",
                  marginTop: "4px",
                  color: colors.text,
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <input
                  name="featured"
                  type="checkbox"
                />

                Feature this recipe
              </label>

              <button
                type="submit"
                style={{
                  ...primaryButtonStyle,
                  marginTop: "18px",
                }}
              >
                Save Recipe
              </button>
            </section>

            <section style={sidePanelStyle}>
              <h2 style={sideTitleStyle}>
                Recipe details
              </h2>

              <div style={twoColumnStyle}>
                <Field label="Prep time">
                  <input
                    value={prepTime}
                    onChange={(e) =>
                      setPrepTime(
                        e.target.value
                      )
                    }
                    placeholder="10 min"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Cook time">
                  <input
                    value={cookTime}
                    onChange={(e) =>
                      setCookTime(
                        e.target.value
                      )
                    }
                    placeholder="8 min"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Servings">
                <input
                  value={servings}
                  onChange={(e) =>
                    setServings(
                      e.target.value
                    )
                  }
                  placeholder="2"
                  style={inputStyle}
                />
              </Field>

              <Field label="Difficulty">
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                >
                  <option>Easy</option>
                  <option>Moderate</option>
                  <option>Advanced</option>
                </select>
              </Field>
            </section>

            <section
              style={{
                ...sidePanelStyle,
                background:
                  colors.greenSoft,
              }}
            >
              <h2 style={sideTitleStyle}>
                Recipe publishing checklist
              </h2>

              <p
                style={{
                  margin: "0 0 12px",
                  color: colors.muted,
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}
              >
                Paste in your completed recipe,
                then use this checklist before
                saving or publishing.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "9px",
                }}
              >
                <ChecklistItem
                  complete={Boolean(
                    title.trim()
                  )}
                  label="Recipe title added"
                />

                <ChecklistItem
                  complete={ingredients.some(
                    (ingredient) =>
                      ingredient.text.trim()
                  )}
                  label="Ingredients completed"
                />

                <ChecklistItem
                  complete={instructions.some(
                    (instruction) =>
                      instruction.text.trim()
                  )}
                  label="Instructions completed"
                />

                <ChecklistItem
                  complete={instructions.some(
                    (instruction) =>
                      Boolean(
                        instruction.image
                      )
                  )}
                  label="At least one step image added"
                />

                <ChecklistItem
                  complete={Boolean(
                    featuredImage
                  )}
                  label="Featured image selected"
                />

                <ChecklistItem
                  complete={Boolean(
                    videoUrl.trim()
                  )}
                  label="Recipe video added"
                />

                <ChecklistItem
                  complete={Boolean(
                    nutrition.trim()
                  )}
                  label="Nutrition information added"
                />

                <ChecklistItem
                  complete={Boolean(
                    tags.trim()
                  )}
                  label="Tags added"
                />
              </div>
            </section>
          </aside>
        </div>
      </form>

      {pickerMode && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setPickerMode(null);
            setStepImageTargetId(null);
          }}
          style={overlayStyle}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "min(980px, 94vw)",
              maxHeight: "88vh",
              overflow: "auto",
              padding: "22px",
              borderRadius: "14px",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "14px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                  }}
                >
                  {pickerMode === "featured"
                    ? "Choose featured image"
                    : pickerMode === "step"
                    ? "Choose step image"
                    : "Choose gallery images"}
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: colors.muted,
                    fontSize: "12px",
                  }}
                >
                  Select an existing image from
                  Media Library.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPickerMode(null);
                  setStepImageTargetId(null);
                }}
                style={removeButtonStyle}
              >
                ×
              </button>
            </div>

            <input
              value={mediaSearch}
              onChange={(e) =>
                setMediaSearch(
                  e.target.value
                )
              }
              placeholder="Search Media Library"
              style={inputStyle}
            />

            {mediaLoading ? (
              <div style={emptyPickerStyle}>
                Loading Media Library…
              </div>
            ) : filteredMedia.length === 0 ? (
              <div style={emptyPickerStyle}>
                No matching images found.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "12px",
                  marginTop: "14px",
                }}
              >
                {filteredMedia.map((asset) => {
                  const selected =
                    pickerMode === "featured"
                      ? featuredImage?.id ===
                        asset.id
                      : pickerMode === "step"
                      ? instructions.find(
                          (instruction) =>
                            instruction.id ===
                            stepImageTargetId
                        )?.image?.id ===
                        asset.id
                      : gallery.some(
                          (item) =>
                            item.id === asset.id
                        );

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() =>
                        chooseMedia(asset)
                      }
                      style={{
                        overflow: "hidden",
                        padding: 0,
                        border: selected
                          ? `2px solid ${colors.green}`
                          : `1px solid ${colors.border}`,
                        borderRadius: "9px",
                        background:
                          "#ffffff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          position:
                            "relative",
                          aspectRatio:
                            "1 / 1",
                          overflow: "hidden",
                          background:
                            "#edf0ec",
                        }}
                      >
                        <img
                          src={asset.public_url}
                          alt={asset.title}
                          loading="lazy"
                          style={imageStyle}
                        />

                        {selected && (
                          <span
                            style={{
                              position:
                                "absolute",
                              top: "7px",
                              right: "7px",
                              display: "grid",
                              width: "24px",
                              height: "24px",
                              placeItems:
                                "center",
                              borderRadius:
                                "50%",
                              background:
                                colors.green,
                              color:
                                "#ffffff",
                              fontWeight: 900,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          overflow: "hidden",
                          padding: "9px",
                          color: colors.text,
                          fontSize: "11px",
                          fontWeight: 800,
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {asset.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {pickerMode === "gallery" && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setPickerMode(null)
                  }
                  style={primaryButtonStyle}
                >
                  Use selected images
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: "20px",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          justifyContent:
            "space-between",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: colors.text,
            fontSize: "18px",
          }}
        >
          {title}
        </h2>

        {action}
      </div>

      <div
        style={{
          display: "grid",
          gap: "15px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "6px",
      }}
    >
      <span
        style={{
          color: colors.text,
          fontSize: "12px",
          fontWeight: 850,
        }}
      >
        {label}
        {required ? " *" : ""}
      </span>

      {children}
    </label>
  );
}

function ChecklistItem({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "9px",
        alignItems: "center",
        color: complete
          ? colors.green
          : colors.muted,
        fontSize: "12px",
        fontWeight: 800,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          width: "22px",
          height: "22px",
          flex: "0 0 22px",
          placeItems: "center",
          border: `1px solid ${
            complete
              ? colors.green
              : colors.border
          }`,
          borderRadius: "50%",
          background: complete
            ? colors.green
            : "#ffffff",
          color: complete
            ? "#ffffff"
            : colors.muted,
          fontSize: "12px",
          fontWeight: 900,
        }}
      >
        {complete ? "✓" : "○"}
      </span>

      <span>{label}</span>
    </div>
  );
}

function MediaSelection({
  title,
  asset,
  emptyText,
  buttonText,
  onChoose,
  onRemove,
}: {
  title: string;
  asset: MediaAsset | null;
  emptyText: string;
  buttonText: string;
  onChoose: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        padding: "13px",
        border: `1px solid ${colors.border}`,
        borderRadius: "10px",
        background: "#ffffff",
      }}
    >
      <strong
        style={{
          fontSize: "13px",
        }}
      >
        {title}
      </strong>

      {asset ? (
        <>
          <div
            style={{
              overflow: "hidden",
              aspectRatio: "16 / 9",
              marginTop: "10px",
              borderRadius: "8px",
              background: "#edf0ec",
            }}
          >
            <img
              src={asset.public_url}
              alt={asset.title}
              style={imageStyle}
            />
          </div>

          <p
            style={{
              overflow: "hidden",
              margin: "8px 0",
              color: colors.muted,
              fontSize: "11px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {asset.title}
          </p>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={onChoose}
              style={secondaryButtonStyle}
            >
              Change
            </button>

            <button
              type="button"
              onClick={onRemove}
              style={{
                ...secondaryButtonStyle,
                color: colors.red,
              }}
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <>
          <p
            style={{
              margin: "8px 0 11px",
              color: colors.muted,
              fontSize: "11px",
            }}
          >
            {emptyText}
          </p>

          <button
            type="button"
            onClick={onChoose}
            style={secondaryButtonStyle}
          >
            {buttonText}
          </button>
        </>
      )}
    </div>
  );
}

const eyebrowStyle = {
  margin: 0,
  color: colors.green,
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
} as const;

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 11px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: colors.text,
  fontFamily: "inherit",
  fontSize: "13px",
  outline: "none",
} as const;

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.6,
} as const;

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "12px",
} as const;

const sidePanelStyle = {
  padding: "17px",
  border: `1px solid ${colors.border}`,
  borderRadius: "14px",
  background: colors.panel,
} as const;

const sideTitleStyle = {
  margin: "0 0 14px",
  color: colors.text,
  fontSize: "17px",
} as const;

const primaryButtonStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "none",
  borderRadius: "8px",
  background: colors.green,
  color: "#ffffff",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  width: "100%",
  padding: "9px 11px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: colors.green,
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 850,
  cursor: "pointer",
} as const;

const addButtonStyle = {
  justifySelf: "start",
  padding: "9px 11px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: colors.greenSoft,
  color: colors.green,
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 850,
  cursor: "pointer",
} as const;

const removeButtonStyle = {
  width: "36px",
  height: "36px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: colors.red,
  fontSize: "20px",
  lineHeight: 1,
  cursor: "pointer",
} as const;

const imageStyle = {
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

const emptyPickerStyle = {
  display: "flex",
  minHeight: "330px",
  alignItems: "center",
  justifyContent: "center",
  color: colors.muted,
  fontSize: "13px",
} as const;