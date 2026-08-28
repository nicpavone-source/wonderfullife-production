import "./meet-zoey.css";

const cards = [
  {
    icon: "🌿",
    title: "My Philosophy",
    text: "Simple choices. Real results. Sustainable wellness for life.",
  },
  {
    icon: "👥",
    title: "Why WonderfulLife?",
    text: "A community of people who want to live healthier, happier, and more meaningful lives.",
  },
  {
    icon: "◻️",
    title: "Why I Chose USANA",
    text: "Clean, science-based supplements you can trust to support your health and your future.",
  },
  {
    icon: "♡",
    title: "Let’s Build Your WonderfulLife",
    text: "Small, daily steps. Big, lasting change. I’m here to walk with you on your journey.",
  },
];

export default function MeetZoeyPage() {
  return (
    <main className="meet-zoey-page">
      <section className="meet-zoey-hero">
        <div className="meet-zoey-photo">
          <img
            src="/images/meet-zoey-hero.png"
            alt="Zoey holding a tablet in a bright Vancouver home"
            className="meet-zoey-image"
          />
        </div>

        <div className="meet-zoey-content">
          <header className="meet-zoey-title">
            <span>Meet</span>
            <h1>ZOEY</h1>
            <h2>Welcome to WonderfulLife</h2>
          </header>

          <div className="meet-zoey-copy">
            <div>
              <h3>Hi, I’m Zoey.</h3>
              <p>I’m so happy you’re here.</p>

              <p>
                WonderfulLife was created with one simple belief:
                <strong>
                  {" "}
                  healthy living should feel simple, achievable, and enjoyable
                </strong>
                —not confusing or overwhelming.
              </p>

              <p>
                Every day we’re surrounded by endless opinions about nutrition,
                exercise, supplements, and wellness. It’s easy to wonder who to
                trust or where to begin.
              </p>
            </div>

            <div>
              <h3>That’s why WonderfulLife exists.</h3>

              <p>
                My goal is to help simplify wellness by bringing together
                practical recipes, science-informed education, healthy
                lifestyle ideas, and supportive guidance—all in one place.
              </p>

              <p>
                Whether you’re preparing your first healthy meal, looking for
                new ways to stay active, exploring nutritional supplements, or
                simply trying to build better daily habits, I’m here to help
                you take the next step.
              </p>

              <h3>Not to be perfect—just the best you.</h3>
            </div>
          </div>

          <div className="meet-zoey-cards">
            {cards.map((card) => (
              <article className="meet-zoey-card" key={card.title}>
                <div className="meet-zoey-card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <span className="meet-zoey-card-arrow">⌄</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="meet-zoey-quote">
        <div className="meet-zoey-quote-mark">“</div>

        <p>
          I created WonderfulLife because I believe great health is built one
          small choice at a time. With the right information, support, and
          community, we can all create a life we love.
        </p>

        <div className="meet-zoey-signature">
          <span>I’m excited to be part of your journey.</span>
          <small>— Zoey ♡</small>
        </div>
      </section>
    </main>
  );
}