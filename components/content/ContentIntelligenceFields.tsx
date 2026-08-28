"use client";

import { useMemo, useState } from "react";

export type IntelligenceTopic = {
  id: number;
  name: string;
  slug: string;
  primary_section: string;
  active?: boolean;
};

export type IntelligenceTag = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  active?: boolean;
};

type ContentIntelligenceFieldsProps = {
  topics: IntelligenceTopic[];
  tags: IntelligenceTag[];

  defaultPrimarySection?: string | null;
  defaultTopic?: string | null;
  defaultTags?: string[] | null;

  sectionName?: string;
  topicName?: string;
  tagsName?: string;
};

const SECTIONS = [
  "Wellness",
  "Nutrition",
  "Recipes",
  "Shop",
  "Videos",
  "Inspiration",
  "Join Our Team",
];

function normalizeTagValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function activeTagsForDefaults(tags: IntelligenceTag[]) {
  return tags.filter((tag) => tag.active !== false);
}

function resolveDefaultTags(
  tags: IntelligenceTag[],
  values: string[]
) {
  const resolved = values
    .map((value) => {
      const cleanValue = String(value || "").trim();

      if (!cleanValue) {
        return null;
      }

      const normalized = normalizeTagValue(cleanValue);

      const match = tags.find((tag) => {
        return (
          tag.slug === cleanValue ||
          tag.slug === normalized ||
          tag.name.toLowerCase().trim() ===
            cleanValue.toLowerCase().trim()
        );
      });

      return match?.slug || null;
    })
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(resolved));
}

