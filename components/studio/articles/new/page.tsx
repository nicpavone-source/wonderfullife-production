"use client";

import { useState } from "react";
import Link from "next/link";

import StudioButton from "../../ui/StudioButton";
import StudioCard from "../../ui/StudioCard";

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Wellness");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState("");

  function saveDraft() {
    setMessage("Draft saved successfully.");
  }

  function publishArticle() {
    if (!title.trim() || !content.trim()) {
      setMessage("Please add an article title and content before publishing.");
      return;
    }

    setMessage("Article is ready to publish.");
  }

  return (
    <div className="article-editor-page">
      <header className="article-editor-page__header">
        <div>
          <Link
            href="/studio/articles"
            className="article-editor-page__back"
          >
            ← Back to Articles
          </Link>

          <p className="article-editor-page__eyebrow">
            WonderfulLife Content Studio
          </p>

          <h1>Create New Article</h1>

          <p>
            Write, organize, save, and publish a complete WonderfulLife article.
          </p>
        </div>

        <div className="article-editor-page__actions">
          <StudioButton
            type="button"
            variant="secondary"
            onClick={saveDraft}
          >
            Save Draft
          </StudioButton>

          <StudioButton
            type="button"
            onClick={publishArticle}
          >
            Publish Article
          </StudioButton>
        </div>
      </header>

      {message && (
        <div className="article-editor-page__message">
          {message}
        </div>
      )}

      <div className="article-editor-page__layout">
        <main className="article-editor-page__main">
          <StudioCard padding="large">
            <div className="article-editor-field">
              <label htmlFor="article-title">
                Article title
              </label>

              <input
                id="article-title"
                className="studio-field"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter a clear, helpful article title"
              />
            </div>

            <div className="article-editor-field">
              <label htmlFor="article-excerpt">
                Excerpt
              </label>

              <textarea
                id="article-excerpt"
                className="studio-field"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                placeholder="Write a short summary for article cards and search results."
                rows={4}
              />
            </div>

            <div className="article-editor-field">
              <label htmlFor="article-content">
                Article content
              </label>

              <textarea
                id="article-content"
                className="studio-field article-editor-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Begin writing your WonderfulLife article..."
                rows={18}
              />
            </div>
          </StudioCard>
        </main>

        <aside className="article-editor-page__sidebar">
          <StudioCard padding="large">
            <h2>Publishing</h2>

            <div className="article-editor-field">
              <label htmlFor="article-category">
                Category
              </label>

              <select
                id="article-category"
                className="studio-field"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Wellness</option>
                <option>Nutrition</option>
                <option>Healthy Living</option>
                <option>Fitness</option>
                <option>Mindset</option>
                <option>Community</option>
              </select>
            </div>

            <div className="article-editor-field">
              <label htmlFor="article-tags">
                Tags
              </label>

              <input
                id="article-tags"
                className="studio-field"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="wellness, energy, habits"
              />

              <p className="studio-helper-text">
                Separate tags with commas.
              </p>
            </div>
          </StudioCard>

          <StudioCard padding="large">
            <h2>Featured Image</h2>

            <div className="article-editor-upload">
              <span>🖼️</span>
              <strong>Add featured image</strong>
              <p>Upload support will be connected next.</p>
            </div>
          </StudioCard>

          <StudioCard padding="large">
            <h2>SEO Preview</h2>

            <div className="article-editor-preview">
              <strong>
                {title || "Your article title"}
              </strong>

              <p>
                {excerpt ||
                  "Your article description will appear here."}
              </p>
            </div>
          </StudioCard>
        </aside>
      </div>
    </div>
  );
}