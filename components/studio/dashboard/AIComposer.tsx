"use client";

import { useState } from "react";

import StudioButton from "../ui/StudioButton";
import StudioCard from "../ui/StudioCard";

const contentTypes = [
  "Article",
  "Recipe",
  "Video Script",
  "Product Story",
  "Community Post",
];

export default function AIComposer() {
  const [contentType, setContentType] = useState("Article");
  const [prompt, setPrompt] = useState("");

  function handleGenerate() {
    if (!prompt.trim()) {
      return;
    }

    console.log("Generate content:", {
      contentType,
      prompt,
    });
  }

  return (
    <StudioCard className="ai-composer" padding="large">
      <div className="ai-composer__header">
        <div>
          <p className="ai-composer__eyebrow">
            Create with Zoey
          </p>

          <h2 className="ai-composer__title">
            What would you like to create today?
          </h2>

          <p className="ai-composer__description">
            Share your idea, choose a content type, and let Zoey help
            turn it into polished WonderfulLife content.
          </p>
        </div>

        <div className="ai-composer__badge">
          <span className="ai-composer__badge-dot" />
          Zoey AI
        </div>
      </div>

      <div className="ai-composer__types">
        {contentTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={
              contentType === type
                ? "ai-composer__type ai-composer__type--active"
                : "ai-composer__type"
            }
            onClick={() => setContentType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="ai-composer__field">
        <label htmlFor="zoey-content-prompt">
          Describe your idea
        </label>

        <textarea
          id="zoey-content-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: Create a warm, practical article about five simple morning habits that support energy, focus, and a healthier lifestyle."
          rows={6}
        />
      </div>

      <div className="ai-composer__footer">
        <p>
          Selected format: <strong>{contentType}</strong>
        </p>

        <StudioButton
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim()}
        >
          Generate with Zoey
        </StudioButton>
      </div>
    </StudioCard>
  );
}