"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoEditor, {
  VideoRecord,
} from "../../../../../components/studio/videos/VideoEditor";
import { createClient } from "../../../../../lib/supabase/client";

export default function EditVideoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [video, setVideo] = useState<VideoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadVideo() {
      const id = Number(params.id);

      if (!Number.isInteger(id)) {
        setErrorMessage("This video ID is invalid.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("content_items")
        .select(
          "id,title,slug,excerpt,body,category,status,featured,image_url,video_url,tags,published_at"
        )
        .eq("id", id)
        .eq("type", "video")
        .maybeSingle();

      if (error) {
        setErrorMessage(`The video could not be loaded: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("This video record could not be found.");
        setLoading(false);
        return;
      }

      setVideo(data as VideoRecord);
      setLoading(false);
    }

    void loadVideo();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px",
          background: "#f6f8f5",
          color: "#173d29",
        }}
      >
        <h1>Loading video…</h1>
      </main>
    );
  }

  if (errorMessage || !video) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px",
          background: "#f6f8f5",
          color: "#173d29",
        }}
      >
        <h1>Video could not be opened</h1>

        <p>{errorMessage}</p>

        <button
          type="button"
          onClick={() => router.push("/studio/videos")}
          style={{
            marginTop: "20px",
            padding: "11px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#23633d",
            color: "#ffffff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Return to Video Library
        </button>
      </main>
    );
  }

  return <VideoEditor mode="edit" initialVideo={video} />;
}