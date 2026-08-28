"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { updateContentAction } from "@/lib/actions/content";
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
  quantity: string;
  item: string;
};

type Instruction = {
  id: number;
  text: string;
};

type Nutrition = {
  calories: string;
  protein: string;
  carbohydrates: string;
  fat: string;
  fibre: string;
  sodium: string;
};

type RecipeRecord = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  status: string | null;
  featured: boolean | null;
  image_url: string | null;
  video_url: string | null;
  tags: string[] | null;
  reading_minutes: number | null;
};

type VideoLibraryRecord = {
  id: number;
  title: string;
  slug: string;
  video_url: string | null;
  image_url: string | null;
  status: string | null;
  category: string | null;
  external_url: string | null;
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
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const SUPPORTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

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

  return `${Date.now()}-${baseName || "recipe-image"}${extension}`;
}

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSection(body: string, heading: string) {
  const marker = `## ${heading}`;
  const start = body.indexOf(marker);

  if (start === -1) {
    return [];
  }

  const contentStart = start + marker.length;
  const remaining = body.slice(contentStart);
  const nextHeading = remaining.indexOf("\n## ");

  const section =
    nextHeading === -1 ? remaining : remaining.slice(0, nextHeading);

  return section
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseRecipeBody(body: string | null) {
  const source = body || "";

  const detailLines = getSection(source, "Recipe Details");
  const ingredientLines = getSection(source, "Ingredients");
  const instructionLines = getSection(source, "Instructions");
  const nutritionLines = getSection(source, "Nutrition");
  const galleryLines = getSection(source, "Gallery");

  const details = {
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "Easy",
  };

  for (const line of detailLines) {
    if (line.toLowerCase().startsWith("prep time:")) {
      details.prepTime = line.slice(line.indexOf(":") + 1).trim();
    }

    if (line.toLowerCase().startsWith("cook time:")) {
      details.cookTime = line.slice(line.indexOf(":") + 1).trim();
    }

    if (line.toLowerCase().startsWith("servings:")) {
      details.servings = line.slice(line.indexOf(":") + 1).trim();
    }

    if (line.toLowerCase().startsWith("difficulty:")) {
      details.difficulty = line.slice(line.indexOf(":") + 1).trim();
    }
  }

  const ingredients: Ingredient[] = ingredientLines
    .filter((line) => line.startsWith("- "))
    .map((line, index) => {
      const value = line.slice(2).trim();
      const parts = value.split(" ");

      if (parts.length === 1) {
        return {
          id: index + 1,
          quantity: "",
          item: value,
        };
      }

      let quantityLength = 1;

      if (
        parts.length >= 2 &&
        (/^\d/.test(parts[0]) ||
          parts[0].toLowerCase() === "to" ||
          parts[0].toLowerCase() === "as")
      ) {
        if (
          ["tbsp", "tsp", "cup", "cups", "g", "kg", "ml", "oz", "large", "small"]
            .includes(parts[1]?.toLowerCase())
        ) {
          quantityLength = 2;
        }
      }

      return {
        id: index + 1,
        quantity: parts.slice(0, quantityLength).join(" "),
        item: parts.slice(quantityLength).join(" "),
      };
    });

  const instructions: Instruction[] = instructionLines
    .filter((line) => /^\d+\./.test(line))
    .map((line, index) => ({
      id: index + 1,
      text: line.replace(/^\d+\.\s*/, "").trim(),
    }));

  const nutrition: Nutrition = {
    calories: "",
    protein: "",
    carbohydrates: "",
    fat: "",
    fibre: "",
    sodium: "",
  };

  for (const line of nutritionLines) {
    const separator = line.indexOf(":");

    if (separator === -1) {
      continue;
    }

    const label = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (label === "calories") nutrition.calories = value;
    if (label === "protein") nutrition.protein = value;
    if (label === "carbohydrates") nutrition.carbohydrates = value;
    if (label === "fat") nutrition.fat = value;
    if (label === "fibre") nutrition.fibre = value;
    if (label === "sodium") nutrition.sodium = value;
  }

  const galleryUrls = galleryLines.filter(
    (line) =>
      line !== "No additional images" &&
      (line.startsWith("http://") || line.startsWith("https://"))
  );

  return {
    ...details,
    ingredients:
      ingredients.length > 0
        ? ingredients
        : [{ id: 1, quantity: "", item: "" }],
    instructions:
      instructions.length > 0
        ? instructions
        : [{ id: 1, text: "" }],
    nutrition,
    galleryUrls,
  };
}

export default function EditRecipeStudioPage() {
  const params = useParams<{ id: string }>();
  const recipeId = Number(params.id);
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [status, setStatus] = useState("draft");
  const [readingMinutes, setReadingMinutes] = useState("5");
  const [featured, setFeatured] = useState(false);

  const [difficulty, setDifficulty] = useState("Easy");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [tags, setTags] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [originalVideoUrl, setOriginalVideoUrl] = useState("");
  const [videoLibrary, setVideoLibrary] = useState<VideoLibraryRecord[]>([]);
  const [videoLibraryLoading, setVideoLibraryLoading] = useState(false);
  const [videoSearch, setVideoSearch] = useState("");
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, quantity: "", item: "" },
  ]);

  const [instructions, setInstructions] = useState<Instruction[]>([
    { id: 1, text: "" },
  ]);

  const [nutrition, setNutrition] = useState<Nutrition>({
    calories: "",
    protein: "",
    carbohydrates: "",
    fat: "",
    fibre: "",
    sodium: "",
  });

  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [pickerMode, setPickerMode] = useState<
    "featured" | "gallery" | null
  >(null);

  const [featuredImage, setFeaturedImage] =
    useState<MediaAsset | null>(null);

  const [gallery, setGallery] = useState<MediaAsset[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRecipe() {
      if (!recipeId) {
        setLoadError("The recipe ID is invalid.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("content_items")
        .select(
          `
            id,
            title,
            slug,
            excerpt,
            body,
            category,
            status,
            featured,
            image_url,
            video_url,
            tags,
            reading_minutes
          `
        )
        .eq("id", recipeId)
        .eq("type", "recipe")
        .single();

      if (error || !data) {
        setLoadError(error?.message || "Recipe could not be found.");
        setLoading(false);
        return;
      }

      const recipe = data as RecipeRecord;
      const parsed = parseRecipeBody(recipe.body);

      setTitle(recipe.title || "");
      setSlug(recipe.slug || "");
      setExcerpt(recipe.excerpt || "");
      setCategory(recipe.category || "Breakfast");
      setStatus(recipe.status || "draft");
      setReadingMinutes(String(recipe.reading_minutes || 5));
      setFeatured(Boolean(recipe.featured));
      setVideoUrl(recipe.video_url || "");
      setOriginalVideoUrl(recipe.video_url || "");
      setTags((recipe.tags || []).join(", "));

      setDifficulty(parsed.difficulty || "Easy");
      setPrepTime(parsed.prepTime);
      setCookTime(parsed.cookTime);
      setServings(parsed.servings);
      setIngredients(parsed.ingredients);
      setInstructions(parsed.instructions);
      setNutrition(parsed.nutrition);

      if (recipe.image_url) {
        setFeaturedImage({
          id: -1,
          title: "Current featured image",
          public_url: recipe.image_url,
          asset_type: "image",
          mime_type: null,
        });
      }

      setGallery(
        parsed.galleryUrls.map((url, index) => ({
          id: -(index + 2),
          title: `Gallery image ${index + 1}`,
          public_url: url,
          asset_type: "image",
          mime_type: null,
        }))
      );

      setLoading(false);
    }

    void loadRecipe();
  }, [recipeId, supabase]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPickerMode(null);
        setVideoPickerOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function loadVideoLibrary() {
    if (videoLibrary.length > 0) return;

    setVideoLibraryLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("content_items")
      .select(
        `
          id,
          title,
          slug,
          video_url,
          image_url,
          status,
          category,
          external_url
        `
      )
      .eq("type", "video")
      .not("video_url", "is", null)
      .order("updated_at", { ascending: false })
      .limit(250);

    if (error) {
      setMessage(`Unable to load videos: ${error.message}`);
      setVideoLibraryLoading(false);
      return;
    }

    const records = (data || []).map((item) => ({
      id: Number(item.id),
      title: String(item.title || "Untitled video"),
      slug: String(item.slug || ""),
      video_url: item.video_url ? String(item.video_url) : null,
      image_url: item.image_url ? String(item.image_url) : null,
      status: item.status ? String(item.status) : null,
      category: item.category ? String(item.category) : null,
      external_url: item.external_url ? String(item.external_url) : null,
    }));

    setVideoLibrary(records);

    if (videoUrl) {
      const match = records.find((item) => item.video_url === videoUrl);
      setSelectedVideoId(match?.id ?? null);
    }

    setVideoLibraryLoading(false);
  }

  async function openVideoPicker() {
    setVideoPickerOpen(true);
    await loadVideoLibrary();
  }

  function chooseRecipeVideo(video: VideoLibraryRecord) {
    if (!video.video_url) return;

    setVideoUrl(video.video_url);
    setSelectedVideoId(video.id);
    setVideoPickerOpen(false);
    setMessage(`“${video.title}” attached to this recipe.`);
  }

  function removeRecipeVideo() {
    setVideoUrl("");
    setSelectedVideoId(null);
    setMessage("Recipe video removed. Save changes to confirm.");
  }

  async function uploadRecipeVideo(file: File) {
    if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      setMessage("Please choose an MP4, MOV, or WebM video.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setMessage(`"${file.name}" is too large. Recipe videos must be smaller than 100 MB.`);
      return;
    }

    setVideoUploading(true);
    setIsDraggingVideo(false);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Your login session could not be confirmed. Please sign in again.");
      setVideoUploading(false);
      return;
    }

    const path = `${user.id}/recipe-videos/${createSafeFileName(file.name)}`;

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

    const { error: assetError } = await supabase
      .from("media_assets")
      .insert({
        uploaded_by: user.id,
        folder_id: null,
        title: file.name,
        alt_text: "",
        bucket: MEDIA_BUCKET,
        path,
        public_url: publicUrl,
        optimized_url: null,
        thumbnail_url: null,
        poster_url: null,
        mime_type: file.type,
        size_bytes: file.size,
        asset_type: "video",
        processing_status: "ready",
      });

    if (assetError) {
      // The recipe can still use the uploaded video even if the optional
      // media-library record could not be created.
      setMessage(
        `Video uploaded and attached. Media Library note: ${assetError.message}`
      );
    } else {
      setMessage(`"${file.name}" uploaded and attached to this recipe. Save Recipe Changes to confirm.`);
    }

    setVideoUrl(publicUrl);
    setSelectedVideoId(null);
    setVideoUploading(false);
  }

  function handleRecipeVideoInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      void uploadRecipeVideo(file);
    }
  }

  function handleRecipeVideoDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingVideo(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void uploadRecipeVideo(file);
    }
  }

  const filteredVideos = useMemo(() => {
    const query = videoSearch.trim().toLowerCase();

    return videoLibrary.filter((video) =>
      !query ||
      video.title.toLowerCase().includes(query) ||
      video.slug.toLowerCase().includes(query)
    );
  }, [videoLibrary, videoSearch]);

  const bodyValue = useMemo(() => {
    const ingredientLines = ingredients
      .filter((item) => item.quantity || item.item)
      .map((item) =>
        [item.quantity.trim(), item.item.trim()].filter(Boolean).join(" ")
      );

    const instructionLines = instructions
      .flatMap((item) => {
        const value = item.text.trim();

        if (!value) {
          return [];
        }

        const normalized = value
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n");

        const explicitNumberedMatches = normalized
          .split(/(?=(?:^|\s)\d+[.)]\s+)/g)
          .map((part) => part.trim())
          .filter(Boolean);

        const numberedSteps =
          explicitNumberedMatches.length > 1
            ? explicitNumberedMatches
            : normalized
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

        return numberedSteps
          .map((line) =>
            line
              .replace(/^\d+[.)]\s*/, "")
              .replace(/^[-•]\s*/, "")
              .trim()
          )
          .filter(Boolean);
      })
      .map((line, index) => `${index + 1}. ${line}`);

    const nutritionLines = [
      nutrition.calories && `Calories: ${nutrition.calories}`,
      nutrition.protein && `Protein: ${nutrition.protein}`,
      nutrition.carbohydrates &&
        `Carbohydrates: ${nutrition.carbohydrates}`,
      nutrition.fat && `Fat: ${nutrition.fat}`,
      nutrition.fibre && `Fibre: ${nutrition.fibre}`,
      nutrition.sodium && `Sodium: ${nutrition.sodium}`,
    ].filter(Boolean);

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
      const isImage =
        asset.asset_type === "image" ||
        asset.mime_type?.startsWith("image/");

      return (
        isImage &&
        (!query || asset.title.toLowerCase().includes(query))
      );
    });
  }, [media, mediaSearch]);

  async function openMediaPicker(mode: "featured" | "gallery") {
    setPickerMode(mode);
    setMessage("");

    if (media.length) {
      return;
    }

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
      (data || []).map((asset) => ({
        id: Number(asset.id),
        title: String(asset.title || "Media image"),
        public_url: String(asset.public_url || ""),
        asset_type: asset.asset_type
          ? String(asset.asset_type)
          : null,
        mime_type: asset.mime_type ? String(asset.mime_type) : null,
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

    if (pickerMode === "gallery") {
      setGallery((current) =>
        current.some((item) => item.public_url === asset.public_url)
          ? current.filter(
              (item) => item.public_url !== asset.public_url
            )
          : [...current, asset]
      );
    }
  }

  async function uploadGalleryImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const invalidFile = selectedFiles.find(
      (file) => !SUPPORTED_IMAGE_TYPES.includes(file.type)
    );

    if (invalidFile) {
      setMessage("Please choose only JPG, PNG, or WebP images.");
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_SIZE
    );

    if (oversizedFile) {
      setMessage(
        `"${oversizedFile.name}" is too large. Each image must be smaller than 12 MB.`
      );
      return;
    }

    setGalleryUploading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(
        "Your login session could not be confirmed. Please sign in again."
      );
      setGalleryUploading(false);
      return;
    }

    const uploadedAssets: MediaAsset[] = [];

    for (const file of selectedFiles) {
      const path = `${user.id}/media-library/${createSafeFileName(file.name)}`;

      const { error: storageError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (storageError) {
        setMessage(`Upload stopped at "${file.name}": ${storageError.message}`);
        setGalleryUploading(false);
        return;
      }

      const { data: publicData } = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(path);

      const publicUrl = publicData.publicUrl;

      const { data: insertedAsset, error: databaseError } = await supabase
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

      if (databaseError || !insertedAsset) {
        await supabase.storage.from(MEDIA_BUCKET).remove([path]);
        setMessage(
          `Upload stopped at "${file.name}": ${
            databaseError?.message || "The image record could not be created."
          }`
        );
        setGalleryUploading(false);
        return;
      }

      uploadedAssets.push({
        id: Number(insertedAsset.id),
        title: String(insertedAsset.title || file.name),
        public_url: String(insertedAsset.public_url || publicUrl),
        asset_type: insertedAsset.asset_type
          ? String(insertedAsset.asset_type)
          : "image",
        mime_type: insertedAsset.mime_type
          ? String(insertedAsset.mime_type)
          : file.type,
      });
    }

    setGallery((current) => {
      const existingUrls = new Set(current.map((asset) => asset.public_url));

      return [
        ...current,
        ...uploadedAssets.filter(
          (asset) => !existingUrls.has(asset.public_url)
        ),
      ];
    });

    setMedia((current) => [...uploadedAssets, ...current]);
    setMessage(
      `${uploadedAssets.length} gallery image${
        uploadedAssets.length === 1 ? "" : "s"
      } uploaded and selected.`
    );
    setGalleryUploading(false);
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      { id: Date.now(), quantity: "", item: "" },
    ]);
  }

  function updateIngredient(
    id: number,
    field: "quantity" | "item",
    value: string
  ) {
    setIngredients((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }

  function removeIngredient(id: number) {
    setIngredients((current) =>
      current.length === 1
        ? [{ id: Date.now(), quantity: "", item: "" }]
        : current.filter((item) => item.id !== id)
    );
  }

  function addInstruction() {
    setInstructions((current) => [
      ...current,
      { id: Date.now(), text: "" },
    ]);
  }

  function updateInstruction(id: number, value: string) {
    setInstructions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, text: value } : item
      )
    );
  }

  function removeInstruction(id: number) {
    setInstructions((current) =>
      current.length === 1
        ? [{ id: Date.now(), text: "" }]
        : current.filter((item) => item.id !== id)
    );
  }

  async function handleRecipeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Capture the form immediately. React clears event.currentTarget after
    // asynchronous work, which previously prevented FormData from being built.
    const submittedForm = event.currentTarget;
    const formData = new FormData(submittedForm);

    const hasIngredient = ingredients.some(
      (item) => item.quantity || item.item
    );
    const hasInstruction = instructions.some((item) => item.text.trim());

    if (!hasIngredient || !hasInstruction) {
      setMessage(
        "Add at least one ingredient and one instruction before saving."
      );
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter a recipe title.");
      return;
    }

    const finalSlug = makeSlug(slug || title);

    if (!finalSlug) {
      setMessage("Please enter a valid recipe title or slug.");
      return;
    }

    setSaving(true);
    setMessage("");

    const now = new Date().toISOString();
    const recipePath = `/recipes/${finalSlug}`;
    const selectedVideo = videoLibrary.find(
      (video) => video.id === selectedVideoId
    );

    let linkingWarning = "";

    try {
      if (originalVideoUrl && originalVideoUrl !== videoUrl) {
        const oldVideo = videoLibrary.find(
          (video) => video.video_url === originalVideoUrl
        );

        if (oldVideo?.external_url === recipePath) {
          const { error: unlinkError } = await supabase
            .from("content_items")
            .update({ external_url: null, updated_at: now })
            .eq("id", oldVideo.id)
            .eq("type", "video");

          if (unlinkError) {
            linkingWarning = ` Previous video link warning: ${unlinkError.message}`;
          }
        }
      }

      if (selectedVideo) {
        const { error: linkError } = await supabase
          .from("content_items")
          .update({
            category: "Recipes",
            external_url: recipePath,
            updated_at: now,
          })
          .eq("id", selectedVideo.id)
          .eq("type", "video");

        if (linkError) {
          linkingWarning = ` Video link warning: ${linkError.message}`;
        }
      }
    } catch (linkError) {
      linkingWarning =
        linkError instanceof Error
          ? ` Video link warning: ${linkError.message}`
          : " Video link warning: the related video could not be updated.";
    }

    formData.set("id", String(recipeId));
    formData.set("type", "recipe");
    formData.set("title", title.trim());
    formData.set("slug", finalSlug);
    formData.set("excerpt", excerpt.trim());
    formData.set("body", bodyValue);
    formData.set("category", category);
    formData.set("status", status);
    formData.set("image_url", featuredImage?.public_url || "");
    formData.set("video_url", videoUrl.trim());
    formData.set("tags", tags);
    formData.set(
      "reading_minutes",
      String(Math.max(1, Number(readingMinutes) || 5))
    );

    if (featured) {
      formData.set("featured", "on");
    } else {
      formData.delete("featured");
    }

    try {
      await updateContentAction(formData);

      setSlug(finalSlug);
      setOriginalVideoUrl(videoUrl);
      setSaving(false);
      setMessage(`Recipe changes saved successfully.${linkingWarning}`);
      router.refresh();
    } catch (error) {
      const redirectDigest =
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        typeof (error as { digest?: unknown }).digest === "string"
          ? String((error as { digest: string }).digest)
          : "";

      if (redirectDigest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }

      setSaving(false);
      setMessage(
        error instanceof Error
          ? `The recipe could not be saved: ${error.message}`
          : "The recipe could not be saved. Please try again."
      );
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px",
          background: colors.page,
          color: colors.text,
        }}
      >
        <div style={sidePanelStyle}>Loading recipe…</div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px",
          background: colors.page,
          color: colors.text,
        }}
      >
        <div style={{ ...sidePanelStyle, maxWidth: "700px" }}>
          <h1 style={{ marginTop: 0 }}>Recipe could not be loaded</h1>

          <p style={{ color: colors.red }}>{loadError}</p>

          <Link
            href="/studio/recipes"
            style={{
              color: colors.green,
              fontWeight: 800,
            }}
          >
            ← Return to Recipe Library
          </Link>
        </div>
      </main>
    );
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
          <p style={eyebrowStyle}>WonderfulLife Studio</p>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "34px",
              lineHeight: 1.1,
            }}
          >
            Edit Recipe
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: colors.muted,
              fontSize: "14px",
            }}
          >
            Update, organize, and publish this WonderfulLife recipe.
          </p>
        </div>

        <Link href="/studio/recipes" style={backButtonStyle}>
          ← Back to Recipe Library
        </Link>
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

      <form onSubmit={handleRecipeSubmit}>
        <input type="hidden" name="id" value={recipeId} />
        <input type="hidden" name="type" value="recipe" />
        <input type="hidden" name="body" value={bodyValue} />

        <input
          type="hidden"
          name="image_url"
          value={featuredImage?.public_url || ""}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 330px",
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
                  onChange={(event) => setTitle(event.target.value)}
                  style={inputStyle}
                />
              </Field>

              <div style={twoColumnStyle}>
                <Field label="Slug">
                  <input
                    name="slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Category">
                  <select
                    name="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
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
                  onChange={(event) =>
                    setExcerpt(event.target.value)
                  }
                  style={textareaStyle}
                />
              </Field>
            </Section>

            <Section title="Ingredients">
              <div style={{ display: "grid", gap: "8px" }}>
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "120px minmax(0, 1fr) auto",
                      gap: "8px",
                    }}
                  >
                    <input
                      value={ingredient.quantity}
                      onChange={(event) =>
                        updateIngredient(
                          ingredient.id,
                          "quantity",
                          event.target.value
                        )
                      }
                      placeholder="Quantity"
                      style={inputStyle}
                    />

                    <input
                      value={ingredient.item}
                      onChange={(event) =>
                        updateIngredient(
                          ingredient.id,
                          "item",
                          event.target.value
                        )
                      }
                      placeholder="Ingredient"
                      style={inputStyle}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeIngredient(ingredient.id)
                      }
                      style={removeButtonStyle}
                    >
                      ×
                    </button>
                  </div>
                ))}
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
              <div style={{ display: "grid", gap: "10px" }}>
                {instructions.map((instruction, index) => (
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
                        background: colors.greenSoft,
                        color: colors.green,
                        fontSize: "12px",
                        fontWeight: 900,
                      }}
                    >
                      {index + 1}
                    </span>

                    <textarea
                      rows={3}
                      value={instruction.text}
                      onChange={(event) =>
                        updateInstruction(
                          instruction.id,
                          event.target.value
                        )
                      }
                      style={textareaStyle}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeInstruction(instruction.id)
                      }
                      style={removeButtonStyle}
                    >
                      ×
                    </button>
                  </div>
                ))}
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
              <div style={twoColumnStyle}>
                <MediaSelection
                  title="Featured image"
                  asset={featuredImage}
                  emptyText="No featured image selected"
                  buttonText="Choose from Media Library"
                  onChoose={() =>
                    void openMediaPicker("featured")
                  }
                  onRemove={() => setFeaturedImage(null)}
                />

                <div style={mediaCardStyle}>
                  <strong style={{ fontSize: "13px" }}>
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
                          gallery.length === 1 ? "" : "s"
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
                            background: "#edf0ec",
                          }}
                        >
                          <img
                            src={asset.public_url}
                            alt={asset.title}
                            style={imageStyle}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setGallery((current) =>
                                current.filter(
                                  (item) =>
                                    item.public_url !==
                                    asset.public_url
                                )
                              )
                            }
                            style={galleryRemoveButtonStyle}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "grid", gap: "8px" }}>
                    <label
                      style={{
                        ...primaryButtonStyle,
                        display: "block",
                        width: "auto",
                        textAlign: "center",
                        opacity: galleryUploading ? 0.7 : 1,
                      }}
                    >
                      {galleryUploading
                        ? "Uploading images…"
                        : "Upload from Computer"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={galleryUploading}
                        onChange={uploadGalleryImages}
                        style={{ display: "none" }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        void openMediaPicker("gallery")
                      }
                      style={secondaryButtonStyle}
                    >
                      Choose from Media Library
                    </button>
                  </div>
                </div>
              </div>

              <input type="hidden" name="video_url" value={videoUrl} />

              <div style={{ display: "grid", gap: "12px" }}>
                <div>
                  <p style={{ margin: 0, color: colors.text, fontSize: "12px", fontWeight: 850 }}>
                    Recipe video
                  </p>
                  <p style={{ margin: "4px 0 0", color: colors.muted, fontSize: "12px" }}>
                    Drag a video from File Explorer, click to upload, or choose one from your WonderfulLife Video Library.
                  </p>
                </div>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleRecipeVideoInput}
                  style={{ display: "none" }}
                />

                {!videoUrl ? (
                  <div style={{ display: "grid", gap: "10px" }}>
                    <div
                      tabIndex={0}
                      onDragEnter={(event) => {
                        event.preventDefault();
                        setIsDraggingVideo(true);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDraggingVideo(true);
                      }}
                      onDragLeave={(event) => {
                        if (event.currentTarget === event.target) {
                          setIsDraggingVideo(false);
                        }
                      }}
                      onDrop={handleRecipeVideoDrop}
                      onClick={() => {
                        if (!videoUploading) {
                          videoInputRef.current?.click();
                        }
                      }}
                      style={{
                        display: "grid",
                        minHeight: "170px",
                        padding: "24px",
                        placeItems: "center",
                        border: `2px dashed ${isDraggingVideo ? colors.green : colors.border}`,
                        borderRadius: "12px",
                        background: isDraggingVideo ? colors.greenSoft : "#fbfcfa",
                        textAlign: "center",
                        cursor: videoUploading ? "wait" : "pointer",
                        outline: "none",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "34px" }}>🎬</div>
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
                            : "Drag or click to add recipe video"}
                        </strong>
                        <p
                          style={{
                            margin: "7px 0 0",
                            color: colors.muted,
                            fontSize: "12px",
                            lineHeight: 1.6,
                          }}
                        >
                          MP4, MOV, or WebM up to 100 MB. Ideal for a 10–20 second Zoey recipe introduction.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void openVideoPicker()}
                      style={secondaryButtonStyle}
                    >
                      Choose from Video Library
                    </button>
                  </div>
                ) : (
                  <div style={linkedVideoCardStyle}>
                    <video
                      src={videoUrl}
                      controls
                      preload="metadata"
                      style={linkedVideoPreviewStyle}
                    />

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        disabled={videoUploading}
                        onClick={() => videoInputRef.current?.click()}
                        style={{ ...secondaryButtonStyle, flex: 1 }}
                      >
                        Upload Different Video
                      </button>

                      <button
                        type="button"
                        onClick={() => void openVideoPicker()}
                        style={{ ...secondaryButtonStyle, flex: 1 }}
                      >
                        Choose from Library
                      </button>

                      <button
                        type="button"
                        onClick={removeRecipeVideo}
                        style={{ ...secondaryButtonStyle, flex: 1, color: colors.red }}
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            <Section title="Nutrition">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: "10px",
                }}
              >
                {(
                  [
                    "calories",
                    "protein",
                    "carbohydrates",
                    "fat",
                    "fibre",
                    "sodium",
                  ] as const
                ).map((key) => (
                  <NutritionField
                    key={key}
                    label={key[0].toUpperCase() + key.slice(1)}
                    value={nutrition[key]}
                    onChange={(value) =>
                      setNutrition((current) => ({
                        ...current,
                        [key]: value,
                      }))
                    }
                  />
                ))}
              </div>
            </Section>

            <Section title="Discoverability">
              <Field label="Tags">
                <input
                  name="tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="Add tags separated by commas"
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
              <h2 style={sideTitleStyle}>Publish</h2>

              <Field label="Status">
                <select
                  name="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>

              <Field label="Reading time">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    name="reading_minutes"
                    type="number"
                    min="1"
                    value={readingMinutes}
                    onChange={(event) =>
                      setReadingMinutes(event.target.value)
                    }
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

              <label style={checkboxLabelStyle}>
                <input
                  name="featured"
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(event.target.checked)
                  }
                />
                Feature this recipe
              </label>

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...primaryButtonStyle,
                  marginTop: "18px",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving…" : "Save Recipe Changes"}
              </button>
            </section>

            <section style={sidePanelStyle}>
              <h2 style={sideTitleStyle}>Recipe details</h2>

              <div style={twoColumnStyle}>
                <Field label="Prep time">
                  <input
                    value={prepTime}
                    onChange={(event) =>
                      setPrepTime(event.target.value)
                    }
                    placeholder="e.g. 10 min"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Cook time">
                  <input
                    value={cookTime}
                    onChange={(event) =>
                      setCookTime(event.target.value)
                    }
                    placeholder="e.g. 8 min"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Servings">
                <input
                  value={servings}
                  onChange={(event) =>
                    setServings(event.target.value)
                  }
                  placeholder="e.g. 2"
                  style={inputStyle}
                />
              </Field>

              <Field label="Difficulty">
                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value)
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
                background: colors.greenSoft,
              }}
            >
              <h2 style={sideTitleStyle}>Editing recipe</h2>

              <p
                style={{
                  margin: 0,
                  color: colors.muted,
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}
              >
                You are editing recipe #{recipeId}. Saving will update
                the existing recipe rather than create a duplicate.
              </p>
            </section>
          </aside>
        </div>
      </form>

      {videoPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setVideoPickerOpen(false)}
          style={overlayStyle}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1040px, 94vw)",
              maxHeight: "88vh",
              overflow: "auto",
              padding: "22px",
              borderRadius: "14px",
              background: "#ffffff",
            }}
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "22px" }}>Attach Existing Video</h2>
                <p style={{ margin: "5px 0 0", color: colors.muted, fontSize: "12px" }}>
                  Selecting a video will connect it to this recipe and create the “View Full Recipe” button on its public video page.
                </p>
              </div>

              <button type="button" onClick={() => setVideoPickerOpen(false)} style={removeButtonStyle}>×</button>
            </div>

            <input
              value={videoSearch}
              onChange={(event) => setVideoSearch(event.target.value)}
              placeholder="Search videos"
              style={inputStyle}
            />

            {videoLibraryLoading ? (
              <div style={emptyPickerStyle}>Loading Video Library…</div>
            ) : filteredVideos.length === 0 ? (
              <div style={emptyPickerStyle}>No matching videos found.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px", marginTop: "14px" }}>
                {filteredVideos.map((video) => {
                  const selected = selectedVideoId === video.id || (!selectedVideoId && video.video_url === videoUrl);

                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => chooseRecipeVideo(video)}
                      style={{
                        overflow: "hidden",
                        padding: 0,
                        border: selected ? `2px solid ${colors.green}` : `1px solid ${colors.border}`,
                        borderRadius: "11px",
                        background: "#ffffff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden", background: "#101410" }}>
                        {video.image_url ? (
                          <img src={video.image_url} alt={video.title} loading="lazy" style={imageStyle} />
                        ) : (
                          <video src={video.video_url || undefined} preload="metadata" muted style={imageStyle} />
                        )}
                        <span style={videoPlayBadgeStyle}>▶</span>
                        {selected && <span style={selectedBadgeStyle}>✓</span>}
                      </div>

                      <div style={{ padding: "11px" }}>
                        <strong style={{ display: "block", color: colors.text, fontSize: "13px", lineHeight: 1.35 }}>{video.title}</strong>
                        <span style={{ display: "block", marginTop: "5px", color: colors.muted, fontSize: "11px" }}>
                          {video.status === "published" ? "Published" : "Draft"}
                          {video.external_url ? " • Already linked" : ""}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {pickerMode && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPickerMode(null)}
          style={overlayStyle}
        >
          <div
            onClick={(event) => event.stopPropagation()}
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
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "22px" }}>
                  {pickerMode === "featured"
                    ? "Choose featured image"
                    : "Choose gallery images"}
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: colors.muted,
                    fontSize: "12px",
                  }}
                >
                  Select an existing image from Media Library.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPickerMode(null)}
                style={removeButtonStyle}
              >
                ×
              </button>
            </div>

            <input
              value={mediaSearch}
              onChange={(event) =>
                setMediaSearch(event.target.value)
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
                      ? featuredImage?.public_url ===
                        asset.public_url
                      : gallery.some(
                          (item) =>
                            item.public_url === asset.public_url
                        );

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => chooseMedia(asset)}
                      style={{
                        overflow: "hidden",
                        padding: 0,
                        border: selected
                          ? `2px solid ${colors.green}`
                          : `1px solid ${colors.border}`,
                        borderRadius: "9px",
                        background: "#ffffff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          aspectRatio: "1 / 1",
                          overflow: "hidden",
                          background: "#edf0ec",
                        }}
                      >
                        <img
                          src={asset.public_url}
                          alt={asset.title}
                          loading="lazy"
                          style={imageStyle}
                        />

                        {selected && (
                          <span style={selectedBadgeStyle}>✓</span>
                        )}
                      </div>

                      <div style={mediaTitleStyle}>
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
                  justifyContent: "flex-end",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPickerMode(null)}
                  style={{
                    ...primaryButtonStyle,
                    width: "auto",
                  }}
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
  children,
}: {
  title: string;
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
          justifyContent: "space-between",
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
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
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
    <label style={{ display: "grid", gap: "6px" }}>
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

function NutritionField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label === "Calories" ? "280" : "12 g"}
        style={inputStyle}
      />
    </Field>
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
    <div style={mediaCardStyle}>
      <strong style={{ fontSize: "13px" }}>{title}</strong>

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

          <div style={{ display: "flex", gap: "8px" }}>
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
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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

