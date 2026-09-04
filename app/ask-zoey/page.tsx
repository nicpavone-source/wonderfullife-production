import ZoeyVideo from "@/components/ZoeyVideo";

const topics = [
  {
  label: "More Energy",
  target: "/ask-zoey/more-energy",
  image: "/images/editorial/jogging.png",
  page: true,
},
  {
    label: "Healthy Weight",
    target: "weight",
    image: "/images/editorial/walking.png",
  },
  {
    label: "Gut Health",
    target: "gut",
    image: "/images/editorial/outdoor eating.png",
  },
  {
    label: "Better Sleep",
    target: "sleep",
    image: "/images/editorial/person sleeping.png",
  },
  {
    label: "Eat Better",
    target: "nutrition",
    image: "/images/editorial/zoey-day-midday.png",
  },
  {
    label: "Stay Strong",
    target: "strength",
    image: "/images/editorial/protein and muscle.png",
  },
  {
    label: "Less Stress",
    target: "stress",
    image: "/images/editorial/stress free.png",
  },
  {
    label: "Healthy Aging",
    target: "aging",
    image: "/images/editorial/zoey-day-morning.png",
  },
];

const questions = [
  {
    id: "energy",
    question: "Why am I tired all the time?",
    answer:
      "Low energy can have many causes. Start with the basics: consistent sleep, enough nutritious food, adequate protein, hydration, regular movement and fewer long periods without eating. Persistent or unexplained fatigue should be discussed with a healthcare professional.",
    product: "14-Day Energy Reset",
    productText:
      "A practical two-week plan built around meals, hydration, movement, sleep and everyday habits.",
  },
  {
    id: "weight",
    question: "How can I lose weight without going on another diet?",
    answer:
      "Sustainable weight management usually works better when the focus shifts away from extreme restriction and toward habits you can repeat: satisfying meals, adequate protein and fibre, sensible portions, movement and consistency.",
    product: "21-Day Eat Better Reset",
    productText:
      "Simple meals, grocery guidance, portion strategies and practical daily habits.",
  },
  {
    id: "gut",
    question: "Why am I always bloated?",
    answer:
      "Bloating can be influenced by meal size, eating speed, fibre intake, carbonated drinks, certain foods and digestive conditions. A simple food-and-symptom diary may help reveal patterns. Persistent, severe or painful bloating should be medically assessed.",
    product: "21-Day Gut-Friendly Eating Plan",
    productText:
      "A food-first approach to building healthier digestive habits with simple meals and planning tools.",
  },
  {
    id: "sleep",
    question: "How can I sleep better naturally?",
    answer:
      "Start with a consistent wake time, morning daylight, regular activity, a cool and dark bedroom and a calmer final hour before bed. Caffeine timing, alcohol and heavy late meals can also affect sleep.",
    product: "14-Day Better Sleep Reset",
    productText:
      "A straightforward daytime and evening routine designed to support healthier sleep habits.",
  },
  {
    id: "nutrition",
    question: "How do I start eating healthier without changing everything?",
    answer:
      "Improve the meals you already eat rather than trying to replace your entire diet overnight. Add protein, vegetables or fruit, fibre-rich foods and water. Small improvements repeated consistently are far more useful than chasing perfection.",
    product: "21-Day Eat Better Reset",
    productText:
      "A step-by-step system for making healthy eating practical instead of overwhelming.",
  },
  {
    question: "How much protein do I actually need?",
    answer:
      "Protein needs vary with body size, age, activity level and personal goals. A useful everyday approach is to include a meaningful protein source at each meal rather than leaving most of your protein intake until dinner.",
    product: "Wonderful-Life Protein & Meal Guide",
    productText:
      "Protein-rich breakfasts, lunches, dinners and snacks with easy meal-planning guidance.",
  },
  {
    question: "How do I stop craving sugar?",
    answer:
      "Sugar cravings can become stronger when meals are skipped or are not satisfying. Regular meals containing protein, fibre and healthy fats can help. Sleep, stress and habitual snacking can also play a role.",
    product: "21-Day Eat Better Reset",
    productText:
      "Build more satisfying meals and a healthier daily eating rhythm.",
  },
  {
    question: "What should I eat when I'm always hungry?",
    answer:
      "Meals that combine protein, fibre-rich foods, vegetables or fruit and some healthy fat tend to be more satisfying than highly refined foods eaten alone. Meal timing and adequate overall food intake matter too.",
    product: "21-Day Eat Better Reset",
    productText:
      "Meal ideas and planning tools designed around satisfying, realistic eating.",
  },
  {
    question: "What should I eat for more energy?",
    answer:
      "Energy-supporting meals often combine protein, minimally processed carbohydrates, vegetables or fruit and adequate fluids. Long gaps between meals or meals dominated by refined carbohydrates can leave some people feeling sluggish.",
    product: "14-Day Energy Reset",
    productText:
      "Two weeks of simple meals and everyday energy-supporting habits.",
  },
  {
    question: "Why do I crash every afternoon?",
    answer:
      "Afternoon crashes may be influenced by sleep, hydration, lunch composition, caffeine habits, prolonged sitting or an overly demanding schedule. Look at the entire daily pattern rather than treating the afternoon slump in isolation.",
    product: "14-Day Energy Reset",
    productText:
      "A structured plan for improving the everyday habits that influence energy.",
  },
  {
    id: "strength",
    question: "How can I stay strong after 40?",
    answer:
      "Strength training, adequate protein, regular movement, recovery and good nutrition become increasingly important as we age. The goal doesn't have to be extreme fitness. Maintaining strength, mobility and independence is a powerful objective.",
    product: "30-Day Strong After 40",
    productText:
      "A practical introduction to strength, protein, movement and recovery.",
  },
  {
    question: "How can I protect my mobility as I get older?",
    answer:
      "Regular strength work, walking, balance exercises, good nutrition and staying physically active all contribute to maintaining function. Consistency matters much more than complicated routines.",
    product: "30-Day Strong After 40",
    productText:
      "Simple routines for building strength, movement and healthy-aging habits.",
  },
  {
    id: "stress",
    question: "What can I do when I feel stressed all the time?",
    answer:
      "Start with small actions that reduce the daily load: movement, outdoor time, regular meals, sufficient sleep, breathing exercises and intentional breaks from screens. Significant or persistent anxiety deserves professional support.",
    product: "Wonderful-Life Daily Reset",
    productText:
      "Short daily routines for movement, mindfulness, sleep and personal wellbeing.",
  },
  {
    id: "aging",
    question: "What actually matters most for healthy aging?",
    answer:
      "The fundamentals remain powerful: stay physically active, maintain strength, eat nutritious food, sleep adequately, maintain meaningful relationships and keep up with appropriate preventive healthcare.",
    product: "30-Day Strong After 40",
    productText:
      "A practical healthy-aging program focused on habits you can influence.",
  },
  {
    question: "How can I eat healthy when I'm busy?",
    answer:
      "Make healthy food easier to choose. Keep several dependable breakfasts, lunches and dinners, use frozen produce when convenient, prepare protein ahead of time and build a repeatable grocery list.",
    product: "Wonderful-Life Healthy Recipe System",
    productText:
      "Four weeks of simple meals, planning tools and organized grocery lists.",
  },
  {
    question: "Can I eat healthy without spending a fortune?",
    answer:
      "Yes. Beans, lentils, eggs, oats, potatoes, frozen vegetables, seasonal fruit, canned fish and other simple foods can form the backbone of nutritious meals without expensive specialty products.",
    product: "Wonderful-Life Healthy Recipe System",
    productText:
      "Affordable meal ideas, shopping lists and practical everyday recipes.",
  },
];