export default function ContentIntelligenceFields({
  topics,
  tags,

  defaultPrimarySection = "",
  defaultTopic = "",
  defaultTags = [],

  sectionName = "primary_section",
  topicName = "topic",
  tagsName = "tags",
}: ContentIntelligenceFieldsProps) {
  const activeTopics = useMemo(() => {
    return topics.filter((topic) => topic.active !== false);
  }, [topics]);

  const activeTags = useMemo(() => {
    return tags.filter((tag) => tag.active !== false);
  }, [tags]);

  const resolvedDefaultTags = useMemo(() => {
    return resolveDefaultTags(
      activeTagsForDefaults(tags),
      Array.isArray(defaultTags) ? defaultTags : []
    );
  }, [tags, defaultTags]);

  const [primarySection, setPrimarySection] = useState(
    defaultPrimarySection || ""
  );

  const [selectedTopic, setSelectedTopic] = useState(
    defaultTopic || ""
  );

  const [selectedTags, setSelectedTags] =
    useState<string[]>(resolvedDefaultTags);

  const [tagSearch, setTagSearch] = useState("");

  const filteredTopics = useMemo(() => {
    if (!primarySection) {
      return activeTopics;
    }

    return activeTopics.filter(
      (topic) =>
        topic.primary_section.toLowerCase() ===
        primarySection.toLowerCase()
    );
  }, [activeTopics, primarySection]);

  const filteredTags = useMemo(() => {
    const search = tagSearch.trim().toLowerCase();

    return activeTags
      .filter((tag) => {
        if (!search) {
          return true;
        }

        return (
          tag.name.toLowerCase().includes(search) ||
          tag.slug.toLowerCase().includes(search) ||
          (tag.category || "")
            .toLowerCase()
            .includes(search)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeTags, tagSearch]);

  const selectedTagObjects = useMemo(() => {
    return activeTags.filter((tag) =>
      selectedTags.includes(tag.slug)
    );
  }, [activeTags, selectedTags]);

  function handleSectionChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newSection = event.target.value;

    setPrimarySection(newSection);

    const currentTopic = activeTopics.find(
      (topic) => topic.slug === selectedTopic
    );

    if (
      currentTopic &&
      currentTopic.primary_section.toLowerCase() !==
        newSection.toLowerCase()
    ) {
      setSelectedTopic("");
    }
  }

  function toggleTag(slug: string) {
    setSelectedTags((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }

      return [...current, slug];
    });
  }

  function removeTag(slug: string) {
    setSelectedTags((current) =>
      current.filter((item) => item !== slug)
    );
  }

  return (
    <section className="intelligence-panel">
      <style>{`
        .intelligence-panel {
          width: 100%;
          margin-top: 24px;
          overflow: hidden;
          border: 1px solid #dce5dc;
          border-radius: 18px;
          background: #ffffff;
          color: #173d29;
        }

        .intelligence-header {
          padding: 22px 24px;
          border-bottom: 1px solid #e7ece7;
          background:
            linear-gradient(
              135deg,
              #f8fbf7 0%,
              #f0f7ef 100%
            );
        }

        .intelligence-eyebrow {
          margin: 0 0 6px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .intelligence-title {
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 25px;
          line-height: 1.15;
        }

        .intelligence-description {
          max-width: 760px;
          margin: 8px 0 0;
          color: #718077;
          font-size: 13px;
          line-height: 1.6;
        }

        .intelligence-body {
          padding: 22px 24px 24px;
        }

        .intelligence-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          gap: 16px;
        }

        .intelligence-field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 7px;
        }

        .intelligence-label {
          color: #234b35;
          font-size: 12px;
          font-weight: 900;
        }

        .intelligence-help {
          margin: 0;
          color: #89958d;
          font-size: 11px;
          line-height: 1.45;
        }

        .intelligence-select,
        .tag-search-input {
          width: 100%;
          min-height: 48px;
          padding: 10px 13px;
          border: 1px solid #d9e3d9;
          border-radius: 10px;
          outline: none;
          background: #ffffff;
          color: #253c2e;
          font: inherit;
        }

        .intelligence-select:focus,
        .tag-search-input:focus {
          border-color: #2b7748;
          box-shadow:
            0 0 0 3px
            rgba(43, 119, 72, 0.08);
        }

        .selected-tags-section {
          margin-top: 20px;
        }

        .selected-tags-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 9px;
        }

        .selected-tags-title {
          margin: 0;
          color: #234b35;
          font-size: 12px;
          font-weight: 900;
        }

        .selected-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          background: #e8f3e7;
          color: #23633d;
          font-size: 10px;
          font-weight: 900;
        }

        .selected-tags {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          min-height: 42px;
          padding: 10px;
          border: 1px solid #e0e7e0;
          border-radius: 11px;
          background: #f8faf7;
        }

        .selected-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 9px 7px 11px;
          border-radius: 999px;
          background: #23633d;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
        }

        .remove-tag {
          display: inline-grid;
          width: 18px;
          height: 18px;
          padding: 0;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background:
            rgba(255, 255, 255, 0.18);
          color: #ffffff;
          cursor: pointer;
          font-size: 12px;
          line-height: 1;
        }

        .no-selected-tags {
          display: flex;
          align-items: center;
          min-height: 22px;
          color: #8a968e;
          font-size: 11px;
        }

        .tag-manager {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #edf1ed;
        }

        .tag-manager-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 12px;
        }

        .tag-manager-heading h3 {
          margin: 0;
          color: #173d29;
          font-size: 15px;
        }

        .tag-manager-heading p {
          margin: 4px 0 0;
          color: #89958d;
          font-size: 11px;
        }

        .tag-search {
          width: min(100%, 310px);
        }

        .tag-search-input {
          min-height: 42px;
          font-size: 13px;
        }

        .tag-list {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(180px, 1fr)
            );
          gap: 8px;
          max-height: 310px;
          overflow-y: auto;
          padding: 3px 4px 4px 0;
        }

        .tag-option {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 9px;
          padding: 10px;
          border: 1px solid #e0e7e0;
          border-radius: 10px;
          background: #ffffff;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background-color 0.15s ease,
            transform 0.15s ease;
        }

        .tag-option:hover {
          border-color: #abc8b2;
          background: #f7faf6;
          transform: translateY(-1px);
        }

        .tag-option-selected {
          border-color: #75a983;
          background: #edf7ee;
        }

        .tag-checkbox {
          width: 17px;
          height: 17px;
          flex: 0 0 auto;
          accent-color: #23633d;
        }

        .tag-text {
          min-width: 0;
        }

        .tag-name {
          display: block;
          overflow: hidden;
          color: #244130;
          font-size: 12px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tag-category {
          display: block;
          margin-top: 2px;
          overflow: hidden;
          color: #8a968e;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .tag-empty {
          grid-column: 1 / -1;
          padding: 30px 16px;
          border: 1px dashed #d7e1d7;
          border-radius: 10px;
          color: #87938b;
          text-align: center;
          font-size: 12px;
        }

        .intelligence-summary {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #edf1ed;
        }

        .summary-item {
          padding: 12px;
          border: 1px solid #e1e8e1;
          border-radius: 10px;
          background: #fafcfa;
        }

        .summary-label {
          margin: 0 0 4px;
          color: #8b978f;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .summary-value {
          overflow: hidden;
          margin: 0;
          color: #244130;
          font-size: 12px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 760px) {
          .intelligence-grid {
            grid-template-columns: 1fr;
          }

          .tag-manager-heading {
            align-items: stretch;
            flex-direction: column;
          }

          .tag-search {
            width: 100%;
          }

          .intelligence-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="intelligence-header">
        <p className="intelligence-eyebrow">
          WonderfulLife Content Intelligence
        </p>

        <h2 className="intelligence-title">
          Classification & Relationships
        </h2>

        <p className="intelligence-description">
          Tell WonderfulLife what this content is about.
          Topics and tags will be used to automatically
          discover related articles, recipes, videos and
          products throughout the website.
        </p>
      </div>

      <div className="intelligence-body">
        <div className="intelligence-grid">
          <div className="intelligence-field">
            <label
              className="intelligence-label"
              htmlFor={`${sectionName}-field`}
            >
              Primary Section
            </label>

            <select
              id={`${sectionName}-field`}
              name={sectionName}
              className="intelligence-select"
              value={primarySection}
              onChange={handleSectionChange}
            >
              <option value="">
                Select primary section
              </option>

              {SECTIONS.map((section) => (
                <option
                  key={section}
                  value={section}
                >
                  {section}
                </option>
              ))}
            </select>

            <p className="intelligence-help">
              Determines where this content primarily
              belongs on WonderfulLife.
            </p>
          </div>

          <div className="intelligence-field">
            <label
              className="intelligence-label"
              htmlFor={`${topicName}-field`}
            >
              Topic
            </label>

            <select
              id={`${topicName}-field`}
              name={topicName}
              className="intelligence-select"
              value={selectedTopic}
              onChange={(event) =>
                setSelectedTopic(event.target.value)
              }
            >
              <option value="">
                Select topic
              </option>

              {filteredTopics.map((topic) => (
                <option
                  key={topic.id}
                  value={topic.slug}
                >
                  {topic.name}
                </option>
              ))}
            </select>

            <p className="intelligence-help">
              Topics automatically filter according to
              the selected primary section.
            </p>
          </div>
        </div>

        <div className="selected-tags-section">
          <div className="selected-tags-header">
            <p className="selected-tags-title">
              Selected Tags
            </p>

            <span className="selected-count">
              {selectedTags.length}
            </span>
          </div>

          <div className="selected-tags">
            {selectedTagObjects.length === 0 ? (
              <div className="no-selected-tags">
                No matching tags selected yet.
              </div>
            ) : (
              selectedTagObjects.map((tag) => (
                <span
                  key={tag.id}
                  className="selected-tag"
                >
                  {tag.name}

                  <button
                    type="button"
                    className="remove-tag"
                    aria-label={`Remove ${tag.name}`}
                    onClick={() =>
                      removeTag(tag.slug)
                    }
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="tag-manager">
          <div className="tag-manager-heading">
            <div>
              <h3>Choose Tags</h3>

              <p>
                Select all keywords that accurately
                describe this content.
              </p>
            </div>

            <div className="tag-search">
              <input
                type="search"
                className="tag-search-input"
                value={tagSearch}
                onChange={(event) =>
                  setTagSearch(event.target.value)
                }
                placeholder="Search tags..."
              />
            </div>
          </div>

          <div className="tag-list">
            {filteredTags.length === 0 ? (
              <div className="tag-empty">
                No tags match your search.
              </div>
            ) : (
              filteredTags.map((tag) => {
                const checked =
                  selectedTags.includes(tag.slug);

                return (
                  <label
                    key={tag.id}
                    className={`tag-option ${
                      checked
                        ? "tag-option-selected"
                        : ""
                    }`}
                  >
                    <input
                      className="tag-checkbox"
                      type="checkbox"
                      name={tagsName}
                      value={tag.slug}
                      checked={checked}
                      onChange={() =>
                        toggleTag(tag.slug)
                      }
                    />

                    <span className="tag-text">
                      <span className="tag-name">
                        {tag.name}
                      </span>

                      <span className="tag-category">
                        {tag.category ||
                          "General"}
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="intelligence-summary">
          <div className="summary-item">
            <p className="summary-label">
              Section
            </p>

            <p className="summary-value">
              {primarySection || "Not selected"}
            </p>
          </div>

          <div className="summary-item">
            <p className="summary-label">
              Topic
            </p>

            <p className="summary-value">
              {selectedTopic || "Not selected"}
            </p>
          </div>

          <div className="summary-item">
            <p className="summary-label">
              Tags
            </p>

            <p className="summary-value">
              {selectedTags.length} selected
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}