const backButtonStyle = {
  padding: "10px 14px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: colors.green,
  fontSize: "13px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const mediaCardStyle = {
  padding: "13px",
  border: `1px solid ${colors.border}`,
  borderRadius: "10px",
  background: "#ffffff",
} as const;

const checkboxLabelStyle = {
  display: "flex",
  gap: "9px",
  alignItems: "center",
  marginTop: "4px",
  color: colors.text,
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
} as const;

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
} as const;

const linkedVideoCardStyle = {
  display: "grid",
  gap: "10px",
  padding: "12px",
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  background: "#fbfcfa",
} as const;

const linkedVideoPreviewStyle = {
  display: "block",
  width: "100%",
  maxHeight: "520px",
  aspectRatio: "9 / 16",
  objectFit: "contain",
  borderRadius: "10px",
  background: "#101410",
} as const;

const attachVideoButtonStyle = {
  display: "grid",
  width: "100%",
  minHeight: "150px",
  padding: "22px",
  placeItems: "center",
  gap: "7px",
  border: `2px dashed ${colors.border}`,
  borderRadius: "12px",
  background: "#fbfcfa",
  color: colors.text,
  fontFamily: "inherit",
  cursor: "pointer",
} as const;

const videoPlayBadgeStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  display: "grid",
  width: "42px",
  height: "42px",
  placeItems: "center",
  border: "2px solid #ffffff",
  borderRadius: "50%",
  background: "rgba(35, 99, 61, 0.92)",
  color: "#ffffff",
  transform: "translate(-50%, -50%)",
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

const galleryRemoveButtonStyle = {
  position: "absolute",
  top: "4px",
  right: "4px",
  width: "22px",
  height: "22px",
  border: "none",
  borderRadius: "50%",
  background: "rgba(0,0,0,0.65)",
  color: "#ffffff",
  cursor: "pointer",
} as const;

const selectedBadgeStyle = {
  position: "absolute",
  top: "7px",
  right: "7px",
  display: "grid",
  width: "24px",
  height: "24px",
  placeItems: "center",
  borderRadius: "50%",
  background: colors.green,
  color: "#ffffff",
  fontWeight: 900,
} as const;

const mediaTitleStyle = {
  overflow: "hidden",
  padding: "9px",
  color: colors.text,
  fontSize: "11px",
  fontWeight: 800,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;