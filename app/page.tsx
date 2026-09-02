import Hero from "../components/Hero";
import HomeEditorialGrid from "../components/HomeEditorialGrid";
import "./zoey-home.css";

export default function HomePage() {
  return (
    <main className="wl-home">
      <Hero />
      <HomeEditorialGrid />
    </main>
  );
}