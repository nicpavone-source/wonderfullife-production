"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
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
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !subject || !message) {
      setStatus("error");
      setErrorMessage("Please complete all fields before sending.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase public configuration is missing.");

      setStatus("error");
      setErrorMessage(
        "We couldn't send your message right now. Please try again shortly."
      );
      return;
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase.from("contact_messages").insert({
        name,
        email,
        recipient: "zoey",
        subject,
        message,
        page_path: "/contact",
        status: "new",
        is_read: false,
      });

      if (error) {
        throw error;
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      console.error("Contact form submission failed:", error);

      setStatus("error");
      setErrorMessage(
        "We couldn't send your message right now. Please try again."
      );
    }
  }

  return (
    <form className="wl-contact-form" onSubmit={handleSubmit}>
      <div className="wl-contact-two-column">
        <div className="wl-contact-field">
          <label htmlFor="contact-name">Your Name</label>

          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            maxLength={120}
            required
          />
        </div>

        <div className="wl-contact-field">
          <label htmlFor="contact-email">Email Address</label>

          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
      </div>

      <div className="wl-contact-field">
        <label htmlFor="contact-subject">What can we help with?</label>

        <select
          id="contact-subject"
          name="subject"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Choose a subject
          </option>

          <option value="WonderfulLife Question">
            WonderfulLife Question
          </option>

          <option value="Join Our Team">Join Our Team</option>

          <option value="USANA Opportunity">USANA Opportunity</option>

          <option value="Wellness or Nutrition">
            Wellness or Nutrition
          </option>

          <option value="Website Support">Website Support</option>

          <option value="Other">Other</option>
        </select>
      </div>

      <div className="wl-contact-field">
        <label htmlFor="contact-message">Message</label>

        <textarea
          id="contact-message"
          name="message"
          placeholder="Tell us how we can help..."
          maxLength={5000}
          required
        />
      </div>

      <button
        type="submit"
        className="wl-contact-submit"
        disabled={status === "sending"}
      >
        {status === "sending"
          ? "Sending..."
          : status === "success"
            ? "Message Sent ✓"
            : "Send Message →"}
      </button>

      {status === "success" && (
        <div
          role="status"
          style={{
            padding: "13px 15px",
            borderRadius: "14px",
            background: "#eef7ef",
            color: "#185d35",
            fontSize: "13px",
            fontWeight: 800,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          Thank you. Your message has been received by the Wonderful-Life
          team.
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          style={{
            padding: "13px 15px",
            borderRadius: "14px",
            background: "#fff2f0",
            color: "#9d342b",
            fontSize: "13px",
            fontWeight: 800,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          {errorMessage}
        </div>
      )}

      <p className="wl-contact-privacy">
        Your information is used only to review and respond to your inquiry.
      </p>
    </form>
  );
}