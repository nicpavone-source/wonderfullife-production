"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function JoinForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "sending") {
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const interest = String(formData.get("interest") ?? "").trim();
    const note = String(formData.get("message") ?? "").trim();

    if (!name || !email || !location || !interest) {
      setStatus("error");
      setErrorMessage("Please complete the required fields.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase public configuration is missing.");

      setStatus("error");
      setErrorMessage(
        "We couldn't send your inquiry right now. Please try again shortly."
      );
      return;
    }

    const message = [
      "JOIN OUR TEAM INQUIRY",
      "",
      `Location: ${location}`,
      `Interest: ${interest}`,
      "",
      note ? `Message: ${note}` : "Message: No additional message provided.",
    ].join("\n");

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase.from("contact_messages").insert({
        name,
        email,
        recipient: "zoey",
        subject: "Join Our Team",
        message,
        page_path: "/join",
        status: "new",
        is_read: false,
      });

      if (error) {
        throw error;
      }

      form.reset();
      setStatus("success");

      document
        .getElementById("join-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error("Join form submission failed:", error);

      setStatus("error");
      setErrorMessage(
        "We couldn't send your inquiry right now. Please try again."
      );
    }
  }

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <div className="join-form-grid">
        <div className="join-field">
          <label htmlFor="join-name">Your Name</label>

          <input
            id="join-name"
            name="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            maxLength={120}
            required
          />
        </div>

        <div className="join-field">
          <label htmlFor="join-email">Email Address</label>

          <input
            id="join-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
      </div>

      <div className="join-field">
        <label htmlFor="join-location">Where are you located?</label>

        <select
          id="join-location"
          name="location"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Choose your area
          </option>

          <option value="Greater Vancouver">
            Greater Vancouver / Lower Mainland
          </option>

          <option value="Elsewhere in British Columbia">
            Elsewhere in British Columbia
          </option>

          <option value="Elsewhere in Canada">
            Elsewhere in Canada
          </option>

          <option value="Outside Canada">
            Outside Canada
          </option>
        </select>
      </div>

      <div className="join-field">
        <label htmlFor="join-interest">
          What interests you most?
        </label>

        <select
          id="join-interest"
          name="interest"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Choose one
          </option>

          <option value="Business Opportunity">
            Business Opportunity
          </option>

          <option value="Wellness and Products">
            Wellness & Products
          </option>

          <option value="Business Opportunity and Wellness">
            Both
          </option>

          <option value="Just Curious">
            I'm Just Curious
          </option>
        </select>
      </div>

      <div className="join-field">
        <label htmlFor="join-message">
          Anything you'd like to ask?
          <span className="join-optional"> Optional</span>
        </label>

        <textarea
          id="join-message"
          name="message"
          placeholder="Tell Zoey what you'd like to know..."
          maxLength={3000}
        />
      </div>

      <button
        type="submit"
        className="join-submit"
        disabled={status === "sending"}
      >
        {status === "sending"
          ? "Sending..."
          : status === "success"
            ? "Inquiry Sent ✓"
            : "I'm Interested →"}
      </button>

      {status === "success" && (
        <div className="join-success" role="status">
          <strong>Thank you!</strong>
          <span>
            Your inquiry has been received by the Wonderful-Life team.
            We'll review it and get back to you.
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="join-error" role="alert">
          {errorMessage}
        </div>
      )}

      <p className="join-privacy">
        No obligation. Your information is used only to review and
        respond to your inquiry.
      </p>
    </form>
  );
}