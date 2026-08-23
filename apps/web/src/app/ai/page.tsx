"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2, User, BookOpen } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const SUGGESTIONS_BN = [
  "ধান গাছের পাতা হলুদ হয়ে যাচ্ছে, কী করব?",
  "টমেটো চাষের জন্য কোন সার ভালো?",
  "এই মৌসুমে কী ফসল লাভজনক হবে?",
];

const SUGGESTIONS_EN = [
  "My rice plant leaves are turning yellow, what should I do?",
  "Which fertilizer is best for tomato farming?",
  "Which crop would be profitable this season?",
];

export default function AiAdvisoryPage() {
  const { locale } = useUIStore();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/chat/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            language: locale,
          }),
        },
      );

      if (!res.ok) throw new Error("AI service error");
      const result = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.data.response,
          sources: result.data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            locale === "bn"
              ? "দুঃখিত, এই মুহূর্তে উত্তর দেওয়া যাচ্ছে না। একটু পর আবার চেষ্টা করুন।"
              : "Sorry, I couldn't respond right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const suggestions = locale === "bn" ? SUGGESTIONS_BN : SUGGESTIONS_EN;

  return (
    <div className="mx-auto flex h-[calc(100vh-76px)] max-w-[800px] flex-col px-4">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-bangla text-2xl font-bold">
              {locale === "bn" ? "AI কৃষি পরামর্শ" : "AI Farming Advisory"}
            </h1>
            <p className="mt-2 max-w-md font-bangla text-[15px] text-muted-foreground">
              {locale === "bn"
                ? "ফসলের রোগ, সার নির্বাচন, বা যেকোনো কৃষি প্রশ্ন বাংলায় করুন"
                : "Ask anything about crop diseases, fertilizers, or farming"}
            </p>

            <div className="mt-8 grid gap-2.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-left font-bangla text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto py-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-muted text-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 font-bangla text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-black/10 pt-2.5">
                    {msg.sources.map((src, si) => (
                      <span
                        key={si}
                        className="flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        <BookOpen className="h-2.5 w-2.5" />
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="font-bangla text-xs text-muted-foreground">
                  {locale === "bn" ? "ভাবছি..." : "Thinking..."}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border py-4"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            locale === "bn" ? "আপনার প্রশ্ন লিখুন..." : "Ask your question..."
          }
          className="font-bangla"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || loading}
          className="shrink-0 bg-primary text-white hover:bg-primary-hover"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
