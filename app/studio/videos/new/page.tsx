import VideoEditor from "@/components/studio/videos/VideoEditor";

export const metadata = {
  title: "Upload Video | WonderfulLife Studio",
};

export default function NewVideoPage() {
  return <VideoEditor mode="create" />;
}