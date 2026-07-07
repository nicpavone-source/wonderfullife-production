import Link from "next/link";

export default function FloatingZoey() {
  return (
    <Link href="/ask-zoey" className="fixed bottom-4 right-4 z-50 rounded-full border border-forest/20 bg-white px-5 py-4 font-black text-forest shadow-xl">
      🎙 Ask Zoey
    </Link>
  );
}