export default function AskZoeyPage() {
  return (
    <main className="ask-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .ask-page {
          min-height: 100vh;
          background:
            linear-gradient(
              180deg,
              #f5f9f3 0%,
              #ffffff 46%,
              #f5f8f3 100%
            );
          color: #173d29;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ask-shell {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 28px 44px 70px;
        }

        /* =========================================================
           HERO
           ========================================================= */

        .ask-hero {
          display: grid;
          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(0, 0.95fr);
          gap: 28px;
          align-items: stretch;
        }

        .video-wrap {
          min-width: 0;
          overflow: hidden;
          border-radius: 28px;
        }

        .hero-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;

          padding: 44px 42px;

          background: rgba(255,255,255,0.96);
          border: 1px solid #dfe8dc;
          border-radius: 28px;

          box-shadow:
            0 20px 60px rgba(20,61,41,0.06);
        }

        .eyebrow {
          margin: 0 0 12px;

          color: #287148;

          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .hero-title {
          max-width: 650px;
          margin: 0;

          color: #173d29;

          font-family: Arial, Helvetica, sans-serif;
          font-size: clamp(42px, 4vw, 62px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.02;
        }

        .hero-text {
          max-width: 640px;
          margin: 22px 0 0;

          color: #69776e;

          font-size: 17px;
          font-weight: 400;
          line-height: 1.65;
        }

        .hero-trust {
          margin-top: 28px;
          padding-top: 22px;

          border-top: 1px solid #e5ebe2;

          color: #456151;

          font-size: 13px;
          font-weight: 600;
          line-height: 1.6;
        }

        /* =========================================================
           CATEGORY CARDS
           ========================================================= */

        .category-section {
          margin-top: 34px;
        }

        .category-heading {
          margin-bottom: 17px;
        }

        .category-heading h2 {
          margin: 0;

          color: #173d29;

          font-family: Arial, Helvetica, sans-serif;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .category-heading p {
          margin: 7px 0 0;

          color: #718078;

          font-size: 14px;
          line-height: 1.5;
        }

        .topic-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        .topic-card {
          position: relative;

          display: block;

          min-width: 0;
          aspect-ratio: 4 / 3;

          overflow: hidden;

          border-radius: 20px;

          background: #eaf0e7;
          border: 1px solid rgba(23,61,41,0.08);

          text-decoration: none;

          box-shadow:
            0 8px 28px rgba(23,61,41,0.06);

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease;
        }

        .topic-card:hover {
          transform: translateY(-3px);

          box-shadow:
            0 14px 34px rgba(23,61,41,0.12);
        }

        .topic-card img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          transition: transform 0.3s ease;
        }

        .topic-card:hover img {
          transform: scale(1.035);
        }

        .topic-shade {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              to top,
              rgba(8,34,20,0.82) 0%,
              rgba(8,34,20,0.32) 34%,
              rgba(8,34,20,0.02) 68%
            );
        }

        .topic-label {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 16px;

          color: #ffffff;

          font-family: Arial, Helvetica, sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.15;

          text-shadow:
            0 2px 8px rgba(0,0,0,0.22);
        }

        /* =========================================================
           POPULAR QUESTIONS
           ========================================================= */

        .questions {
          width: 100%;
          max-width: 1120px;

          margin: 72px auto 0;
        }

        .section-head {
          max-width: 760px;
          margin: 0 auto 30px;

          text-align: center;
        }

        .section-head h2 {
          margin: 6px 0 12px;

          color: #173d29;

          font-family: Arial, Helvetica, sans-serif;
          font-size: clamp(34px, 4vw, 48px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.06;
        }

        .section-head > p:last-child {
          margin: 0;

          color: #6d7a72;

          font-size: 16px;
          font-weight: 400;
          line-height: 1.6;
        }

        .faq-list {
          display: grid;
          gap: 12px;
        }

        .faq {
          overflow: hidden;

          background: #ffffff;
          border: 1px solid #dfe7dc;
          border-radius: 18px;

          box-shadow:
            0 7px 24px rgba(20,61,41,0.03);
        }

        .faq summary {
          display: flex;
          align-items: center;
          gap: 18px;

          min-height: 76px;
          padding: 18px 22px;

          cursor: pointer;
          list-style: none;

          color: #173d29;

          font-family: Arial, Helvetica, sans-serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.35;
        }

        .faq summary::-webkit-details-marker {
          display: none;
        }

        .question-number {
          display: grid;
          place-items: center;

          width: 36px;
          height: 36px;
          flex: 0 0 36px;

          border-radius: 50%;

          background: #f0f5ed;

          color: #267047;

          font-size: 12px;
          font-weight: 700;
        }

        .faq-question {
          flex: 1;
        }

        .plus {
          flex: 0 0 auto;

          color: #74837a;

          font-size: 25px;
          font-weight: 300;
          line-height: 1;

          transition: transform 0.2s ease;
        }

        .faq[open] .plus {
          transform: rotate(45deg);
        }

        .faq[open] summary {
          border-bottom:
            1px solid #edf1eb;
        }

        .faq-body {
          padding:
            23px
            26px
            26px
            76px;
        }

        .faq-answer {
          max-width: 880px;

          margin: 0;

          color: #56655c;

          font-size: 16px;
          font-weight: 400;
          line-height: 1.72;
        }

        /* =========================================================
           PRODUCT / GO DEEPER
           ========================================================= */

        .offer {
          max-width: 880px;

          margin-top: 22px;
          padding: 18px 20px;

          background: #f3f7f0;
          border: 1px solid #dce7d8;
          border-radius: 15px;
        }

        .offer-label {
          margin: 0 0 6px;

          color: #267047;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .offer h3 {
          margin: 0 0 6px;

          color: #173d29;

          font-size: 17px;
          font-weight: 700;
          line-height: 1.3;
        }

        .offer-description {
          margin: 0;

          color: #68766e;

          font-size: 14px;
          line-height: 1.55;
        }

        .coming {
          display: inline-flex;
          align-items: center;

          margin-top: 14px;
          padding: 9px 14px;

          background: #173d29;
          border-radius: 999px;

          color: #ffffff;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .trust-note {
          max-width: 850px;

          margin: 38px auto 0;
          padding: 20px 24px;

          background: #fafbf9;
          border: 1px solid #e2e8df;
          border-radius: 16px;

          color: #758078;

          font-size: 12px;
          line-height: 1.65;
          text-align: center;
        }
.more-questions {
  margin-top: 8px;
}

.more-questions > summary {
  list-style: none;
}

.more-questions > summary::-webkit-details-marker {
  display: none;
}

.more-questions-button {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 58px;
  padding: 15px 24px;

  background: #173d29;
  border-radius: 999px;

  color: #ffffff;

  cursor: pointer;

  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.more-questions-button::after {
  content: " ↓";
  margin-left: 8px;
}

.more-questions[open] .more-questions-button::after {
  content: " ↑";
}

.more-questions-list {
  display: grid;
  gap: 12px;

  margin-top: 12px;
}
        /* =========================================================
           DESKTOP HERO TIGHTENING
           Keeps tablet/mobile styling completely unchanged.
           ========================================================= */

        @media (min-width: 1001px) {
          .ask-shell {
            padding-top: 20px;
          }

          .ask-hero {
            gap: 24px;
          }

          .video-wrap {
            height: 410px;
          }

          .video-wrap video {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
          }

          .hero-copy {
            padding: 30px 36px;
          }

          .eyebrow {
            margin-bottom: 9px;
          }

          .hero-title {
            font-size: clamp(40px, 3.6vw, 56px);
          }

          .hero-text {
            margin-top: 16px;
            line-height: 1.55;
          }

          .category-section {
            margin-top: 22px;
          }
        }

        /* =========================================================
           DESKTOP QUESTION SPACING — TIGHTENED
           ========================================================= */

        @media (min-width: 1001px) {
          .questions {
            margin-top: 46px;
          }

          .section-head {
            margin-bottom: 22px;
          }

          .section-head h2 {
            margin: 4px 0 9px;
          }
        }

        /* =========================================================
           TABLET
           ========================================================= */

        @media (max-width: 1000px) {
          .ask-shell {
            padding-left: 26px;
            padding-right: 26px;
          }

          .ask-hero {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .hero-copy {
            padding: 30px;
          }

          .topic-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* =========================================================
           MOBILE
           ========================================================= */

        @media (max-width: 760px) {
          .ask-shell {
            width: 100%;
            max-width: none;

            padding:
              14px
              12px
              48px;
          }

          .ask-hero {
            display: block;
          }

          .video-wrap {
            width: 100%;
            height: 300px;

            margin-bottom: 12px;

            border-radius: 22px;
          }

          .hero-copy {
            padding: 24px 20px 23px;

            border-radius: 22px;

            box-shadow:
              0 12px 32px rgba(20,61,41,0.045);
          }

          .eyebrow {
            margin-bottom: 9px;

            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.17em;
          }

          .hero-title {
            font-size: 34px;
            font-weight: 700;
            letter-spacing: -0.035em;
            line-height: 1.06;
          }

          .hero-text {
            margin-top: 14px;

            font-size: 14px;
            line-height: 1.55;
          }

          .hero-trust {
            margin-top: 18px;
            padding-top: 16px;

            font-size: 11.5px;
          }

          /* IMAGE CATEGORY GRID */

          .category-section {
            margin-top: 26px;
          }

          .category-heading {
            padding: 0 3px;
            margin-bottom: 13px;
          }

          .category-heading h2 {
            font-size: 21px;
          }

          .category-heading p {
            margin-top: 5px;

            font-size: 12.5px;
          }

          .topic-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .topic-card {
            aspect-ratio: 4 / 3;

            border-radius: 14px;

            box-shadow:
              0 5px 18px rgba(23,61,41,0.055);
          }

          .topic-label {
            left: 11px;
            right: 11px;
            bottom: 10px;

            font-size: 14px;
            font-weight: 700;
          }

          /* QUESTIONS */

          .questions {
            margin-top: 46px;
          }

          .section-head {
            margin-bottom: 20px;
            padding: 0 4px;

            text-align: left;
          }

          .section-head h2 {
            margin-top: 5px;
            margin-bottom: 9px;

            font-size: 29px;
            font-weight: 700;
            letter-spacing: -0.035em;
            line-height: 1.08;
          }

          .section-head > p:last-child {
            font-size: 13.5px;
            line-height: 1.55;
          }

          .faq-list {
            gap: 8px;
          }

          .faq {
            border-radius: 15px;
          }

          .faq summary {
            gap: 11px;

            min-height: 66px;

            padding: 14px 15px;

            font-size: 15px;
            font-weight: 600;
            line-height: 1.32;
          }

          .question-number {
            width: 31px;
            height: 31px;
            flex-basis: 31px;

            font-size: 10px;
          }

          .plus {
            font-size: 22px;
          }

          .faq-body {
            padding:
              18px
              16px
              19px;
          }

          .faq-answer {
            font-size: 14px;
            line-height: 1.65;
          }

          .offer {
            margin-top: 17px;
            padding: 15px;

            border-radius: 13px;
          }

          .offer h3 {
            font-size: 15px;
          }

          .offer-description {
            font-size: 12.5px;
          }

          .coming {
            margin-top: 11px;

            font-size: 10px;
          }

          .trust-note {
            margin-top: 26px;
            padding: 17px;

            font-size: 11px;
          }
        }

        /* =========================================================
           SMALL PHONES
           ========================================================= */

        @media (max-width: 390px) {
          .ask-shell {
            padding-left: 10px;
            padding-right: 10px;
          }

          .video-wrap {
            height: 270px;
          }

          .hero-title {
            font-size: 31px;
          }

          .topic-label {
            font-size: 13px;
          }

          .section-head h2 {
            font-size: 27px;
          }

          .faq summary {
            font-size: 14px;
          }
        }
          /* SHOW MORE QUESTIONS — FINAL OVERRIDE */

.faq-list > .more-questions {
  margin-top: 14px;
}

.faq-list > .more-questions > summary.more-questions-button {
  display: flex !important;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 58px;

  padding: 16px 24px;

  background: #173d29;
  border: none;
  border-radius: 16px;

  color: #ffffff;

  cursor: pointer;
  list-style: none;

  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
}

.faq-list > .more-questions > summary.more-questions-button::-webkit-details-marker {
  display: none;
}

.faq-list > .more-questions > summary.more-questions-button::marker {
  display: none;
  content: "";
}

.faq-list > .more-questions > summary.more-questions-button::after {
  content: "↓";
  margin-left: 10px;

  font-size: 16px;
  font-weight: 400;
}

.faq-list > .more-questions[open] > summary.more-questions-button::after {
  content: "↑";
}

.more-questions-list {
  display: grid;
  gap: 12px;

  margin-top: 12px;
}
      `}</style>

      <section className="ask-shell">

        {/* HERO */}
        <section className="ask-hero">
          <div className="video-wrap">
            <ZoeyVideo />
          </div>

          <div className="hero-copy">
            <p className="eyebrow">
              Ask Zoey
            </p>

            <h1 className="hero-title">
              What can I help you with today?
            </h1>

            <p className="hero-text">
              Simple, practical guidance for the health, food and
              wellness questions people ask every day. Choose what
              you would like help with and start there.
            </p>

            
          </div>
        </section>

        {/* CATEGORY IMAGE CARDS */}
        <section className="category-section">
          <div className="category-heading">
            <h2>
              What would you like to improve?
            </h2>

            <p>
              Choose a topic to jump straight to the questions that
              matter to you.
            </p>
          </div>

          <div className="topic-grid">
            {topics.map((topic) => (
             <a
  className="topic-card"
  href={topic.page ? topic.target : `#${topic.target}`}
  key={topic.label}
>
                <img
                  src={topic.image}
                  alt={topic.label}
                />

                <div className="topic-shade" />

                <div className="topic-label">
                  {topic.label}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* QUESTIONS */}
        <section
          className="questions"
          id="popular-questions"
        >
          <div className="section-head">
            <p className="eyebrow">
              Popular Questions
            </p>

            <h2>
               What would you like help with?
              
            </h2>

            <p>
              Start with a straightforward answer. Then explore
              practical next steps and deeper Wonderful-Life guides
              whenever you want more help.
            </p>
          </div>

          <div className="faq-list">
  {questions.slice(0, 6).map((item, index) => (
    <details
      className="faq"
      id={item.id}
      key={`${item.question}-${index}`}
    >
      <summary>
        <span className="question-number">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="faq-question">
          {item.question}
        </span>

        <span className="plus">+</span>
      </summary>

      <div className="faq-body">
        <p className="faq-answer">
          {item.answer}
        </p>

        <div className="offer">
          <p className="offer-label">
            Go Deeper
          </p>

          <h3>{item.product}</h3>

          <p className="offer-description">
            {item.productText}
          </p>

          <span className="coming">
            Wonderful-Life Guide — Coming Soon
          </span>
        </div>
      </div>
    </details>
  ))}

  <details className="more-questions">
    <summary className="more-questions-button">
      Show More Questions
    </summary>

    <div className="more-questions-list">
      {questions.slice(6).map((item, index) => {
        const questionNumber = index + 7;

        return (
          <details
            className="faq"
            id={item.id}
            key={`${item.question}-${questionNumber}`}
          >
            <summary>
              <span className="question-number">
                {String(questionNumber).padStart(2, "0")}
              </span>

              <span className="faq-question">
                {item.question}
              </span>

              <span className="plus">+</span>
            </summary>

            <div className="faq-body">
              <p className="faq-answer">
                {item.answer}
              </p>

              <div className="offer">
                <p className="offer-label">
                  Go Deeper
                </p>

                <h3>{item.product}</h3>

                <p className="offer-description">
                  {item.productText}
                </p>

                <span className="coming">
                  Wonderful-Life Guide — Coming Soon
                </span>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  </details>
</div>

          <div className="trust-note">
            Wonderful-Life provides general educational wellness
            information. It is not a substitute for individualized
            medical diagnosis, treatment or professional healthcare
            advice.
          </div>
        </section>
      </section>
    </main>
  );
}