"use client";

import { useState } from "react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const starters = [
  {
    label: "More Energy",
    prompt: "How can I improve my energy naturally throughout the day?",
    icon: "⚡",
  },
  {
    label: "Better Sleep",
    prompt: "What can I do to improve my sleep and recovery?",
    icon: "🌙",
  },
  {
    label: "Nutrition",
    prompt: "Help me improve my everyday nutrition.",
    icon: "🥗",
  },
  {
    label: "Reduce Stress",
    prompt: "What are some practical ways to reduce stress and feel calmer?",
    icon: "🧘",
  },
  {
    label: "Healthy Aging",
    prompt: "What should I focus on for healthy aging and long-term vitality?",
    icon: "💪",
  },
  {
    label: "Surprise Me",
    prompt: "Give me one wellness idea I can use today.",
    icon: "✨",
  },
];

export default function ZoeyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Zoey. What would you like to explore today? You can ask me about wellness, nutrition, sleep, healthy aging, products, recipes, or simply where to begin.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text = input) {
    const message = text.trim();

    if (!message || loading) return;

    setInput("");
    setLoading(true);

    const next: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: message,
      },
    ];

    setMessages(next);

    try {
      const res = await fetch("/api/zoey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await res.json();

      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            data.reply ||
            "I’m here with you. Let’s find one practical next step together.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "I’m having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showStarters =
    messages.length === 1 && !loading;

  return (
    <div className="zoey-chat">
      <style>{`
        .zoey-chat {
          display: flex;
          min-height: 490px;
          flex-direction: column;
        }

        .zoey-chat-window {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: #cfdccf transparent;
        }

        .zoey-message-row {
          display: flex;
          margin-bottom: 14px;
        }

        .zoey-message-row.user {
          justify-content: flex-end;
        }

        .zoey-message {
          max-width: 88%;
          padding: 14px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.55;
        }

        .zoey-message.assistant {
          border: 1px solid #dce7dc;
          border-top-left-radius: 7px;
          background: #f1f6ef;
          color: #173d29;
        }

        .zoey-message.user {
          border-top-right-radius: 7px;
          background: #23633d;
          color: #ffffff;
        }

        .zoey-message-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 6px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .zoey-avatar-dot {
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          border-radius: 50%;
          background: #23633d;
          color: #ffffff;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          font-weight: 900;
        }

        .zoey-thinking {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          padding: 12px 14px;
          border: 1px solid #dce7dc;
          border-radius: 16px;
          background: #f1f6ef;
          color: #5f7065;
          font-size: 13px;
          font-weight: 800;
        }

        .thinking-dots {
          display: inline-flex;
          gap: 3px;
        }

        .thinking-dots span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #6d8d75;
          animation: zoeyPulse 1.2s infinite ease-in-out;
        }

        .thinking-dots span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .thinking-dots span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes zoeyPulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }

          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        .zoey-starters {
          margin-top: 18px;
        }

        .zoey-starters-label {
          margin: 0 0 10px;
          color: #7a877e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .zoey-starter-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .zoey-starter {
          display: flex;
          min-height: 48px;
          align-items: center;
          gap: 9px;
          padding: 10px 12px;
          border: 1px solid #dce6dc;
          border-radius: 12px;
          background: #ffffff;
          color: #23563a;
          font-family: inherit;
          font-size: 12px;
          font-weight: 850;
          text-align: left;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .zoey-starter:hover {
          transform: translateY(-1px);
          border-color: #b8ceb9;
          box-shadow: 0 7px 18px rgba(23, 61, 41, 0.07);
        }

        .zoey-starter-icon {
          font-size: 16px;
        }

        .zoey-composer {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #e3e9e2;
        }

        .zoey-input-shell {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 7px;
          padding: 6px 7px 6px 14px;
          border: 1px solid #d9e3d9;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(23, 61, 41, 0.05);
        }

        .zoey-input {
          width: 100%;
          height: 46px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #173d29;
          font-family: inherit;
          font-size: 14px;
        }

        .zoey-input::placeholder {
          color: #99a39c;
        }

        .zoey-mic-button,
        .zoey-send-button {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 12px;
          font-family: inherit;
          cursor: pointer;
        }

        .zoey-mic-button {
          border: 1px solid #e0e7df;
          background: #f7faf6;
          color: #23633d;
          font-size: 17px;
        }

        .zoey-send-button {
          border: none;
          background: #23633d;
          color: #ffffff;
          font-size: 17px;
          font-weight: 900;
        }

        .zoey-send-button:disabled {
          cursor: default;
          opacity: 0.55;
        }

        .zoey-composer-note {
          margin: 8px 0 0;
          color: #89948c;
          font-size: 10px;
          line-height: 1.4;
          text-align: center;
        }

        @media (max-width: 700px) {
          .zoey-chat {
            min-height: 520px;
          }

          .zoey-starter-grid {
            grid-template-columns: 1fr;
          }

          .zoey-message {
            max-width: 94%;
          }
        }
      `}</style>

      <div className="zoey-chat-window">
        {messages.map((message, index) => {
          const assistant =
            message.role === "assistant";

          return (
            <div
              key={`${message.role}-${index}`}
              className={`zoey-message-row ${
                assistant ? "" : "user"
              }`}
            >
              <div
                className={`zoey-message ${
                  assistant
                    ? "assistant"
                    : "user"
                }`}
              >
                <div className="zoey-message-label">
                  {assistant ? (
                    <>
                      <span className="zoey-avatar-dot">
                        Z
                      </span>
                      Zoey
                    </>
                  ) : (
                    "You"
                  )}
                </div>

                <div
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}

        {loading ? (
          <div className="zoey-thinking">
            <span className="zoey-avatar-dot">
              Z
            </span>

            Zoey is thinking

            <span className="thinking-dots">
              <span />
              <span />
              <span />
            </span>
          </div>
        ) : null}

        {showStarters ? (
          <div className="zoey-starters">
            <p className="zoey-starters-label">
              Try asking me about
            </p>

            <div className="zoey-starter-grid">
              {starters.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  className="zoey-starter"
                  onClick={() =>
                    void send(starter.prompt)
                  }
                >
                  <span className="zoey-starter-icon">
                    {starter.icon}
                  </span>

                  {starter.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="zoey-composer">
        <div className="zoey-input-shell">
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                void send();
              }
            }}
            placeholder="Ask Zoey anything..."
            className="zoey-input"
            aria-label="Ask Zoey anything"
          />

          <button
            type="button"
            className="zoey-mic-button"
            aria-label="Voice conversation coming soon"
            title="Voice conversation coming soon"
          >
            🎙
          </button>

          <button
            type="button"
            className="zoey-send-button"
            disabled={
              loading || !input.trim()
            }
            onClick={() => void send()}
            aria-label="Send message"
          >
            →
          </button>
        </div>

        <p className="zoey-composer-note">
          Zoey offers general wellness guidance
          and does not replace professional
          medical advice.
        </p>
      </div>
    </div>
  );
}