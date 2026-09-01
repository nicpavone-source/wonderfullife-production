import Link from "next/link";
import "./meet-zoey-test.css";

const helpCards = [
  {
    icon: "🌿",
    title: "I want to feel healthier",
    text: "Explore simple wellness ideas and everyday habits.",
    href: "/wellness",
  },
  {
    icon: "🥗",
    title: "Help me eat better",
    text: "Practical nutrition guidance.",
    href: "/nutrition",
  },
  {
    icon: "🍽️",
    title: "What should I cook?",
    text: "Find a healthy recipe.",
    href: "/recipes",
  },
  {
    icon: "✨",
    title: "I need some inspiration",
    text: "Wellness, mindfulness and motivation.",
    href: "/videos",
  },
  {
    icon: "💬",
    title: "Ask Zoey",
    text: "Tell me what you need.",
    href: "/ask-zoey",
  },
];

const dayCards = [
  {
    time: "Morning",
    title: "Move your body",
    text: "Begin with movement, breathing and a little time for yourself.",
    href: "/wellness",
    image: "/images/zoey-day-morning.png",
    position: "center 36%",
  },
  {
    time: "Midday",
    title: "Choose fresh",
    text: "Fresh ingredients make healthy choices feel simple.",
    href: "/nutrition",
    image: "/images/zoey-day-midday.png",
    position: "center 34%",
  },
  {
    time: "Afternoon",
    title: "Get outside",
    text: "Move, get outside and give yourself an energy reset.",
    href: "/videos",
    image: "/images/zoey-day-afternoon.png",
    position: "center 28%",
  },
  {
    time: "Evening",
    title: "Make something wonderful",
    text: "Simple, nourishing food made for real life.",
    href: "/recipes",
    image: "/images/zoey-day-evening.png",
    position: "center 30%",
  },
  {
    time: "Wind Down",
    title: "Slow things down",
    text: "Create a little space to relax, reflect and enjoy the moment.",
    href: "/wellness",
    image: "/images/zoey-day-wind-down.png",
    position: "center 32%",
  },
];

export default function MeetZoeyTestPage() {
  return (
    <main className="mz-page">
      <section className="mz-hero">
        <div className="mz-video-shell" id="meet-zoey-video">
          <div className="mz-video-frame">
            <video
              className="mz-video"
              controls
              playsInline
              preload="metadata"
            >
              <source src="/videos/zoey-welcome.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <div className="mz-hero-copy">
          <div className="mz-eyebrow">MEET ZOEY</div>

          <h1>
            Hi, I’m Zoey.
            <span>Your guide to a healthier, happier life.</span>
          </h1>

          <p className="mz-hero-intro">
            Wellness, nutrition, recipes and inspiration—let’s find what works
            for you.
          </p>
        </div>
      </section>

      <section className="mz-help" id="help">
        <div className="mz-section-heading">
          <span>START HERE</span>
          <h2>What can I help you with today?</h2>
          <p>Choose what feels most useful right now.</p>
        </div>

        <div className="mz-help-grid">
          {helpCards.map((card) => (
            <Link href={card.href} key={card.title} className="mz-help-card">
              <div className="mz-help-icon">{card.icon}</div>

              <div className="mz-help-card-copy">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>

              <span className="mz-card-link">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mz-about">
        <div className="mz-about-photo">
          <picture>
            <source
              media="(max-width: 720px)"
              srcSet="/images/meet-zoey-mobile.png"
            />
            <img
              src="/images/meet-zoey-hero.png"
              alt="Zoey in a bright Vancouver home"
            />
          </picture>
        </div>

        <div className="mz-about-copy">
          <span className="mz-script">A little about me</span>
          <h2>Wellness doesn’t have to be complicated.</h2>

          <p>
            I believe feeling better shouldn’t mean completely changing your
            life. Sometimes it’s a healthier meal, a morning walk, a few quiet
            minutes, or simply knowing where to begin.
          </p>

          <p>
            That’s what I’m here for—to help make the next step feel a little
            clearer, a little easier, and a lot more enjoyable.
          </p>

          <div className="mz-signature">— Zoey ♡</div>
        </div>
      </section>

      <section className="mz-day">
        <div className="mz-section-heading">
          <span>A DAY WITH ZOEY</span>
          <h2>Small moments can change the feel of your whole day.</h2>
          <p>
            Explore a simple rhythm of movement, nourishment, inspiration and
            rest.
          </p>
        </div>

        <div className="mz-day-grid">
          {dayCards.map((card) => (
            <Link
              href={card.href}
              key={card.time}
              className="mz-day-card"
              style={{
                backgroundImage: `linear-gradient(
                  180deg,
                  rgba(8, 28, 17, 0.06) 0%,
                  rgba(8, 28, 17, 0.18) 42%,
                  rgba(8, 28, 17, 0.82) 100%
                ), url("${card.image}")`,
                backgroundSize: "cover",
                backgroundPosition: card.position,
                backgroundRepeat: "no-repeat",
              }}
            >
              <span className="mz-day-time">{card.time}</span>

              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>

              <span className="mz-day-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mz-ask">
        <div className="mz-ask-avatar">Z</div>

        <div className="mz-ask-copy">
          <span>ASK ZOEY</span>
          <h2>Where would you like to begin?</h2>
          <p>“Tell me what you’re looking for. I’ll help you find it.”</p>

          <div className="mz-suggestions">
            <span>Help me sleep better</span>
            <span>Healthy dinner tonight</span>
            <span>I need more energy</span>
            <span>Surprise me</span>
          </div>
        </div>

        <Link className="mz-button mz-ask-button" href="/ask-zoey">
          Ask Zoey →
        </Link>
      </section>
    </main>
  );
}