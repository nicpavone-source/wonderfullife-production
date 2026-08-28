import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

type Topic = {
  id: number;
  name: string;
  slug: string;
  primary_section: string;
  description: string | null;
  active: boolean;
};

type Tag = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  active: boolean;
};

const SECTIONS = [
  "Wellness",
  "Nutrition",
  "Recipes",
  "Shop",
  "Videos",
  "Inspiration",
];

const STARTER_TOPICS = [
  ["Exercise", "exercise", "Wellness"],
  ["Sleep", "sleep", "Wellness"],
  ["Stress Management", "stress-management", "Wellness"],
  ["Tai Chi", "tai-chi", "Wellness"],
  ["Yoga", "yoga", "Wellness"],
  ["Healthy Aging", "healthy-aging", "Wellness"],
  ["Longevity", "longevity", "Wellness"],

  ["Protein", "protein", "Nutrition"],
  ["Omega-3", "omega-3", "Nutrition"],
  ["Gut Health", "gut-health", "Nutrition"],
  ["Blood Sugar", "blood-sugar", "Nutrition"],
  ["Fiber", "fiber", "Nutrition"],
  ["Hydration", "hydration", "Nutrition"],
  ["Vitamins", "vitamins", "Nutrition"],
  ["Minerals", "minerals", "Nutrition"],
  ["Antioxidants", "antioxidants", "Nutrition"],

  ["Breakfast", "breakfast", "Recipes"],
  ["Lunch", "lunch", "Recipes"],
  ["Dinner", "dinner", "Recipes"],
  ["Smoothies", "smoothies", "Recipes"],
  ["Soups", "soups", "Recipes"],
  ["Desserts", "desserts", "Recipes"],

  ["Supplements", "supplements", "Shop"],
  ["Nutrition Products", "nutrition-products", "Shop"],
  ["Skincare", "skincare", "Shop"],

  ["Educational", "educational", "Videos"],
  ["Recipe Videos", "recipe-videos", "Videos"],
  ["Wellness Videos", "wellness-videos", "Videos"],
  ["Product Videos", "product-videos", "Videos"],

  ["Daily Inspiration", "daily-inspiration", "Inspiration"],
  ["Mantras", "mantras", "Inspiration"],
  ["Affirmations", "affirmations", "Inspiration"],
  ["Meditation", "meditation", "Inspiration"],
  ["Gratitude", "gratitude", "Inspiration"],
  ["Faith", "faith", "Inspiration"],
  ["Motivation", "motivation", "Inspiration"],
];

const STARTER_TAGS = [
  ["Omega-3", "omega-3", "Nutrition"],
  ["BiOmega", "biomega", "Products"],
  ["Heart Health", "heart-health", "Wellness"],
  ["Brain Health", "brain-health", "Wellness"],
  ["Fish Oil", "fish-oil", "Nutrition"],
  ["EPA", "epa", "Nutrition"],
  ["DHA", "dha", "Nutrition"],

  ["Protein", "protein", "Nutrition"],
  ["Muscle Health", "muscle-health", "Wellness"],
  ["Healthy Aging", "healthy-aging", "Wellness"],
  ["Longevity", "longevity", "Wellness"],

  ["Gut Health", "gut-health", "Nutrition"],
  ["Microbiome", "microbiome", "Nutrition"],
  ["Probiotics", "probiotics", "Nutrition"],
  ["Prebiotics", "prebiotics", "Nutrition"],

  ["Blood Sugar", "blood-sugar", "Nutrition"],
  ["Glucose", "glucose", "Nutrition"],

  ["Hydration", "hydration", "Nutrition"],
  ["Electrolytes", "electrolytes", "Nutrition"],

  ["Magnesium", "magnesium", "Nutrition"],
  ["Calcium", "calcium", "Nutrition"],
  ["Vitamin D", "vitamin-d", "Nutrition"],
  ["Vitamin C", "vitamin-c", "Nutrition"],

  ["Antioxidants", "antioxidants", "Nutrition"],
  ["Cellular Health", "cellular-health", "Wellness"],

  ["Sleep", "sleep", "Wellness"],
  ["Stress", "stress", "Wellness"],
  ["Meditation", "meditation", "Wellness"],
  ["Mindfulness", "mindfulness", "Wellness"],

  ["Salmon", "salmon", "Recipes"],
  ["Breakfast", "breakfast", "Recipes"],
  ["Lunch", "lunch", "Recipes"],
  ["Dinner", "dinner", "Recipes"],
  ["Smoothie", "smoothie", "Recipes"],
  ["Soup", "soup", "Recipes"],
  ["Dessert", "dessert", "Recipes"],

  ["USANA", "usana", "Products"],
  ["HealthPak", "healthpak", "Products"],
  ["CellSentials", "cellsentials", "Products"],
  ["Procosa", "procosa", "Products"],
  ["Probiotic", "probiotic", "Products"],
  ["Collagen", "collagen", "Products"],

  ["Motivation", "motivation", "Inspiration"],
  ["Gratitude", "gratitude", "Inspiration"],
  ["Affirmation", "affirmation", "Inspiration"],
  ["Mantra", "mantra", "Inspiration"],
  ["Solfeggio", "solfeggio", "Inspiration"],
  ["528 Hz", "528-hz", "Inspiration"],
  ["396 Hz", "396-hz", "Inspiration"],
  ["741 Hz", "741-hz", "Inspiration"],
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return supabase;
}

