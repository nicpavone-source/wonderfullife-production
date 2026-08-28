import Image from "next/image";

export default function AIStudioPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="relative w-full">
        <Image
          src="/images/wl-home-aistudio-001-approved.png"
          alt="WonderfulLife AI Studio homepage featuring Zoey creating videos, podcasts, articles, recipes, images, and wellness research"
          width={1536}
          height={1024}
          priority
          className="h-auto w-full object-cover"
        />
      </div>
    </main>
  );
}