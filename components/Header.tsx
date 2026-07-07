import Link from "next/link";

const links = [
  ["Home", "/"],
  ["Articles", "/articles"],
  ["Recipes", "/recipes"],
  ["Videos", "/videos"],
  ["Dashboard", "/dashboard"],
  ["Journey", "/journey"],
  ["Community", "/community"],
  ["Studio", "/studio/articles"]
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-warm/95 px-5 py-4 backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-serif text-3xl font-bold">
          Wonderful<span className="text-forest">Life</span>.ca
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm font-black">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full bg-white px-4 py-2 text-forest shadow-sm">
              {label}
            </Link>
          ))}
          <Link href="/sign-in" className="rounded-full bg-forest px-4 py-2 text-white shadow-sm">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
