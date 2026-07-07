"use client";

import { useState } from "react";

export default function ZoeyChat() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi, I’m Zoey. Ask me about energy, sleep, nutrition, recovery, or your wellness journey." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text = input) {
    const message = text.trim();
    if (!message || loading) return;

    setInput("");
    setLoading(true);
    const next = [...messages, { role: "user", content: message }];
    setMessages(next);

    try {
      const res = await fetch("/api/zoey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply || "I’m here with you. Let’s take one small healthy step today." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[2.5rem] bg-white p-5 shadow-wl md:p-8">
      <div className="h-[520px] space-y-4 overflow-y-auto rounded-[2rem] bg-warm p-5">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "assistant" ? "max-w-[86%] rounded-3xl bg-sage p-5" : "ml-auto max-w-[86%] rounded-3xl bg-forest p-5 text-white"}>
            <div className="mb-1 font-black">{m.role === "assistant" ? "Zoey" : "You"}</div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}
        {loading ? <div className="max-w-[86%] rounded-3xl bg-sage p-5 font-bold">Zoey is thinking...</div> : null}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type your message..." className="h-14 rounded-2xl border border-gray-200 px-5 text-lg" />
        <button onClick={() => send()} className="h-14 rounded-2xl bg-forest px-8 font-black text-white">Send</button>
      </div>
    </div>
  );
}