async function createTopic(formData: FormData) {
  "use server";

  const supabase = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const section = String(
    formData.get("primary_section") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  if (!name || !section) {
    redirect(
      `/studio/content-intelligence?message=${encodeURIComponent(
        "Topic name and primary section are required."
      )}`
    );
  }

  const { error } = await supabase
    .from("content_topics")
    .insert({
      name,
      slug: slugify(name),
      primary_section: section,
      description: description || null,
      active: true,
    });

  if (error) {
    redirect(
      `/studio/content-intelligence?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/studio/content-intelligence");

  redirect(
    `/studio/content-intelligence?message=${encodeURIComponent(
      "Topic added successfully."
    )}`
  );
}

async function createTag(formData: FormData) {
  "use server";

  const supabase = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const category = String(
    formData.get("category") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  if (!name) {
    redirect(
      `/studio/content-intelligence?message=${encodeURIComponent(
        "Tag name is required."
      )}`
    );
  }

  const { error } = await supabase
    .from("content_tags")
    .insert({
      name,
      slug: slugify(name),
      category: category || null,
      description: description || null,
      active: true,
    });

  if (error) {
    redirect(
      `/studio/content-intelligence?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/studio/content-intelligence");

  redirect(
    `/studio/content-intelligence?message=${encodeURIComponent(
      "Tag added successfully."
    )}`
  );
}

async function toggleTopic(formData: FormData) {
  "use server";

  const supabase = await requireUser();

  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase
    .from("content_topics")
    .update({
      active: !active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/studio/content-intelligence");
}

async function toggleTag(formData: FormData) {
  "use server";

  const supabase = await requireUser();

  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase
    .from("content_tags")
    .update({
      active: !active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/studio/content-intelligence");
}

async function seedStarterLibrary() {
  "use server";

  const supabase = await requireUser();

  const topics = STARTER_TOPICS.map(
    ([name, slug, primary_section]) => ({
      name,
      slug,
      primary_section,
      active: true,
    })
  );

  const tags = STARTER_TAGS.map(
    ([name, slug, category]) => ({
      name,
      slug,
      category,
      active: true,
    })
  );

  const { error: topicError } = await supabase
    .from("content_topics")
    .upsert(topics, {
      onConflict: "slug",
      ignoreDuplicates: true,
    });

  if (topicError) {
    redirect(
      `/studio/content-intelligence?message=${encodeURIComponent(
        topicError.message
      )}`
    );
  }

  const { error: tagError } = await supabase
    .from("content_tags")
    .upsert(tags, {
      onConflict: "slug",
      ignoreDuplicates: true,
    });

  if (tagError) {
    redirect(
      `/studio/content-intelligence?message=${encodeURIComponent(
        tagError.message
      )}`
    );
  }

  revalidatePath("/studio/content-intelligence");

  redirect(
    `/studio/content-intelligence?message=${encodeURIComponent(
      "WonderfulLife starter Topics and Tags have been installed."
    )}`
  );
}

export default async function ContentIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await requireUser();

  const [
    { data: topicData, error: topicError },
    { data: tagData, error: tagError },
  ] = await Promise.all([
    supabase
      .from("content_topics")
      .select(
        `
          id,
          name,
          slug,
          primary_section,
          description,
          active
        `
      )
      .order("primary_section")
      .order("name"),

    supabase
      .from("content_tags")
      .select(
        `
          id,
          name,
          slug,
          category,
          description,
          active
        `
      )
      .order("category")
      .order("name"),
  ]);

  const topics = (topicData || []) as Topic[];
  const tags = (tagData || []) as Tag[];

  const activeTopics = topics.filter(
    (topic) => topic.active
  ).length;

  const activeTags = tags.filter(
    (tag) => tag.active
  ).length;

  return (
    <main className="ci-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .ci-page {
          min-height: 100vh;
          padding: 40px 28px 80px;
          background: #f5f8f4;
          color: #173d29;
        }

        .ci-container {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #287244;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(38px, 5vw, 56px);
          line-height: 1;
          letter-spacing: -0.035em;
        }

        .description {
          max-width: 850px;
          margin: 14px 0 0;
          color: #68766d;
          font-size: 16px;
          line-height: 1.65;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 28px;
        }

        .stat {
          padding: 20px;
          border: 1px solid #dce5dc;
          border-radius: 16px;
          background: #ffffff;
        }

        .stat-value {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 34px;
          font-weight: 700;
        }

        .stat-label {
          margin: 7px 0 0;
          color: #718077;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .message {
          margin-top: 22px;
          padding: 14px 18px;
          border: 1px solid #cfe3d2;
          border-radius: 12px;
          background: #edf7ee;
          color: #23633d;
          font-size: 14px;
          font-weight: 800;
        }

        .seed-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 24px;
          padding: 20px;
          border: 1px solid #dce5dc;
          border-radius: 16px;
          background: #ffffff;
        }

        .seed-box h2 {
          margin: 0;
          font-size: 18px;
        }

        .seed-box p {
          max-width: 720px;
          margin: 6px 0 0;
          color: #738077;
          font-size: 13px;
          line-height: 1.55;
        }

        .primary-button {
          min-height: 44px;
          padding: 0 18px;
          border: 0;
          border-radius: 10px;
          background: #23633d;
          color: #ffffff;
          cursor: pointer;
          font-weight: 900;
        }

        .manager-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          margin-top: 24px;
          align-items: start;
        }

        .panel {
          overflow: hidden;
          border: 1px solid #dce5dc;
          border-radius: 20px;
          background: #ffffff;
        }

        .panel-header {
          padding: 22px;
          border-bottom: 1px solid #e5ebe5;
          background: #fbfcfa;
        }

        .panel-header h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
        }

        .panel-header p {
          margin: 7px 0 0;
          color: #78867d;
          font-size: 13px;
          line-height: 1.5;
        }

        .create-form {
          display: grid;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid #e7ece7;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field label {
          font-size: 11px;
          font-weight: 900;
        }

        .field input,
        .field select {
          width: 100%;
          min-height: 44px;
          padding: 9px 12px;
          border: 1px solid #d9e3d9;
          border-radius: 9px;
          outline: none;
          background: #ffffff;
          color: #263b2e;
          font: inherit;
        }

        .field input:focus,
        .field select:focus {
          border-color: #2e7b4a;
          box-shadow: 0 0 0 3px rgba(46,123,74,.08);
        }

        .library {
          max-height: 780px;
          overflow-y: auto;
        }

        .library-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 15px 22px;
          border-bottom: 1px solid #edf1ed;
        }

        .library-item:last-child {
          border-bottom: 0;
        }

        .item-name {
          margin: 0;
          font-size: 14px;
          font-weight: 900;
        }

        .item-meta {
          margin: 4px 0 0;
          color: #839087;
          font-size: 11px;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .active-badge,
        .inactive-badge {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
        }

        .active-badge {
          background: #e7f6eb;
          color: #18703a;
        }

        .inactive-badge {
          background: #f0f1ef;
          color: #788078;
        }

        .toggle-button {
          min-height: 34px;
          padding: 0 11px;
          border: 1px solid #d5dfd5;
          border-radius: 8px;
          background: #ffffff;
          color: #23633d;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
        }

        .empty {
          padding: 36px 22px;
          color: #7b887f;
          text-align: center;
        }

        .error {
          margin-top: 22px;
          padding: 16px;
          border: 1px solid #ebcaca;
          border-radius: 12px;
          background: #fff3f3;
          color: #a03b3b;
          font-weight: 800;
        }

        @media (max-width: 950px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .manager-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .ci-page {
            padding: 28px 16px 60px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ci-container">
        <header>
          <p className="eyebrow">
            WonderfulLife Studio
          </p>

          <h1 className="title">
            Content Intelligence
          </h1>

          <p className="description">
            Manage the Topics and Tags that connect
            WonderfulLife articles, recipes, videos and
            products. These relationships will power related
            content, homepage recommendations, search and
            Ask Zoey.
          </p>
        </header>

        <section className="stats">
          <div className="stat">
            <p className="stat-value">
              {topics.length}
            </p>
            <p className="stat-label">
              Topics
            </p>
          </div>

          <div className="stat">
            <p className="stat-value">
              {activeTopics}
            </p>
            <p className="stat-label">
              Active Topics
            </p>
          </div>

          <div className="stat">
            <p className="stat-value">
              {tags.length}
            </p>
            <p className="stat-label">
              Tags
            </p>
          </div>

          <div className="stat">
            <p className="stat-value">
              {activeTags}
            </p>
            <p className="stat-label">
              Active Tags
            </p>
          </div>
        </section>

        {params.message ? (
          <div className="message">
            {params.message}
          </div>
        ) : null}

        {topicError || tagError ? (
          <div className="error">
            {topicError?.message ||
              tagError?.message}
          </div>
        ) : null}

        <section className="seed-box">
          <div>
            <h2>
              WonderfulLife Starter Library
            </h2>

            <p>
              Install the initial wellness, nutrition,
              recipe, product, video and inspiration Topics
              and Tags. You can expand the library whenever
              you need new subjects.
            </p>
          </div>

          <form action={seedStarterLibrary}>
            <button
              type="submit"
              className="primary-button"
            >
              Install Starter Library
            </button>
          </form>
        </section>

        <section className="manager-grid">

          {/* TOPICS */}

          <div className="panel">
            <div className="panel-header">
              <h2>Topics</h2>

              <p>
                Broad subjects used to organize content
                inside each WonderfulLife section.
              </p>
            </div>

            <form
              action={createTopic}
              className="create-form"
            >
              <div className="form-row">
                <div className="field">
                  <label>
                    Topic Name
                  </label>

                  <input
                    name="name"
                    placeholder="e.g. Joint Health"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Primary Section
                  </label>

                  <select
                    name="primary_section"
                    required
                    defaultValue=""
                  >
                    <option
                      value=""
                      disabled
                    >
                      Select section
                    </option>

                    {SECTIONS.map(
                      (section) => (
                        <option
                          key={section}
                          value={section}
                        >
                          {section}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>
                  Description — Optional
                </label>

                <input
                  name="description"
                  placeholder="Short internal description"
                />
              </div>

              <button
                type="submit"
                className="primary-button"
              >
                Add Topic
              </button>
            </form>

            <div className="library">
              {topics.length === 0 ? (
                <div className="empty">
                  No topics yet. Install the
                  starter library above.
                </div>
              ) : (
                topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="library-item"
                  >
                    <div>
                      <p className="item-name">
                        {topic.name}
                      </p>

                      <p className="item-meta">
                        {topic.primary_section}
                        {" • "}
                        {topic.slug}
                      </p>
                    </div>

                    <div className="item-actions">
                      <span
                        className={
                          topic.active
                            ? "active-badge"
                            : "inactive-badge"
                        }
                      >
                        {topic.active
                          ? "Active"
                          : "Inactive"}
                      </span>

                      <form
                        action={toggleTopic}
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={topic.id}
                        />

                        <input
                          type="hidden"
                          name="active"
                          value={String(
                            topic.active
                          )}
                        />

                        <button
                          type="submit"
                          className="toggle-button"
                        >
                          {topic.active
                            ? "Disable"
                            : "Enable"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TAGS */}

          <div className="panel">
            <div className="panel-header">
              <h2>Tags</h2>

              <p>
                Specific keywords used by the
                recommendation engine to discover
                closely related content.
              </p>
            </div>

            <form
              action={createTag}
              className="create-form"
            >
              <div className="form-row">
                <div className="field">
                  <label>
                    Tag Name
                  </label>

                  <input
                    name="name"
                    placeholder="e.g. Joint Health"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    defaultValue=""
                  >
                    <option value="">
                      General
                    </option>

                    <option value="Wellness">
                      Wellness
                    </option>

                    <option value="Nutrition">
                      Nutrition
                    </option>

                    <option value="Recipes">
                      Recipes
                    </option>

                    <option value="Products">
                      Products
                    </option>

                    <option value="Videos">
                      Videos
                    </option>

                    <option value="Inspiration">
                      Inspiration
                    </option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>
                  Description — Optional
                </label>

                <input
                  name="description"
                  placeholder="Short internal description"
                />
              </div>

              <button
                type="submit"
                className="primary-button"
              >
                Add Tag
              </button>
            </form>

            <div className="library">
              {tags.length === 0 ? (
                <div className="empty">
                  No tags yet. Install the
                  starter library above.
                </div>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="library-item"
                  >
                    <div>
                      <p className="item-name">
                        {tag.name}
                      </p>

                      <p className="item-meta">
                        {tag.category ||
                          "General"}
                        {" • "}
                        {tag.slug}
                      </p>
                    </div>

                    <div className="item-actions">
                      <span
                        className={
                          tag.active
                            ? "active-badge"
                            : "inactive-badge"
                        }
                      >
                        {tag.active
                          ? "Active"
                          : "Inactive"}
                      </span>

                      <form
                        action={toggleTag}
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={tag.id}
                        />

                        <input
                          type="hidden"
                          name="active"
                          value={String(
                            tag.active
                          )}
                        />

                        <button
                          type="submit"
                          className="toggle-button"
                        >
                          {tag.active
                            ? "Disable"
                            : "Enable"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}